import assert from 'assert'
import { RcPassage } from '../src/models/RcPassage.js'

function startOfIST(date = new Date()) {
  const utc = date.getTime() + date.getTimezoneOffset() * 60000
  const ist = new Date(utc + 5.5 * 3600000)
  ist.setHours(0, 0, 0, 0)
  return ist
}

// Simple check: midnight IST should have hours=0
const d = startOfIST(new Date('2024-01-01T18:30:00.000Z')) // 00:00 IST
assert.equal(d.getHours(), 0)
