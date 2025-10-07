import { Router } from 'express'
import { authRequired, requireRole } from '../middleware/auth.js'
import {
  listRcs,
  createRc,
  updateRc,
  archiveRc,
  analyticsRcs,
  analyticsRcDetail,
  analyticsUser,
  getMonthlySchedule,
} from '../controllers/admin.controller.js'

const router = Router()
router.use(authRequired, requireRole('admin'))
router.get('/rcs', listRcs)
router.get('/rcs-analytics', analyticsRcs)
router.get('/rcs/:id/analytics', analyticsRcDetail)
router.get('/users/:id/analytics', analyticsUser)
router.post('/rcs', createRc)
router.put('/rcs/:id', updateRc)
router.delete('/rcs/:id', archiveRc)
router.get('/rcs-monthly', getMonthlySchedule)
export default router
