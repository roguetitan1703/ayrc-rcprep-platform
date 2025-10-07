import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import {
  submitAttempt,
  saveProgress,
  getAnalysis,
  // saveAnalysisFeedback, // Removed - duplicate functionality with captureReason
  listUserAttempts,
  captureReason,
  saveAnalysisNotes,
} from '../controllers/attempt.controller.js'
import rateLimit from 'express-rate-limit'
import { enforceFeedbackLock } from '../middleware/policy.js'

const router = Router()
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 })

router.get('/', authRequired, listUserAttempts)
router.post('/', authRequired, enforceFeedbackLock, limiter, submitAttempt)
router.patch('/:id/progress', authRequired, saveProgress)
router.get('/analysis/:rcId', authRequired, getAnalysis)
// Removed: /analysis-feedback (duplicate of /reasons endpoint)
router.patch('/:id/reasons', authRequired, captureReason)
router.patch('/:id/analysis-notes', authRequired, saveAnalysisNotes)

export default router
