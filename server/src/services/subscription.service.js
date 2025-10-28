import { User } from '../models/User.js'
import { Subscription } from '../models/Subscription.js'
import mongoose from 'mongoose'

/**
 * Find expired subscriptions and users needing nullification.
 * If dryRun is true, no writes will be performed and a summary is returned.
 */
export async function findExpiredCandidates() {
  const now = new Date()

  // Find Subscription documents that ended before now and are still active
  const expiredSubs = await Subscription.find({ end_date: { $lt: now }, status: 'active' }).lean()

  // Find Users whose quick-field subexp indicates expiry but issubexp is false
  const expiredUsers = await User.find({ subexp: { $lt: now }, issubexp: false }).lean()

  return { expiredSubs, expiredUsers }
}

/**
 * Nullify expired subscriptions.
 * - Marks Subscription docs with end_date < now as 'expired'
 * - Updates corresponding User quick fields (set issubexp = true; keeps subscriptionPlan/subon/subexp for audit but can be customized)
 */
export async function nullifyExpiredSubscriptions({ dryRun = false } = {}) {
  const now = new Date()
  const summary = { subsUpdated: 0, usersUpdated: 0 }

  // Find subscription documents that should be expired
  const expiredSubs = await Subscription.find({ end_date: { $lt: now }, status: 'active' })

  if (expiredSubs.length === 0) {
    // Still check users quick-fields
    const expiredUsers = await User.find({ subexp: { $lt: now }, issubexp: false })
    if (expiredUsers.length === 0) return { summary, details: { expiredSubs: 0, expiredUsers: 0 } }
  }

  // Process subscriptions
  for (const sub of expiredSubs) {
    summary.subsUpdated += 1
    if (!dryRun) {
      try {
        const prevStatus = sub.status
        sub.status = 'expired'
        await sub.save()
        console.log(
          `[nullify] subscription ${sub._id} status ${prevStatus} -> expired for user ${sub.user}`
        )
        // update user quick-fields: mark issubexp true if sub matches user's current subexp
        if (sub.user) {
          const userId = mongoose.isValidObjectId(sub.user) ? sub.user : sub.user?._id
          if (userId) {
            const user = await User.findById(userId)
            if (user) {
              // only mark user's issubexp if their subexp is <= this sub.end_date
              if (!user.issubexp && user.subexp && new Date(user.subexp) <= sub.end_date) {
                user.issubexp = true
                await user.save()
                summary.usersUpdated += 1
                console.log(
                  `[nullify] user ${user._id} marked issubexp=true (sub ${sub._id} expired)`
                )
              }
            }
          }
        }
      } catch (err) {
        console.error('[nullifyExpiredSubscriptions] error updating subscription', sub._id, err)
      }
    }
  }

  // Also ensure any users who have expired quick-field but no subscription doc are marked
  const expiredUsers = await User.find({ subexp: { $lt: now }, issubexp: false })
  for (const u of expiredUsers) {
    if (dryRun) {
      summary.usersUpdated += 1
      continue
    }
    try {
      u.issubexp = true
      // optional: clear quick subscription plan pointer? Keep for audit; do not clear automatically
      await u.save()
      summary.usersUpdated += 1
      console.log(`[nullify] user ${u._id} marked issubexp=true (no active subscription documents)`)
    } catch (err) {
      console.error('[nullifyExpiredSubscriptions] error updating user', u._id, err)
    }
  }

  return {
    summary,
    details: { expiredSubs: expiredSubs.length, expiredUsers: expiredUsers.length },
  }
}

export default { findExpiredCandidates, nullifyExpiredSubscriptions }
