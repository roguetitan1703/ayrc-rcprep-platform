import { Router } from 'express'
import { authRequired } from '../middleware/auth.js'
import { leaderboard, performanceDetail } from '../controllers/aggregation.controller.js'
import rateLimit from 'express-rate-limit'

const router = Router()
const limiter = rateLimit({ windowMs: 60 * 1000, max: 20 })

router.get('/leaderboard', authRequired, leaderboard)
router.get('/performance', authRequired, limiter, performanceDetail)

export default router
