import { Attempt } from '../models/Attempt.js'
import { RcPassage } from '../models/RcPassage.js'
import { AnalyticsEvent } from '../models/AnalyticsEvent.js'
import { success, badRequest, notFoundErr, forbidden } from '../utils/http.js'
import { User } from '../models/User.js'
import { z } from 'zod'
import { startOfIST } from '../utils/date.js'
import { REASON_CODES } from '../utils/reasonCodes.js'

const qDetailZ = z.object({
  questionIndex: z.number().int().min(0),
  timeSpent: z.number().int().min(0),
  wasReviewed: z.boolean().optional(),
  isCorrect: z.boolean().optional(),
  qType: z.string().optional(),
  qCategory: z.string().optional(),
})

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
  durationSeconds: z.number().int().min(0).optional(),
  deviceType: z.enum(['desktop', 'tablet', 'mobile', 'unknown']).optional(),
  q_details: z.array(qDetailZ).optional(),
  attemptType: z.enum(['official', 'practice']).optional(),
})

export async function submitAttempt(req, res, next) {
  try {
  // Validate user authentication
    if (!req.user || !req.user.id) {
      return forbidden('User not authenticated'); 
    }

    const { rcPassageId, answers, timeTaken, durationSeconds, deviceType, q_details, attemptType } =
      submitSchema.parse(req.body);
    const rc = await RcPassage.findById(rcPassageId);
    if (!rc) throw notFoundErr('RC not found');

    // Safe debug log: req.user may be undefined in some error cases, and rc is now defined
    try {
      const userInfo = {
        id: req.user?.id || null,
        subscription: (req.user?.subscription || 'free'),
        joinedDate: req.user?.subon || req.user?.createdAt,
      }
      console.log('[submitAttempt] user:', userInfo, 'rcId:', rc._id.toString())
    } catch (logErr) {
      console.error('submitAttempt: failed to log debug info', logErr)
    }
 
    const user = req.user;
    const subscription = (user.subscription || 'free').toLowerCase();
    const joinedDate = user.subon || user.createdAt;
    const now = new Date();

    // Subscription-based access control
    if (subscription === 'free') {
      if (rc.createdAt < joinedDate) return forbidden('Not allowed: RC uploaded before you joined');
      // Only allow attempt if scheduledDate is today (not for missed RCs)
      const today = startOfIST();
      const rcDay = startOfIST(rc.scheduledDate);
      if (rcDay.getTime() !== today.getTime()) {
        return forbidden('Not allowed: You can only attempt today\'s RCs');
      }
    } else if (subscription === 'weekly' || subscription === '1 week plan') {
      const sevenDaysAfterJoin = new Date(joinedDate);
      sevenDaysAfterJoin.setDate(sevenDaysAfterJoin.getDate() + 7);
      if (rc.createdAt < joinedDate || rc.createdAt > sevenDaysAfterJoin) {
        return forbidden('Not allowed: RC not in your subscription window');
      }
    } // else for till CAT, allow all

    // Prevent official attempts on future-dated content not yet live
    if ((!attemptType || attemptType === 'official') && rc.scheduledDate) {
      const todayStart = startOfIST();
      const rcDay = startOfIST(rc.scheduledDate);
      if (rcDay > todayStart && rc.status !== 'live' && rc.status !== 'archived') {
        return badRequest('Cannot submit attempt before RC date');
      }
    }

    // Normalize answers (null -> '') and score
    const normalized = answers.map((a) => (a === null ? '' : a))
    let score = 0
    rc.questions.forEach((q, i) => {
      if (normalized[i] && normalized[i] === q.correctAnswerId) score += 1
    })

    // Auto-populate q_details with question metadata
    const enrichedQDetails = (q_details || []).map((detail, idx) => {
      const question = rc.questions[idx]
      return {
        ...detail,
        isCorrect: normalized[idx] === (question?.correctAnswerId || ''),
        qType: question?.questionType || 'inference',
        qCategory: rc.topicTags?.[0] || 'general', // Use first topic tag as category
      }
    })

    // If frontend didn't send q_details at all, create basic entries
    const finalQDetails =
      enrichedQDetails.length > 0
        ? enrichedQDetails
        : rc.questions.map((q, idx) => ({
            questionIndex: idx,
            timeSpent: 0,
            wasReviewed: false,
            isCorrect: normalized[idx] === q.correctAnswerId,
            qType: q.questionType || 'inference',
            qCategory: rc.topicTags?.[0] || 'general',
          }))

    const attemptedAt = new Date()
    const type = attemptType || 'official'
    let attempt = await Attempt.findOneAndUpdate(
      { userId: req.user.id, rcPassageId, attemptType: type },
      {
        answers: normalized,
        score,
        timeTaken: timeTaken || 0,
        durationSeconds: durationSeconds || timeTaken || 0,
        deviceType: deviceType || 'unknown',
        q_details: finalQDetails,
        attemptedAt,
        attemptType: type,
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    )

    // Log analytics event for admin metrics
    try {
      await AnalyticsEvent.create({
        userId: req.user.id,
        type: 'attempt_submission',
        payload: {
          rcPassageId,
          attemptId: attempt._id,
          durationSeconds: attempt.durationSeconds,
          deviceType: attempt.deviceType,
        },
      })
    } catch (e) {
      /* non-fatal */
    }

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

    // Personal best recalculation (official attempts only)
    if (type === 'official') {
      try {
        const top = await Attempt.find({ userId: req.user.id, attemptType: 'official' })
          .select('score')
          .sort({ score: -1 })
          .limit(1)
          .lean()
        const topScore = top?.[0]?.score ?? score
        // Reset previous PB flags if lower than top
        await Attempt.updateMany(
          {
            userId: req.user.id,
            attemptType: 'official',
            isPersonalBest: true,
            score: { $lt: topScore },
          },
          { $set: { isPersonalBest: false } }
        )
        // Mark all attempts that match topScore as personal best (handles ties)
        await Attempt.updateMany(
          { userId: req.user.id, attemptType: 'official', score: topScore },
          { $set: { isPersonalBest: true } }
        )
        attempt = await Attempt.findById(attempt._id).lean()
      } catch (e) {
        /* non-fatal */
      }
    }

    return success(res, {
      id: attempt._id,
      score,
      attemptType: attempt.attemptType,
      isPersonalBest: attempt.isPersonalBest,
    })
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
    const { rcId: identifier } = req.params

    // Try to interpret identifier as attempt id first
    let attempt = await Attempt.findById(identifier)
    if (attempt && attempt.userId.toString() !== req.user.id) attempt = null // not user's attempt

    // If not an attempt, treat as rcPassage id and find attempt for this user
    if (!attempt) {
      attempt = await Attempt.findOne({ userId: req.user.id, rcPassageId: identifier })
    }
    if (!attempt) throw notFoundErr('Analysis unavailable')

    const rc = await RcPassage.findById(attempt.rcPassageId)
    if (!rc) throw notFoundErr('Analysis unavailable')

    // Aggregate answer distributions for each question across all attempts of this RC
    const allAttempts = await Attempt.find({ rcPassageId: rc._id }).select('answers')
    const questionCount = rc.questions.length
    const baseCounts = Array.from({ length: questionCount }, () => ({ A: 0, B: 0, C: 0, D: 0 }))
    allAttempts.forEach((a) => {
      ;(a.answers || []).forEach((ans, idx) => {
        if (baseCounts[idx] && ['A', 'B', 'C', 'D'].includes(ans)) baseCounts[idx][ans] += 1
      })
    })
    const totalAnswerers = allAttempts.length || 1

    const questions = rc.questions.map((q, i) => {
      const userAnswer = attempt.answers[i] || null
      const distributions = q.options.map((opt) => {
        const count = baseCounts[i][opt.id] || 0
        const percent = Math.round((count / totalAnswerers) * 100)
        return { id: opt.id, text: opt.text, count, percent }
      })
      // include question category (hardness) if available
      const qDetail = (attempt.q_details || []).find((qd) => qd.questionIndex === i) || {}
      return {
        index: i,
        questionText: q.questionText,
        options: distributions,
        correctAnswerId: q.correctAnswerId,
        explanation: q.explanation,
        userAnswer,
        isCorrect: userAnswer === q.correctAnswerId,
        category: qDetail.qCategory || null,
      }
    })

    // Coverage metrics (reason tagging)
    const incorrectCount = questions.filter((q) => !q.isCorrect).length
    const taggedCount = (attempt.analysisFeedback || []).length
    const coverage = incorrectCount > 0 ? taggedCount / incorrectCount : 0

    // Category stats derived from q_details
    let categoryStats = []
    if (Array.isArray(attempt.q_details) && attempt.q_details.length) {
      const map = {}
      attempt.q_details.forEach((qd, idx) => {
        const cat = qd.qCategory || 'Uncategorized'
        if (!map[cat]) map[cat] = { category: cat, attempts: 0, correct: 0 }
        map[cat].attempts += 1
        if (questions[idx]?.isCorrect) map[cat].correct += 1
      })
      categoryStats = Object.values(map).map((c) => ({
        ...c,
        accuracy: c.attempts > 0 ? c.correct / c.attempts : 0,
      }))
    }

    // Additional computed stats
    const totalQuestions = questions.length || 1
    const accuracyPercent = Math.round((attempt.score / totalQuestions) * 100)
    const avgTimePerQuestion =
      totalQuestions > 0
        ? Math.round((attempt.durationSeconds || attempt.timeTaken || 0) / totalQuestions)
        : 0
    const speedTier =
      avgTimePerQuestion <= 40 ? 'Fast' : avgTimePerQuestion <= 65 ? 'On Pace' : 'Slow'
    const questionTiming = (attempt.q_details || []).map((qd) => ({
      index: qd.questionIndex,
      timeSpent: qd.timeSpent || 0,
    }))

    return success(res, {
      attemptId: attempt._id,
      rc: { id: rc._id, title: rc.title, topicTags: rc.topicTags, passageText: rc.passageText },
      score: attempt.score,
      timeTaken: attempt.timeTaken,
      durationSeconds: attempt.durationSeconds,
      attemptedAt: attempt.attemptedAt || attempt.createdAt,
      questions,
      analysisFeedback: attempt.analysisFeedback || [],
      // @deprecated - wrongReasons is a legacy field kept for API backward compatibility
      wrongReasons: attempt.wrongReasons || [],
      coverage: { coverage, taggedCount, incorrectCount },
      categoryStats,
      stats: {
        accuracyPercent,
        avgTimePerQuestion,
        speedTier,
        questionTiming,
      },
    })
  } catch (e) {
    next(e)
  }
}

/**
 * @deprecated This endpoint is deprecated. Use captureReason() instead.
 * This function is kept for backward compatibility only.
 * The /analysis-feedback route has been removed from routes/attempts.js
 */
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

export async function listUserAttempts(req, res, next) {
  try {
    const page = Math.max(1, Number(req.query.page) || 1)
    const limit = Math.min(50, Math.max(1, Number(req.query.limit) || 10))
    const skip = (page - 1) * limit

    const totalAttempts = await Attempt.countDocuments({ userId: req.user.id })
    const attempts = await Attempt.find({ userId: req.user.id })
       .populate({
    path: 'rcPassageId',
    select: 'title topicTags',
  })
      .sort({ attemptedAt: -1 })
      .skip(skip)
      .limit(limit) 
      .lean()

    const formatted = attempts.map((a) => {
      const totalQuestions = a.answers?.length || 4
      const wrongCount = totalQuestions - a.score
      const tagged = (a.analysisFeedback || []).length
      const rc = a.rcPassageId || {}
      return {
        _id: a._id,
        rcPassage: {
          _id: rc._id,
          title: rc.title || 'Untitled',
          topicTags: rc.topicTags || [],
        },
        score: a.score,
        correctCount: a.score,
        totalQuestions,
        durationSeconds: a.durationSeconds || a.timeTaken || 0,
        avgTimePerQuestion:
          totalQuestions > 0
            ? Math.round((a.durationSeconds || a.timeTaken || 0) / totalQuestions)
            : 0,
        wrongCount,
        taggedWrong: tagged,
        attemptedAt: a.attemptedAt ? new Date(a.attemptedAt) : (a.createdAt ? new Date(a.createdAt) : null),
        isPersonalBest: a.isPersonalBest || false,
        attemptType: a.attemptType || 'official',
      }
    })

    // Calculate lightweight stats for Results page (last 7 days)
    let stats = null
    if (page === 1) {
      const sevenDaysAgo = new Date()
      sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

      const recentAttempts = await Attempt.find({
        userId: req.user.id,
        attemptType: 'official',
        attemptedAt: { $gte: sevenDaysAgo },
      })
        .select('score durationSeconds answers analysisFeedback')
        .lean()

      const attempts7d = recentAttempts.length
      const totalCorrect = recentAttempts.reduce((sum, a) => sum + (a.score || 0), 0)
      const totalQuestions = recentAttempts.length * 4
      const accuracy7d = totalQuestions > 0 ? totalCorrect / totalQuestions : 0

      const totalDuration = recentAttempts.reduce(
        (sum, a) => sum + (a.durationSeconds || a.timeTaken || 0),
        0
      )
      const avgDuration = attempts7d > 0 ? Math.round(totalDuration / attempts7d) : 0

      // Calculate coverage from ALL attempts (not time-limited)
      // Need to fetch RC passages to determine which questions are incorrect
      const allOfficialAttempts = await Attempt.find({
        userId: req.user.id,
        attemptType: 'official',
      })
        .select('answers analysisFeedback rcPassageId score')
        .lean()

      // Fetch RC passages to check correct answers
      const attemptRcIds = [...new Set(allOfficialAttempts.map((a) => a.rcPassageId.toString()))]
      const rcPassages = await RcPassage.find({ _id: { $in: attemptRcIds } })
        .select('questions')
        .lean()
      const rcMap = new Map(rcPassages.map((rc) => [rc._id.toString(), rc]))

      let totalWrong = 0
      let taggedWrong = 0

      allOfficialAttempts.forEach((a) => {
        const rc = rcMap.get(a.rcPassageId.toString())
        if (!rc) return // Skip if RC not found

        // First, identify which questions are incorrect
        const incorrectQuestions = new Set()
        rc.questions.forEach((q, i) => {
          const userAns = (a.answers && a.answers[i]) || ''
          const isCorrect = userAns && userAns === q.correctAnswerId
          if (!isCorrect) {
            totalWrong++
            incorrectQuestions.add(i)
          }
        })

        // Only count tags for incorrect questions
        if (a.analysisFeedback && a.analysisFeedback.length) {
          a.analysisFeedback.forEach((f) => {
            if (incorrectQuestions.has(f.questionIndex)) {
              taggedWrong++
            }
          })
        }
      })

      const coverage = totalWrong > 0 ? taggedWrong / totalWrong : 0

      stats = {
        attempts7d,
        accuracy7d,
        avgDuration,
        coverage,
        taggedWrong,
        totalWrong,
      }
    }

    return success(res, {
      attempts: formatted,
      stats, // null if not page 1
      pagination: {
        currentPage: page,
        totalPages: Math.ceil(totalAttempts / limit),
        totalAttempts,
      },
    })
  } catch (e) {
    next(e)
  }
}

export async function captureReason(req, res, next) {
  try {
    const { id } = req.params // attempt id
    const { questionIndex, code } = req.body

    if (typeof questionIndex !== 'number' || questionIndex < 0) {
      throw badRequest('Invalid question index')
    }
    if (!code || !REASON_CODES[code]) {
      throw badRequest('Invalid reason code')
    }

    const attempt = await Attempt.findById(id)
    if (!attempt) throw notFoundErr('Attempt not found')
    if (attempt.userId.toString() !== req.user.id) throw forbidden('Not allowed')

    // Validate questionIndex is within range
    const totalQuestions = attempt.answers?.length || 4
    if (questionIndex >= totalQuestions) {
      throw badRequest('Question index out of range')
    }

    // Store in analysisFeedback field (used by dashboard)
    // Remove existing reason for this questionIndex if present (idempotent)
    const analysisFeedback = (attempt.analysisFeedback || []).filter(
      (r) => r.questionIndex !== questionIndex
    )
    analysisFeedback.push({ questionIndex, reason: code })

    await Attempt.findByIdAndUpdate(id, { analysisFeedback })

    return success(res, { analysisFeedback })
  } catch (e) {
    next(e)
  }
}

export async function saveAnalysisNotes(req, res, next) {
  try {
    const { id } = req.params // attempt id
    const { analysisNotes } = req.body

    if (typeof analysisNotes !== 'string') throw badRequest('Invalid notes')
    if (analysisNotes.length > 2000) throw badRequest('Notes too long (max 2000 characters)')

    const attempt = await Attempt.findById(id)
    if (!attempt) throw notFoundErr('Attempt not found')
    if (attempt.userId.toString() !== req.user.id) throw forbidden('Not allowed')

    await Attempt.findByIdAndUpdate(id, { analysisNotes })

    return success(res, { analysisNotes })
  } catch (e) {
    next(e)
  }
}
