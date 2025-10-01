import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'

export default function Feedback() {
  const nav = useNavigate()
  const [difficulty, setDifficulty] = useState(3)
  const [clarity, setClarity] = useState(3)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedToday, setSubmittedToday] = useState(false)
  const [success, setSuccess] = useState(false)
  const toast = useToast()

  const valid = difficulty >= 1 && clarity >= 1

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/feedback/today')
        setSubmittedToday(!!data?.submitted)
      } catch (e) {
        /* non-blocking */
      }
    })()
  }, [])

  async function submit() {
    try {
      if (!valid || submittedToday) return
      setSubmitting(true)
      await api.post('/feedback', {
        difficultyRating: difficulty,
        explanationClarityRating: clarity,
        comment,
      })
      setSuccess(true)
      setSubmittedToday(true)
    } catch (e) {
      const msg = extractErrorMessage(e, 'Submit failed')
      setError(msg)
      toast.show(msg, { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-xl mx-auto bg-card-surface rounded p-6 space-y-4">
        <h1 className="h3">Daily Feedback</h1>
        <p className="body-muted">
          Help us tune difficulty and explanations. This takes 10 seconds.
        </p>
        {error && (
          <div className="bg-error-red/10 border border-error-red/40 text-error-red text-sm rounded p-2">
            {error}
          </div>
        )}
        {submittedToday && !success && (
          <div className="bg-green-500/10 border border-green-500/40 text-green-300 text-sm rounded p-2">
            Thanks! You’ve already submitted feedback for today.
          </div>
        )}
        {success && (
          <div className="bg-green-500/10 border border-green-500/40 text-green-300 text-sm rounded p-2">
            Feedback saved. See you tomorrow!
          </div>
        )}
        <div className="space-y-3">
          <div>
            <label className="block text-sm mb-1">Overall difficulty (1 easy – 5 hard)</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(Number(e.target.value))}
              className="w-full bg-background border border-white/10 rounded p-2"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Explanation clarity (1 poor – 5 excellent)</label>
            <select
              value={clarity}
              onChange={(e) => setClarity(Number(e.target.value))}
              className="w-full bg-background border border-white/10 rounded p-2"
            >
              {[1, 2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm mb-1">Comments (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              className="w-full bg-background border border-white/10 rounded p-2"
              placeholder="What felt off or great?"
            />
          </div>
        </div>
        <div className="pt-2">
          <Button
            disabled={submitting || !valid || submittedToday}
            onClick={submit}
            className="w-full"
          >
            {submittedToday
              ? 'Already submitted today'
              : submitting
              ? 'Submitting...'
              : 'Submit & Unlock'}
          </Button>
          <div className="mt-2 text-center">
            <button
              onClick={() => nav('/dashboard')}
              className="text-xs text-text-secondary hover:text-text-primary"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
