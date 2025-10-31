import { User } from '../models/User.js'
import { Transaction } from '../models/Transaction.js'
import { Subscription } from '../models/Subscription.js'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import mongoose from 'mongoose'
import { success, badRequest } from '../utils/http.js'
import { sendEmail } from '../services/mailer.service.js'

// Initialize Razorpay instance if keys are present. In dev, keys may be absent.
let razorpay = null
try {
  const keyId =
    process.env.NODE_ENV === 'production'
      ? process.env.RAZORPAY_KEY_ID_PROD
      : process.env.RAZORPAY_KEY_ID
  const keySecret =
    process.env.NODE_ENV === 'production'
      ? process.env.RAZORPAY_KEY_SECRET_PROD
      : process.env.RAZORPAY_KEY_SECRET
  if (keyId && keySecret) {
    razorpay = new Razorpay({ key_id: keyId, key_secret: keySecret })
    console.log('Razorpay initialized', keyId)
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
}

// Create Razorpay order
export const createOrder = async (req, res, next) => {
  try {
    if (!razorpay)
      return res
        .status(501)
        .json({ status: 'fail', message: 'Razorpay not configured on this server' })
    const { planId } = req.body
    if (!planId) return res.status(400).json({ status: 'fail', message: 'Missing planId' })
    // Lazy import to avoid circular deps
    const { Plan } = await import('../models/Plan.js')
    const plan = await Plan.findById(planId)
    if (!plan || !plan.active)
      return res.status(400).json({ status: 'fail', message: 'Plan not found or inactive' })

    const amount = plan.finalPriceCents
    const options = {
      amount: amount, // already in paise
      currency: plan.currency || 'INR',
      receipt: `receipt_${Date.now()}`,
      notes: {
        planId: plan._id.toString(),
        planSlug: plan.slug,
        userid: req.user.id,
      },
    }
    //   } catch (err) {
    //   console.error('Error creating Razorpay order:', err)
    //   return res.status(500).json({ status: 'fail', message: 'Error creating Razorpay order' })
    // }

    const order = await razorpay.orders.create(options)
    if (!order) {
      return res.status(400).json({
        status: 'fail',
        message: 'Error creating order',
      })

    }

    // Persist a Transaction record referencing this order
    try {
     const transaction =  await Transaction.create({
        user: req.user.id,
        plan: plan._id,
        amount_cents: options.amount,
        currency: options.currency,
        razorpay_order_id: order.id,
        status: 'created',
        metadata: options.notes || {},
      })
      console.log("trasaction", transaction )
    } catch (txErr) {
      console.error('Error creating Transaction record:', txErr)
      // proceed even if transaction persistence failed - client still has orde
    }
    console.log('Created Razorpay order:', order)
    
    res.status(200).json({ status: 'success', message: 'Order created successfully', order })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({ error: 'Error creating order' })
  }
}

// Verify payment and update subscription
export const verifyPayment = async (req, res, next) => {
  try {
    // If webhook secret is configured, verify signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET
    const signatureHeader =
      req.headers['x-razorpay-signature'] || req.headers['X-Razorpay-Signature']
    if (webhookSecret) {
      if (!signatureHeader || !req.rawBody) {
        return res.status(400).json({
          status: 'fail',
          message: 'Missing signature or rawBody for webhook verification',
        })
      }

      try {
        const expectedSignature = crypto
          .createHmac('sha256', webhookSecret)
          .update(req.rawBody)
          .digest('hex')
        // Use a timing-safe compare
        const sigBuffer = Buffer.from(signatureHeader)
        const expectedBuffer = Buffer.from(expectedSignature)
        if (
          sigBuffer.length !== expectedBuffer.length ||
          !crypto.timingSafeEqual(sigBuffer, expectedBuffer)
        ) {
          return res.status(403).json({ status: 'fail', message: 'Invalid webhook signature' })
        }
      } catch (sigErr) {
        console.error('Error verifying webhook signature', sigErr)
        return res.status(403).json({ status: 'fail', message: 'Invalid webhook signature' })
      }
    }

    if (req.body.event === 'payment.captured') {
      const razorpay_payment_id = req.body.payload.payment.entity.id
      const razorpay_order_id = req.body.payload.payment.entity.order_id
      const notes = req.body.payload.payment.entity.notes || {}
      const paid_amount = req.body.payload.payment.entity.amount // paise
      const planId = notes.planId || notes.planid || null
      const planSlug = notes.planSlug || notes.planslug || null
      const userId = notes.userid || notes.userId || null

        console.log('[verifyPayment] webhook received for order', razorpay_order_id) // debug webhook
        console.log('[verifyPayment] payload notes:', notes) // debug notes
       

      if (!userId) {
        console.warn('[verifyPayment] webhook missing user id in order notes')
        return res.status(200).json({ status: 'success', message: 'No user id in notes' })
      }

      // Lookup plan by id or slug
      let plan = null
      try {
        const Plan = (await import('../models/Plan.js')).Plan
        if (planId) plan = await Plan.findById(planId)
        if (!plan && planSlug) plan = await Plan.findOne({ slug: planSlug })
      } catch (pErr) {
        console.error('[verifyPayment] error looking up plan', pErr)
      }

      if (!plan) {
        console.warn('[verifyPayment] plan not found for notes', { planId, planSlug })
        // Still record orderids on user so manual reconciliation is possible
      }

      if (!mongoose.isValidObjectId(userId)) {
        console.warn('[verifyPayment] invalid user id in notes', userId)
        return res.status(200).json({ status: 'success', message: 'User not found' })
      }
      const currentUser = await User.findById(userId)
      if (!currentUser) {
        console.warn('[verifyPayment] user not found for id', userId)
        return res.status(200).json({ status: 'success', message: 'User not found' })
      }

      const now = new Date()
      let startFrom = now
      if (currentUser.subexp && currentUser.subexp > now && !currentUser.issubexp)
        startFrom = new Date(currentUser.subexp)

      let newSubon = startFrom
      let newSubexp = null

      if (plan) {
        if (plan.billingType === 'duration_days') {
          const d = Number(plan.durationDays) || 0
          newSubexp = new Date(startFrom)
          newSubexp.setDate(newSubexp.getDate() + d)
        } else if (plan.billingType === 'till_date') {
          newSubexp = plan.accessUntil ? new Date(plan.accessUntil) : null
          if (newSubexp && newSubexp < startFrom) {
            newSubexp = new Date(startFrom)
          }
        }
      }

      // Find or create Transaction record
      let tx = await Transaction.findOne({ razorpay_order_id })
      if (tx && tx.status === 'captured') {
        // idempotent: already processed
        console.log('[verifyPayment] webhook already processed for order', razorpay_order_id)
        return res.status(200).json({ status: 'success', message: 'Payment already processed' })
      }

      if (tx && tx.metadata && tx.metadata.orphan) {
        // We previously recorded this as an orphan — held for manual review.
        console.log(
          '[verifyPayment] orphan transaction still held for manual review',
          razorpay_order_id
        )
        // ensure user's orderids include this payment for manual review
        currentUser.orderids = currentUser.orderids || []
        const already = (currentUser.orderids || []).some(
          (o) => o.razorpay_order_id === razorpay_order_id
        )
        if (!already) currentUser.orderids.push({ razorpay_order_id, razorpay_payment_id })
        try {
          await currentUser.save()
        } catch (uErr) {
          console.error('[verifyPayment] error saving user orderids for orphan tx', uErr)
        }
        return res
          .status(200)
          .json({ status: 'success', message: 'No transaction found — held for manual review' })
      }

      if (!tx) {
        // create orphan transaction (no prior order persisted).
        // Strict policy: do NOT auto-create subscriptions for orphan webhooks.
        try {
          tx = await Transaction.create({
            user: currentUser._id,
            plan: plan ? plan._id : null,
            amount_cents: 0,
            paid_amount_cents: paid_amount ?? null,
            currency: 'INR',
            razorpay_order_id,
            razorpay_payment_id,
            status: 'created',
            raw_payload: req.body,
            metadata: { ...(notes || {}), orphan: true },
            is_discrepant: false,
          })
        } catch (cErr) {
          console.error('[verifyPayment] error creating orphan transaction', cErr)
        }

        // ensure user's orderids include this payment for manual review
        currentUser.orderids = currentUser.orderids || []
        const already = (currentUser.orderids || []).some(
          (o) => o.razorpay_order_id === razorpay_order_id
        )
        if (!already) currentUser.orderids.push({ razorpay_order_id, razorpay_payment_id })
        try {
          await currentUser.save()
        } catch (uErr) {
          console.error('[verifyPayment] error saving user orderids for orphan tx', uErr)
        }

        return res
          .status(200)
          .json({ status: 'success', message: 'No transaction found — held for manual review' })
      } else {
        tx.razorpay_payment_id = razorpay_payment_id
        tx.paid_amount_cents = paid_amount ?? tx.paid_amount_cents
        tx.status = 'captured'
        tx.raw_payload = req.body
        tx.metadata = { ...(tx.metadata || {}), ...(notes || {}) }

        // flag discrepancy if paid differs from requested
        try {
          if (typeof tx.amount_cents === 'number' && typeof tx.paid_amount_cents === 'number') {
            if (tx.amount_cents !== tx.paid_amount_cents) {
              tx.is_discrepant = true
              tx.metadata = {
                ...(tx.metadata || {}),
                reconciliation: { requested: tx.amount_cents, paid: tx.paid_amount_cents },
              }
            }
          }
        } catch (flagErr) {
          console.error('[verifyPayment] error checking discrepancy', flagErr)
        }

        await tx.save()
      }

      // Create Subscription (idempotent if one already linked to this transaction)
      let subscription = null
      if (tx) {
        // check if subscription already created for this transaction
        subscription = await Subscription.findOne({ transaction: tx._id })
      }

      // If transaction is discrepant, do NOT auto-create subscription.
      // Mark the tx for manual reconciliation and surface orderids on the user for admin review.
      if (tx && tx.is_discrepant) {
        try {
          tx.metadata = { ...(tx.metadata || {}), held_for_reconciliation: true }
          await tx.save()
        } catch (mfErr) {
          console.error('[verifyPayment] error marking transaction held for reconciliation', mfErr)
        }

        // ensure user's orderids include this payment for manual review
        currentUser.orderids = currentUser.orderids || []
        const already = (currentUser.orderids || []).some(
          (o) => o.razorpay_order_id === razorpay_order_id
        )
        if (!already) currentUser.orderids.push({ razorpay_order_id, razorpay_payment_id })
        try {
          await currentUser.save()
        } catch (uErr) {
          console.error('[verifyPayment] error saving user orderids for discrepant tx', uErr)
        }

        // return early — admin will resolve via assign flow
        return res
          .status(200)
          .json({ status: 'success', message: 'Payment held for reconciliation' })
      }

      if (!subscription && plan) {
        try {
          const sub = await Subscription.create({
            user: currentUser._id,
            plan: plan._id,
            transaction: tx ? tx._id : null,
            start_date: newSubon,
            end_date: newSubexp || newSubon,
            status: 'active',
            meta: { via: 'webhook' },
          })
          subscription = sub
          // link back into tx metadata
          if (tx) {
            tx.metadata = { ...(tx.metadata || {}), subscription_id: sub._id }
            await tx.save()
          }

          // update user's quick fields
          currentUser.subscriptionPlan = plan._id
          currentUser.subon = newSubon
          currentUser.subexp = newSubexp
          currentUser.issubexp = false
          // push orderids for manual reconciliation
          currentUser.orderids = currentUser.orderids || []
          const already = (currentUser.orderids || []).some(
            (o) => o.razorpay_order_id === razorpay_order_id
          )
          if (!already) currentUser.orderids.push({ razorpay_order_id, razorpay_payment_id })
          await currentUser.save()
        } catch (sErr) {
          console.error('[verifyPayment] error creating subscription', sErr)
        }
      } else {
        // if plan not found, still push orderids for manual reconciliation
        currentUser.orderids = currentUser.orderids || []
        const already = (currentUser.orderids || []).some(
          (o) => o.razorpay_order_id === razorpay_order_id
        )
        if (!already) {
          currentUser.orderids.push({ razorpay_order_id, razorpay_payment_id })
          await currentUser.save()
        }
      }

      return res.status(200).json({ status: 'success', message: 'Payment processed' })
    } else if (req.body.event === 'payment.authorized') {
      return res.status(200).json({ status: 'success', message: 'Payment authorized' })
    } else if (req.body.event === 'payment.failed') {
      return res.status(200).json({ status: 'success', message: 'Payment failed' })
    }
  } catch (error) {
    next(error)
    next(error)
  }
}

// Get all users' subscription data (admin only)
export async function getAllSubscriptions(req, res, next) {
  try {
    // Use an aggregation to return users with populated subscriptionPlan and latest active Subscription (if any)
    const results = await User.aggregate([
      // project only the fields we need
      {
        $project: {
          name: 1,
          email: 1,
          subscriptionPlan: 1,
          subon: 1,
          subexp: 1,
          issubexp: 1,
          role: 1,
        },
      },
      // lookup the plan referenced by user's quick-field subscriptionPlan
      {
        $lookup: {
          from: 'plans',
          localField: 'subscriptionPlan',
          foreignField: '_id',
          as: 'subscriptionPlan',
        },
      },
      { $unwind: { path: '$subscriptionPlan', preserveNullAndEmptyArrays: true } },
      // lookup the most recent active subscription document for this user
      {
        $lookup: {
          from: 'subscriptions',
          let: { userId: '$_id' },
          pipeline: [
            {
              $match: {
                $expr: { $and: [{ $eq: ['$user', '$$userId'] }, { $eq: ['$status', 'active'] }] },
              },
            },
            { $sort: { end_date: -1, createdAt: -1 } },
            { $limit: 1 },
          ],
          as: 'latestSubscription',
        },
      },
      // annotate presence flag
      {
        $addFields: {
          hasSubscriptionDoc: { $gt: [{ $size: '$latestSubscription' }, 0] },
        },
      },
      // project the shape expected by the client
      {
        $project: {
          name: 1,
          email: 1,
          subscriptionPlan: {
            _id: '$subscriptionPlan._id',
            slug: '$subscriptionPlan.slug',
            name: '$subscriptionPlan.name',
          },
          subon: 1,
          subexp: 1,
          issubexp: 1,
          role: 1,
          hasSubscriptionDoc: 1,
        },
      },
    ])

    return success(res, results)
  } catch (err) {
    next(err)
  }
}

// Revoke a user's subscription
export async function revokeSubscription(req, res, next) {
  try {
    const userId = req.params.id
    const user = await User.findById(userId)
    if (!user) return next(badRequest('User not found'))

    user.subscriptionPlan = null
    user.subon = null
    user.subexp = null
    user.issubexp = true

    await user.save()
    // mark any active Subscription documents as revoked and set end_date to now
    try {
      const now = new Date()
      await Subscription.updateMany(
        { user: user._id, status: 'active' },
        { $set: { status: 'revoked', end_date: now, 'meta.revokedBy': req.user?.id || null } }
      )
    } catch (uErr) {
      console.error('[revokeSubscription] failed to update subscription documents', uErr)
    }

    return success(res, { message: 'Subscription revoked', user })
  } catch (err) {
    next(err)
  }
}

// Admin: assign a subscription to a user (manual reconciliation)
export async function adminAssignSubscription(req, res, next) {
  try {
    const { userId, planId, startDate, transactionId, note } = req.body || {}
    if (!userId || !planId) return next(badRequest('Missing userId or planId'))

    if (!mongoose.isValidObjectId(userId) || !mongoose.isValidObjectId(planId))
      return next(badRequest('Invalid userId or planId'))

    const user = await User.findById(userId)
    if (!user) return next(badRequest('User not found'))

    const Plan = (await import('../models/Plan.js')).Plan
    const plan = await Plan.findById(planId)
    if (!plan) return next(badRequest('Plan not found'))

    const now = new Date()
    let startFrom = startDate ? new Date(startDate) : now
    // if user has active subscription, start from current subexp
    if (user.subexp && user.subexp > now && !user.issubexp) startFrom = new Date(user.subexp)

    // compute new expiry according to plan
    let newExp = null
    if (plan.billingType === 'duration_days') {
      const d = Number(plan.durationDays) || 0
      newExp = new Date(startFrom)
      newExp.setDate(newExp.getDate() + d)
    } else if (plan.billingType === 'till_date') {
      newExp = plan.accessUntil ? new Date(plan.accessUntil) : null
      if (newExp && newExp < startFrom) newExp = new Date(startFrom)
    }

    // create subscription record
    const sub = await Subscription.create({
      user: user._id,
      plan: plan._id,
      transaction: transactionId || null,
      start_date: startFrom,
      end_date: newExp || startFrom,
      status: 'active',
      meta: { via: 'admin', note: note || null },
    })

    // link transaction if provided
    if (transactionId) {
      try {
        let tx = null
        if (mongoose.isValidObjectId(transactionId)) {
          tx = await Transaction.findById(transactionId)
        }
        if (!tx) {
          // try common payment id fields
          tx = await Transaction.findOne({ razorpay_payment_id: transactionId })
        }
        if (!tx) tx = await Transaction.findOne({ razorpay_order_id: transactionId })
        if (tx) {
          tx.metadata = { ...(tx.metadata || {}), subscription_id: sub._id }
          await tx.save()
        }
      } catch (txErr) {
        console.error('[adminAssignSubscription] error linking transaction', txErr)
      }
    }

    // update user's quick fields
    user.subscriptionPlan = plan._id
    user.subon = startFrom
    user.subexp = newExp
    user.issubexp = false

    // persist possible order identifiers if tx had them
    if (transactionId) {
      user.orderids = user.orderids || []
      const already = (user.orderids || []).some(
        (o) => o.razorpay_payment_id === transactionId || o.razorpay_order_id === transactionId
      )
      if (!already)
        user.orderids.push({ razorpay_order_id: transactionId, razorpay_payment_id: transactionId })
    }

    await user.save()

    return success(res, sub)
  } catch (err) {
    next(err)
  }
}

// Extend a user's subscription
export async function extendSubscription(req, res, next) {
  try {
    const { id } = req.params
    const { days, type } = req.body // type optional, e.g., "Monthly"
    console.log(id, days, type)

    const user = await User.findById(id)
    if (!user) return next(badRequest('User not found'))

    // Prevent extending free plan
    if (user.subscriptionPlan) {
      try {
        const Plan = (await import('../models/Plan.js')).Plan
        const plan = await Plan.findById(user.subscriptionPlan)
        if (plan && plan.slug === 'free')
          return next(badRequest('Cannot extend users on the free plan'))
      } catch (pErr) {
        console.error('[extendSubscription] error checking plan slug', pErr)
      }
    }

    const now = new Date()
    const start = !user.subexp || user.issubexp ? now : new Date(user.subexp)
    const newExp = new Date(start)
    newExp.setDate(newExp.getDate() + days)

    user.subexp = newExp
    user.subon = !user.subon || user.issubexp ? now : user.subon
    // legacy `subscription` string removed from quick fields; keep subscriptionPlan unchanged here
    // If a caller wants to change the plan pointer, use the admin assign endpoint.
    user.issubexp = false

    await user.save()

    // Must have an existing active Subscription document to extend
    try {
      let subDoc = await Subscription.findOne({ user: user._id, status: 'active' }).sort({
        end_date: -1,
      })
      if (!subDoc) {
        // strictness: do not auto-create subscription docs for extensions
        return next(
          badRequest(
            'No active subscription document exists for this user. Use Assign to create one before extending.'
          )
        )
      }

      subDoc.end_date = newExp
      await subDoc.save()
    } catch (sErr) {
      console.error('[extendSubscription] error syncing subscription documents', sErr)
    }

    return success(res, { ok: true, user })
  } catch (e) {
    next(e)
  }
}

// NOTE: The canonical nullifier lives in `server/src/services/subscription.service.js`.
// The controller previously exported a second implementation that wrote the legacy
// `User.subscription` string. That behavior is deprecated and has been removed.
//
// If you need to invoke nullification from admin tools, use the service:
//   import { nullifyExpiredSubscriptions } from '../services/subscription.service.js'
// The service updates Subscription documents and the user's `issubexp` quick-flag
// while preserving `subscriptionPlan`/`subon`/`subexp` for audit.
