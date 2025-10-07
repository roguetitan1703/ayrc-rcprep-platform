import { Router } from 'express'
import { authRequired, requireRole } from '../middleware/auth.js'
import {
  submitFeedback,
  getTodayFeedbackStatus,
  getTodaysQuestions,
  createFeedbackQuestion,
  updateFeedbackQuestion,
  deleteFeedbackQuestion,
  getTodayAndFutureQuestions,
} from '../controllers/feedback.controller.js'
import { feedbackLockInfo } from '../middleware/policy.js'
import { success } from '../utils/http.js'

const router = Router()

// User routes
router.post('/', authRequired, submitFeedback)
router.get('/today', authRequired, getTodayFeedbackStatus)
router.get('/questions/today', authRequired, getTodaysQuestions)
router.get('/lock-status', authRequired, async (req, res, next) => {
  try {
    const info = await feedbackLockInfo(req.user.id)
    return success(res, info)
  } catch (e) {
    next(e)
  }
})

// Admin routes for managing feedback questions
router.post(
  '/questions',
  authRequired,
  requireRole('admin'),
  createFeedbackQuestion
)
router.get(
  '/questions/future',
  authRequired,
  requireRole('admin'),
  getTodayAndFutureQuestions
)

router.put(
  '/questions/:id',
  authRequired,
  requireRole('admin'),
  updateFeedbackQuestion
)

router.delete(
  '/questions/:id',
  authRequired,
  requireRole('admin'),
  deleteFeedbackQuestion
)

export default router
