import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import {
  submitAttempt,
  saveProgress,
  getAnalysis,
  saveAnalysisFeedback,
} from '../controllers/attempt.controller.js'
import rateLimit from 'express-rate-limit'
import { enforceFeedbackLock } from '../middleware/policy.js'

const router = Router()
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 })
router.post('/', authRequired, enforceFeedbackLock, limiter, submitAttempt)
router.patch('/:id/progress', authRequired, saveProgress)
router.get('/analysis/:rcId', authRequired, getAnalysis)
router.patch('/:id/analysis-feedback', authRequired, saveAnalysisFeedback)
export default router
