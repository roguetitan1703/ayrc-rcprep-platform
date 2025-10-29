import { RcPassage } from '../models/RcPassage.js'
import { Attempt } from '../models/Attempt.js'
import { AnalyticsEvent } from '../models/AnalyticsEvent.js'
import { success, notFoundErr, badRequest } from '../utils/http.js'
import { startOfIST } from '../utils/date.js'

export async function listRcs(req, res, next) {
  try {
    const rcs = await RcPassage.find().sort({ createdAt: -1 })
    const now = new Date()
    const todayStr = now.toISOString().slice(0, 10)
    const updates = []
    for (const rc of rcs) {
      if (rc.scheduledDate) {
        const rcDate = new Date(rc.scheduledDate)
        const rcDateStr = rcDate.toISOString().slice(0, 10)
        // If scheduled for today and not live, set to live
        if (rc.status === 'scheduled' && rcDateStr === todayStr) {
          rc.status = 'live'
          if (!rc.topicTags.includes('live')) rc.topicTags.push('live')
          // Remove 'scheduled' tag if present
          rc.topicTags = rc.topicTags.filter((t) => t !== 'scheduled')
          updates.push(rc.save())
        }
        // If scheduled date is before today and not archived, set to archived
        if (
          (rc.status === 'live' || rc.status === 'scheduled') &&
          rcDate < now &&
          rcDateStr !== todayStr
        ) {
          rc.status = 'archived'
          if (!rc.topicTags.includes('archived')) rc.topicTags.push('archived')
          // Remove 'live' and 'scheduled' tags if present
          rc.topicTags = rc.topicTags.filter((t) => t !== 'live' && t !== 'scheduled')
          updates.push(rc.save())
        }
      }
    }
    if (updates.length) await Promise.all(updates)
    // Re-fetch to get updated statuses
    const updatedRcs = await RcPassage.find().sort({ createdAt: -1 })
    return success(res, updatedRcs)
  } catch (e) {
    next(e)
  }
}

export async function createRc(req, res, next) {
  try {
    const { title, passageText, source, topicTags, status, scheduledDate, questions } = req.body
    if (!title || !passageText || !Array.isArray(questions) || questions.length !== 4)
      throw badRequest('Invalid payload')
    const rc = await RcPassage.create({
      title,
      passageText,
      source,
      topicTags,
      status,
      scheduledDate,
      questions,
      createdBy: req.user.id,
    })
    return success(res, rc, 201)
  } catch (e) {
    next(e)
  }
}

export async function updateRc(req, res, next) {
  try {
    const rc = await RcPassage.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    })
    if (!rc) throw notFoundErr('RC not found')
    return success(res, rc)
  } catch (e) {
    next(e)
  }
}

export async function archiveRc(req, res, next) {
  try {
    const rc = await RcPassage.findByIdAndUpdate(
      req.params.id,
      { status: 'archived' },
      { new: true }
    )
    if (!rc) throw notFoundErr('RC not found')
    return success(res, rc)
  } catch (e) {
    next(e)
  }
}

export async function analyticsRcs(req, res, next) {
  try {
    // Admin-level aggregation across all RCs
    const rcs = await RcPassage.find()
      .select('title topicTags questions status scheduledDate')
      .lean()
    const out = []
    for (const rc of rcs) {
      const attempts = await Attempt.find({ rcPassageId: rc._id })
        .select('score durationSeconds deviceType answers analysisFeedback attemptedAt')
        .lean()
      const attemptsCount = attempts.length
      const avgScore = attemptsCount
        ? Number((attempts.reduce((s, a) => s + (a.score || 0), 0) / attemptsCount).toFixed(2))
        : 0
      const avgDuration = attemptsCount
        ? Math.round(attempts.reduce((s, a) => s + (a.durationSeconds || 0), 0) / attemptsCount)
        : 0
      const deviceMix = {}
      const reasonCounts = new Map()
      let totalWrong = 0
      let taggedWrong = 0
      attempts.forEach((a) => {
        deviceMix[a.deviceType || 'unknown'] = (deviceMix[a.deviceType || 'unknown'] || 0) + 1

        // First, identify which questions are incorrect for this attempt
        const incorrectQuestions = new Set()
        if (rc.questions && Array.isArray(rc.questions)) {
          rc.questions.forEach((q, i) => {
            const userAns = (a.answers && a.answers[i]) || ''
            const isCorrect = userAns && userAns === q.correctAnswerId
            if (!isCorrect) {
              totalWrong++
              incorrectQuestions.add(i)
            }
          })
        }

        // Only count tags for incorrect questions
        if (a.analysisFeedback && a.analysisFeedback.length) {
          a.analysisFeedback.forEach((f) => {
            if (incorrectQuestions.has(f.questionIndex)) {
              taggedWrong++
              reasonCounts.set(f.reason, (reasonCounts.get(f.reason) || 0) + 1)
            }
          })
        }
      })
      const coverage = totalWrong > 0 ? Number(((taggedWrong / totalWrong) * 100).toFixed(1)) : 0
      const topReasons = Array.from(reasonCounts.entries())
        .map(([reason, count]) => ({ reason, count }))
        .sort((a, b) => b.count - a.count)
      out.push({
        id: rc._id,
        title: rc.title,
        attemptsCount,
        avgScore,
        avgDuration,
        deviceMix,
        coverage,
        reasons: { top: topReasons },
      })
    }
    // attach 7-day trend per RC
    const today = new Date()
    const withTrend = []
    for (const item of out) {
      // find attempts for this rc in last 7 days
      const since = new Date()
      since.setDate(since.getDate() - 6) // 7 days inclusive
      const atts = await Attempt.find({ rcPassageId: item.id, attemptedAt: { $gte: since } })
        .select('attemptedAt')
        .lean()
      const trend = []
      for (let i = 6; i >= 0; i--) {
        const d = new Date(today)
        d.setDate(d.getDate() - i)
        d.setHours(0, 0, 0, 0)
        const key = d.toISOString()
        const cnt = atts.filter((a) => {
          const dd = new Date(a.attemptedAt)
          dd.setHours(0, 0, 0, 0)
          return dd.toISOString() === key
        }).length
        trend.push(cnt)
      }
      withTrend.push({ ...item, trend })
    }
    return success(res, withTrend)
  } catch (e) {
    next(e)
  }
}

// Detailed analytics for a single RC
export async function analyticsRcDetail(req, res, next) {
  try {
    const { id } = req.params
    const rc = await RcPassage.findById(id).lean()
    if (!rc) return next(notFoundErr('RC not found'))

    const attempts = await Attempt.find({ rcPassageId: id })
      .select(
        'userId score durationSeconds deviceType q_details analysisFeedback attemptedAt attemptType'
      )
      .lean()
    const attemptsCount = attempts.length
    const avgScore = attemptsCount
      ? Number((attempts.reduce((s, a) => s + (a.score || 0), 0) / attemptsCount).toFixed(2))
      : 0
    const avgDuration = attemptsCount
      ? Math.round(attempts.reduce((s, a) => s + (a.durationSeconds || 0), 0) / attemptsCount)
      : 0

    // device mix
    const deviceMix = {}
    attempts.forEach((a) => {
      deviceMix[a.deviceType || 'unknown'] = (deviceMix[a.deviceType || 'unknown'] || 0) + 1
    })

    // coverage & reasons
    let totalWrong = 0,
      taggedWrong = 0
    const reasonCounts = new Map()
    for (const a of attempts) {
      // First, identify which questions are incorrect for this attempt
      const incorrectQuestions = new Set()
      if (rc.questions && Array.isArray(rc.questions)) {
        rc.questions.forEach((q, i) => {
          const userAns =
            a.q_details && a.q_details[i] && a.q_details[i].isCorrect
              ? q.correctAnswerId
              : a.q_details && a.q_details[i]
              ? null
              : null
          if (a.q_details && a.q_details[i]) {
            if (!a.q_details[i].isCorrect) {
              totalWrong++
              incorrectQuestions.add(i)
            }
          } else {
            /* fallback */
            if (!(a.score && a.score > 0)) {
              totalWrong++
              incorrectQuestions.add(i)
            }
          }
        })
      }
      // Only count tags for incorrect questions
      if (a.analysisFeedback && a.analysisFeedback.length) {
        a.analysisFeedback.forEach((f) => {
          if (incorrectQuestions.has(f.questionIndex)) {
            taggedWrong++
            reasonCounts.set(f.reason, (reasonCounts.get(f.reason) || 0) + 1)
          }
        })
      }
    }
    const coverage =
      totalWrong > 0 ? Number((((totalWrong - taggedWrong) / totalWrong) * 100).toFixed(1)) : 0
    const topReasons = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)

    // accuracy by qType and qCategory using q_details
    const byQType = new Map()
    const byQCategory = new Map()
    for (const a of attempts) {
      if (!a.q_details) continue
      a.q_details.forEach((qd) => {
        const t = qd.qType || 'unknown'
        const c = qd.qCategory || 'unknown'
        if (!byQType.has(t)) byQType.set(t, { correct: 0, total: 0 })
        if (!byQCategory.has(c)) byQCategory.set(c, { correct: 0, total: 0 })
        byQType.get(t).total += 1
        if (qd.isCorrect) byQType.get(t).correct += 1
        byQCategory.get(c).total += 1
        if (qd.isCorrect) byQCategory.get(c).correct += 1
      })
    }
    const accuracyByQType = Array.from(byQType.entries()).map(([k, v]) => ({
      qType: k,
      accuracy: v.total ? Number(((v.correct / v.total) * 100).toFixed(1)) : 0,
      total: v.total,
    }))
    const accuracyByQCategory = Array.from(byQCategory.entries()).map(([k, v]) => ({
      qCategory: k,
      accuracy: v.total ? Number(((v.correct / v.total) * 100).toFixed(1)) : 0,
      total: v.total,
    }))

    // time of day buckets (based on attemptedAt)
    const timeOfDayBuckets = { morning: 0, afternoon: 0, evening: 0, night: 0 }
    attempts.forEach((a) => {
      const d = a.attemptedAt ? new Date(a.attemptedAt) : null
      if (!d) return
      const h = d.getHours()
      if (h >= 5 && h < 12) timeOfDayBuckets.morning++
      else if (h >= 12 && h < 17) timeOfDayBuckets.afternoon++
      else if (h >= 17 && h < 21) timeOfDayBuckets.evening++
      else timeOfDayBuckets.night++
    })

    // practice -> official conversion rate: percent of users who had a practice attempt and later an official
    const userMap = new Map()
    attempts.forEach((a) => {
      const uid = a.userId.toString()
      if (!userMap.has(uid)) userMap.set(uid, { practice: [], official: [] })
      userMap.get(uid)[a.attemptType === 'practice' ? 'practice' : 'official'].push(a)
    })
    let converters = 0,
      usersWithPractice = 0
    userMap.forEach((v, uid) => {
      if (v.practice.length > 0) {
        usersWithPractice++
        // check if there's an official attempt after any practice
        const practiceLatest = v.practice.reduce(
          (m, a) =>
            a.attemptedAt && (!m || new Date(a.attemptedAt) > new Date(m.attemptedAt)) ? a : m,
          null
        )
        const officialAfter = v.official.find(
          (o) =>
            practiceLatest &&
            o.attemptedAt &&
            new Date(o.attemptedAt) > new Date(practiceLatest.attemptedAt)
        )
        if (officialAfter) converters++
      }
    })
    const practiceConversionRate = usersWithPractice
      ? Number(((converters / usersWithPractice) * 100).toFixed(1))
      : 0

    // 30-day momentum (attempts per day for last 30 days)
    const momentumSince = new Date()
    momentumSince.setDate(momentumSince.getDate() - 29) // 30 days inclusive
    const momentum = []
    const today = new Date()
    for (let i = 29; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      d.setHours(0, 0, 0, 0)
      const key = d.toISOString()
      const cnt = attempts.filter((a) => {
        const dd = new Date(a.attemptedAt)
        dd.setHours(0, 0, 0, 0)
        return dd.toISOString() === key
      }).length
      momentum.push({ date: key.slice(0, 10), attempts: cnt })
    }

    // time-to-mastery: number of attempts a user took to reach mastery (score === number of questions OR threshold)
    // assume mastery threshold = full score (all correct)
    const attemptsByUser = new Map()
    attempts.forEach((a) => {
      const uid = String(a.userId)
      if (!attemptsByUser.has(uid)) attemptsByUser.set(uid, [])
      attemptsByUser.get(uid).push(a)
    })
    const toMasterList = []
    const masteryThreshold = rc.questions ? rc.questions.length : 4
    attemptsByUser.forEach((list) => {
      // sort by attemptedAt
      list.sort((x, y) => new Date(x.attemptedAt) - new Date(y.attemptedAt))
      let count = 0
      let mastered = false
      for (const at of list) {
        count++
        if ((at.score || 0) >= masteryThreshold) {
          mastered = true
          break
        }
      }
      if (mastered) toMasterList.push(count)
    })
    // build buckets for time-to-mastery: 1,2,3-5,6-10,>10
    const timeToMasterBuckets = { 1: 0, 2: 0, '3-5': 0, '6-10': 0, '10+': 0 }
    toMasterList.forEach((n) => {
      if (n === 1) timeToMasterBuckets['1']++
      else if (n === 2) timeToMasterBuckets['2']++
      else if (n >= 3 && n <= 5) timeToMasterBuckets['3-5']++
      else if (n >= 6 && n <= 10) timeToMasterBuckets['6-10']++
      else timeToMasterBuckets['10+']++
    })
    const median = toMasterList.length
      ? (function (arr) {
          const s = [...arr].sort((a, b) => a - b)
          const m = Math.floor((s.length - 1) / 2)
          return s.length % 2 === 1 ? s[m] : Math.round((s[m] + s[m + 1]) / 2)
        })(toMasterList)
      : null

    return success(res, {
      id: rc._id,
      title: rc.title,
      attemptsCount,
      avgScore,
      avgDuration,
      deviceMix,
      coverage,
      reasons: { top: topReasons },
      accuracyByQType,
      accuracyByQCategory,
      timeOfDay: timeOfDayBuckets,
      practiceConversionRate,
      momentum30: momentum,
      timeToMaster: { raw: toMasterList, buckets: timeToMasterBuckets, median },
    })
  } catch (e) {
    next(e)
  }
}

// Admin: analytics for a specific user (student)
export async function analyticsUser(req, res, next) {
  try {
    const { id } = req.params
    const userId = id
    const attemptsAll = await Attempt.find({ userId })
      .select(
        'score attemptedAt answers rcPassageId q_details analysisFeedback durationSeconds attemptType deviceType'
      )
      .lean()
    // overall stats
    const totalAttempts = attemptsAll.length
    const totalCorrect = attemptsAll.reduce((a, c) => a + (c.score || 0), 0)
    const accuracy = totalAttempts
      ? Number(((totalCorrect / (totalAttempts * 4)) * 100).toFixed(1))
      : 0

    // attempts7d & trend
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const recent = attemptsAll.filter((a) => new Date(a.attemptedAt) >= since)
    const today = new Date()
    const trend = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const start = new Date(d)
      start.setHours(0, 0, 0, 0)
      const key = start.toISOString()
      const count = recent.filter((a) => {
        const dd = new Date(a.attemptedAt)
        dd.setHours(0, 0, 0, 0)
        return dd.toISOString() === key
      }).length
      trend.push({ date: key.slice(0, 10), attempts: count })
    }
    const attempts7d = trend.reduce((s, t) => s + t.attempts, 0)

    // coverage & top reasons
    let totalWrong = 0,
      taggedWrong = 0
    const reasonCounts = new Map()
    for (const a of recent) {
      // First, identify which questions are incorrect for this attempt
      const incorrectQuestions = new Set()
      if (a.q_details && a.q_details.length) {
        a.q_details.forEach((qd, idx) => {
          if (!qd.isCorrect) {
            totalWrong++
            incorrectQuestions.add(idx)
          }
        })
      }
      // Only count tags for incorrect questions
      if (a.analysisFeedback && a.analysisFeedback.length) {
        a.analysisFeedback.forEach((f) => {
          if (incorrectQuestions.has(f.questionIndex)) {
            taggedWrong++
            reasonCounts.set(f.reason, (reasonCounts.get(f.reason) || 0) + 1)
          }
        })
      }
    }
    const coverage =
      totalWrong > 0 ? Number((((totalWrong - taggedWrong) / totalWrong) * 100).toFixed(1)) : 0
    const topReasons = Array.from(reasonCounts.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)

    // accuracy by qType using q_details
    const byQType = new Map()
    recent.forEach((a) => {
      if (!a.q_details) return
      a.q_details.forEach((qd) => {
        const t = qd.qType || 'unknown'
        if (!byQType.has(t)) byQType.set(t, { correct: 0, total: 0 })
        byQType.get(t).total++
        if (qd.isCorrect) byQType.get(t).correct++
      })
    })
    const accuracyByQType = Array.from(byQType.entries()).map(([k, v]) => ({
      qType: k,
      accuracy: v.total ? Number(((v.correct / v.total) * 100).toFixed(1)) : 0,
      total: v.total,
    }))

    return success(res, {
      totalAttempts,
      accuracy,
      attempts7d,
      trend,
      coverage,
      reasons: { top: topReasons },
      accuracyByQType,
    })
  } catch (e) {
    next(e)
  }
}

// Monthly schedule summary: counts per IST day within month, and whether underfilled/overfilled
export async function getMonthlySchedule(req, res, next) {
  try {
    const year = parseInt(req.query.year, 10)
    const month = parseInt(req.query.month, 10) // 0-11
    if (isNaN(year) || isNaN(month))
      return res.status(400).json({ error: 'year and month required' })
    const monthStart = new Date(Date.UTC(year, month, 1, 0, 0, 0))
    const nextMonth = new Date(Date.UTC(year, month + 1, 1, 0, 0, 0))
    const rcs = await RcPassage.find({
      scheduledDate: { $gte: monthStart, $lt: nextMonth },
    }).select('scheduledDate status')
    const map = {}
    for (const rc of rcs) {
      const d = startOfIST(rc.scheduledDate)
      const key = d.toISOString().slice(0, 10)
      map[key] = (map[key] || 0) + 1
    }
    const days = []
    let cursor = new Date(monthStart)
    while (cursor < nextMonth) {
      const key = cursor.toISOString().slice(0, 10)
      const count = map[key] || 0
      days.push({ date: key, count, status: count === 2 ? 'ideal' : count < 2 ? 'under' : 'over' })
      cursor.setUTCDate(cursor.getUTCDate() + 1)
    }
    return success(res, days)
  } catch (e) {
    next(e)
  }
}
