import { User } from "../models/User.js";
import Razorpay from "razorpay";
import crypto from "crypto";
import mongoose from "mongoose";

// Initialize Razorpay instance if keys are present. In dev, keys may be absent.
let razorpay = null
try {
  const keyId = process.env.NODE_ENV === "production" ? process.env.RAZORPAY_KEY_ID_Prod : process.env.RAZORPAY_KEY_ID
  const keySecret = process.env.NODE_ENV === "production" ? process.env.RAZORPAY_KEY_SECRET_Prod : process.env.RAZORPAY_KEY_SECRET
  if (keyId && keySecret) {
    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    console.log('Razorpay initialized')
  } else {
    console.warn('Razorpay not configured - skipping initialization')
  }
} catch (err) {
  console.warn('Razorpay initialization failed:', err && err.message)
  razorpay = null
}

// Subscription prices
const SUBSCRIPTION_PRICES = {
  Monthly: 150,
  Yearly: 1700,
};

// Create Razorpay order
export const createOrder = async (req, res, next) => {
  try {
    if (!razorpay) return res.status(501).json({ status: 'fail', message: 'Razorpay not configured on this server' })
    const { subtype } = req.body;
    if (!["Yearly", "Monthly"].includes(subtype)) {
      return res.status(400).json({
        status: "fail",
        message:
          "Invalid subscription type. Allowed types: 'Yearly', 'Monthly'.",
      });
    }

    const amount = SUBSCRIPTION_PRICES[subtype];
    const options = {
      amount: amount * 100, // in paise
      currency: "INR",
      receipt: `receipt_${Date.now()}`,
      notes: {
        subtype: subtype,
        userid: req.user.id,
      },
    };

    const order = await razorpay.orders.create(options);
    if (!order) {
      return res.status(400).json({
        status: "fail",
        message: "Error creating order",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Order created successfully",
      order,
    });
  } catch (error) {
    console.error("Error creating order:", error);
    res.status(500).json({ error: "Error creating order" });
  }
};

// Verify payment and update subscription
export const verifyPayment = async (req, res, next) => {
  try {
    if (req.body.event === "payment.captured") {
      const razorpay_payment_id = req.body.payload.payment.entity.id;
      const razorpay_order_id = req.body.payload.payment.entity.order_id;
      const subscriptionType = req.body.payload.payment.entity.notes.subtype;
      const userId = req.body.payload.payment.entity.notes.userid;

      if (!userId) {
        return res.status(400).json({ status: "fail", message: "User not found" });
      }
      if (!["Yearly", "Monthly"].includes(subscriptionType)) {
        return res.status(400).json({
          status: "fail",
          message: "Invalid subscription type. Allowed types: 'Yearly', 'Monthly'.",
        });
      }

      const currentUser = await User.findById(new mongoose.Types.ObjectId(userId));
      if (!currentUser) {
        return res.status(404).json({ status: "fail", message: "User not found" });
      }

      let subon = null;
      let subexp = null;
      let issubexp = false;
      const currentDate = new Date();

      if (currentUser.subexp && currentUser.subexp > currentDate && !currentUser.issubexp) {
        // Extend existing subscription
        if (subscriptionType === "Yearly") {
          const now = new Date();
          if (currentUser.parentrefCode) {
            const parentUser = await User.findOne({ referralCode: currentUser.parentrefCode });
            if (parentUser?.refinc.includes(currentUser.referralCode)) {
              parentUser.refinc.pull(currentUser.referralCode);
              if (!parentUser.issubexp) {
                parentUser.subexp = new Date(parentUser.subexp.setMonth(parentUser.subexp.getMonth() + 3));
              } else {
                parentUser.subon = now;
                parentUser.subexp = new Date(now.setMonth(now.getMonth() + 3));
                parentUser.issubexp = false;
              }
              await parentUser.save();

              subexp = new Date(now);
              subexp.setFullYear(subexp.getFullYear() + 1);
              subexp.setMonth(now.getMonth() + 1); // bonus month
            }
          } else {
            subexp = new Date(now);
            subexp.setFullYear(now.getFullYear() + 1);
          }
          issubexp = false;
        }

        if (subscriptionType === "Monthly") {
          subon = currentUser.subon;
          subexp = new Date(currentUser.subexp.setMonth(currentUser.subexp.getMonth() + 1));
          issubexp = false;
        }
      } else {
        // New or expired subscription
        const now = new Date();
        if (subscriptionType === "Yearly") {
          subon = now;
          issubexp = false;
          if (currentUser.parentrefCode) {
            const parentUser = await User.findOne({ referralCode: currentUser.parentrefCode });
            if (parentUser?.refinc.includes(currentUser.referralCode)) {
              const updatedRefinc = parentUser.refinc.filter(ref => ref !== currentUser.referralCode);
              let newSubon = parentUser.subon;
              let newSubexp = parentUser.subexp ? new Date(parentUser.subexp) : now;
              let newIssubexp = parentUser.issubexp;

              if (!parentUser.issubexp) newSubexp.setMonth(newSubexp.getMonth() + 3);
              else {
                newSubon = now;
                newSubexp = new Date(now.setMonth(now.getMonth() + 3));
                newIssubexp = false;
              }

              await User.findByIdAndUpdate(parentUser._id, {
                refinc: updatedRefinc,
                subon: newSubon,
                subexp: newSubexp,
                issubexp: newIssubexp
              });

              subexp = new Date(now);
              subexp.setFullYear(subexp.getFullYear() + 1);
              subexp.setMonth(now.getMonth() + 1); // bonus month
            }
          } else {
            subexp = new Date(now);
            subexp.setFullYear(now.getFullYear() + 1);
          }
        }

        if (subscriptionType === "Monthly") {
          subon = now;
          subexp = new Date(now.setMonth(now.getMonth() + 1));
          issubexp = false;
        }
      }

      // Update user subscription
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        {
          subscription: subscriptionType,
          subon,
          subexp,
          issubexp,
          orderids: currentUser?.orderids
            ? [{ razorpay_order_id, razorpay_payment_id }, ...currentUser.orderids]
            : [{ razorpay_order_id, razorpay_payment_id }],
        },
        { new: true, runValidators: true }
      );

      if (!updatedUser) return res.status(404).json({ status: "fail", message: "User not found" });

      res.status(200).json({
        status: "success",
        message: "Payment verified and subscription updated successfully",
      });
    } else if (req.body.event === "payment.authorized") {
      res.status(200).json({ status: "success", message: "Payment authorized" });
    } else if (req.body.event === "payment.failed") {
      res.status(200).json({ status: "success", message: "Payment failed" });
    }
  } catch (error) {
    next(error);
  }
};
