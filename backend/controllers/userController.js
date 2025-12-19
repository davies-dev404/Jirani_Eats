import User from "../models/User.js";

// @desc    Get user profile
// @route   GET /api/users/profile
// @access  Private
export const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        address: user.address,
        bio: user.bio,
        status: user.status,
        verificationStatus: user.verificationStatus
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user profile
// @route   PUT /api/users/profile
// @access  Private
export const updateUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id);

    if (user) {
      user.name = req.body.name || user.name;
      user.email = req.body.email || user.email;
      user.phone = req.body.phone || user.phone;
      user.address = req.body.address || user.address;
      user.bio = req.body.bio || user.bio;
      
      if (req.body.password) {
        user.password = req.body.password;
      }
      
      // Handle nested Vehicle Details
      if (req.body.vehicleDetails) {
          user.vehicleDetails = {
              ...user.vehicleDetails,
              ...req.body.vehicleDetails
          };
      }

      // Handle Verification Status and Documents
      if (req.body.verificationStatus) {
          user.verificationStatus = req.body.verificationStatus;
      }
      if (req.body.documents) {
          user.documents = req.body.documents;
      }

      const updatedUser = await user.save();

      // Emit socket event for real-time updates if needed (e.g. admin dashboard)
      const io = req.app.get("socketio");
      io.emit("userUpdated", updatedUser);

      res.json({
        _id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isAvailable: updatedUser.isAvailable, // Return availability
        verificationStatus: updatedUser.verificationStatus,
        token: req.headers.authorization.split(" ")[1] 
      });
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update user status (Online/Offline)
// @route   PATCH /api/users/status
// @access  Private
export const updateUserStatus = async (req, res) => {
    try {
        const user = await User.findById(req.user._id);

        if (user) {
            user.isAvailable = !user.isAvailable;
            const updatedUser = await user.save();

            res.json({
                _id: updatedUser._id,
                isAvailable: updatedUser.isAvailable,
            });
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all users (Admin only)
// @route   GET /api/users
// @access  Private/Admin
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}).sort({ createdAt: -1 });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
// @desc    Verify user (Admin only)
// @route   PATCH /api/users/:id/verify
// @access  Private/Admin
export const verifyUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);

        if (user) {
            // Update detailed verification status
            if(req.body.status === 'verified') {
                 user.verificationStatus = 'approved';
                 // Optionally set user.status to 'active' if checking
                 if (user.status !== 'blacklisted') user.status = 'active';
            } else if (req.body.status === 'rejected') {
                 user.verificationStatus = 'rejected';
                 // Keep user active or suspend? usually rejected verification doesn't ban them immediately unless fraud
            }
            
            const updatedUser = await user.save();
            
            // Emit event
            const io = req.app.get("socketio");
            io.emit("userUpdated", updatedUser);

            res.json(updatedUser);
        } else {
            res.status(404).json({ message: "User not found" });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
