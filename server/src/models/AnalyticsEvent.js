import mongoose from 'mongoose'

const analyticsEventSchema = new mongoose.Schema(
    {
        userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: false, index: true },
        type: { type: String, enum: ['login', 'attempt_submission', 'explanation_open'], required: true },
        payload: { type: mongoose.Schema.Types.Mixed, default: {} },
        createdAt: { type: Date, default: Date.now, index: true },
    },
    { timestamps: false }
)

export const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema)
