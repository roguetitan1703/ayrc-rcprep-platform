import { Attempt } from '../models/Attempt.js'
import { RcPassage } from '../models/RcPassage.js'
import { User } from '../models/User.js'

/**
 * Build question-level rollups for accuracy by question type and category
 * Returns arrays of accuracy percentages grouped by type and category
 *
 * @param {string} userId - User ID
 * @param {Object} range - Date range { start: Date, end: Date }
 * @returns {Promise<Object>} - { byType: [], byCategory: [], topicDistribution: [] }
 */
export async function buildQuestionRollups(userId, range = {}) {
  const query = { userId, attemptType: 'official' }
  if (range.start || range.end) {
    query.attemptedAt = {}
    if (range.start) query.attemptedAt.$gte = range.start
    if (range.end) query.attemptedAt.$lte = range.end
  }

  const attempts = await Attempt.find(query).lean()

  // Aggregate accuracy by question type
  const typeMap = new Map()
  const categoryMap = new Map()

  attempts.forEach((attempt) => {
    if (!attempt.q_details || attempt.q_details.length === 0) return

    attempt.q_details.forEach((qd) => {
      const type = qd.qType || 'unknown'
      const category = qd.qCategory || 'unknown'

      // By type
      if (!typeMap.has(type)) typeMap.set(type, { correct: 0, total: 0 })
      const typeStats = typeMap.get(type)
      typeStats.total += 1
      if (qd.isCorrect) typeStats.correct += 1

      // By category
      if (!categoryMap.has(category)) categoryMap.set(category, { correct: 0, total: 0 })
      const catStats = categoryMap.get(category)
      catStats.total += 1
      if (qd.isCorrect) catStats.correct += 1
    })
  })

  const byType = Array.from(typeMap.entries()).map(([type, stats]) => ({
    type,
    accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    totalQuestions: stats.total,
  }))

  const byCategory = Array.from(categoryMap.entries()).map(([category, stats]) => ({
    category,
    accuracy: stats.total > 0 ? (stats.correct / stats.total) * 100 : 0,
    totalQuestions: stats.total,
  }))

  // Topic distribution for treemap/sunburst
  const topicDistribution = byCategory.map((item) => ({
    name: item.category,
    value: item.totalQuestions,
    accuracy: item.accuracy,
  }))

  return { byType, byCategory, topicDistribution }
}

/**
 * Build progress timeline showing score trends over time
 * Returns array of { date, score, rcId, rcTitle } sorted chronologically
 *
 * @param {string} userId - User ID
 * @param {Object} range - Date range { start: Date, end: Date }
 * @returns {Promise<Array>} - Timeline data
 */
export async function buildProgressTimeline(userId, range = {}) {
  const query = { userId, attemptType: 'official' }
  if (range.start || range.end) {
    query.attemptedAt = {}
    if (range.start) query.attemptedAt.$gte = range.start
    if (range.end) query.attemptedAt.$lte = range.end
  }

  const attempts = await Attempt.find(query).sort({ attemptedAt: 1 }).lean()

  // Enrich with RC titles
  const rcIds = [...new Set(attempts.map((a) => a.rcPassageId.toString()))]
  const rcs = await RcPassage.find({ _id: { $in: rcIds } })
    .select('title topicTags')
    .lean()
  const rcMap = new Map(rcs.map((rc) => [rc._id.toString(), rc]))

  const timeline = attempts.map((attempt) => {
    const rc = rcMap.get(attempt.rcPassageId.toString())
    return {
      date: attempt.attemptedAt,
      score: attempt.score,
      rcId: attempt.rcPassageId,
      rcTitle: rc?.title || 'Unknown',
      topicTags: rc?.topicTags || [],
    }
  })

  return timeline
}

/**
 * Build radar chart dataset for multi-dimensional skill assessment
 * Returns array of { dimension, value } for radar visualization
 *
 * @param {string} userId - User ID
 * @param {Object} range - Date range { start: Date, end: Date }
 * @returns {Promise<Array>} - Radar dataset
 */
export async function buildRadarDataset(userId, range = {}) {
  const rollups = await buildQuestionRollups(userId, range)

  // Map question types to radar dimensions
  const typeMapping = {
    'main-idea': 'Main Idea',
    inference: 'Inference',
    detail: 'Detail Recognition',
    vocabulary: 'Vocabulary',
    'tone-attitude': 'Tone & Attitude',
    'structure-function': 'Structure Analysis',
    application: 'Application',
  }

  const radarData = rollups.byType.map((item) => ({
    dimension: typeMapping[item.type] || item.type,
    value: Math.round(item.accuracy),
    totalQuestions: item.totalQuestions,
  }))

  // Ensure all dimensions are present (fill missing with 0)
  Object.keys(typeMapping).forEach((type) => {
    if (!radarData.find((d) => d.dimension === typeMapping[type])) {
      radarData.push({
        dimension: typeMapping[type],
        value: 0,
        totalQuestions: 0,
      })
    }
  })

  return radarData
}

/**
 * Calculate advanced performance metrics
 * Includes consistency score, improvement rate, time efficiency
 *
 * @param {string} userId - User ID
 * @param {Object} range - Date range { start: Date, end: Date }
 * @returns {Promise<Object>} - Advanced metrics
 */
export async function calculateAdvancedMetrics(userId, range = {}) {
  const query = { userId, attemptType: 'official' }
  if (range.start || range.end) {
    query.attemptedAt = {}
    if (range.start) query.attemptedAt.$gte = range.start
    if (range.end) query.attemptedAt.$lte = range.end
  }

  const attempts = await Attempt.find(query).sort({ attemptedAt: 1 }).lean()

  if (attempts.length === 0) {
    return {
      consistencyScore: 0,
      improvementRate: 0,
      avgTimePerQuestion: 0,
      speedAccuracyBalance: 0,
    }
  }

  // Consistency: standard deviation of scores (lower is more consistent)
  const scores = attempts.map((a) => a.score)
  const avgScore = scores.reduce((sum, s) => sum + s, 0) / scores.length
  const variance = scores.reduce((sum, s) => sum + Math.pow(s - avgScore, 2), 0) / scores.length
  const stdDev = Math.sqrt(variance)
  const consistencyScore = Math.max(0, 100 - stdDev * 25) // Scale to 0-100

  // Improvement rate: compare first half vs second half
  const mid = Math.floor(attempts.length / 2)
  const firstHalf = attempts.slice(0, mid)
  const secondHalf = attempts.slice(mid)
  const firstAvg = firstHalf.reduce((sum, a) => sum + a.score, 0) / firstHalf.length
  const secondAvg = secondHalf.reduce((sum, a) => sum + a.score, 0) / secondHalf.length
  const improvementRate = secondAvg - firstAvg

  // Time efficiency
  const totalQuestions = attempts.length * 4 // 4 questions per RC
  const totalTime = attempts.reduce((sum, a) => sum + (a.durationSeconds || 0), 0)
  const avgTimePerQuestion = totalQuestions > 0 ? totalTime / totalQuestions : 0

  // Speed-accuracy balance (higher is better balance)
  const avgAccuracy = (avgScore / 4) * 100
  const speedScore = avgTimePerQuestion > 0 ? Math.min(100, (120 / avgTimePerQuestion) * 100) : 0
  const speedAccuracyBalance = (avgAccuracy + speedScore) / 2

  return {
    consistencyScore: Math.round(consistencyScore),
    improvementRate: Math.round(improvementRate * 100) / 100,
    avgTimePerQuestion: Math.round(avgTimePerQuestion),
    speedAccuracyBalance: Math.round(speedAccuracyBalance),
    totalAttempts: attempts.length,
    avgScore: Math.round(avgScore * 100) / 100,
  }
}

/**
 * Build complete performance studio dataset
 * Combines all analytics for unified performance view
 *
 * @param {string} userId - User ID
 * @param {Object} range - Date range { start: Date, end: Date }
 * @returns {Promise<Object>} - Complete performance data
 */
export async function buildPerformanceStudio(userId, range = {}) {
  const [rollups, timeline, radar, metrics, user] = await Promise.all([
    buildQuestionRollups(userId, range),
    buildProgressTimeline(userId, range),
    buildRadarDataset(userId, range),
    calculateAdvancedMetrics(userId, range),
    User.findById(userId).select('dailyStreak personalBest').lean(),
  ])

  return {
    overview: {
      dailyStreak: user?.dailyStreak || 0,
      personalBest: user?.personalBest || 0,
      totalAttempts: metrics.totalAttempts,
      avgScore: metrics.avgScore,
    },
    questionRollups: rollups,
    progressTimeline: timeline,
    radarData: radar,
    advancedMetrics: metrics,
  }
}
