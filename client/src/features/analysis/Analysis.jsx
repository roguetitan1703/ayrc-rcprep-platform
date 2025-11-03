import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { CoverageMeter } from '../attempts/components/CoverageMeter'
import { CategoryAccuracyTable } from '../attempts/components/CategoryAccuracyTable'
import { ReasonTagSelect } from '../attempts/components/ReasonTagSelect'
import { Clock3, Target, CalendarDays, Zap, Tag, Activity } from 'lucide-react'

// Reusable stat tile
function StatTile({ label, value, icon: Icon, iconColor = 'text-text-secondary' }) {
  return (
    <div className="bg-white border border-soft rounded-lg p-4 flex flex-col justify-between shadow-sm">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-text-secondary">{label}</div>
        {Icon && <Icon className={`h-4 w-4 ${iconColor}`} />}
      </div>
      <div className="mt-1 text-md font-semibold text-text-primary leading-none">{value}</div>
    </div>
  )
}

export default function Analysis() {
  const { id } = useParams()
  const [analysis, setAnalysis] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [analysisFeedback, setAnalysisFeedback] = useState([])
  const [activeQuestion, setActiveQuestion] = useState(0)

  useEffect(() => {
    async function fetchAnalysis() {
      try {
        setLoading(true)
        const { data } = await api.get(`/attempts/analysis/${id}`)
        setAnalysis(data)
        setAnalysisFeedback(data.analysisFeedback || [])
      } catch (e) {
        setError(e?.response?.data?.error || e.message)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalysis()
  }, [id])

  function handleReasonSelected(questionIndex, code) {
    setAnalysisFeedback((prev) => {
      const filtered = prev.filter((r) => r.questionIndex !== questionIndex)
      return [...filtered, { questionIndex, reason: code }]
    })
  }

  // Helper for date formatting with ordinal
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

  if (loading)
    return (
      <div className="space-y-6">
        <Skeleton className="h-40 w-full" />
        <div className="grid lg:grid-cols-2 gap-8">
          <Skeleton className="h-[70vh]" />
          <Skeleton className="h-[70vh]" />
        </div>
      </div>
    )
  if (error)
    return (
      <div className="p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">
        {error}
      </div>
    )
  if (!analysis) return null

  const {
    rc,
    questions,
    score,
    durationSeconds,
    attemptedAt,
    coverage,
    categoryStats,
    stats,
    isPersonalBest,
  } = analysis
  const correctCount = questions.filter((q) => q.isCorrect).length

  return (
    <div className="space-y-8">
      {/* Hero Panel */}
      <div className="relative overflow-hidden rounded-xl border border-soft bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 p-6 md:p-8">
        <div className="flex flex-col gap-4">
          <div className="flex items-end gap-4">
            <div className="text-5xl font-bold text-success-green">
              {Math.round((score / questions.length) * 100)}%
            </div>
            {/*
            {isPersonalBest && (
              <span className="px-2 py-1 rounded bg-primary-light text-white text-xs font-semibold">
                PERSONAL BEST
              </span>
            )}
            */}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <StatTile
              label="Correct"
              value={`${correctCount}/${questions.length}`}
              icon={Target}
              iconColor="text-success-green"
            />
            <StatTile
              label="Time"
              value={`${Math.floor((durationSeconds || analysis.timeTaken) / 60)}m ${
                (durationSeconds || analysis.timeTaken) % 60
              }s`}
              icon={Clock3}
              iconColor="text-info-blue"
            />
            <StatTile
              label="Avg / Q"
              value={`${stats.avgTimePerQuestion}s`}
              icon={Zap}
              iconColor="text-primary"
            />
            <StatTile
              label="Speed Tier"
              value={stats.speedTier}
              icon={Activity}
              iconColor="text-primary"
            />
            {/* Date with ordinal format */}
            <StatTile
              label="Date"
              value={(() => {
                const d = new Date(attemptedAt)
                return `${getOrdinal(d.getDate())} ${d.toLocaleString('default', {
                  month: 'long',
                })} ${d.getFullYear()}`
              })()}
              icon={CalendarDays}
              iconColor="text-primary"
            />
            {/* Topics as pills */}
            {rc.topicTags?.length > 0 && (
              <div className="bg-white border border-soft rounded-lg p-4 shadow-sm flex flex-col">
                <div className="text-xs uppercase tracking-wide text-text-secondary mb-1">
                  Topics
                </div>
                <div className="flex flex-wrap gap-2">
                  {rc.topicTags.map((t) => (
                    <span
                      key={t}
                      className="text-xs px-2 py-0.5 bg-info-blue/10 text-info-blue rounded-full"
                    >
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Coverage Meter */}
      {coverage && (
        <CoverageMeter
          coverage={coverage.coverage}
          target={0.7}
          taggedCount={coverage.taggedCount}
          totalWrong={coverage.incorrectCount}
        />
      )}

      <div className="grid lg:grid-cols-5 gap-8 items-start">
        {/* Passage */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="font-semibold text-text-primary">Passage</h2>
            </CardHeader>
            <CardContent>
              <div className="prose max-w-none text-sm leading-relaxed whitespace-pre-line">
                {rc.passageText}
              </div>
            </CardContent>
          </Card>
          {categoryStats?.length > 0 && <CategoryAccuracyTable stats={categoryStats} />}
        </div>
        {/* Questions */}
        <div className="lg:col-span-3">
          {/* Question Tabs */}
          <div className="flex flex-wrap gap-2 mb-4">
            {questions.map((_, idx) => {
              const correct = questions[idx].isCorrect
              const isActive = activeQuestion === idx
              return (
                <button
                  key={idx}
                  onClick={() => setActiveQuestion(idx)}
                  className={`px-3 py-1 rounded border font-semibold text-sm transition-all
                    ${
                      correct
                        ? 'bg-success-green/10 border-success-green text-success-green'
                        : 'bg-error-red/10 border-error-red text-error-red'
                    }
                    ${isActive ? 'ring-4 ring-[#D33F49]/40 scale-110' : ''}
                  `}
                >
                  {idx + 1}
                </button>
              )
            })}
          </div>

          {/* Active Question Card */}
          {(() => {
            const q = questions[activeQuestion]
            const i = activeQuestion
            const current = analysisFeedback.find((r) => r.questionIndex === i)?.reason
            // Get real question type from backend data
            const qType = q.questionType || 'Unknown'
            const qDifficulty = q.difficulty || 'medium'
            // Use only the definitive backend field `userAnswer` (do not guess alternate names)
            const getUserAnswer = (q) => q.userAnswer
            return (
              <Card
                key={i}
                className={q.isCorrect ? 'border-success-green/40' : 'border-error-red/40'}
              >
                <CardHeader className="flex items-center justify-between flex-wrap gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-lg font-semibold text-text-primary">
                            Question {i + 1}
                          </span>
                          {(() => {
                            const ua = getUserAnswer(q)
                            // Consider null/undefined as skipped; only definitive userAnswer counts as answered
                            const userAnswered = ua != null && ua !== ''
                            if (q.isCorrect) {
                              return (
                                <Badge color="success" className="uppercase text-[10px] px-2 py-0.5">
                                  Correct
                                </Badge>
                              )
                            }
                            if (!userAnswered) {
                              return (
                                <Badge color="neutral" className="uppercase text-[10px] px-2 py-0.5">
                                  Skipped
                                </Badge>
                              )
                            }
                            return (
                              <Badge color="error" className="uppercase text-[10px] px-2 py-0.5">
                                Incorrect
                              </Badge>
                            )
                          })()}
                        </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Question metadata with labels */}
                  <div className="flex items-center gap-3 text-xs text-text-secondary border-b border-soft pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Difficulty:</span>
                      <Badge
                        color={
                          qDifficulty === 'hard'
                            ? 'error'
                            : qDifficulty === 'easy'
                            ? 'success'
                            : 'warning'
                        }
                        className="uppercase text-[10px] px-2 py-0.5"
                      >
                        {qDifficulty}
                      </Badge>
                    </div>
                    <div className="w-px h-4 bg-soft"></div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-medium">Type:</span>
                      <Badge className="text-[10px] px-2 py-0.5 capitalize">
                        {qType.replace('-', ' ')}
                      </Badge>
                    </div>
                  </div>

                  <div className="text-sm text-text-primary leading-relaxed">{q.questionText}</div>
                  <div className="space-y-3">
                    {q.options.map((opt) => {
                      const ua = getUserAnswer(q)
                      const isC = opt.id === q.correctAnswerId
                      const isU = ua != null && String(opt.id) === String(ua)
                      return (
                        <div
                          key={opt.id}
                          className={`rounded-lg border px-3 py-3 text-sm relative overflow-hidden transition-transform hover:scale-[1.01] ${
                            isC
                              ? 'border-success-green bg-success-green/5'
                              : isU
                              ? 'border-accent-amber bg-accent-amber/10'
                              : 'border-soft bg-surface-muted/40'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-4 mb-2">
                            <span className="font-medium flex-1">
                              {opt.id}. {opt.text}
                            </span>
                            {isC && (
                              <span className="text-[10px] tracking-wide text-success-green font-semibold whitespace-nowrap">
                                ANSWER
                              </span>
                            )}
                            {isU && !isC && (
                              <span className="text-[10px] tracking-wide text-accent-amber font-semibold whitespace-nowrap">
                                YOUR CHOICE
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-1 bg-surface-muted rounded-full">
                              <div
                                className={`h-full rounded-full ${
                                  isC
                                    ? 'bg-success-green'
                                    : isU
                                    ? 'bg-accent-amber'
                                    : 'bg-primary/40'
                                }`}
                                style={{ width: `${opt.percent}%` }}
                              />
                            </div>
                            <span className="text-xs text-text-secondary tabular-nums whitespace-nowrap w-10 text-right">
                              {opt.percent}%
                            </span>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                  <div className="bg-surface-muted p-3 rounded-lg text-sm leading-relaxed">
                    <strong className="text-text-primary">Explanation:</strong> {q.explanation}
                  </div>
                    <div className="pt-3 border-t border-soft">
                      <div className="flex items-center gap-3">
                        <ReasonTagSelect
                          isCorrect={q.isCorrect}
                          questionIndex={i}
                          attemptId={analysis.attemptId}
                          currentReason={current}
                          onReasonSelected={(code) => handleReasonSelected(i, code)}
                          onNext={() => {
                            if (i < questions.length - 1) {
                              setActiveQuestion(i + 1)
                            }
                          }}
                        />
                        {!current && !q.isCorrect && (
                          <span className="text-[10px] text-text-secondary uppercase tracking-wide">
                            Tag Reason
                          </span>
                        )}
                      </div>
                    </div>
                </CardContent>
              </Card>
            )
          })()}
        </div>
      </div>
    </div>
  )
}
