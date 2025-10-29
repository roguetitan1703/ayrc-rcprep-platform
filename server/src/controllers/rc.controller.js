import { RcPassage } from '../models/RcPassage.js'
import { Attempt } from '../models/Attempt.js'
import { success, notFoundErr, forbidden as forbiddenErr } from '../utils/http.js'
import { startOfIST, endOfIST } from '../utils/date.js'
import planAccess from '../lib/planAccess.js'

export async function getTodayRcs(req, res, next) {
  try {
    const start = startOfIST()
    const end = endOfIST()
    const rcs = await RcPassage.find({
      status: { $in: ['scheduled', 'live'] },
      scheduledDate: { $gte: start, $lt: end },
    }).select('title topicTags status scheduledDate')

    const attempts = await Attempt.find({
      userId: req.user.id,
      rcPassageId: { $in: rcs.map((r) => r._id) },
    })
    const attemptMap = new Map(attempts.map((a) => [a.rcPassageId.toString(), a]))

    const data = rcs.map((rc) => ({
      id: rc._id,
      title: rc.title,
      topicTags: rc.topicTags,
      scheduledDate: rc.scheduledDate,
      status: attemptMap.get(rc._id.toString()) ? 'attempted' : 'pending',
      score: attemptMap.get(rc._id.toString())?.score ?? null,
    }))

    return success(res, data)
  } catch (e) {
    next(e)
  }
}

export async function getArchive(req, res, next) {
  try {
    const page = Math.max(1, parseInt(req.query.page || '1', 10))
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit || '20', 10)))
    const skip = (page - 1) * limit
    const user = req.user

    const joinedDate = user.subon || user.createdAt
    const now = new Date()

    // Determine archive access rule for this user
    const rule = await planAccess.archiveRuleForUser(user)

    // If attempted-only: return only attempted RCs
    if (rule.type === 'attempted-only') {
      const attempts = await Attempt.find({ userId: user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
      const rcIds = attempts.map((a) => a.rcPassageId)
      const rcs = await RcPassage.find({ _id: { $in: rcIds } }).select(
        'title scheduledDate topicTags createdAt'
      )
      const attemptMap = new Map(attempts.map((a) => [a.rcPassageId.toString(), a]))
      const data = rcs.map((rc) => {
        const a = attemptMap.get(rc._id.toString())
        return {
          id: rc._id,
          title: rc.title,
          scheduledDate: rc.scheduledDate,
          topicTags: rc.topicTags,
          attempted: true,
          score: a?.score ?? null,
        }
      })
      return success(res, { data })
    }

    // For window or all: construct rcQuery accordingly
    let rcQuery = { status: { $in: ['scheduled', 'live', 'archived'] } }
    if (rule.type === 'window') {
      const windowDays = Number(rule.windowDays || 0)
      const start = joinedDate
      const end = new Date(start)
      end.setDate(end.getDate() + windowDays)
      rcQuery.createdAt = { $gte: start, $lte: end }
    }

    const rcs = await RcPassage.find(rcQuery)
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('title scheduledDate topicTags createdAt')
    const attempts = await Attempt.find({
      userId: user.id,
      rcPassageId: { $in: rcs.map((r) => r._id) },
    })
    const attemptMap = new Map(attempts.map((a) => [a.rcPassageId.toString(), a]))
    const data = rcs.map((rc) => {
      const a = attemptMap.get(rc._id.toString())
      return {
        id: rc._id,
        title: rc.title,
        scheduledDate: rc.scheduledDate,
        topicTags: rc.topicTags,
        attempted: !!a,
        score: a?.score ?? null,
      }
    })
    return success(res, { data })
  } catch (e) {
    next(e)
  }
}

export async function getRcById(req, res, next) {
  try {
    const rc = await RcPassage.findById(req.params.id)
    if (!rc) {
      console.error('[getRcById] RC not found for id:', req.params.id)
      throw notFoundErr('RC not found')
    }

    const user = req.user
    const plan = await planAccess.resolvePlanForUser(user)
    const subscription = plan ? String(plan.slug).toLowerCase() : 'free'
    const joinedDate = user.subon || user.createdAt
    const now = new Date()

    // Debug: log user and RC after rc is defined
    console.log('[getRcById] user:', { id: user.id, subscription, joinedDate }, 'rc:', rc._id)

    const preview =
      String(req.query.preview || '') === '1' || String(req.query.mode || '') === 'preview'
    const practice =
      String(req.query.practice || '') === '1' || String(req.query.mode || '') === 'practice'

    // Restrict access to future scheduled content (unless admin preview)
    if (!preview) {
      if (rc.scheduledDate) {
        const nowDay = startOfIST()
        const rcDayStart = startOfIST(rc.scheduledDate)
        if (rcDayStart > nowDay && rc.status !== 'live' && rc.status !== 'archived') {
          throw notFoundErr('RC not available yet')
        }
      }

      // Subscription/Plan-based access control
      // Use planAccess helper to determine if this user may view the RC.
      // It will always allow today's RCs and evaluate attempted/window/all rules.
      const attempt = await Attempt.findOne({ userId: user.id, rcPassageId: rc._id })
      const attempted = !!attempt
      const access = await planAccess.canAccessArchive(user, rc, attempted)
      if (!access.allowed) {
        // Map reason to a friendly message where possible
        const reason = access.reason || 'access denied'
        throw forbiddenErr(`Not allowed: ${reason}`)
      }
    }

    const safe = rc.toObject()
    if (preview) {
      if (!req.user || req.user.role !== 'admin') throw forbiddenErr('Not allowed')
      return success(res, safe)
    }
    if (practice) {
      safe.questions = safe.questions.map((q) => ({
        questionText: q.questionText,
        options: q.options,
        correctAnswerId: q.correctAnswerId,
        explanation: q.explanation,
      }))
      return success(res, safe)
    }
    safe.questions = safe.questions.map((q) => ({
      questionText: q.questionText,
      options: q.options,
    }))
    return success(res, safe)
  } catch (e) {
    console.error('[getRcById] error:', e)
    next(e)
  }
}
