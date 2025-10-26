import { User } from '../models/User.js'
import { Attempt } from '../models/Attempt.js'
import { RcPassage as RcModel } from '../models/RcPassage.js'
import { Feedback } from '../models/Feedback.js'
import { startOfIST, endOfIST } from '../utils/date.js'
import { success } from '../utils/http.js'
import { feedbackLockInfo } from '../middleware/policy.js'

/**
 * Get comprehensive user analytics and coverage metrics
 * This should be called by dashboardBundle to get attempt-related data
 */
export async function getUserAnalytics(userId) {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  // For analytics (topics/trend), use last 30 days
  const recentAttempts = await Attempt.find({
    userId,
    attemptType: 'official',
    attemptedAt: { $gte: since },
  }).select('answers attemptedAt rcPassageId attemptType analysisFeedback')

  // For coverage calculation, get ALL official attempts (not time-limited)
  const allOfficialAttempts = await Attempt.find({
    userId,
    attemptType: 'official',
  }).select('answers attemptedAt rcPassageId attemptType analysisFeedback')

  const rcMap = new Map()
  const passageIds = recentAttempts.map((a) => a.rcPassageId)
  const passages = await RcModel.find({ _id: { $in: passageIds } }).select('topicTags questions')
  passages.forEach((p) => rcMap.set(p._id.toString(), p))

  // Topic accuracy stats (last 30 days)
  const topicStats = new Map()
  for (const a of recentAttempts) {
    const p = rcMap.get(a.rcPassageId.toString())
    if (!p) continue
    p.topicTags.forEach((tag) => {
      if (!topicStats.has(tag)) topicStats.set(tag, { tag, correct: 0, total: 0 })
    })
    p.questions.forEach((q, i) => {
      const correct = a.answers[i] && a.answers[i] === q.correctAnswerId
      p.topicTags.forEach((tag) => {
        const t = topicStats.get(tag)
        t.total += 1
        if (correct) t.correct += 1
      })
    })
  }
  const topics = Array.from(topicStats.values()).map((t) => ({
    tag: t.tag,
    accuracy: t.total ? Number(((t.correct / t.total) * 100).toFixed(1)) : 0,
    totalQuestions: t.total,
  }))
  topics.sort((a, b) => a.tag.localeCompare(b.tag))

  // Trend: attempts per day last 7 days
  const today = startOfIST()
  const trend = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = startOfIST(d).toISOString()
    const count = recentAttempts.filter(
      (a) => startOfIST(a.attemptedAt).toISOString() === key && a.attemptType === 'official'
    ).length
    trend.push({ date: key.slice(0, 10), attempts: count })
  }

  // Coverage calculation: use ALL official attempts
  const initialAttemptsMap = new Map()
  // Pick the most recent attempt per passage (latest analysis)
  for (const a of allOfficialAttempts) {
    const rid = a.rcPassageId.toString()
    const prev = initialAttemptsMap.get(rid)
    if (!prev || a.attemptedAt > prev.attemptedAt) {
      initialAttemptsMap.set(rid, a)
    }
  }

  const initialAttempts = Array.from(initialAttemptsMap.values())

  // Fetch RC passage data for coverage attempts
  const coveragePassageIds = initialAttempts.map((a) => a.rcPassageId)
  const coveragePassages = await RcModel.find({ _id: { $in: coveragePassageIds } }).select(
    'questions'
  )
  const coverageRcMap = new Map()
  coveragePassages.forEach((p) => coverageRcMap.set(p._id.toString(), p))

  let totalWrong = 0
  let taggedWrong = 0
  const reasonCounts = new Map()
  for (const a of initialAttempts) {
    const p = coverageRcMap.get(a.rcPassageId.toString())
    if (!p) continue

    // First, identify which questions are incorrect
    const incorrectQuestions = new Set()
    p.questions.forEach((q, i) => {
      const userAns = (a.answers && a.answers[i]) || ''
      const isCorrect = userAns && userAns === q.correctAnswerId
      if (!isCorrect) {
        totalWrong++
        incorrectQuestions.add(i) // Store question index
      }
    })

    // Only count tags for incorrect questions
    if (a.analysisFeedback && a.analysisFeedback.length) {
      a.analysisFeedback.forEach((f) => {
        // Only count if this feedback is for an incorrect question
        if (incorrectQuestions.has(f.questionIndex)) {
          taggedWrong++
          reasonCounts.set(f.reason, (reasonCounts.get(f.reason) || 0) + 1)
        }
      })
    }
  }

  // coverage: percentage of wrong questions that have been tagged
  const coverage = totalWrong > 0 ? Number(((taggedWrong / totalWrong) * 100).toFixed(1)) : 0
  const topReasons = Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)

  return {
    topics,
    trend,
    coverage,
    reasons: { top: topReasons },
    attempts7d: trend.reduce((s, t) => s + t.attempts, 0),
    taggedWrong,
    totalWrong,
  }
}

/**
 * Get comprehensive admin analytics (platform-wide)
 */
export async function getAdminAnalytics() {
  const since = new Date()
  since.setDate(since.getDate() - 30)

  // For analytics, use last 30 days
  const recentAttempts = await Attempt.find({ attemptedAt: { $gte: since } }).select(
    'answers attemptedAt rcPassageId attemptType analysisFeedback userId score'
  )

  // For coverage calculation, get ALL official attempts (not time-limited)
  const allOfficialAttempts = await Attempt.find({ attemptType: 'official' }).select(
    'answers attemptedAt rcPassageId attemptType analysisFeedback userId score'
  )

  // --- Active Users Trend (last 7 days) ---
  const today = startOfIST()
  const activeUsersTrend = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = startOfIST(d).toISOString()
    const users = new Set(
      recentAttempts
        .filter(
          (a) => startOfIST(a.attemptedAt).toISOString() === key && a.attemptType === 'official'
        )
        .map((a) => a.userId.toString())
    )
    activeUsersTrend.push({ date: key.slice(0, 10), count: users.size })
  }
  const activeUsersToday = activeUsersTrend[6]?.count || 0
  const activeUsersWeek = activeUsersTrend.reduce((sum, day) => sum + day.count, 0)

  // --- Average Accuracy ---
  let totalQuestions = 0
  let totalCorrect = 0
  for (const a of recentAttempts) {
    const rc = await RcModel.findById(a.rcPassageId).select('questions')
    if (!rc) continue
    rc.questions.forEach((q, i) => {
      totalQuestions++
      if (a.answers[i] && a.answers[i] === q.correctAnswerId) totalCorrect++
    })
  }
  const avgAccuracy =
    totalQuestions > 0 ? Number(((totalCorrect / totalQuestions) * 100).toFixed(1)) : 0

  // --- Ratings Distribution ---
  const feedbacks = await Feedback.find({ date: { $gte: since } }).select('answers')
  // Assume ratings are in answers with type 'rating' and value 1-5
  const ratingsDist = [0, 0, 0, 0, 0] // [5,4,3,2,1]
  feedbacks.forEach((fb) => {
    fb.answers.forEach((ans) => {
      if (
        ans.type === 'rating' &&
        typeof ans.value === 'number' &&
        ans.value >= 1 &&
        ans.value <= 5
      ) {
        ratingsDist[5 - ans.value]++
      }
    })
  })

  // --- Topic Accuracy Stats (normalized tags) ---
  const rcMap = new Map()
  const passageIds = recentAttempts.map((a) => a.rcPassageId)
  const passages = await RcModel.find({ _id: { $in: passageIds } }).select('topicTags questions')
  passages.forEach((p) => rcMap.set(p._id.toString(), p))
  const topicStats = new Map()
  const systemTags = new Set(['archived', 'system', ''])
  for (const a of recentAttempts) {
    const p = rcMap.get(a.rcPassageId.toString())
    if (!p) continue
    p.topicTags.forEach((tag) => {
      const cleanTag = (tag || '').replace(/['"\\]/g, '').trim()
      if (!cleanTag || systemTags.has(cleanTag.toLowerCase())) return
      if (!topicStats.has(cleanTag))
        topicStats.set(cleanTag, { tag: cleanTag, correct: 0, total: 0 })
    })
    p.questions.forEach((q, i) => {
      const correct = a.answers[i] && a.answers[i] === q.correctAnswerId
      p.topicTags.forEach((tag) => {
        const cleanTag = (tag || '').replace(/['"\\]/g, '').trim()
        if (!cleanTag || systemTags.has(cleanTag.toLowerCase())) return
        const t = topicStats.get(cleanTag)
        t.total += 1
        if (correct) t.correct += 1
      })
    })
  }
  const topics = Array.from(topicStats.values()).map((t) => ({
    tag: t.tag,
    accuracy: t.total ? Number(((t.correct / t.total) * 100).toFixed(1)) : 0,
    totalQuestions: t.total,
  }))
  topics.sort((a, b) => a.tag.localeCompare(b.tag))

  // --- Attempts By Day (trend) ---
  const attemptsByDay = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today)
    d.setDate(d.getDate() - i)
    const key = startOfIST(d).toISOString()
    const count = recentAttempts.filter(
      (a) => startOfIST(a.attemptedAt).toISOString() === key && a.attemptType === 'official'
    ).length
    attemptsByDay.push({ date: key.slice(0, 10), attempts: count })
  }
  const attemptsToday = attemptsByDay[6]?.attempts || 0
  const attemptsWeek = attemptsByDay.reduce((sum, day) => sum + day.attempts, 0)
  const attempts7d = attemptsWeek

  // --- Coverage and Reasons (cleaned) ---
  const coverageByUserRC = new Map()
  for (const a of allOfficialAttempts) {
    const key = `${a.userId}_${a.rcPassageId}`
    const prev = coverageByUserRC.get(key)
    if (!prev || a.attemptedAt > prev.attemptedAt) {
      coverageByUserRC.set(key, a)
    }
  }
  const initialAttempts = Array.from(coverageByUserRC.values())
  const coveragePassageIds = initialAttempts.map((a) => a.rcPassageId)
  const coveragePassages = await RcModel.find({ _id: { $in: coveragePassageIds } }).select(
    'questions'
  )
  const coverageRcMap = new Map()
  coveragePassages.forEach((p) => coverageRcMap.set(p._id.toString(), p))
  let totalWrong = 0
  let taggedWrong = 0
  const reasonCounts = new Map()
  for (const a of initialAttempts) {
    const p = coverageRcMap.get(a.rcPassageId.toString())
    if (!p) continue
    const incorrectQuestions = new Set()
    p.questions.forEach((q, i) => {
      const userAns = (a.answers && a.answers[i]) || ''
      const isCorrect = userAns && userAns === q.correctAnswerId
      if (!isCorrect) {
        totalWrong++
        incorrectQuestions.add(i)
      }
    })
    if (a.analysisFeedback && a.analysisFeedback.length) {
      a.analysisFeedback.forEach((f) => {
        if (incorrectQuestions.has(f.questionIndex)) {
          // Clean reason string
          const reason = (f.reason || '').replace(/[^a-zA-Z0-9 .,'-]/g, '').trim()
          if (reason.length < 2) return
          taggedWrong++
          reasonCounts.set(reason, (reasonCounts.get(reason) || 0) + 1)
        }
      })
    }
  }
  const coverage = totalWrong > 0 ? Number(((taggedWrong / totalWrong) * 100).toFixed(1)) : 0
  const topReasons = Array.from(reasonCounts.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count)

  // --- Canonical Analytics Schema ---
  return {
    attemptsByDay,
    attemptsToday,
    attemptsWeek,
    totalAttempts: recentAttempts.length,
    activeUsersTrend,
    activeUsersToday,
    activeUsersWeek,
    avgAccuracy,
    ratingsDist,
    topics,
    coverage,
    reasons: { top: topReasons },
    attempts7d,
    taggedWrong,
    totalWrong,
  }
}

/**
 * Aggregated dashboard bundle endpoint
 * Orchestrates data from multiple sources
 */
export async function dashboardBundle(req, res, next) {
  try {
    const userId = req.user.id
    const user = await User.findById(userId).select('name role dailyStreak lastActiveDate')

    // If admin, return platform-wide analytics
    if (user && user.role === 'admin') {
      console.log('Admin dashboard bundle requested by', userId)
      // Basic stats (official attempts across platform)
      const attemptsAll = await Attempt.find({ attemptType: 'official' }).select(
        'score attemptedAt'
      )
      const totalAttempts = attemptsAll.length
      const totalCorrect = attemptsAll.reduce((a, c) => a + (c.score || 0), 0)
      const accuracy =
        totalAttempts > 0 ? Number(((totalCorrect / (totalAttempts * 4)) * 100).toFixed(1)) : 0
      const today = startOfIST()
      const daySet = new Set(
        attemptsAll.map((a) => startOfIST(a.attemptedAt || a.createdAt).toISOString())
      )
      let rolling = 0
      for (let i = 0; i < 7; i++) {
        const d = new Date(today)
        d.setDate(today.getDate() - i)
        if (daySet.has(startOfIST(d).toISOString())) rolling++
        else break
      }
      const statsData = { totalAttempts, accuracy, rollingConsistentDays: rolling }

      // Get admin analytics from separate function
      const analyticsData = await getAdminAnalytics()

      // Today RCs (platform view)
      const start = startOfIST()
      const end = endOfIST()
      const rcs = await RcModel.find({
        status: { $in: ['scheduled', 'live'] },
        scheduledDate: { $gte: start, $lt: end },
      }).select('title topicTags status scheduledDate questions')
      const attemptsToday = await Attempt.find({ rcPassageId: { $in: rcs.map((r) => r._id) } })
      const attemptMap = new Map(attemptsToday.map((a) => [a.rcPassageId.toString(), a]))
      const todayData = rcs.map((rc) => ({
        id: rc._id,
        title: rc.title,
        topicTags: rc.topicTags,
        scheduledDate: rc.scheduledDate,
        status: attemptMap.get(rc._id.toString()) ? 'attempted' : 'pending',
        score: attemptMap.get(rc._id.toString())?.score ?? null,
      }))

      const todayFeedback = await Feedback.findOne({ date: start })
      const lockStatus = await feedbackLockInfo(userId)

      return success(res, {
        user,
        stats: statsData,
        analytics: analyticsData,
        today: todayData,
        feedback: { submitted: !!todayFeedback, lockStatus },
      })
    }

    // Non-admin: per-user dashboard
    // Basic stats
    const attemptsAll = await Attempt.find({ userId, attemptType: 'official' }).select(
      'score attemptedAt'
    )
    const totalAttempts = attemptsAll.length
    const totalCorrect = attemptsAll.reduce((a, c) => a + (c.score || 0), 0)
    const accuracy =
      totalAttempts > 0 ? Number(((totalCorrect / (totalAttempts * 4)) * 100).toFixed(1)) : 0
    const today = startOfIST()
    const daySet = new Set(
      attemptsAll.map((a) => startOfIST(a.attemptedAt || a.createdAt).toISOString())
    )
    let rolling = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      if (daySet.has(startOfIST(d).toISOString())) rolling++
      else break
    }
    const statsData = { totalAttempts, accuracy, rollingConsistentDays: rolling }

    // Get user analytics from separate function
    const analyticsData = await getUserAnalytics(userId)

    // Today RCs
    const start = startOfIST()
    const end = endOfIST()
    const rcs = await RcModel.find({
      status: { $in: ['scheduled', 'live'] },
      scheduledDate: { $gte: start, $lt: end },
    }).select('title topicTags status scheduledDate questions')
    const attemptsToday = await Attempt.find({
      userId,
      rcPassageId: { $in: rcs.map((r) => r._id) },
    })
    const attemptMap = new Map(attemptsToday.map((a) => [a.rcPassageId.toString(), a]))
    const todayData = rcs.map((rc) => ({
      id: rc._id,
      title: rc.title,
      topicTags: rc.topicTags,
      scheduledDate: rc.scheduledDate,
      status: attemptMap.get(rc._id.toString()) ? 'attempted' : 'pending',
      score: attemptMap.get(rc._id.toString())?.score ?? null,
    }))

    const todayFeedback = await Feedback.findOne({ userId, date: start })
    const lockStatus = await feedbackLockInfo(userId)

    return success(res, {
      user,
      stats: statsData,
      analytics: analyticsData,
      today: todayData,
      feedback: { submitted: !!todayFeedback, lockStatus },
    })
  } catch (e) {
    next(e)
  }
}
