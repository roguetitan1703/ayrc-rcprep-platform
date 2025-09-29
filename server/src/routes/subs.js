import express from "express";
import * as subscription from "../controllers/sub.Controller.js";
import { authRequired } from "../middleware/auth.js";

const router = express.Router();

// Verify payment webhook (no auth required)
router.route("/verify-payment").post(subscription.verifyPayment);

// Protect all subscription routes
router.use(authRequired);

// Subscription routes
router.route("/create-order").post(subscription.createOrder);

export default router;
