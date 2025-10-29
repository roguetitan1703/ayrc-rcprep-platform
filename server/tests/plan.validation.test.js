import 'dotenv/config'
import * as planController from '../src/controllers/plan.Controller.js'
import { beforeAll, afterAll, describe, test, expect } from '@jest/globals'
import { setupTestDB, teardownTestDB } from './setupTestDB.js'

beforeAll(async () => {
  await setupTestDB()
})

describe('Plan validation (controller)', () => {
  test('createPlan rejects missing fields', async () => {
    const req = { body: {} }
    const res = {}
    await expect(
      planController.createPlan(req, res, (e) => {
        throw e
      })
    ).rejects.toThrow(/Missing required plan fields/i)
  })

  test('createPlan rejects invalid slug and negative price', async () => {
    const req = {
      body: {
        name: 'Bad',
        slug: 'Invalid Slug',
        finalPriceCents: -100,
        billingType: 'duration_days',
        durationDays: 30,
      },
    }
    const res = {}
    await expect(
      planController.createPlan(req, res, (e) => {
        throw e
      })
    ).rejects.toThrow(/slug|price/i)
  })

  test('createPlan rejects inconsistent markup < final', async () => {
    const req = {
      body: {
        name: 'Bad markup',
        slug: 'bad-markup',
        finalPriceCents: 1000,
        markupPriceCents: 5000,
        billingType: 'duration_days',
        durationDays: 10,
      },
    }
    // Note: markup >= final is allowed; to assert a failing case, provide markup < final
    req.body.markupPriceCents = 500 // smaller than final
    const res = {}
    await expect(
      planController.createPlan(req, res, (e) => {
        throw e
      })
    ).rejects.toThrow(/markupPriceCents should be greater than or equal to finalPriceCents/i)
  })

  test('updatePlan rejects setting slug to reserved free', async () => {
    const req = { params: { id: '000000000000000000000000' }, body: { slug: 'free' } }
    const res = {}
    await expect(
      planController.updatePlan(req, res, (e) => {
        throw e
      })
    ).rejects.toThrow(/Cannot set slug to reserved value `free`/i)
  })
})

afterAll(async () => {
  await teardownTestDB()
})
