import { Router } from 'express'
import { authRequired, requireRole } from '../middleware/auth.js'
import { listRcs, createRc, updateRc, archiveRc } from '../controllers/admin.controller.js'
import { getMonthlySchedule } from '../controllers/rc.controller.js'

const router = Router()
router.use(authRequired, requireRole('admin'))
router.get('/rcs', listRcs)
router.post('/rcs', createRc)
router.put('/rcs/:id', updateRc)
router.delete('/rcs/:id', archiveRc)
router.get('/rcs-monthly', getMonthlySchedule)
export default router
