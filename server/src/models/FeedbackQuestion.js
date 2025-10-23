import mongoose from "mongoose";

const feedbackQuestionSchema = new mongoose.Schema(
    {
        type: {
            type: String,
            enum: ["rating", "multi", "open", "redirect"],
            required: true,
        },
        label: { type: String, required: true },
        options: [{ type: String }], // only for multi-select
        url: { type: String },       // only for redirect type
        buttonText: { type: String },// only for redirect type
        minWords: { type: Number },  // for open & redirect review
        time: { type: Number, default: 0 }, // time in seconds for stepwise blocking
        status: { type: String, default: 'live', enum: ['live', 'archived'] },
        date: { type: Date, default: null }, // optional: assign for a specific day
    },
    { timestamps: true }
);

export const FeedbackQuestion = mongoose.model(
    "FeedbackQuestion",
    feedbackQuestionSchema
);
