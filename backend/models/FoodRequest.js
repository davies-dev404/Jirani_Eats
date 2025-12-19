import mongoose from "mongoose";

const foodRequestSchema = new mongoose.Schema(
  {
    food: { type: mongoose.Schema.Types.ObjectId, ref: "Food", required: true }, // Changed from foodId to food for populating
    pickupLocation: { type: String, required: true },
    pickupTime: { type: Date, required: true },
    phoneNumber: { type: String, required: true },
    message: { type: String, default: "" },
    quantity: { type: Number, required: true, min: 1, default: 1 },
    status: {
      type: String,
      enum: ["requested", "approved", "assigned", "on_the_way", "picked_up", "delivered", "completed", "cancelled"],
      default: "requested",
    },
    deliveryMethod: {
      type: String,
      enum: ["self-pickup", "rider"],
      default: "self-pickup",
    },
    rider: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    deliveryStatus: {
      type: String,
      enum: ["pending", "on_the_way", "picked_up", "delivered"],
      default: "pending",
    },
    proofOfDelivery: { type: String, default: null },
    requestedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

const FoodRequest = mongoose.model("FoodRequest", foodRequestSchema);
export default FoodRequest;
