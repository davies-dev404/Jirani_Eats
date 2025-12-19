import express from "express";
import { getFoods, createFood, updateFood, deleteFood, getMyFoods, getFoodById, getAllFoodsAdmin } from "../controllers/foodController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.route("/")
  .get(getFoods)
  .post(protect, createFood);

router.get("/my-foods", protect, getMyFoods);
router.get("/admin", protect, getAllFoodsAdmin);

router.route("/:id")
  .get(getFoodById)
  .put(protect, updateFood)
  .delete(protect, deleteFood);

export default router;
