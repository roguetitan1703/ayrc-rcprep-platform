import mongoose from 'mongoose'

const analysisFeedbackSchema = new mongoose.Schema(
  {
    questionIndex: { type: Number, required: true },
    reason: { type: String, required: true },
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
    timeTaken: { type: Number, default: 0 },
    attemptedAt: { type: Date },
    analysisFeedback: { type: [analysisFeedbackSchema], default: [] },
    attemptType: { type: String, enum: ['official', 'practice'], default: 'official', index: true },
  },
  { timestamps: true }
)

// Allow multiple practice attempts; enforce single official attempt per user/RC
attemptSchema.index({ userId: 1, rcPassageId: 1, attemptType: 1 }, { unique: true })

export const Attempt = mongoose.model('Attempt', attemptSchema)
