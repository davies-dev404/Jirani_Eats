import FoodRequest from "../models/FoodRequest.js";
import Food from "../models/FoodItem.js";
import User from "../models/User.js";

// @desc    Create a new request
// @route   POST /api/requests
// @access  Private (Receiver)
// @desc    Create a new request
// @route   POST /api/requests
// @access  Private (Receiver)
export const createRequest = async (req, res) => {
  try {
    const data = req.body;
    // Handle cases where foodId might be missing or nested
    const foodId = data.foodId || req.params.id; 

    if (!foodId) {
        return res.status(400).json({ message: "Food ID is required" });
    }

    const food = await Food.findById(foodId);
    if (!food) {
      return res.status(404).json({ message: "Food not found" });
    }

    const { 
        pickupLocation, 
        pickupTime, 
        phoneNumber, 
        message, 
        deliveryMethod, 
        quantity 
    } = data;

    if (!food.isAvailable || food.quantity < quantity) {
        return res.status(400).json({ message: `Only ${food.quantity} items available` });
    }

    const request = new FoodRequest({
      food: foodId,
      requestedBy: req.user._id,
      pickupLocation,
      pickupTime,
      phoneNumber,
      message,
      deliveryMethod,
      quantity
    });

    const createdRequest = await request.save();

    // Deduct quantity
    food.quantity -= quantity;
    if (food.quantity <= 0) {
        food.quantity = 0;
        food.isAvailable = false;
    }
    await food.save();

    // Emit socket event
    const io = req.app.get("socketio");
    const populatedRequest = await createdRequest.populate("food requestedBy"); 
    io.emit("requestAdded", populatedRequest);
    
    // Create a fresh populated object for the food update to ensure all fields are present for frontend
    const updatedFood = await Food.findById(food._id).populate("postedBy", "name email phone verificationStatus");
    io.emit("foodUpdated", updatedFood);

    res.status(201).json(createdRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my requests
// @route   GET /api/requests
// @access  Private
export const getMyRequests = async (req, res) => {
  try {
    // If donor, show requests for their food. If receiver, show their requests.
    // If admin, show all?
    let query = {};
    if (req.user.role === 'receiver') {
        query = { requestedBy: req.user._id };
    } else if (req.user.role === 'donor') {
        // Need to find foods by this donor, then requests for those foods
        const myFoods = await Food.find({ postedBy: req.user._id }).select('_id');
        const myFoodIds = myFoods.map(f => f._id);
        query = { food: { $in: myFoodIds } };
    } else if (req.user.role === 'admin') {
         query = {};
    } else if (req.user.role === 'rider') {
         query = { rider: req.user._id };
    }

    const requests = await FoodRequest.find(query)
        .populate("food", "title postedBy")
        .populate("requestedBy", "name email phone")
        .populate("rider", "name phone verificationStatus")
        .populate({
             path: 'food',
             populate: { path: 'postedBy', select: 'name phone' }
        })
        .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update request status
// @route   PATCH /api/requests/:id
// @access  Private
// @desc    Update request status
// @route   PATCH /api/requests/:id
// @access  Private
export const updateRequestStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const request = await FoodRequest.findById(req.params.id).populate("food");

        if (!request) {
            return res.status(404).json({ message: "Request not found" });
        }

        const oldStatus = request.status;
        request.status = status;
        
        // Save proof of delivery if provided
        if (req.body.proofOfDelivery) {
            request.proofOfDelivery = req.body.proofOfDelivery;
        }
        
        // Restore quantity if cancelling/rejecting
        if ((status === 'cancelled' || status === 'rejected') && oldStatus !== 'cancelled' && oldStatus !== 'rejected') {
             const food = await Food.findById(request.food._id);
             if (food) {
                 food.quantity += request.quantity;
                 food.isAvailable = true; // Make available again
                 await food.save();
                 req.app.get("socketio").emit("foodUpdated", food);
             }
        }

        // SYNC deliveryStatus if it matches delivery workflow
        if (['on_the_way', 'picked_up', 'delivered'].includes(status)) {
            request.deliveryStatus = status;
        }

        await request.save();

        const io = req.app.get("socketio");
        io.emit("requestUpdated", request);

        res.json(request);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Assign rider to request (Admin)
// @route   PATCH /api/requests/:id/assign
// @access  Private/Admin
export const assignRider = async (req, res) => {
    try {
        const { riderId } = req.body;
        const request = await FoodRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        request.rider = riderId;
        request.rider = riderId;
        request.status = 'assigned'; 
        // request.deliveryStatus = 'pending'; // Stays pending until rider accepts
        await request.save();

        const populatedRequest = await request.populate("food requestedBy rider");
        
        const io = req.app.get("socketio");
        io.emit("requestUpdated", populatedRequest);

        res.json(populatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Decline request (Rider)
// @route   PATCH /api/requests/:id/decline
// @access  Private/Rider
export const declineRequest = async (req, res) => {
    try {
        const request = await FoodRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        if (request.rider && request.rider.toString() !== req.user._id.toString()) {
            return res.status(401).json({ message: "Not authorized" });
        }

        // Unassign rider and reset status to approved (back to pool)
        request.rider = undefined;
        request.status = 'approved'; 
        request.deliveryStatus = 'pending';
        await request.save();

        const populatedRequest = await request.populate("food requestedBy");
        
        const io = req.app.get("socketio");
        io.emit("requestUpdated", populatedRequest); // Notify admin/others it's back in pool

        res.json(populatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Accept request (Rider)
// @route   PATCH /api/requests/:id/accept
// @access  Private/Rider
export const acceptRequest = async (req, res) => {
    try {
        const request = await FoodRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ message: "Request not found" });

        // If explicitly assigning via this route (self-assign from pool)
        if (!request.rider) {
             request.rider = req.user._id;
        } else if (request.rider.toString() !== req.user._id.toString()) {
             return res.status(400).json({ message: "Request already assigned to another rider" });
        }

        request.status = 'on_the_way';
        request.deliveryStatus = 'on_the_way';
        await request.save();

        const populatedRequest = await request.populate("food requestedBy rider");
        
        const io = req.app.get("socketio");
        io.emit("requestUpdated", populatedRequest);

        res.json(populatedRequest);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single request
// @route   GET /api/requests/:id
// @access  Private
export const getRequestById = async (req, res) => {
    try {
        const request = await FoodRequest.findById(req.params.id)
            .populate("food")
            .populate("requestedBy", "name email")
            .populate("rider", "name phone verificationStatus");
        if(request) res.json(request);
        else res.status(404).json({ message: 'Request not found' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
// @desc    Get available jobs for riders
// @route   GET /api/requests/rider/available
// @access  Private (Rider)
export const getAvailableJobs = async (req, res) => {
    try {
        // Find requests that are 'pending' (or whatever status implies ready for pickup) 
        // AND have no rider assigned
        const requests = await FoodRequest.find({ 
            status: 'approved', 
            rider: { $exists: false } 
        })
        .populate("food", "title pickupLocation postedBy")
        .populate("requestedBy", "name phone address")
        .populate({
             path: 'food',
             populate: { path: 'postedBy', select: 'name phone' }
        })
        .sort({ createdAt: -1 });

        res.json(requests);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get active job for current rider
// @route   GET /api/requests/rider/active
// @access  Private (Rider)
export const getActiveJob = async (req, res) => {
    try {
        // Find request where rider is current user and status is NOT delivered/cancelled
        const request = await FoodRequest.findOne({
            rider: req.user._id,
            status: { $in: ['assigned', 'on_the_way', 'picked_up'] }
        })
        .populate("food")
        .populate("requestedBy", "name phone address");

        if (request) {
            res.json(request);
        } else {
            res.status(404).json({ message: "No active job found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
