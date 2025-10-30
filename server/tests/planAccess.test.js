import { archiveRuleForUser } from '../src/lib/planAccess.js'
import { Plan } from '../src/models/Plan.js'
import { jest } from '@jest/globals'

describe('planAccess.archiveRuleForUser', () => {
  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('returns attempted-only when plan exists but has no archive feature', async () => {
    const fakePlan = { _id: '1', features: {} }
    jest.spyOn(Plan, 'findById').mockResolvedValue(fakePlan)
    const rule = await archiveRuleForUser({ subscriptionPlan: '1' })
    expect(rule).toEqual({ type: 'attempted-only' })
  })

  test('returns window rule when plan.features.archive.type === window', async () => {
    const fakePlan = {
      _id: '2',
      features: { archive: { type: 'window', windowDays: 7 } },
      durationDays: 0,
    }
    jest.spyOn(Plan, 'findById').mockResolvedValue(fakePlan)
    const rule = await archiveRuleForUser({ subscriptionPlan: '2' })
    expect(rule.type).toBe('window')
    expect(rule.windowDays).toBe(7)
  })
})
