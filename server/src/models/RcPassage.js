import mongoose from 'mongoose'

const optionSchema = new mongoose.Schema(
  {
    id: { type: String, enum: ['A', 'B', 'C', 'D'], required: true },
    text: { type: String, required: true },
  },
  { _id: false }
)

const questionSchema = new mongoose.Schema(
  {
    questionText: { type: String, required: true },
    options: { type: [optionSchema], validate: (v) => v.length === 4 },
    correctAnswerId: {
      type: String,
      enum: ['A', 'B', 'C', 'D'],
      required: true,
    },
    explanation: { type: String, required: true },
    questionType: {
      type: String,
      enum: [
        'main-idea', // What is the main idea/purpose of the passage?
        'inference', // What can be inferred from the passage?
        'detail', // Specific detail mentioned in the passage
        'vocabulary', // Meaning of a word in context
        'tone-attitude', // Author's tone or attitude
        'structure-function', // How the passage is organized or why author included X
        'application', // Apply the passage's reasoning to a new scenario
      ],
      default: 'inference',
    },
    difficulty: {
      type: String,
      enum: ['easy', 'medium', 'hard'],
      default: 'medium',
    },
  },
  { _id: false }
)

const rcPassageSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    passageText: { type: String, required: true },
    source: { type: String },
    topicTags: { type: [String], default: [] },
    status: {
      type: String,
      enum: ['draft', 'scheduled', 'live', 'archived'],
      default: 'draft',
    },
    scheduledDate: { type: Date },
    questions: { type: [questionSchema], validate: (v) => v.length === 4 },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
)

export const RcPassage = mongoose.model('RcPassage', rcPassageSchema)
