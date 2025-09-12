import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    difficultyRating: { type: Number, min: 1, max: 5, required: true },
    explanationClarityRating: { type: Number, min: 1, max: 5, required: true },
    comment: { type: String },
  },
  { timestamps: true }
);

feedbackSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
