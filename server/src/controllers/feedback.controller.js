import { Feedback } from '../models/Feedback.js'
import { FeedbackQuestion } from '../models/FeedbackQuestion.js'
import { success, badRequest } from '../utils/http.js'
import { startOfIST } from '../utils/date.js'
import { z } from 'zod'

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
    const answersPayload = Array.isArray(req.body) ? req.body : req.body.answers
    const answers = answerSchema.parse(answersPayload)

    if (!answers || answers.length === 0) return badRequest(res, 'No answers provided')

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
      return badRequest(res, 'Feedback already submitted today')
    }
    next(e)
  }
}

export async function getTodayFeedbackStatus(req, res, next) {
  try {
    const today = startOfIST()
    const fb = await Feedback.findOne({ userId: req.user.id, date: today })
    return success(res, { submitted: !!fb })
  } catch (e) {
    next(e)
  }
}

export async function getTodaysQuestions(req, res, next) {
  try {
    const today = startOfIST()
    const todayStr = today.toISOString().slice(0, 10) // 'YYYY-MM-DD'

    const questions = await FeedbackQuestion.find().sort({ _id: 1 })

    const formatted = questions
      .filter((q) => q.date?.toISOString().slice(0, 10) === todayStr || !q.date) // include global questions with null date
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
      return badRequest(res, 'Question with this ID already exists')
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

    if (!question) return badRequest(res, 'Question not found')

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

    if (!question) return badRequest(res, 'Question not found')

    return success(res, { ok: true })
  } catch (e) {
    next(e)
  }
}
