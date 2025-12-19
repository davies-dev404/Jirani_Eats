import mongoose from "mongoose";

const foodSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: String,
    quantity: { type: Number, required: true },
    unit: { type: String, default: "pcs" },
    pickupLocation: {
      address: { type: String, required: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    expiryDate: Date,
    isAvailable: { type: Boolean, default: true },
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    approvalStatus: {
      type: String,
      enum: ["pending_approval", "available", "rejected"],
      default: "pending_approval",
    },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Food", foodSchema, "foods");
