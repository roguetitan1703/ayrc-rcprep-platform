import { Feedback } from '../models/Feedback.js'
import { FeedbackQuestion } from '../models/FeedbackQuestion.js'
import { success, badRequest } from '../utils/http.js'
import { startOfIST } from '../utils/date.js'
import { endOfIST } from '../utils/date.js'
import { z } from 'zod'
import mongoose from 'mongoose'

// Schema for dynamic answers
const answerSchema = z.array(
  z.object({
    questionId: z.string(),
    questionId: z.string(),
    type: z.enum(['rating', 'multi', 'open', 'redirect']),
    value: z.any(),
    expectedTime: z.number().int().min(0).optional(),
    timeSpent: z.number().int().min(0).optional(),
  })
)

export async function submitFeedback(req, res, next) {
  try {
    // Handle both formats: direct array or { answers: array }
    const answersPayload = Array.isArray(req.body) ? req.body : req.body?.answers

    if (!answersPayload || !Array.isArray(answersPayload) || answersPayload.length === 0) {
      return next(badRequest('No answers provided'))
    }

    const answers = answerSchema.parse(answersPayload)

    const today = startOfIST()

    await Feedback.findOneAndUpdate(
      { userId: req.user.id, date: today },
      { answers },
      { upsert: true, new: true }
    )

    return success(res, { ok: true })
  } catch (e) {
    // Handle duplicate submission
    if (e.code === 11000) {
      return next(badRequest('Feedback already submitted today'))
    }
    next(e)
  }
}

export async function getTodayFeedbackStatus(req, res, next) {
  try {
    const today = startOfIST()
    const todayEnd = endOfIST()
    // Check if there are any feedback questions for today
    // const todayStr = today.toISOString().slice(0, 10)
    const questions = await FeedbackQuestion.find().sort({ _id: 1 })
    const todaysQuestions = questions.filter(
      (q) => !q.date || (q.date >= today && q.date < todayEnd)
    )

    let fb = await Feedback.findOne({ userId: req.user.id, date: today })

    const hasQuestions = todaysQuestions && todaysQuestions.length > 0
    const isSubscribed = req.user?.subscription?.status === 'active'

    if (!hasQuestions && !fb && isSubscribed) {
      // No questions for today, auto-unlock by creating a Feedback doc
      fb = await Feedback.create({ userId: req.user.id, date: today, answers: [] })
    } else if (hasQuestions && !isSubscribed && !fb) {
      // Free user hasn't submitted feedback yet → remain locked
      return success(res, { submitted: false })
    }
    // ✅ If feedback exists or user is subscribed → allow access
    return success(res, { submitted: true })
  } catch (e) {
    next(e)
  }
}

export async function getTodaysQuestions(req, res, next) {
  try {
    const today = startOfIST()
    const todayEnd = endOfIST()
    // const todayStr = today.toISOString().slice(0, 10)

    const questions = await FeedbackQuestion.find().sort({ _id: 1 })

    const formatted = questions
      .filter((q) => !q.date || (q.date >= today && q.date < todayEnd)) // include global questions with null date
      .map((q) => ({
        id: q._id?.toString(),
        date: q.date,
        type: q.type,
        label: q.label,
        options: q.options || [],
        url: q.url || '',
        buttonText: q.buttonText || '',
        minWords: q.minWords || 0,
        time: q.time || 0,
      }))

    return success(res, formatted)
  } catch (e) {
    next(e)
  }
}

export async function getTodayAndFutureQuestions(req, res, next) {
  try {
    const today = startOfIST()
    const todayStr = today.toISOString().slice(0, 10)

    const questions = await FeedbackQuestion.find().sort({ _id: 1 })

    const formatted = questions
      .filter((q) => !q.date || q.date.toISOString().slice(0, 10) >= todayStr) // today + future + global
      .map((q) => ({
        id: q._id,
        date: q.date,
        type: q.type,
        label: q.label,
        options: q.options || [],
        url: q.url || '',
        buttonText: q.buttonText || '',
        minWords: q.minWords || 0,
        time: q.time || 0,
      }))

    return success(res, formatted)
  } catch (e) {
    next(e)
  }
}
// -----------------------------
// Validation schema for creating/updating a question
// -----------------------------
const questionSchema = z.object({
  type: z.enum(['rating', 'multi', 'open', 'redirect']),
  label: z.string(),
  options: z.array(z.string()).optional(),
  url: z.string().url().or(z.literal('')).optional(),
  buttonText: z.string().optional(),
  minWords: z.number().int().optional(),
  time: z.number().int().min(0).optional(),
  date: z.string().optional(), // ISO date string
})

// -----------------------------
// Create a new feedback question
// -----------------------------
export async function createFeedbackQuestion(req, res, next) {
  try {
    const data = questionSchema.parse(req.body)
    console.log(data)

    const question = new FeedbackQuestion({
      ...data,
      date: data.date ? new Date(data.date) : null,
    })

    await question.save()
    return success(res, question)
  } catch (e) {
    if (e.code === 11000) {
      return next(badRequest('Question with this ID already exists'))
    }
    next(e)
  }
}

// -----------------------------
// Update an existing feedback question
// -----------------------------
export async function updateFeedbackQuestion(req, res, next) {
  try {
    const id = req.params.id
    const data = questionSchema.partial().parse(req.body) // partial for updates

    if (data.date) {
      data.date = new Date(data.date)
    }

    const question = await FeedbackQuestion.findByIdAndUpdate(id, data, {
      new: true,
    })

    if (!question) return next(badRequest('Question not found'))

    return success(res, question)
  } catch (e) {
    next(e)
  }
}

// -----------------------------
// Delete a feedback question
// -----------------------------
export async function deleteFeedbackQuestion(req, res, next) {
  try {
    const id = req.params.id
    console.log(id)
    const question = await FeedbackQuestion.findByIdAndDelete(id)

    if (!question) return next(badRequest('Question not found'))

    return success(res, { ok: true })
  } catch (e) {
    next(e)
  }
}

// -----------------------------
// ADMIN: (Optional) Manually Archive a feedback question
// -----------------------------
export async function archiveFeedbackQuestion(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) {
      console.error(`Invalid question ID for archive: ${id}`)
      return next(badRequest('Invalid question ID format'))
    }
    console.log(`Received PATCH request to archive question ID: ${id}`)
    const question = await FeedbackQuestion.findByIdAndUpdate(
      id,
      { status: 'archived' },
      { new: true }
    )
    if (!question) {
      console.error(`Question not found for archive: ${id}`)
      return next(notFoundErr('Question not found'))
    }
    console.log(`Successfully archived question: ${id}`)
    return success(res, { message: 'Question archived successfully', question })
  } catch (e) {
    console.error('Error in archiveFeedbackQuestion:', e)
    next(e)
  }
}

// ADMIN: Get all feedback questions
export async function getAllFeedbackQuestions(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can access feedback questions' })
    }

    // 🕒 Get IST-based day boundaries
    const todayStart = startOfIST()
    const todayEnd = endOfIST()

    // 1️⃣ Archive questions older than today
    await FeedbackQuestion.updateMany(
      { date: { $lt: todayStart } },
      { $set: { status: 'archived' } }
    )

    // 2️⃣ Mark today's questions as live
    await FeedbackQuestion.updateMany(
      { date: { $gte: todayStart, $lt: todayEnd } },
      { $set: { status: 'live' } }
    )

    // 3️⃣ Mark future questions as scheduled
    await FeedbackQuestion.updateMany(
      { date: { $gte: todayEnd } },
      { $set: { status: 'scheduled' } }
    )

    // 4️⃣ Fetch all questions sorted by newest first
    const questions = await FeedbackQuestion.find().sort({ date: -1 })

    return success(res, { questions })
  } catch (e) {
    console.error('[getAllFeedbackQuestions] error:', e)
    next(e)
  }
}
// -----------------------------
// ADMIN: Republish archived/draft question
// -----------------------------
export async function republishFeedbackQuestion(req, res, next) {
  try {
    if (req.user.role !== 'admin') {
      return next(badRequest('Only admins can republish feedback questions'))
    }

    const { id } = req.params
    const { date } = req.body // Optional new date
    const updateData = { status: 'live' }
    if (date) updateData.date = new Date(date)
    const question = await FeedbackQuestion.findByIdAndUpdate(id, updateData, { new: true })
    if (!question) throw notFoundErr('Question not found')
    return success(res, {
      message: 'Question republished successfully',
      question,
    })
  } catch (e) {
    next(e)
  }
}
