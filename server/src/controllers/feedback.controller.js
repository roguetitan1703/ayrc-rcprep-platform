import { Feedback } from '../models/Feedback.js'
import { success, badRequest } from '../utils/http.js'
import { startOfIST } from '../utils/date.js'
import { z } from 'zod'

const feedbackSchema = z.object({
  difficultyRating: z.number().int().min(1).max(5),
  explanationClarityRating: z.number().int().min(1).max(5),
  comment: z.string().max(1000).optional(),
})

export async function submitFeedback(req, res, next) {
  try {
    const { difficultyRating, explanationClarityRating, comment } = feedbackSchema.parse(req.body)
    const today = startOfIST()
    await Feedback.findOneAndUpdate(
      { userId: req.user.id, date: today },
      { difficultyRating, explanationClarityRating, comment },
      { upsert: true, new: true }
    )
    return success(res, { ok: true })
  } catch (e) {
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
