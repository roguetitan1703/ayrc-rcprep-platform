import { describe, beforeAll, afterAll, test, expect, jest } from '@jest/globals'
// Mock Razorpay before importing app/controller so controller's Razorpay init uses the mock
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: {
      create: jest.fn().mockResolvedValue({ id: 'order_mock_1' }),
    },
  }))
})

import request from 'supertest'
import app from '../src/app.js'
import { Plan } from '../src/models/Plan.js'
import { User } from '../src/models/User.js'
import { Transaction } from '../src/models/Transaction.js'
import { Subscription } from '../src/models/Subscription.js'
import { setupTestDB, teardownTestDB } from './setupTestDB.js'
import { signJwt } from '../src/utils/jwt.js'

describe('Transactions & Subscriptions', () => {
  beforeAll(async () => {
    // ensure JWT secret for auth helper
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
    // ensure webhook secret is not set so tests can POST JSON without raw signature
    delete process.env.RAZORPAY_WEBHOOK_SECRET
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  test('POST /api/v1/sub/create-order persists Transaction with requested amount', async () => {
    // ensure plan exists
    await Plan.updateOne(
      { slug: 'create-order-test' },
      {
        $setOnInsert: {
          name: 'CreateOrderTest',
          slug: 'create-order-test',
          description: 'test',
          active: true,
          currency: 'INR',
          finalPriceCents: 4200,
          billingType: 'duration_days',
          durationDays: 7,
          features: {},
        },
      },
      { upsert: true }
    )
    const plan = await Plan.findOne({ slug: 'create-order-test' })

    // create a user and token
    const user = await User.create({
      name: 'OrderUser',
      email: 'order@example.com',
      password: 'password',
    })
    const token = signJwt({ id: user._id.toString() })

    const res = await request(app)
      .post('/api/v1/sub/create-order')
      .set('Authorization', `Bearer ${token}`)
      .send({ planId: plan._id.toString() })

    expect(res.statusCode).toBe(200)
    expect(res.body).toHaveProperty('order')
    // Transaction should have been created referencing the user & plan
    const tx = await Transaction.findOne({ user: user._id, plan: plan._id })
    expect(tx).toBeTruthy()
    expect(tx.user.toString()).toBe(user._id.toString())
    expect(tx.plan.toString()).toBe(plan._id.toString())
    expect(tx.amount_cents).toBe(plan.finalPriceCents)
    expect(tx.status).toBe('created')
  })

  test('POST /api/v1/sub/verify-payment creates Transaction and Subscription (idempotent)', async () => {
    // create a user and plan
    await User.deleteOne({ email: 't2@example.com' })
    const user = await User.create({ name: 'T2', email: 't2@example.com', password: 'password123' })
    await Plan.updateOne(
      { slug: 'trial-plan-2' },
      {
        $setOnInsert: {
          name: 'TrialPlan2',
          slug: 'trial-plan-2',
          description: 'trial',
          active: true,
          currency: 'INR',
          finalPriceCents: 1000,
          billingType: 'duration_days',
          durationDays: 3,
          features: {},
        },
      },
      { upsert: true }
    )
    const plan = await Plan.findOne({ slug: 'trial-plan-2' })

    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_2',
            order_id: 'order_test_2',
            amount: plan.finalPriceCents,
            notes: { userid: user._id.toString(), planId: plan._id.toString() },
          },
        },
      },
    }

    // Simulate createOrder persisted Transaction referencing this order
    await Transaction.create({
      user: user._id,
      plan: plan._id,
      amount_cents: plan.finalPriceCents,
      currency: 'INR',
      razorpay_order_id: 'order_test_2',
      status: 'created',
      metadata: { planId: plan._id.toString(), userid: user._id.toString() },
    })

    // First webhook - should process existing Transaction and create Subscription
    let res = await request(app).post('/api/v1/sub/verify-payment').send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('success')

    const tx = await Transaction.findOne({ razorpay_order_id: 'order_test_2' })
    expect(tx).toBeTruthy()
    expect(tx.razorpay_payment_id || tx.raw_payload).toBeTruthy()

    const sub = await Subscription.findOne({ transaction: tx._id })
    expect(sub).toBeTruthy()
    expect(sub.user.toString()).toBe(user._id.toString())
    expect(sub.plan.toString()).toBe(plan._id.toString())

    // Replay webhook - idempotency: no duplicate subscription created and tx.status remains captured
    res = await request(app).post('/api/v1/sub/verify-payment').send(payload)
    expect(res.statusCode).toBe(200)
    const subs = await Subscription.find({ transaction: tx._id })
    expect(subs.length).toBe(1)
    const txAfter = await Transaction.findOne({ razorpay_order_id: 'order_test_2' })
    expect(txAfter.status).toBe('captured')
  })

  test('POST /api/v1/sub/verify-payment with discrepant amount holds for reconciliation (no auto-sub)', async () => {
    // create a user and plan
    await User.deleteOne({ email: 't3@example.com' })
    const user = await User.create({ name: 'T3', email: 't3@example.com', password: 'password123' })
    await Plan.updateOne(
      { slug: 'trial-plan-3' },
      {
        $setOnInsert: {
          name: 'TrialPlan3',
          slug: 'trial-plan-3',
          description: 'trial discrepant',
          active: true,
          currency: 'INR',
          finalPriceCents: 2000,
          billingType: 'duration_days',
          durationDays: 3,
          features: {},
        },
      },
      { upsert: true }
    )
    const plan = await Plan.findOne({ slug: 'trial-plan-3' })

    // send a payment where no prior order exists; strict policy: hold orphan for review
    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_3',
            order_id: 'order_test_3',
            amount: 1500,
            notes: { userid: user._id.toString(), planId: plan._id.toString() },
          },
        },
      },
    }

    const res = await request(app).post('/api/v1/sub/verify-payment').send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('success')
    expect(res.body.message).toBe('No transaction found — held for manual review')

    const tx = await Transaction.findOne({ razorpay_order_id: 'order_test_3' })
    expect(tx).toBeTruthy()
    // orphan recorded as created with metadata.orphan flag
    expect(tx.status).toBe('created')
    expect(tx.metadata && tx.metadata.orphan).toBe(true)
    expect(tx.is_discrepant).toBe(false)

    const sub = await Subscription.findOne({ transaction: tx._id })
    expect(sub).toBeNull()

    // Replay webhook: still held for review
    const res2 = await request(app).post('/api/v1/sub/verify-payment').send(payload)
    expect(res2.statusCode).toBe(200)
    expect(res2.body.message).toBe('No transaction found — held for manual review')
    const subs = await Subscription.find({ transaction: tx._id })
    expect(subs.length).toBe(0)
  })
})
