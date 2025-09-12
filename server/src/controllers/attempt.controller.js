import { Attempt } from '../models/Attempt.js'
import { RcPassage } from '../models/RcPassage.js'
import { success, badRequest, notFoundErr, forbidden } from '../utils/http.js'
import { User } from '../models/User.js'
import { z } from 'zod'
import { startOfIST } from '../utils/date.js'

const submitSchema = z.object({
  rcPassageId: z.string().min(1),
  answers: z
    .array(
      z.union([
        z.literal('A'),
        z.literal('B'),
        z.literal('C'),
        z.literal('D'),
        z.literal(''),
        z.null(),
      ])
    )
    .length(4),
  timeTaken: z.number().int().min(0).optional(),
  attemptType: z.enum(['official', 'practice']).optional(),
})

export async function submitAttempt(req, res, next) {
  try {
    const { rcPassageId, answers, timeTaken, attemptType } = submitSchema.parse(req.body)
    const rc = await RcPassage.findById(rcPassageId)
    if (!rc) throw notFoundErr('RC not found')
    // Prevent official attempts on future-dated content not yet live
    if ((!attemptType || attemptType === 'official') && rc.scheduledDate) {
      const todayStart = startOfIST()
      const rcDay = startOfIST(rc.scheduledDate)
      if (rcDay > todayStart && rc.status !== 'live' && rc.status !== 'archived') {
        return badRequest('Cannot submit attempt before RC date')
      }
    }

    // Normalize answers (null -> '') and score
    const normalized = answers.map((a) => (a === null ? '' : a))
    let score = 0
    rc.questions.forEach((q, i) => {
      if (normalized[i] && normalized[i] === q.correctAnswerId) score += 1
    })

    const attemptedAt = new Date()
    const type = attemptType || 'official'
    const attempt = await Attempt.findOneAndUpdate(
      { userId: req.user.id, rcPassageId, attemptType: type },
      { answers: normalized, score, timeTaken: timeTaken || 0, attemptedAt, attemptType: type },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    if (type === 'official') {
      // Streak logic: completing at least one official RC for the day counts
      const today = startOfIST()
      const user = await User.findById(req.user.id)
      const last = user.lastActiveDate ? new Date(user.lastActiveDate) : null
      if (!last || last < today) {
        const yesterday = new Date(today)
        yesterday.setDate(yesterday.getDate() - 1)
        const newStreak =
          last && last.getTime() === yesterday.getTime() ? (user.dailyStreak || 0) + 1 : 1
        user.dailyStreak = newStreak
        user.lastActiveDate = today
        await user.save()
      }
    }

    return success(res, { id: attempt._id, score, attemptType: attempt.attemptType })
  } catch (e) {
    next(e)
  }
}

export async function saveProgress(req, res, next) {
  try {
    const { id } = req.params // attempt id
    const { progress } = req.body
    if (!Array.isArray(progress) || progress.length !== 4) throw badRequest('Invalid progress')
    const attempt = await Attempt.findById(id)
    if (!attempt) throw notFoundErr('Attempt not found')
    if (attempt.userId.toString() !== req.user.id) throw forbidden('Not allowed')
    await Attempt.findByIdAndUpdate(id, { progress })
    return success(res, { ok: true })
  } catch (e) {
    next(e)
  }
}

export async function getAnalysis(req, res, next) {
  try {
    const { rcId } = req.params
    const attempt = await Attempt.findOne({
      userId: req.user.id,
      rcPassageId: rcId,
    })
    const rc = await RcPassage.findById(rcId)
    if (!attempt || !rc) throw notFoundErr('Analysis unavailable')
    const questions = rc.questions.map((q, i) => ({
      questionText: q.questionText,
      options: q.options,
      correctAnswerId: q.correctAnswerId,
      explanation: q.explanation,
      userAnswer: attempt.answers[i] || null,
      isCorrect: (attempt.answers[i] || null) === q.correctAnswerId,
    }))
    return success(res, {
      attemptId: attempt._id,
      rc: { id: rc._id, title: rc.title, topicTags: rc.topicTags },
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      questions,
    })
  } catch (e) {
    next(e)
  }
}

export async function saveAnalysisFeedback(req, res, next) {
  try {
    const { id } = req.params // attempt id
    const { feedback } = req.body // [{questionIndex, reason}]
    if (!Array.isArray(feedback)) throw badRequest('Invalid feedback')
    const attempt = await Attempt.findById(id)
    if (!attempt) throw notFoundErr('Attempt not found')
    if (attempt.userId.toString() !== req.user.id) throw forbidden('Not allowed')
    await Attempt.findByIdAndUpdate(id, { analysisFeedback: feedback })
    return success(res, { ok: true })
  } catch (e) {
    next(e)
  }
}
