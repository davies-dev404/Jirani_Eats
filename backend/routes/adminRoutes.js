import express from "express";
import { protect, admin } from "../middleware/authMiddleware.js";
import { 
    getSystemStats, 
    getAllUsers, 
    deleteUser,
    getPendingItems,
    approveUser,
    rejectUser,
    approveFood,
    rejectFood,
    suspendUser,
    activateUser,
    getAllDeliveries,
    getAllFoods,
    deleteFood,
    getAnalyticsData,
    updateUserByAdmin,
    getPendingFoods
} from "../controllers/adminController.js";

const router = express.Router();

router.use(protect);
router.use(admin);

router.get("/stats", getSystemStats);
router.get("/users", getAllUsers);
router.delete("/users/:id", deleteUser);
router.put("/users/:id", updateUserByAdmin);

router.patch("/users/:id/suspend", suspendUser);
router.patch("/users/:id/activate", activateUser);

// Placeholders required by frontend or old code reference
router.get("/pending", getPendingItems);
router.get("/pending-foods", getPendingFoods);
router.patch("/users/:id/approve", approveUser);
router.patch("/users/:id/reject", rejectUser);
router.patch("/foods/:id/approve", approveFood);
router.patch("/foods/:id/reject", rejectFood);
router.get("/foods", getAllFoods);
router.delete("/foods/:id", deleteFood);
router.get("/deliveries", getAllDeliveries);
router.get("/analytics", getAnalyticsData);

export default router;
