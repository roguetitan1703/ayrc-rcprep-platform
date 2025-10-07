import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionId: { type: Number, required: true },
  type: {
    type: String,
    enum: ["rating", "multi", "open", "redirect"],
    required: true,
  },
  value: { type: mongoose.Schema.Types.Mixed, required: true }, // number, array, or string
  expectedTime: { type: Number, default: 0 }, // time in seconds expected for this question
  timeSpent: { type: Number, default: 0 },   // optional: track how long user actually spent
});

const feedbackSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    date: { type: Date, required: true },
    answers: [answerSchema],
  },
  { timestamps: true }
);

// Ensure a user can only submit feedback once per day
feedbackSchema.index({ userId: 1, date: 1 }, { unique: true });

export const Feedback = mongoose.model("Feedback", feedbackSchema);
