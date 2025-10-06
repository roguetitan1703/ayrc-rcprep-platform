import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate, useParams, useLocation, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { QUESTION_COUNT, TEST_DURATION_SECONDS, LOCAL_PROGRESS_KEY } from '../../lib/constants'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'

export default function Test() {
  const { id } = useParams()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const mode = params.get('mode')
  const isPractice = mode === 'practice' || params.get('practice') === '1'
  const isPreview = mode === 'preview' || params.get('preview') === '1'
  const [rc, setRc] = useState(null)
  const [answers, setAnswers] = useState(Array.from({ length: QUESTION_COUNT }, () => ''))
  const [marked, setMarked] = useState(Array.from({ length: QUESTION_COUNT }, () => false))
  const [qIndex, setQIndex] = useState(0)
  const [timeLeft, setTimeLeft] = useState(TEST_DURATION_SECONDS)
  const [startedAt, setStartedAt] = useState(null)
  const [questionTimers, setQuestionTimers] = useState(Array.from({ length: QUESTION_COUNT }, () => 0)) // seconds per question
  const questionStartRef = useRef(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [revealAnswers, setRevealAnswers] = useState(false)
  const nav = useNavigate()
  const toast = useToast()
  const intervalRef = useRef(null)
  const autosaveRef = useRef(null)

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/rcs/${id}${(isPractice) ? '?practice=1' : ''}`)
        setRc(data)
        // restore any local progress
        const key = LOCAL_PROGRESS_KEY(id, isPractice ? 'practice' : isPreview ? 'preview' : 'test')
        const saved = localStorage.getItem(key)
        if (saved) {
          try {
            const parsed = JSON.parse(saved)
            if (Array.isArray(parsed.answers) && parsed.answers.length === QUESTION_COUNT) setAnswers(parsed.answers)
            if (Array.isArray(parsed.marked) && parsed.marked.length === QUESTION_COUNT) setMarked(parsed.marked)
            if (typeof parsed.qIndex === 'number') setQIndex(Math.min(QUESTION_COUNT - 1, Math.max(0, parsed.qIndex)))
            if (typeof parsed.questionTimers !== 'undefined') setQuestionTimers(parsed.questionTimers)
          } catch { }
        }
      } catch (e) { setError(e?.response?.data?.error || e.message) }
      finally { setLoading(false) }
    })()
  }, [id])

  useEffect(() => {
    if (isPractice || isPreview) return
    intervalRef.current = setInterval(() => setTimeLeft(t => t > 0 ? t - 1 : 0), 1000)
    return () => clearInterval(intervalRef.current)
  }, [isPractice, isPreview])

  useEffect(() => { if (!(isPractice || isPreview) && timeLeft === 0) submit() }, [timeLeft, isPractice, isPreview])

  // autosave to localStorage every 30s
  useEffect(() => {
    autosaveRef.current = setInterval(() => {
      const key = LOCAL_PROGRESS_KEY(id, isPractice ? 'practice' : isPreview ? 'preview' : 'test')
      const payload = { answers, marked, qIndex, questionTimers }
      try { localStorage.setItem(key, JSON.stringify(payload)) } catch { }
    }, 30000)
    return () => clearInterval(autosaveRef.current)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, answers, marked, qIndex])

  // Initialize start time and per-question timer start when component mounts / rc loaded
  useEffect(() => {
    if (loading) return
    setStartedAt(prev => prev || Date.now())
    // start timing for current question
    questionStartRef.current = Date.now()
    return () => {
      // on unmount, record the in-progress question time
      if (questionStartRef.current != null) {
        const delta = Math.floor((Date.now() - questionStartRef.current) / 1000)
        setQuestionTimers(t => { const a = [...t]; a[qIndex] = (a[qIndex] || 0) + delta; return a })
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [loading])

  function selectAnswer(i, val) {
    setAnswers(a => { const b = [...a]; b[i] = val; return b })
  }

  const prevIndexRef = useRef(qIndex)

  // record time when moving between questions
  useEffect(() => {
    // whenever qIndex changes, close previous timer and start new
    const now = Date.now()
    if (questionStartRef.current != null) {
      const delta = Math.floor((now - questionStartRef.current) / 1000)
      setQuestionTimers(t => { const a = [...t]; const idx = prevIndexRef.current ?? 0; a[idx] = (a[idx] || 0) + delta; return a })
    }
    // start new timer for current
    questionStartRef.current = now
    prevIndexRef.current = qIndex
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [qIndex])

  async function submit() {
    try {
      if (isPreview) { nav('/dashboard'); return }
      // For practice mode, compute score locally and show results without POSTing
      if (isPractice) {
        // finalize timers
        const nowP = Date.now()
        const finalTimersP = [...questionTimers]
        if (questionStartRef.current != null) {
          const delta = Math.floor((nowP - questionStartRef.current) / 1000)
          finalTimersP[qIndex] = (finalTimersP[qIndex] || 0) + delta
        }
        const normalizedP = answers.map(a => (a === null ? '' : a))
        let scoreP = 0
        rc.questions.forEach((q, i) => { if (normalizedP[i] && normalizedP[i] === q.correctAnswerId) scoreP += 1 })
        const totalDurationP = Math.floor((nowP - (startedAt || nowP)) / 1000)
        try { localStorage.removeItem(LOCAL_PROGRESS_KEY(id)) } catch {}
        nav(`/results/${id}?practice=1&score=${scoreP}&time=${totalDurationP}`)
        return
      }
      // finalize timers (compute synchronously so we can send correct payload)
      const now = Date.now()
      const finalTimers = [...questionTimers]
      if (questionStartRef.current != null) {
        const delta = Math.floor((now - questionStartRef.current) / 1000)
        finalTimers[qIndex] = (finalTimers[qIndex] || 0) + delta
      }
      setQuestionTimers(finalTimers)
      const totalDuration = Math.floor((now - (startedAt || now)) / 1000)
      // derive device type
      const ua = navigator.userAgent || ''
      const deviceType = /Mobi|Android|iPhone|iPad/.test(ua) ? (/iPad|Tablet/.test(ua) ? 'tablet' : 'mobile') : 'desktop'

      // Build q_details from finalized timers
      const q_details = finalTimers.map((sec, idx) => ({ questionIndex: idx, timeSpent: sec || 0, wasReviewed: !!marked[idx] }))

      const payload = { rcPassageId: id, answers, durationSeconds: totalDuration, timeTaken: (TEST_DURATION_SECONDS - timeLeft), deviceType, q_details, attemptType: 'official' }
      const { data } = await api.post('/attempts', payload)
      try { localStorage.removeItem(LOCAL_PROGRESS_KEY(id)) } catch { }
      nav(`/results/${id}?score=${data.score}&time=${TEST_DURATION_SECONDS - timeLeft}`)
    } catch (e) { const msg = extractErrorMessage(e, 'Submit failed'); setError(msg); toast.show(msg, { variant: 'error' }) }
  }

  if (loading) return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 grid grid-cols-12 gap-4">
        <div className="col-span-7 bg-card-surface rounded p-4 overflow-hidden">
          <Skeleton className="h-6 w-2/5 mb-4" />
          <SkeletonText lines={6} />
        </div>
        <div className="col-span-4 space-y-3">
          <div className="bg-card-surface rounded p-3"><Skeleton className="h-5 w-1/3" /></div>
          <div className="bg-card-surface rounded p-4 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-4/5" />
            <Skeleton className="h-4 w-3/5" />
          </div>
        </div>
        <div className="col-span-1 flex flex-col gap-2 items-stretch">
          {Array.from({ length: QUESTION_COUNT }).map((_, i) => <div key={i} className="h-10 rounded bg-card-surface" />)}
        </div>
      </div>
      <div className="mt-4 h-16 bg-card-surface rounded flex items-center justify-between px-4 text-sm text-text-secondary">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-8 w-32" />
      </div>
    </div>
  )
  if (error) return <div className="p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">{error}</div>
  if (!rc) return null

  const q = rc.questions[qIndex]

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)]">
      <div className="flex-1 grid grid-cols-12 gap-4 overflow-hidden">
        {/* Passage Column */}
        <div className="col-span-7 bg-card-surface rounded flex flex-col">
          <div className="px-5 pt-4 pb-3 border-b border-white/5 flex items-center justify-between">
            <h2 className="text-lg font-semibold truncate pr-4">{rc.title}</h2>
            {!(isPractice || isPreview) && (
              <Badge color={timeLeft <= 60 ? 'warning' : 'default'} aria-live={timeLeft <= 60 ? 'assertive' : 'off'} aria-label={`Time remaining ${Math.floor(timeLeft / 60)} minutes ${timeLeft % 60} seconds`}>
                {Math.floor(timeLeft / 60).toString().padStart(2, '0')}:{(timeLeft % 60).toString().padStart(2, '0')}
              </Badge>
            )}
          </div>
          <div className="px-5 py-4 overflow-auto font-serif whitespace-pre-wrap leading-relaxed text-text-primary/90">
            {rc.passageText}
          </div>
        </div>
        {/* Question Column */}
        <div className="col-span-4 bg-card-surface rounded flex flex-col">
          <div className="px-5 pt-4 pb-3 border-b border-white/5 flex items-center justify-between text-sm">
            <div>Question {qIndex + 1} / {QUESTION_COUNT}</div>
            <div className="flex items-center gap-3">
              {isPractice && (
                <>
                  <span className="text-text-secondary">Practice Mode</span>
                  <button
                    type="button"
                    onClick={() => setRevealAnswers(r => !r)}
                    className="text-xs px-2 py-1 rounded border bg-background hover:bg-background/95"
                  >{revealAnswers ? 'Hide Answers' : 'Reveal Answers'}</button>
                </>
              )}
              {isPreview && <span className="text-accent-amber">Preview</span>}
            </div>
          </div>
          <div className="p-5 flex-1 overflow-auto">
            <div className="mb-4 text-sm">{q.questionText}</div>
            <fieldset className="space-y-2">
              <legend className="sr-only">Answer choices</legend>
              {q.options.map(op => (
                <label key={op.id} className="flex items-start gap-2 cursor-pointer text-sm">
                  <input type="radio" className="mt-0.5" name={`q${qIndex}`} checked={answers[qIndex] === op.id} onChange={() => selectAnswer(qIndex, op.id)} />
                  <span className="leading-snug">
                    <span className="font-medium mr-1">{op.id}.</span>{op.text}
                    {isPractice && revealAnswers && answers[qIndex] === op.id && (
                      <span className={`ml-2 text-xs ${answers[qIndex]===rc.questions[qIndex].correctAnswerId? 'text-success-green':'text-error-red'}`}>
                        {op.id === rc.questions[qIndex].correctAnswerId ? '✓ Correct' : '✕ Incorrect'}
                      </span>
                    )}
                  </span>
                </label>
              ))}
            </fieldset>
            {isPractice && revealAnswers && (
              <div className="mt-4 text-sm text-text-secondary">Explanation: {rc.questions[qIndex].explanation}</div>
            )}
            <div className="mt-4">
              <label className="inline-flex items-center gap-2 cursor-pointer text-xs">
                <input type="checkbox" checked={marked[qIndex]} onChange={() => setMarked(m => { const c = [...m]; c[qIndex] = !c[qIndex]; return c })} />
                <span>Mark for review</span>
              </label>
            </div>
          </div>
        </div>
        {/* Palette Gutter */}
        <div className="col-span-1 flex flex-col items-stretch gap-2" aria-label="Question palette">
          {Array.from({ length: QUESTION_COUNT }).map((_, i) => {
            const answered = !!answers[i]
            const isCurrent = i === qIndex
            return (
              <button
                key={i}
                onClick={() => setQIndex(i)}
                aria-label={`Go to question ${i + 1}${marked[i] ? ' marked for review' : ''}${answered ? ' answered' : ''}`}
                className={`h-10 rounded text-sm font-medium border transition relative
                  ${isCurrent ? 'border-accent-amber' : 'border-white/10'}
                  ${answered ? 'bg-white/10' : ''}
                  ${marked[i] ? 'ring-2 ring-accent-amber/60' : ''}`}
              >{i + 1}</button>
            )
          })}
        </div>
      </div>
      {/* Footer */}
      <div className="mt-4 h-16 bg-card-surface rounded flex items-center justify-between px-5 text-sm">
        <Link to="/dashboard" className="text-text-secondary hover:text-text-primary">← Dashboard</Link>
        <div className="flex items-center gap-3">
          {qIndex > 0 && <Button variant="outline" onClick={() => setQIndex(i => i - 1)}>Previous</Button>}
          {qIndex < QUESTION_COUNT - 1 ? (
            <Button onClick={() => setQIndex(i => i + 1)}>{(isPractice || isPreview) ? 'Next' : 'Save & Next'}</Button>
          ) : (
            <Button onClick={submit}>{(isPractice || isPreview) ? 'Done' : 'Submit Test'}</Button>
          )}
        </div>
      </div>
    </div>
  )
}
