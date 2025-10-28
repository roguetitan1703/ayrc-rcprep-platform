import mongoose from 'mongoose'

const SubscriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', required: true },
    transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', default: null },
    start_date: { type: Date, required: true },
    end_date: { type: Date, required: true, index: true },
    status: { type: String, enum: ['active', 'expired', 'revoked', 'pending'], default: 'active' },
    meta: { type: Object, default: {} },
  },
  { timestamps: true }
)

export const Subscription =
  mongoose.models.Subscription || mongoose.model('Subscription', SubscriptionSchema)
