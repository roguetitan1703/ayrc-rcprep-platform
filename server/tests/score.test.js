import assert from 'assert'

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

assert.equal(score(rc, ['A', 'B', 'C', 'D']), 4)
assert.equal(score(rc, ['A', 'B', 'X', null]), 2)
assert.equal(score(rc, ['', '', '', '']), 0)
