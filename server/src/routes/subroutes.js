const express = require("express");
const subscription = require("../controllers/subController");
const authController = require("./../middleware/auth");

const router = express.Router();
router.route("/verify-payment").post(subscription.verifyPayment);
router.use(authController.authRequired);

// Subscription routes
router.route("/").post(subscription.subscribe).delete(subscription.unsubscribe);
router.route("/create-order").post(subscription.createOrder);


export default router
