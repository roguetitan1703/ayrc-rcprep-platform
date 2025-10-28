import mongoose from 'mongoose'

const planSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, default: '' },

    active: { type: Boolean, default: true },

    currency: { type: String, default: 'INR' },
    // finalPriceCents is required and used for payment gateways (paise)
    finalPriceCents: { type: Number, required: true },
    // markupPriceCents is optional (may be used to show MRP / strike-through)
    markupPriceCents: { type: Number, default: null },

    // Billing semantics: only two types supported as requested
    billingType: {
      type: String,
      enum: ['duration_days', 'till_date'],
      required: true,
    },
    // Used when billingType === 'duration_days'
    durationDays: { type: Number, default: null },
    // Used when billingType === 'till_date' (stored as UTC; admin should provide date which we'll treat as end-of-day IST)
    accessUntil: { type: Date, default: null },

    // Feature gating: explicit sub-schema to hold plan-level feature flags and config
    features: {
      type: new mongoose.Schema(
        {
          // Archive controls which archived RCs a user may access
          archive: {
            type: new mongoose.Schema(
              {
                type: { type: String, enum: ['attempted-only', 'window', 'all'], default: 'attempted-only' },
                windowDays: { type: Number, default: null },
                includeAttempted: { type: Boolean, default: true },
              },
              { _id: false }
            ),
            default: undefined,
          },

          // Feedback lock: whether completing yesterday's RCs requires feedback before further attempts
          feedbackLock: {
            enabled: { type: Boolean, default: false },
            // scope: 'free' | 'all' - default 'all' means applies to all users on this plan
            scope: { type: String, enum: ['free', 'all'], default: 'all' },
          },

          // Example: control how many practice RCs or attempts per day (optional)
          dailyLimits: {
            dailyRcs: { type: Number, default: null },
            dailyAttempts: { type: Number, default: null },
          },

          // Generic extensible object for other feature flags
          extras: { type: Object, default: {} },
        },
        { _id: false }
      ),
      default: {},
    },

    metadata: { type: Object, default: {} },

    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    version: { type: Number, default: 1 },
  },
  { timestamps: true }
)

// Note: `slug` is declared with `unique: true` on the field - no separate index required.

export const Plan = mongoose.model('Plan', planSchema)
