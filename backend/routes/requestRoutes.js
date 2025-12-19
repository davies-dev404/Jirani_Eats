import express from "express";
import { createRequest, getMyRequests, updateRequestStatus, getRequestById, getAvailableJobs, getActiveJob, assignRider, acceptRequest, declineRequest } from "../controllers/requestController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.route("/")
  .post(createRequest)
  .get(getMyRequests);

router.get("/rider/available", getAvailableJobs);
router.get("/rider/active", getActiveJob);

router.route("/:id")
  .get(getRequestById)
  .patch(updateRequestStatus); // General update

router.patch("/:id/assign", assignRider); // Admin assign
router.patch("/:id/accept", acceptRequest); // Rider accept
router.patch("/:id/decline", declineRequest); // Rider decline assignment

export default router;
