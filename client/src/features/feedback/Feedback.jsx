import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { getTodaysFeedback, submitFeedback, getTodaysQuestions } from '../../lib/feedback'
const RATINGS = [1, 2, 3, 4, 5]

export default function Feedback() {
  const nav = useNavigate()
  const toast = useToast()
  const [answers, setAnswers] = useState({})
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submittedToday, setSubmittedToday] = useState(false)
  const [success, setSuccess] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [nextDisabled, setNextDisabled] = useState(false)
  const [nextCountdown, setNextCountdown] = useState(0)
  const [dailyQuestions, setDailyQuestions] = useState([])

  useEffect(() => {
    ;(async () => {
      try {
        const questions = await getTodaysQuestions()
        if (!questions || questions.length === 0) {
          // No feedback required today, unlock access
          try {
            await api.post('/feedback/skip')
          } catch (e) {
            // ignore error, maybe already unlocked
          }
          setSubmittedToday(true)
          setSuccess(true)
          setDailyQuestions([])
          return
        }
        setDailyQuestions(questions)

        const status = await getTodaysFeedback()
        setSubmittedToday(!!status?.submitted)
      } catch (e) {
        console.error('Could not load daily questions or feedback status', e)
      }
    })()
  }, [])

  // Show toast when already submitted (on initial load)
  useEffect(() => {
    if (submittedToday && !success) {
      toast.show("Thanks! You've already submitted feedback for today.", { variant: 'success' })
    }
  }, [submittedToday, success, toast])

  const handleAnswer = (id, value) => {
    setAnswers((prev) => ({ ...prev, [id]: value }))
  }

  const startNextBlockTimer = (seconds = 3) => {
    setNextDisabled(true)
    setNextCountdown(seconds)
    const interval = setInterval(() => {
      setNextCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(interval)
          setNextDisabled(false)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const validateStep = () => {
    const q = dailyQuestions[currentStep]
    const ans = answers[q.id]
    if (q.type === 'rating') return ans != null
    if (q.type === 'multi') return ans?.length > 0
    if (q.type === 'open' || q.type === 'redirect')
      return ans?.split(' ').length >= (q.minWords || 0)
    return true
  }

  const handleNext = () => {
    if (!validateStep()) return
    if (currentStep < dailyQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1)
      const nextQuestion = dailyQuestions[currentStep + 1]

      startNextBlockTimer(nextQuestion.time)
    } else {
      submit()
    }
  }

  const handlePrev = () => {
    if (currentStep > 0) setCurrentStep((prev) => prev - 1)
  }

  const submit = async () => {
    setSubmitting(true)
    try {
      console.log(dailyQuestions)
      // Convert answers object to array for backend
      const answersArray = dailyQuestions.map((q) => ({
        questionId: q.id,
        type: q.type,
        value: answers[q.id],
        expectedTime: q.time || 0,
        timeSpent: 0, // You can update this if you track time per question
      }))
      await submitFeedback(answersArray)
      setSuccess(true)
      setSubmittedToday(true)
      toast.show('Feedback saved. See you tomorrow!', { variant: 'success' })
    } catch (e) {
      const msg = extractErrorMessage(e, 'Submit failed')
      setError(msg)
      toast.show(msg, { variant: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  // If feedback is submitted today (either previously or just now) → show info container
  if (submittedToday) {
    return (
      <div className="flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 rounded-lg p-6 border border-neutral-gray shadow-sm text-center space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            {success ? 'Thanks — Feedback Submitted!' : 'Feedback Submitted!'}
          </h2>
          <p className="text-text-secondary">
            {success
              ? "Thanks for your feedback! We've saved it — come back tomorrow for more insights."
              : "Great job! You've already submitted your feedback for today. Keep practicing your RCs and come back tomorrow for more insights!"}
          </p>
          <Button onClick={() => nav('/dashboard')} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  // Normal feedback form

  if (!dailyQuestions.length && !submittedToday) {
    return <div className="flex items-center justify-center px-4">Loading questions...</div>
  }

  if (!dailyQuestions.length && submittedToday) {
    return (
      <div className="flex items-center justify-center px-4">
        <div className="max-w-xl w-full bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 rounded-lg p-6 border border-neutral-gray shadow-sm text-center space-y-4">
          <h2 className="text-lg font-semibold text-text-primary">
            No feedback required today
          </h2>
          <p className="text-text-secondary">
            You have access to today's RC. Enjoy your practice!
          </p>
          <Button onClick={() => nav('/dashboard')} variant="primary">
            Back to Dashboard
          </Button>
        </div>
      </div>
    )
  }

  const q = dailyQuestions[currentStep]

  return (
    <div className="flex items-center justify-center px-4">
      <div className="max-w-xl w-full bg-card-surface rounded p-6 space-y-4">
        <h1 className="h3">Daily Feedback</h1>
        <p className="body-muted">
          Help us improve your experience. Completing this unlocks today's premium content.
        </p>

        {error && (
          <div className="bg-error-red/10 border border-error-red/40 text-error-red text-sm rounded p-2">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <label className="block text-sm mb-1 font-medium">{q.label}</label>

          {q.type === 'rating' && (
            <div className="flex gap-2">
              {RATINGS.map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleAnswer(q.id, n)}
                  className={`w-10 h-10 rounded-full border flex items-center justify-center font-semibold
                    ${
                      answers[q.id] === n
                        ? 'bg-primary text-white border-primary'
                        : 'bg-background border-white/20'
                    }
                  `}
                >
                  {n}
                </button>
              ))}
            </div>
          )}

          {q.type === 'multi' && (
            <div className="flex gap-2 flex-wrap">
              {q.options.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() =>
                    handleAnswer(
                      q.id,
                      answers[q.id]?.includes(opt)
                        ? answers[q.id].filter((o) => o !== opt)
                        : [...(answers[q.id] || []), opt]
                    )
                  }
                  className={`px-3 py-1 border rounded ${
                    answers[q.id]?.includes(opt)
                      ? 'bg-primary text-white border-primary'
                      : 'bg-background border-white/20'
                  }`}
                >
                  {opt}
                </button>
              ))}
            </div>
          )}

          {(q.type === 'open' || q.type === 'redirect') && (
            <>
              {q.type === 'redirect' && (
                <Button onClick={() => window.open(q.url, '_blank')} className="mt-2">
                  {q.buttonText || 'Visit Feature'}
                </Button>
              )}
              <textarea
                value={answers[q.id] || ''}
                onChange={(e) => handleAnswer(q.id, e.target.value)}
                rows={3}
                className="w-full bg-background border border-white/10 rounded p-2"
                placeholder={`Write at least ${q.minWords || 10} words`}
              />
            </>
          )}
        </div>

        <div className="flex justify-between pt-2">
          <Button onClick={handlePrev} disabled={currentStep === 0}>
            Previous
          </Button>
          <Button onClick={handleNext} disabled={nextDisabled || submitting}>
            {nextDisabled
              ? `Next (${nextCountdown}s)`
              : currentStep === dailyQuestions.length - 1
              ? 'Submit & Unlock'
              : 'Next'}
          </Button>
        </div>

        <div className="mt-2 text-center">
          <button
            onClick={() => nav('/dashboard')}
            className="text-xs text-text-secondary hover:text-text-primary"
          >
            Back to Dashboard
          </button>
        </div>

        <div className="text-xs text-text-secondary text-center mt-2">
          Step {currentStep + 1} of {dailyQuestions.length}
        </div>
      </div>
    </div>
  )
}
