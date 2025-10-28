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

  const attempts = await Attempt.find({ userId, rcPassageId: { $in: rcIds } })
  const allAttempted = attempts.length === rcIds.length && rcIds.length > 0
  if (!allAttempted) return { lock: false, reason: 'incomplete_yesterday' }

  const feedback = await Feedback.findOne({ userId, date: yesterdayStart })
  if (!feedback) return { lock: true, reason: 'feedback_missing' }
  return { lock: false, reason: 'feedback_submitted' }
}

export async function enforceFeedbackLock(req, res, next) {
  try {
    // Enforce lock for free users (no plan) or if the user's plan explicitly enables feedbackLock
    const plan = await planAccess.resolvePlanForUser(req.user)
    const isFree = !plan
    const planEnablesLock = plan && plan.features && plan.features.feedbackLock && plan.features.feedbackLock.enabled

    // If neither free user nor plan enables lock, skip enforcement
    if (!isFree && !planEnablesLock) return next()

    const info = await feedbackLockInfo(req.user.id)
    if (info.lock) return next(forbidden('Daily feedback required to continue'))
    next()
  } catch (e) {
    next(e)
  }
}
