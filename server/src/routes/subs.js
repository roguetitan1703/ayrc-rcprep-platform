import express from "express";
import * as subscription from "../controllers/sub.Controller.js";
import { authRequired, requireRole } from "../middleware/auth.js";

const router = express.Router();

// Verify payment webhook (no auth required)
router.route("/verify-payment").post(subscription.verifyPayment);

// Protect all subscription routes
router.use(authRequired);

// Subscription routes
router.route("/create-order").post(subscription.createOrder);
router.use(requireRole('admin'))

router.get('/', subscription.getAllSubscriptions)
router.patch('/revoke/:id', subscription.revokeSubscription)
router.patch('/extend/:id', subscription.extendSubscription)

export default router;
