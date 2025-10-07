import { Router } from 'express'
import { me, updateMe, changePassword, stats, analytics } from '../controllers/auth.controller.js'
import { dashboardBundle } from '../controllers/dashboard.controller.js'
import { authRequired } from '../middleware/auth.js'

const router = Router()
router.get('/me', authRequired, me)
router.patch('/me', authRequired, updateMe)
router.post('/me/change-password', authRequired, changePassword)
router.get('/me/stats', authRequired, stats)
router.get('/me/analytics', authRequired, analytics)
router.get('/me/dashboard', authRequired, dashboardBundle)
export default router
