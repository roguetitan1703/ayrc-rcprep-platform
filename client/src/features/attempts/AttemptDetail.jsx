import React, { useEffect, useState } from 'react'
import { useNavigate, useParams, useLocation } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Clock3, CheckCircle, XCircle, Slash } from 'lucide-react'

export default function AttemptDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const location = useLocation()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let mounted = true
    const fetchAttempt = async () => {
      try {
        setLoading(true)
        // The backend exposes attempt analysis at /attempts/analysis/:id
        const { data } = await api.get(`/attempts/analysis/${id}`)
        if (mounted) setAnalysis(data)
      } catch (e) {
        console.error('Could not load attempt', e)
        if (mounted) setError('Failed to load attempt')
      } finally {
        if (mounted) setLoading(false)
      }
    }
    fetchAttempt()
    return () => {
      mounted = false
    }
  }, [id])

  if (loading) return (
    <div className="flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          <aside className="md:w-80 flex-shrink-0 flex flex-col">
            <div className="overflow-hidden rounded-xl border border-soft bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 p-5 shadow-sm animate-pulse h-56" />
          </aside>

          <main className="flex-1">
            <div className="bg-white border rounded-lg shadow-md p-6 h-full min-h-[26rem] flex flex-col justify-between">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div className="w-2/3">
                    <div className="h-6 bg-surface-muted rounded w-3/4 mb-3" />
                    <div className="h-4 bg-surface-muted rounded w-1/2" />
                  </div>
                  <div className="w-1/6">
                    <div className="h-4 bg-surface-muted rounded w-full ml-auto" />
                    <div className="h-6 bg-surface-muted rounded w-full mt-2 ml-auto" />
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="rounded-lg p-4 flex items-center gap-3 shadow-sm bg-surface-muted animate-pulse h-20" />
                  <div className="rounded-lg p-4 flex items-center gap-3 shadow-sm bg-surface-muted animate-pulse h-20" />
                  <div className="rounded-lg p-4 flex items-center gap-3 shadow-sm bg-surface-muted animate-pulse h-20" />
                  <div className="rounded-lg p-4 flex items-center gap-3 shadow-sm bg-surface-muted animate-pulse h-20" />
                </div>
              </div>

              <div className="mb-3">
                <div className="h-4 bg-surface-muted rounded w-3/4 animate-pulse" />
              </div>

              <div className="flex items-center justify-between gap-3 pt-4 border-t border-soft">
                <div>
                  <div className="h-3 bg-surface-muted rounded w-24 mb-2 animate-pulse" />
                  <div className="flex flex-wrap gap-2">
                    <div className="h-6 w-16 bg-surface-muted rounded animate-pulse" />
                    <div className="h-6 w-12 bg-surface-muted rounded animate-pulse" />
                    <div className="h-6 w-10 bg-surface-muted rounded animate-pulse" />
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <div className="h-10 w-24 bg-surface-muted rounded animate-pulse" />
                  <div className="h-10 w-40 bg-surface-muted rounded animate-pulse" />
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  )
  if (error) return <div className="p-6 text-error-red">{error}</div>
  if (!analysis) return <div className="p-6">No attempt found</div>

  const totalQs = analysis.questions ? analysis.questions.length : (analysis.totalQuestions || 4)
  // Use the definitive backend field `userAnswer` only (do not guess alternate names)
  const getUserAnswer = (q) => q.userAnswer
  const correct = analysis.questions ? analysis.questions.filter(q => q.isCorrect).length : (analysis.correctCount || 0)
  const answeredCount = analysis.questions ? analysis.questions.filter(q => {
    const ua = getUserAnswer(q)
    return typeof ua !== 'undefined' && ua !== null && ua !== ''
  }).length : 0
  const skipped = (totalQs || 0) - answeredCount
  const incorrect = (answeredCount || 0) - (correct || 0)
  const durationSec = analysis.durationSeconds || analysis.timeTaken || 0
  const fmtDuration = durationSec ? `${Math.floor(durationSec / 60)}m ${durationSec % 60}s` : 'N/A'
  const scorePercent = totalQs ? Math.round((analysis.score / totalQs) * 100) : 0
  const performanceComment = (() => {
    // Show 'No answers submitted' only when the user did not provide any answers.
    if (answeredCount === 0) return 'No answers submitted — consider attempting the next test to practice.'
    if (scorePercent >= 80) return 'Great job — strong performance. Keep it up!'
    if (scorePercent >= 50) return 'Good effort — a few areas to review.'
    return 'Room to improve — review the explanations and try again.'
  })()

  // Return a human-friendly relative time like '2 days ago'
  function formatRelative(ts) {
    try {
      const d = new Date(ts)
      const diff = Date.now() - d.getTime()
      const s = Math.floor(diff / 1000)
      const m = Math.floor(s / 60)
      const h = Math.floor(m / 60)
      const days = Math.floor(h / 24)
      if (s < 60) return 'just now'
      if (m < 60) return `${m}m ago`
      if (h < 24) return `${h}h ago`
      if (days < 7) return `${days}d ago`
      return d.toLocaleDateString()
    } catch (e) {
      return ''
    }
  }
  function getOrdinal(n) {
    if (n % 100 >= 11 && n % 100 <= 13) return n + 'th'
    switch (n % 10) {
      case 1:
        return n + 'st'
      case 2:
        return n + 'nd'
      case 3:
        return n + 'rd'
      default:
        return n + 'th'
    }
  }

  // Split attempted date and time into separate values for clearer layout
  let attemptedDate = 'N/A'
  let attemptedTime = ''
  if (analysis.attemptedAt) {
    const d = new Date(analysis.attemptedAt)
    attemptedDate = `${getOrdinal(d.getDate())} ${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`
    attemptedTime = d.toLocaleTimeString()
  }
  const topics = analysis.rc?.topicTags || []

  return (
    <div className="flex items-start justify-center py-8 px-4">
      <div className="w-full max-w-5xl">
        <div className="flex flex-col md:flex-row gap-6 items-stretch">
          {/* Left: slim hero with attempted date */}
          <aside className="md:w-80 flex-shrink-0 flex flex-col">
            <div className="overflow-hidden rounded-xl border border-soft bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 p-5 shadow-sm flex-1 flex flex-col justify-between">
              <div className="flex flex-col justify-between h-full">
                <div>
                  <h3 className="text-lg font-semibold text-primary">Attempt Overview</h3>
                </div>
                {/* Spread attempted time across the card */}
                <div className="text-sm text-text-secondary">
                  <div className="text-xs uppercase tracking-wide">Attempted</div>
                  <div className="mt-2 font-semibold text-text-primary text-xl">{formatRelative(analysis.attemptedAt)}</div>
                  <div className="text-lg font-semibold text-text-primary mt-2">{attemptedDate}</div>
                  <div className="text-base text-text-secondary mt-1">{attemptedTime}</div>
                </div>
                <div>{/* spacer (duration removed from left) */}</div>
              </div>
            </div>
          </aside>

          {/* Right: main content card (larger, contains stats + topics + actions) */}
          <main className="flex-1">
            <div className="bg-white border rounded-lg shadow-md p-6 h-full min-h-[26rem] flex flex-col justify-between transition-shadow hover:shadow-lg">
              <div>
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h2 className="text-2xl font-bold text-text-primary leading-tight">{analysis.rc?.title || analysis.rc?.name || ''}</h2>
                    {/* performanceComment moved to floating banner below cards */}
                  </div>
                  <div className="text-sm text-text-secondary text-right">
                    <div className="text-xs">Score</div>
                    <div className="text-lg font-semibold">{analysis.score}/{totalQs || 0}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  <div className="bg-gradient-to-br from-white to-primary/20 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2 rounded-full bg-info-blue/10 text-info-blue">
                      <Clock3 className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary uppercase">Duration</div>
                      <div className="text-xl font-bold whitespace-nowrap">{fmtDuration}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-success-green/20 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2 rounded-full bg-success-green/10 text-success-green">
                      <CheckCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary uppercase">Correct</div>
                      <div className="text-xl font-bold">{correct}</div>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-white to-error-red/20 rounded-lg p-4 flex items-center gap-3 shadow-sm">
                    <div className="p-2 rounded-full bg-error-red/10 text-error-red">
                      <XCircle className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary uppercase">Incorrect</div>
                      <div className="text-xl font-bold">{incorrect}</div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-br from-white to-neutral/40 rounded-lg p-4 flex items-center gap-3 shadow-sm border border-soft">
                    <div className="p-2 rounded-full bg-neutral/10 text-text-secondary">
                      <Slash className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-xs text-text-secondary uppercase">Skipped</div>
                      <div className="text-xl font-bold">{skipped}</div>
                    </div>
                  </div>
                </div>
                </div>

              {/* Performance comment: placed above the footer */}
              <div className="mb-3">
                <div className="text-sm text-text-primary font-medium">{performanceComment}</div>
              </div>

              {/* Footer: topics on the left, actions on the right */}
              <div className="flex items-center justify-between gap-3 pt-4 border-t border-soft">
                <div>
                  <div className="text-xs text-text-secondary mb-2 font-medium">Topics</div>
                  <div className="flex flex-wrap gap-2">
                    {topics.length ? topics.map((t) => (
                      <span key={t} className="text-xs px-3 py-1 bg-info-blue/10 text-info-blue rounded-full">{t}</span>
                    )) : <div className="text-xs text-text-secondary">—</div>}
                  </div>
                </div>
                <div className="flex items-center justify-end gap-3">
                  <Button variant="outline" onClick={() => navigate('/attempts')}>Back</Button>
                  <Button size='md' onClick={() => navigate(`/attempts/${id}/analysis`, { state: { from: location.pathname } })}>View full analysis</Button>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
      {/* Performance comment moved into the right card above the footer */}
    </div>
  )
}
