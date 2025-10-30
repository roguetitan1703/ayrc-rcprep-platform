import { Attempt } from '../models/Attempt.js'
import { Feedback } from '../models/Feedback.js'
import { RcPassage } from '../models/RcPassage.js'
import { startOfIST, endOfIST } from '../utils/date.js'
import { forbidden } from '../utils/http.js'
import planAccess from '../lib/planAccess.js'

// Determines if user has completed yesterday's RC set (2 attempts) but not yet submitted feedback.
export async function feedbackLockInfo(userId) {
  const todayStart = startOfIST()
  const yesterdayStart = new Date(todayStart)
  yesterdayStart.setDate(yesterdayStart.getDate() - 1)
  const yesterdayEnd = startOfIST(todayStart) // start of today

  // Fetch yesterday's scheduled RCs
  const yRcs = await RcPassage.find({
    scheduledDate: { $gte: yesterdayStart, $lt: yesterdayEnd },
    status: { $in: ['scheduled', 'live'] },
  }).select('_id')
  const rcIds = yRcs.map((r) => r._id)
  if (rcIds.length === 0) return { lock: false, reason: 'no_yesterday_rcs' }

  // Count unique RCs attempted yesterday by the user. Users may have multiple
  // attempts per RC, so comparing raw attempt count is incorrect.
  const attempts = await Attempt.find({ userId, rcPassageId: { $in: rcIds } }).select(
    'rcPassageId'
  )
  const attemptedSet = new Set((attempts || []).map((a) => String(a.rcPassageId)))
  const allAttempted = attemptedSet.size === rcIds.length && rcIds.length > 0
  if (!allAttempted) return { lock: false, reason: 'incomplete_yesterday' }

  const feedback = await Feedback.findOne({ userId, date: yesterdayStart })
  if (!feedback) return { lock: true, reason: 'feedback_missing' }
  return { lock: false, reason: 'feedback_submitted' }
}

export async function enforceFeedbackLock(req, res, next) {
  try {
    // Enforce lock for free users (no plan) or if the user's plan explicitly enables feedbackLock
    // Product decision: feedback lock applies only to free users (users without
    // a `subscriptionPlan`). Paid subscribers are exempt. Keep this check simple
    // so the behavior is predictable during the pilot. In future we can make
    // this configurable via plan features and use the `featureGates` helper.
    const plan = await planAccess.resolvePlanForUser(req.user)
    const isFree = !plan

    // Enforce only for free users right now
    if (!isFree) return next()

    const info = await feedbackLockInfo(req.user.id)
    if (info.lock) return next(forbidden('Daily feedback required to continue'))
    next()
  } catch (e) {
    next(e)
  }
}
