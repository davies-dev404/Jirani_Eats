import User from "../models/User.js";
import Food from "../models/FoodItem.js";
import FoodRequest from "../models/FoodRequest.js";

// @desc    Get system stats
// @route   GET /api/admin/stats
// @access  Private/Admin
export const getSystemStats = async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const pendingApprovals = await Food.countDocuments({ approvalStatus: 'pending' });
        const activeDeliveries = await FoodRequest.countDocuments({ status: { $in: ['approved', 'picked-up'] } });

        res.json({
            totalUsers,
            pendingApprovals,
            activeDeliveries
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
    try {
        const users = await User.find({}).select("-password").sort({ createdAt: -1 });
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
export const deleteUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            await User.deleteOne({ _id: user._id });
            res.json({ message: "User removed" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update user by admin
// @route   PUT /api/admin/users/:id
// @access  Private/Admin
export const updateUserByAdmin = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (user) {
            user.name = req.body.name || user.name;
            user.email = req.body.email || user.email;
            user.role = req.body.role || user.role;
            user.phone = req.body.phone || user.phone;

            const updatedUser = await user.save();
            res.json({
                _id: updatedUser._id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Suspend user
// @route   PATCH /api/admin/users/:id/suspend
// @access  Private/Admin
export const suspendUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user) {
            user.status = 'suspended';
            await user.save();
            res.json({ message: "User suspended" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Activate user
// @route   PATCH /api/admin/users/:id/activate
// @access  Private/Admin
export const activateUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if(user) {
            user.status = 'active';
            await user.save();
            res.json({ message: "User activated" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// Placeholder for other admin functions found in original routes
// @desc    Get pending approval items
// @route   GET /api/admin/pending
// @access  Private/Admin
export const getPendingItems = async (req, res) => {
    try {
        const pendingUsers = await User.find({ verificationStatus: 'pending' }).select('-password');
        // Currently only users need approval in this flow
        res.json(pendingUsers);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Approve user verification
// @route   PATCH /api/admin/users/:id/approve
// @access  Private/Admin
export const approveUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.verificationStatus = 'approved';
        await user.save();
        
        // Emit event for real-time update
        const io = req.app.get("socketio");
        io.emit("userUpdated", user);

        res.json({ message: "User approved", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Reject user verification
// @route   PATCH /api/admin/users/:id/reject
// @access  Private/Admin
export const rejectUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ message: "User not found" });

        user.verificationStatus = 'rejected';
        await user.save();

        const io = req.app.get("socketio");
        io.emit("userUpdated", user);

        res.json({ message: "User rejected", user });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
// @desc    Get pending food items
// @route   GET /api/admin/pending-foods
// @access  Private/Admin
export const getPendingFoods = async (req, res) => {
    try {
        const foods = await Food.find({ approvalStatus: 'pending' }).populate("postedBy", "name email");
        res.json(foods);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const approveFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id).populate("postedBy", "name email phone verificationStatus");
        if (!food) return res.status(404).json({ message: "Food not found" });

        food.approvalStatus = 'approved';
        await food.save();
        
        const io = req.app.get("socketio");
        // Broadcast to public now that it is approved
        io.emit("foodAdded", food);

        res.json({ message: "Food approved", food });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

export const rejectFood = async (req, res) => {
    try {
        const food = await Food.findById(req.params.id);
        if (!food) return res.status(404).json({ message: "Food not found" });

        food.approvalStatus = 'rejected';
        await food.save();

        res.json({ message: "Food rejected", food });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
export const getAllFoods = async (req, res) => { res.json([]); };
export const deleteFood = async (req, res) => { res.json({message: "Not implemented yet"}); };
export const getAllDeliveries = async (req, res) => { res.json([]); };
export const getAnalyticsData = async (req, res) => { res.json({}); };
