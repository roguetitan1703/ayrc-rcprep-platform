import express from 'express'
import * as subscription from '../controllers/sub.Controller.js'
import * as planController from '../controllers/plan.Controller.js'
import { authRequired, requireRole } from '../middleware/auth.js'

const router = express.Router()

// Verify payment webhook (no auth required)
router.route('/verify-payment').post(subscription.verifyPayment)

// Public: list available plans
router.get('/plans', planController.listPublicPlans)

// Protect all subscription routes
router.use(authRequired)

// Subscription routes
router.route('/create-order').post(subscription.createOrder)
router.use(requireRole('admin'))

router.get('/', subscription.getAllSubscriptions)
router.patch('/revoke/:id', subscription.revokeSubscription)
router.patch('/extend/:id', subscription.extendSubscription)
// Admin: manually assign a subscription to a user (reconciliation)
router.post('/admin/assign', subscription.adminAssignSubscription)

export default router
