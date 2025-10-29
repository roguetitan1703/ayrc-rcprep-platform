import { describe, beforeAll, afterAll, test, expect } from '@jest/globals'
import request from 'supertest'
import app from '../src/app.js'
import { Plan } from '../src/models/Plan.js'
import { User } from '../src/models/User.js'
import { setupTestDB, teardownTestDB } from './setupTestDB.js'

describe('Subscription controller integration', () => {
  beforeAll(async () => {
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  test('GET /api/v1/sub/plans returns plans and discountPercent', async () => {
    // ensure a weekly plan exists (idempotent)
    await Plan.updateOne(
      { slug: 'weekly-test' },
      {
        $setOnInsert: {
          name: 'Weekly',
          slug: 'weekly-test',
          description: '7 day access',
          active: true,
          currency: 'INR',
          finalPriceCents: 15000,
          markupPriceCents: 20000,
          billingType: 'duration_days',
          durationDays: 7,
          features: { archive: { type: 'window', windowDays: 7, includeAttempted: true } },
        },
      },
      { upsert: true }
    )

    const res = await request(app).get('/api/v1/sub/plans')
    expect(res.statusCode).toBe(200)
    expect(Array.isArray(res.body)).toBe(true)
    expect(res.body.some((p) => p.slug === 'weekly-test')).toBe(true)
  })

  test('POST /api/v1/sub/verify-payment handles payment.captured and updates user', async () => {
    // create a user and plan (idempotent)
    await User.deleteOne({ email: 't@example.com' })
    const user = await User.create({
      name: 'Test',
      email: 't@example.com',
      password: 'password123',
    })
    await Plan.updateOne(
      { slug: 'trial-plan' },
      {
        $setOnInsert: {
          name: 'TrialPlan',
          slug: 'trial-plan',
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
    const plan = await Plan.findOne({ slug: 'trial-plan' })

    const payload = {
      event: 'payment.captured',
      payload: {
        payment: {
          entity: {
            id: 'pay_test_1',
            order_id: 'order_test_1',
            notes: { userid: user._id.toString(), planId: plan._id.toString() },
          },
        },
      },
    }

    // simulate createOrder created a Transaction for this order
    await (
      await import('../src/models/Transaction.js')
    ).Transaction.create({
      user: user._id,
      plan: plan._id,
      amount_cents: plan.finalPriceCents,
      currency: 'INR',
      razorpay_order_id: 'order_test_1',
      status: 'created',
      metadata: { planId: plan._id.toString(), userid: user._id.toString() },
    })

    const res = await request(app).post('/api/v1/sub/verify-payment').send(payload)
    expect(res.statusCode).toBe(200)
    expect(res.body.status).toBe('success')

    const updated = await User.findById(user._id)
    expect(updated).toBeTruthy()
    expect(updated.subscriptionPlan).toBeTruthy()
    expect(updated.subscriptionPlan.toString()).toBe(plan._id.toString())
    expect(updated.subexp).toBeTruthy()
  })
})
