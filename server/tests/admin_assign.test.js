import { describe, beforeAll, afterAll, test, expect, jest } from '@jest/globals'
// Mock Razorpay to avoid real initialization
jest.mock('razorpay', () => {
  return jest.fn().mockImplementation(() => ({
    orders: { create: jest.fn().mockResolvedValue({ id: 'order_mock_1' }) },
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

describe('Admin assign subscription API', () => {
  beforeAll(async () => {
    process.env.JWT_SECRET = process.env.JWT_SECRET || 'test-secret'
    delete process.env.RAZORPAY_WEBHOOK_SECRET
    await setupTestDB()
  })

  afterAll(async () => {
    await teardownTestDB()
  })

  test('happy path: admin can assign subscription and user quick fields updated', async () => {
    // create admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@example.com',
      password: 'password123',
      role: 'admin',
    })
    const adminToken = signJwt({ id: admin._id.toString() })

    // create target user
    const user = await User.create({
      name: 'AssignUser',
      email: 'assign@example.com',
      password: 'password',
    })

    // create plan
    await Plan.updateOne(
      { slug: 'admin-assign-plan' },
      {
        $setOnInsert: {
          name: 'AdminAssignPlan',
          slug: 'admin-assign-plan',
          description: 'admin assign',
          active: true,
          currency: 'INR',
          finalPriceCents: 1234,
          billingType: 'duration_days',
          durationDays: 10,
          features: {},
        },
      },
      { upsert: true }
    )
    const plan = await Plan.findOne({ slug: 'admin-assign-plan' })

    const res = await request(app)
      .post('/api/v1/sub/admin/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ userId: user._id.toString(), planId: plan._id.toString() })

    expect(res.statusCode).toBe(200)
    // subscription created
    const sub = await Subscription.findOne({ user: user._id, plan: plan._id })
    expect(sub).toBeTruthy()
    // user quick fields updated
    const updated = await User.findById(user._id)
    expect(updated.subscriptionPlan && updated.subscriptionPlan.toString()).toBe(
      plan._id.toString()
    )
    expect(updated.issubexp).toBe(false)
    expect(updated.subon).toBeTruthy()
  })

  test('linking transaction: admin can pass transactionId and tx gets linked', async () => {
    const admin = await User.findOne({ email: 'admin@example.com' })
    const adminToken = signJwt({ id: admin._id.toString() })

    const user = await User.create({
      name: 'LinkUser',
      email: 'link@example.com',
      password: 'password',
    })
    const plan = await Plan.findOne({ slug: 'admin-assign-plan' })

    // create a transaction
    const tx = await Transaction.create({
      user: user._id,
      plan: plan._id,
      amount_cents: plan.finalPriceCents,
      currency: 'INR',
      razorpay_order_id: 'order_link_1',
      status: 'created',
      metadata: {},
    })

    const res = await request(app)
      .post('/api/v1/sub/admin/assign')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({
        userId: user._id.toString(),
        planId: plan._id.toString(),
        transactionId: tx._id.toString(),
        note: 'manual reconcile',
      })

    expect(res.statusCode).toBe(200)
    const sub = await Subscription.findOne({ user: user._id, plan: plan._id })
    expect(sub).toBeTruthy()

    const linkedTx = await Transaction.findById(tx._id)
    expect(linkedTx.metadata && linkedTx.metadata.subscription_id).toBeTruthy()
    expect(linkedTx.metadata.subscription_id.toString()).toBe(sub._id.toString())
  })

  test('forbidden for non-admin', async () => {
    const nonAdmin = await User.create({
      name: 'User2',
      email: 'user2@example.com',
      password: 'password123',
    })
    const token = signJwt({ id: nonAdmin._id.toString() })

    const plan = await Plan.findOne({ slug: 'admin-assign-plan' })

    const res = await request(app)
      .post('/api/v1/sub/admin/assign')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: nonAdmin._id.toString(), planId: plan._id.toString() })

    expect(res.statusCode).toBe(403)
  })
})
