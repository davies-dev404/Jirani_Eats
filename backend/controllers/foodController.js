import Food from "../models/FoodItem.js";

// @desc    Get all foods
// @route   GET /api/foods
// @access  Public
export const getFoods = async (req, res) => {
  try {
    // Only show approved and available foods
    const foods = await Food.find({ isAvailable: true, approvalStatus: 'available' }).populate("postedBy", "name email phone verificationStatus");
    res.json(foods);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get my foods (Donor)
// @route   GET /api/foods/my-foods
// @access  Private
export const getMyFoods = async (req, res) => {
    try {
        const foods = await Food.find({ postedBy: req.user._id.toString() })
            .populate("postedBy", "name email phone verificationStatus")
            .sort({ createdAt: -1 });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single food
// @route   GET /api/foods/:id
// @access  Public
export const getFoodById = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id).populate("postedBy", "name email phone verificationStatus");
        if (food) {
            res.json(food);
        } else {
            res.status(404).json({ message: "Food not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a food item
// @route   POST /api/foods
// @access  Private (Donor)
export const createFood = async (req, res) => {
  try {
    const { title, description, quantity, unit, pickupLocation, expiryDate, imageUrl } = req.body;

    const food = new Food({
      title,
      description,
      quantity,
      unit,
      pickupLocation,
      expiryDate,
      imageUrl,
      postedBy: req.user._id.toString(),
      approvalStatus: 'pending_approval' // Explicitly pending_approval
    });

    const createdFood = await food.save();
    
    // Emit socket event to Admins only? 
    // Currently we broadcast to everyone. We should STOP broadcasting to receivers until approved.
    // We can broadcast a "newFoodPending" event if we want Admins to see it real-time.
    const io = req.app.get("socketio");
    io.emit("adminFoodPending", await createdFood.populate("postedBy", "name"));

    res.status(201).json(createdFood);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update food item
// @route   PUT /api/foods/:id
// @access  Private (Owner)
export const updateFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if(!food) return res.status(404).json({ message: "Food not found" });
        
        if(food.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized" });
        }

        const updatedFood = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
        
        // Emit update event
        const io = req.app.get("socketio");
        io.emit("foodUpdated", updatedFood);

        res.json(updatedFood);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get ALL foods (Admin) - including pending
// @route   GET /api/foods/admin
// @access  Private/Admin
export const getAllFoodsAdmin = async (req, res) => {
    try {
        const foods = await Food.find({})
            .populate("postedBy", "name email phone")
            .sort({ createdAt: -1 });
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete food item
// @route   DELETE /api/foods/:id
// @access  Private (Owner/Admin)
export const deleteFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if(!food) return res.status(404).json({ message: "Food not found" });

        if(food.postedBy.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return res.status(401).json({ message: "Not authorized" });
        }

        await Food.deleteOne({ _id: food._id });
        res.json({ message: "Food removed" });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
