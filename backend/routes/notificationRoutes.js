import express from "express";
import Notification from "../models/Notification.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.get("/", async (req, res) => {
    try {
        const notifications = await Notification.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(notifications);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

router.patch("/:id/read", async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if(notification && notification.user.toString() === req.user._id.toString()) {
            notification.read = true;
            await notification.save();
            res.json(notification);
        } else {
            res.status(404).json({ message: "Notification not found" });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

export default router;
