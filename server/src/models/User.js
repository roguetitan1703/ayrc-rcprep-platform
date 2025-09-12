import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phoneNumber: { type: String },
    password: { type: String, required: true },
    role: { type: String, enum: ["aspirant", "admin"], default: "aspirant" },
    dailyStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
  },
  { timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" } }
);

export const User = mongoose.model("User", userSchema);
