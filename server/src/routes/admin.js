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
import * as planController from '../controllers/plan.Controller.js'

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
// Admin plan management
router.get('/plans', planController.adminListPlans)
router.post('/plans', planController.createPlan)
router.patch('/plans/:id', planController.updatePlan)
router.patch('/plans/:id/deactivate', planController.deactivatePlan)
router.delete('/plans/:id', planController.deletePlan)
export default router
