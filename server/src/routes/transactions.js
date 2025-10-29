import express from 'express'
import * as txCtrl from '../controllers/transaction.Controller.js'
import { authRequired, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Admin-only transactions API
router.use(authRequired)
router.use(requireRole('admin'))

router.get('/', txCtrl.listTransactions)
router.get('/:id', txCtrl.getTransactionById)

export default router
