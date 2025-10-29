import React from 'react'
import { CoverageMeter } from './CoverageMeter'
import { Target, Clock3, Activity, ListChecks } from 'lucide-react'

export function StatsPanel({ stats, loading, totalAttempts = 0 }) {
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl p-6 lg:p-8 border border-soft bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 space-y-6">
        <div className="grid grid-cols-3 gap-4">
          <div className="h-20 bg-surface-muted rounded" />
          <div className="h-20 bg-surface-muted rounded" />
          <div className="h-20 bg-surface-muted rounded" />
        </div>
        <div className="h-4 bg-surface-muted rounded" />
      </div>
    )
  }

  const {
    attempts7d = 0,
    accuracy7d = 0,
    avgDuration = 0,
    taggedWrong = 0,
    totalWrong = 0,
  } = stats || {}
  const coveragePercent = totalWrong > 0 ? taggedWrong / totalWrong : 0
  const formatDuration = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}m ${secs}s`
  }

  return (
    <div className="relative overflow-hidden rounded-xl p-6 lg:p-8 border border-soft bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
  <StatTile label="Total attempts" value={totalAttempts} icon={ListChecks} />
        <StatTile label="Attempts (7d)" value={attempts7d} icon={Activity} />
        <StatTile label="Accuracy (7d)" value={`${Math.round(accuracy7d * 100)}%`} icon={Target} />
        <StatTile label="Avg Duration" value={formatDuration(avgDuration)} icon={Clock3} />
      </div>
      <CoverageMeter
        coverage={coveragePercent}
        target={0.7}
        taggedCount={taggedWrong}
        totalWrong={totalWrong}
      />
    </div>
  )
}

function StatTile({ label, value, icon: Icon }) {
  return (
    <div className="bg-card-surface/60 backdrop-blur-sm rounded-lg p-6 border border-soft/60 shadow-sm flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <div className="text-xs uppercase tracking-wide text-text-secondary">{label}</div>
        {Icon && <Icon className="h-4 w-4 text-text-secondary" />}
      </div>
      <div className="text-2xl font-bold text-text-primary">{value}</div>
    </div>
  )
}
