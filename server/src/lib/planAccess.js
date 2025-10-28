import { Plan } from '../models/Plan.js'
import { startOfIST, endOfIST } from '../utils/date.js'

// Resolve a Plan object for a user using the canonical `subscriptionPlan` pointer.
// Do NOT attempt legacy fallbacks — subscription must be represented by a Plan ObjectId.
export async function resolvePlanForUser(user) {
  if (!user) return null

  if (!user.subscriptionPlan) return null
  try {
    const plan = await Plan.findById(user.subscriptionPlan)
    return plan || null
  } catch (e) {
    console.warn('[planAccess] error loading plan by id', e && e.message)
    return null
  }
}

// Derive archive rule for a user: returns { type: 'attempted-only'|'window'|'all', windowDays?, includeAttempted? }
export async function archiveRuleForUser(user) {
  // Resolve the plan (always read Plan.features from the canonical Plan document so
  // admin updates take immediate effect for existing users).
  const plan = await resolvePlanForUser(user)
  if (!plan) {
    return { type: 'attempted-only' }
  }

  const f = plan.features && plan.features.archive
  if (!f) {
    // default: if plan exists but no archive feature, allow all
    return { type: 'all' }
  }

  if (f.type === 'attempted-only') return { type: 'attempted-only' }
  if (f.type === 'window')
    return {
      type: 'window',
      windowDays: Number(
        f.windowDays || f.windowDays === 0 ? f.windowDays : plan.durationDays || 0
      ),
      includeAttempted: f.includeAttempted !== false,
    }
  if (f.type === 'all') return { type: 'all' }

  return { type: 'attempted-only' }
}

// Check if a given RC (rc.createdAt or scheduledDate) is in user's window
export function isDateInWindow(date, subon, windowDays) {
  if (!date || !subon || !windowDays) return false
  const start = new Date(subon)
  const end = new Date(start)
  end.setDate(end.getDate() + Number(windowDays))
  return date >= start && date <= end
}

// Main helper to check archive access for a specific RC
// rc: RcPassage doc
// attempted: boolean whether user attempted this rc
export async function canAccessArchive(user, rc, attempted = false) {
  const rule = await archiveRuleForUser(user)
  // Always allow today's RCs (scheduled today)
  try {
    if (rc.scheduledDate) {
      const todayStart = startOfIST()
      const rcDayStart = startOfIST(rc.scheduledDate)
      if (rcDayStart.getTime() === todayStart.getTime()) return { allowed: true, reason: 'today' }
    }
  } catch (e) {
    // ignore
  }

  if (rule.type === 'all') return { allowed: true, reason: 'plan:all' }
  if (rule.type === 'attempted-only') {
    return attempted
      ? { allowed: true, reason: 'attempted' }
      : { allowed: false, reason: 'attempted-only' }
  }
  if (rule.type === 'window') {
    const includeAttempted = rule.includeAttempted !== false
    const windowDays = Number(rule.windowDays || 0)
    const subon = user.subon || user.createdAt
    // If attempted and includeAttempted -> allow
    if (attempted && includeAttempted) return { allowed: true, reason: 'attempted' }
    // Otherwise check date
    const createdAt = rc.createdAt || rc.scheduledDate
    if (!createdAt) return { allowed: false, reason: 'no-date' }
    if (isDateInWindow(createdAt, subon, windowDays)) return { allowed: true, reason: 'window' }
    return { allowed: false, reason: 'outside-window' }
  }

  return { allowed: false, reason: 'unknown-rule' }
}

export default {
  resolvePlanForUser,
  archiveRuleForUser,
  canAccessArchive,
}
