import mongoose from 'mongoose'

const TransactionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    plan: { type: mongoose.Schema.Types.ObjectId, ref: 'Plan', default: null },
    // amount_cents stores the requested amount (in paise) that the server sent to Razorpay
    amount_cents: { type: Number, required: true }, // store in paise
    // paid_amount_cents will be set when webhook arrives (actual captured amount in paise)
    paid_amount_cents: { type: Number, default: null },
    currency: { type: String, default: 'INR' },
    razorpay_order_id: { type: String, required: true, index: true },
    razorpay_payment_id: { type: String, default: null, index: true },
    // status reflects the payment lifecycle (do not conflate with reconciliation state)
    status: {
      type: String,
      enum: ['created', 'authorized', 'captured', 'failed'],
      default: 'created',
    },
    raw_payload: { type: Object, default: null },
    metadata: { type: Object, default: {} },
    // reconciliation flags: is_discrepant true when paid_amount differs from requested
    is_discrepant: { type: Boolean, default: false },
  },
  { timestamps: true }
)

export const Transaction =
  mongoose.models.Transaction || mongoose.model('Transaction', TransactionSchema)
