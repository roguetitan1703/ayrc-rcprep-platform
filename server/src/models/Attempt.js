import mongoose from 'mongoose'
import { REASON_CODES } from '../utils/reasonCodes.js'

const analysisFeedbackSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    reason: { type: String, required: true },
  },
  { _id: false }
)

const wrongReasonSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    code: {
      type: String,
      enum: Object.keys(REASON_CODES),
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
)

const qDetailSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    timeSpent: { type: Number, required: true }, // seconds
    wasReviewed: { type: Boolean, default: false },
    isCorrect: { type: Boolean },
    qType: { type: String, default: '' },
    qCategory: { type: String, default: '' },
  },
  { _id: false }
)

const attemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    rcPassageId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'RcPassage',
      required: true,
      index: true,
    },
    answers: { type: [String], default: [] },
    progress: { type: [String], default: [] },
    score: { type: Number, default: 0 },
    timeTaken: { type: Number, default: 0 }, // legacy field (seconds)
    durationSeconds: { type: Number, default: 0 },
    isTimed: { type: Boolean, default: true },
    deviceType: {
      type: String,
      enum: ['desktop', 'tablet', 'mobile', 'unknown'],
      default: 'unknown',
    },
    analysisNotes: { type: String, maxlength: 2000, default: '' },
    q_details: { type: [qDetailSchema], default: [] },
    attemptedAt: { type: Date },
    analysisFeedback: { type: [analysisFeedbackSchema], default: [] },
    wrongReasons: { type: [wrongReasonSchema], default: [] },
    attemptType: { type: String, enum: ['official', 'practice'], default: 'official', index: true },
    isPersonalBest: { type: Boolean, default: false },
  },
  { timestamps: true }
)

// Allow multiple practice attempts; enforce single official attempt per user/RC
attemptSchema.index({ userId: 1, rcPassageId: 1, attemptType: 1 }, { unique: true })

export const Attempt = mongoose.model('Attempt', attemptSchema)
