import { Attempt } from '../models/Attempt.js'
import { RcPassage } from '../models/RcPassage.js' // Need to import this model now
import { success, notFoundErr, badRequest } from '../utils/http.js'
import { buildPerformanceStudio } from '../services/analytics.service.js'
import mongoose from 'mongoose'

// --- IN-MEMORY CACHING ---
const leaderboardCache = {}
// Removed DEFAULT_TAG since we fetch all
const now = new Date()
const CURRENT_YEAR = now.getFullYear()
const CURRENT_MONTH_0_INDEX = now.getMonth()

// --- LEADERBOARD AGGREGATION FUNCTIONS (LIMITED TO TOP 10) ---
// (getTodaysLeaderboard and getMonthlyLeaderboard remain mostly the same,
// keeping the error fixes from the previous interaction.)

// ... (getTodaysLeaderboard function definition remains the same) ...

const getTodaysLeaderboard = async () => {
  // ... (omitted for brevity, assume the fixed code from the last response is here) ...
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const tomorrow = new Date(today)
  tomorrow.setDate(tomorrow.getDate() + 1)

  return Attempt.aggregate([
    {
      $lookup: {
        from: 'rcpassages',
        localField: 'rcPassageId',
        foreignField: '_id',
        as: 'rcDetails',
      },
    },
    { $unwind: '$rcDetails' },
    { $match: { 'rcDetails.scheduledDate': { $gte: today, $lt: tomorrow } } },

    {
      $addFields: {
        totalQuestions: { $size: { $ifNull: ['$rcDetails.questions', []] } },
        correctAnswers: {
          $size: {
            $filter: {
              input: { $ifNull: ['$q_details', []] },
              as: 'detail',
              cond: { $eq: ['$$detail.isCorrect', true] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        attemptAccuracy: {
          $cond: {
            if: { $eq: ['$totalQuestions', 0] },
            then: 0,
            else: { $divide: ['$correctAnswers', '$totalQuestions'] },
          },
        },
      },
    },

    {
      $group: {
        _id: '$userId',
        attemptsToday: { $sum: 1 },
        avgAccuracy: { $avg: '$attemptAccuracy' },
        totalTimeSeconds: { $sum: '$durationSeconds' },
      },
    },

    { $sort: { avgAccuracy: -1, totalTimeSeconds: 1 } },
    { $limit: 10 },

    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
    { $unwind: '$userDetails' },

    {
      $project: {
        _id: 0,
        name: '$userDetails.name',
        accuracy: { $round: [{ $multiply: ['$avgAccuracy', 100] }, 2] },
        timeTakenSeconds: '$totalTimeSeconds',
        rcsAttempted: '$attemptsToday',
      },
    },
  ])
}

// ... (getMonthlyLeaderboard function definition remains the same) ...

const getMonthlyLeaderboard = async (year, month) => {
  // ... (omitted for brevity, assume the fixed code from the last response is here) ...
  const startDate = new Date(year, month, 1)
  const endDate = new Date(year, month + 1, 1)

  return Attempt.aggregate([
    {
      $lookup: {
        from: 'rcpassages',
        localField: 'rcPassageId',
        foreignField: '_id',
        as: 'rcDetails',
      },
    },
    { $unwind: '$rcDetails' },
    { $match: { 'rcDetails.scheduledDate': { $gte: startDate, $lt: endDate } } },

    {
      $addFields: {
        totalQuestions: { $size: { $ifNull: ['$rcDetails.questions', []] } },
        correctAnswers: {
          $size: {
            $filter: {
              input: { $ifNull: ['$q_details', []] },
              as: 'detail',
              cond: { $eq: ['$$detail.isCorrect', true] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        attemptAccuracy: {
          $cond: {
            if: { $eq: ['$totalQuestions', 0] },
            then: 0,
            else: { $divide: ['$correctAnswers', '$totalQuestions'] },
          },
        },
      },
    },

    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        avgAccuracy: { $avg: '$attemptAccuracy' },
        totalTimeSeconds: { $sum: '$durationSeconds' },
      },
    },

    { $sort: { avgAccuracy: -1, totalTimeSeconds: 1 } },
    { $limit: 10 },

    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
    { $unwind: '$userDetails' },

    {
      $project: {
        _id: 0,
        name: '$userDetails.name',
        averageAccuracy: { $round: [{ $multiply: ['$avgAccuracy', 100] }, 2] },
        totalTimeSeconds: '$totalTimeSeconds',
        attemptsCount: '$totalAttempts',
      },
    },
  ])
}

/**
 * NEW FUNCTION: Calculates leaderboards for ALL unique tags and returns them in a map.
 */
const getAllTagLeaderboards = async () => {
  // 1. Get all unique tags from RcPassage
  const uniqueTagsResult = await RcPassage.aggregate([
    { $unwind: '$topicTags' },
    { $group: { _id: '$topicTags' } },
  ])
  const allTags = uniqueTagsResult.map((item) => item._id)

  // 2. Base pipeline for tag-wise leaderboard (up to the $match stage)
  const tagBasePipeline = [
    {
      $lookup: {
        from: 'rcpassages',
        localField: 'rcPassageId',
        foreignField: '_id',
        as: 'rcDetails',
      },
    },
    { $unwind: '$rcDetails' },
    // $match will be inserted here

    {
      $addFields: {
        totalQuestions: { $size: { $ifNull: ['$rcDetails.questions', []] } },
        correctAnswers: {
          $size: {
            $filter: {
              input: { $ifNull: ['$q_details', []] },
              as: 'detail',
              cond: { $eq: ['$$detail.isCorrect', true] },
            },
          },
        },
      },
    },
    {
      $addFields: {
        attemptAccuracy: {
          $cond: {
            if: { $eq: ['$totalQuestions', 0] },
            then: 0,
            else: { $divide: ['$correctAnswers', '$totalQuestions'] },
          },
        },
      },
    },

    {
      $group: {
        _id: '$userId',
        totalAttempts: { $sum: 1 },
        avgAccuracy: { $avg: '$attemptAccuracy' },
        totalTimeSeconds: { $sum: '$durationSeconds' },
      },
    },

    { $sort: { avgAccuracy: -1, totalTimeSeconds: 1 } },
    { $limit: 10 },

    { $lookup: { from: 'users', localField: '_id', foreignField: '_id', as: 'userDetails' } },
    { $unwind: '$userDetails' },

    {
      $project: {
        _id: 0,
        name: '$userDetails.name',
        averageAccuracy: { $round: [{ $multiply: ['$avgAccuracy', 100] }, 2] },
        totalTimeSeconds: '$totalTimeSeconds',
        attemptsCount: '$totalAttempts',
      },
    },
  ]

  // 3. Execute pipeline for every tag concurrently
  const leaderboardPromises = allTags.map((tag) => {
    const pipeline = [
      ...tagBasePipeline.slice(0, 2), // up to $unwind
      { $match: { 'rcDetails.topicTags': tag } }, // Insert tag filter
      ...tagBasePipeline.slice(2), // rest of the pipeline
    ]
    return Attempt.aggregate(pipeline)
  })

  const resultsArray = await Promise.all(leaderboardPromises)

  // 4. Map results back to tag names
  const resultsMap = allTags.reduce((acc, tag, index) => {
    acc[tag] = resultsArray[index]
    return acc
  }, {})

  return { allTags, leaderboards: resultsMap }
}

// --- SINGLE CACHE BUSTER FUNCTION ---

const getTotalAttemptCount = async () => {
  return Attempt.countDocuments({})
}

// --- MAIN CONTROLLER ---

const MASTER_CACHE_KEY = 'all_leaderboards_v2' // Bump key version due to data structure change

export async function leaderboard(req, res, next) {
  try {
    const cachedData = leaderboardCache[MASTER_CACHE_KEY]
    const currentTotalAttempts = await getTotalAttemptCount()
    let results = {}

    // 1. Check Cache
    if (cachedData && cachedData.count === currentTotalAttempts) {
      console.log(`Cache HIT for ${MASTER_CACHE_KEY}. Count: ${currentTotalAttempts}`)
      results = cachedData.data
    } else {
      // Cache MISS or STALE: Recalculate all three leaderboards in parallel.
      console.log(`Cache MISS/STALE for ${MASTER_CACHE_KEY}. Recalculating...`)

      // Execute all three leaderboards concurrently using Promise.all
      const [todayLB, monthlyLB, tagData] = await Promise.all([
        getTodaysLeaderboard(),
        getMonthlyLeaderboard(CURRENT_YEAR, CURRENT_MONTH_0_INDEX),
        getAllTagLeaderboards(), // New function returns { allTags, leaderboards }
      ])

      results = {
        today: todayLB,
        monthly: monthlyLB,
        tags: tagData.allTags, // Send all tags list
        tagLeaderboards: tagData.leaderboards, // Send the map of leaderboards
      }

      // Update Cache
      leaderboardCache[MASTER_CACHE_KEY] = {
        count: currentTotalAttempts,
        data: results,
        timestamp: Date.now(),
      }
    }

    // 2. Final Response Check
    const totalEntries =
      results.today.length +
      Object.values(results.tagLeaderboards).flat().length +
      results.monthly.length
    if (totalEntries === 0) {
      return notFoundErr(res, 'No attempts found to generate leaderboards.')
    }

    // 3. Return All Leaderboards
    return success(res, results)
  } catch (e) {
    console.error('Leaderboard Error:', e)
    next(e)
  }
}

/**
 * Performance Studio Endpoint
 * Returns unified analytics payload for Performance Studio UI
 * Supports optional date range filtering via query params
 */
export async function performanceDetail(req, res, next) {
  try {
    const userId = req.user.id

    // Parse optional date range from query params
    const range = {}
    if (req.query.startDate) {
      range.start = new Date(req.query.startDate)
    }
    if (req.query.endDate) {
      range.end = new Date(req.query.endDate)
    }

    const performanceData = await buildPerformanceStudio(userId, range)

    return success(res, performanceData)
  } catch (e) {
    console.error('Performance Detail Error:', e)
    next(e)
  }
}
