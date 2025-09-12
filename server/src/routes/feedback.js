import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import { submitFeedback, getTodayFeedbackStatus } from '../controllers/feedback.controller.js'
import { feedbackLockInfo } from '../middleware/policy.js'
import { success } from '../utils/http.js'

const router = Router()
router.post('/', authRequired, submitFeedback)
router.get('/today', authRequired, getTodayFeedbackStatus)
router.get('/lock-status', authRequired, async (req, res, next) => {
  try {
    const info = await feedbackLockInfo(req.user.id)
    return success(res, info)
  } catch (e) {
    next(e)
  }
})
export default router
