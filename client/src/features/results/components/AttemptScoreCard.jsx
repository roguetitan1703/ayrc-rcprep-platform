import React from 'react'
import { PersonalBestBadge } from '../../../components/ui/PersonalBestBadge'

export function AttemptScoreCard({
  attemptId,
  rcTitle,
  score,
  correctCount,
  totalQuestions,
  duration,
  attemptedAt,
  isPersonalBest,
  onClick,
  variant = 'compact', // 'compact' for list, 'hero' for detail page
}) {
  const percentage = Math.round((score / totalQuestions) * 100)
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  const formatDate = (date) => {
    if (!date) return ''
    const d = new Date(date)
    const now = new Date()
    const diffDays = Math.floor((now - d) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} days ago`
    return d.toLocaleDateString()
  }

  const getScoreColor = () => {
    if (percentage >= 75) return 'text-success-green'
    if (percentage >= 60) return 'text-accent-amber'
    return 'text-error-red'
  }

  if (variant === 'hero') {
    return (
      <div className="bg-card-surface border border-soft rounded-xl p-8 mb-6 relative shadow-sm">
        {isPersonalBest && (
          <div className="absolute inset-0 bg-gradient-radial from-primary/10 to-transparent rounded-xl pointer-events-none" />
        )}

        <div className="relative z-10">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h1 className={`text-5xl font-bold mb-2 ${getScoreColor()}`}>{percentage}%</h1>
              <p className="text-text-secondary text-lg">
                {correctCount}/{totalQuestions} correct · {formatDuration(duration)}
              </p>
            </div>

            {isPersonalBest && <PersonalBestBadge />}
          </div>

          <div className="text-sm text-text-secondary">
            {rcTitle} · {formatDate(attemptedAt)}
          </div>
        </div>
      </div>
    )
  }

  // Compact variant for list
  return (
    <div
      className="bg-card-surface border border-soft rounded-xl p-6 hover:shadow-lg hover:border-primary/20 transition-all"
    >
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <h3 className="font-semibold text-text-primary mb-2 text-lg line-clamp-2">{rcTitle}</h3>
          <p className="text-sm text-text-secondary">{formatDate(attemptedAt)}</p>
        </div>

        <div className="flex flex-col items-end gap-2 ml-4">
          <div className={`text-3xl font-bold ${getScoreColor()}`}>{percentage}%</div>
          {isPersonalBest && (
            <span className="px-2 py-0.5 bg-primary-light text-white rounded text-xs font-semibold whitespace-nowrap">
              🎉 Best
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-soft">
        <div className="flex items-center gap-4 text-sm text-text-secondary">
          <span>
            {correctCount}/{totalQuestions} correct
          </span>
          <span>·</span>
          <span>{formatDuration(duration)}</span>
        </div>

        <button
          onClick={onClick}
          className="px-4 py-2 bg-primary text-white rounded-lg hover:bg-primary-dark transition-colors text-sm font-medium"
        >
          View Details
        </button>
      </div>
    </div>
  )
}
