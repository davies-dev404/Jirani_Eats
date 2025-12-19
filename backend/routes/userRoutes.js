import express from "express";
import { getUserProfile, updateUserProfile, updateUserStatus, getAllUsers, verifyUser } from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
    .get(getAllUsers);

router.route("/profile")
  .get(getUserProfile)
  .put(updateUserProfile);

router.route("/status").patch(updateUserStatus);
router.route("/:id/verify").patch(verifyUser);

export default router;
