import { RcPassage } from '../models/RcPassage.js'
import { Attempt } from '../models/Attempt.js'
import { success, notFoundErr, forbidden as forbiddenErr } from '../utils/http.js'
import { startOfIST, endOfIST } from '../utils/date.js'

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
    const rcs = await RcPassage.find({
      status: { $in: ['scheduled', 'live', 'archived'] },
    })
      .sort({ scheduledDate: -1 })
      .skip(skip)
      .limit(limit)
      .select('title scheduledDate topicTags')

    // Include attempt info for this user so the client can surface results/practice actions easily
    const attempts = await Attempt.find({
      userId: req.user.id,
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
    return success(res, data)
  } catch (e) {
    next(e)
  }
}

export async function getRcById(req, res, next) {
  try {
    const rc = await RcPassage.findById(req.params.id)
    if (!rc) throw notFoundErr('RC not found')

    const preview =
      String(req.query.preview || '') === '1' || String(req.query.mode || '') === 'preview'
    const practice =
      String(req.query.practice || '') === '1' || String(req.query.mode || '') === 'practice'

    // Restrict access to future scheduled content (unless admin preview)
    if (!preview) {
      if (rc.scheduledDate) {
        const now = startOfIST()
        const rcDayStart = startOfIST(rc.scheduledDate)
        if (rcDayStart > now && rc.status !== 'live' && rc.status !== 'archived') {
          throw notFoundErr('RC not available yet')
        }
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
    next(e)
  }
}
