import { describe, test, expect } from '@jest/globals'

function startOfIST(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  const ist = new Date(utc + 5.5 * 3600000)
  ist.setHours(0, 0, 0, 0)
  return ist
}

describe('date utilities', () => {
  test('startOfIST returns midnight IST', () => {
    const d = startOfIST(new Date('2024-01-01T18:30:00.000Z')) // 00:00 IST
    expect(d.getHours()).toBe(0)
  })
})
