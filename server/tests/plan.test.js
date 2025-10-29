import 'dotenv/config'
import { Plan } from '../src/models/Plan.js'
import * as planController from '../src/controllers/plan.Controller.js'
import { describe, beforeAll, afterAll, test, expect } from '@jest/globals'
import { setupTestDB, teardownTestDB } from './setupTestDB.js'

beforeAll(async () => {
  await setupTestDB()
})

describe('Plans and plan controller', () => {
  test('seeded plans exist in DB', async () => {
    const free = await Plan.findOne({ slug: 'free' })
    expect(free).toBeTruthy()
    expect(free.slug).toBe('free')
  })

  test('listPublicPlans returns plans array', async () => {
    const req = { query: {} }
    const captured = { status: null, data: null }
    const res = {
      status(code) {
        captured.status = code
        return this
      },
      json(data) {
        captured.data = data
        return data
      },
    }

    await planController.listPublicPlans(req, res, (e) => {
      throw e
    })
    expect(Array.isArray(captured.data)).toBe(true)
    expect(captured.data.length).toBeGreaterThan(0)
    const slugs = captured.data.map((p) => p.slug)
    expect(slugs).toContain('free')
  })
})

afterAll(async () => {
  await teardownTestDB()
})
