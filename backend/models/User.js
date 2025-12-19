import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: [true, "Please enter your name"] },
    email: { type: String, required: [true, "Please enter your email"], unique: true },
    password: { type: String, required: [true, "Please enter your password"] },
    role: { 
        type: String, 
        enum: ["donor", "receiver", "admin", "rider"], 
        default: "receiver" 
    },
    phone: { type: String, default: "" },
    isAvailable: { type: Boolean, default: false },
    address: { type: String, default: "" },
    bio: { type: String, default: "" },
    verificationStatus: { 
        type: String, 
        enum: ["unverified", "pending", "approved", "rejected"], 
        default: "unverified" 
    },
    documents: [
      {
        type: { type: String, enum: ["id", "license", "other"] },
        url: { type: String, required: true },
        status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" }
      }
    ],
    vehicleDetails: {
      type: { type: String, enum: ["bike", "motorcycle", "car", "van", "truck"] },
      plateNumber: String,
      model: String,
      color: String,
    },
    status: { 
        type: String, 
        enum: ["active", "suspended", "blacklisted"], 
        default: "active" 
    },
    gender: { type: String, enum: ["Male", "Female", "Other", "Prefer not to say"] },
    dob: { type: Date },
    walletBalance: { type: Number, default: 0 },
    averageRating: { type: Number, default: 0 }
  },
  { timestamps: true }
);

// Match password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Encrypt password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

const User = mongoose.model("User", userSchema);
export default User;
