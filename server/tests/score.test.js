import { describe, test, expect } from '@jest/globals'

const rc = {
  questions: [
    { correctAnswerId: 'A' },
    { correctAnswerId: 'B' },
    { correctAnswerId: 'C' },
    { correctAnswerId: 'D' },
  ],
}

function score(rc, answers) {
  let s = 0
  rc.questions.forEach((q, i) => {
    if (answers[i] === q.correctAnswerId) s += 1
  })
  return s
}

describe('score function', () => {
  test('full correct answers', () => {
    expect(score(rc, ['A', 'B', 'C', 'D'])).toBe(4)
  })

  test('partial correct answers', () => {
    expect(score(rc, ['A', 'B', 'X', null])).toBe(2)
  })

  test('no answers', () => {
    expect(score(rc, ['', '', '', ''])).toBe(0)
  })
})
