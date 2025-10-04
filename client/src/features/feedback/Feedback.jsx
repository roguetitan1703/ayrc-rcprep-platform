import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'

export default function Feedback() {
  const nav = useNavigate()
  const [difficulty, setDifficulty] = useState(null)
  const [clarity, setClarity] = useState(null)
  const [comment, setComment] = useState('')
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedToday, setSubmittedToday] = useState(false)
  const [success, setSuccess] = useState(false)
  const toast = useToast()

  const valid = difficulty !== null && clarity !== null

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/feedback/today')
        setSubmittedToday(!!data?.submitted)
      } catch (e) {
        const msg = extractErrorMessage(e, 'Could not check submission status')
        setError(msg)
        toast.show(msg, { variant: 'error' })
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

  const ratings = [1, 2, 3, 4, 5]

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-card-surface rounded p-6 space-y-4">
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

        {/* Ratings */}
        <div className="space-y-4">
          {/* Difficulty */}
          <div>
            <label className="block text-sm mb-1 font-medium">Overall difficulty</label>
            <div className="flex gap-2">
              {ratings.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setDifficulty(n)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center font-semibold
                    ${
                      difficulty === n
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background border-white/20'
                    }
                  `}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Clarity */}
          <div>
            <label className="block text-sm mb-1 font-medium">Explanation clarity</label>
            <div className="flex gap-2">
              {ratings.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setClarity(n)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center font-semibold
                    ${
                      clarity === n
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background border-white/20'
                    }
                  `}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>

          {/* Comment */}
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

        {/* Submit */}
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
