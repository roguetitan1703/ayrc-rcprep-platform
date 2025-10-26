import React from 'react'
import { Tag } from 'lucide-react'

export function CoverageMeter({ coverage, target = 0.7, taggedCount = 0, totalWrong = 0 }) {
  const safeCoverage = typeof coverage === 'number' && !isNaN(coverage) ? coverage : 0
  const percentage = Math.round(safeCoverage * 100)
  const targetPercentage = Math.round(target * 100)
  const remaining = Math.max(0, targetPercentage - percentage)

  return (
    <div className="mb-2">
      <div className="flex justify-between items-center text-sm mb-2">
        <div className="flex items-center gap-2 text-text-secondary">
          <Tag className="h-4 w-4" />
          <span>Reason Coverage</span>
        </div>
        <span className="text-text-primary font-semibold">
          {percentage}% / {targetPercentage}% target
        </span>
      </div>
  <div className="h-2 bg-white rounded-full overflow-hidden relative">
        <div
          className="h-full bg-primary transition-all duration-500"
          style={{ width: `${Math.min(100, Math.max(0, percentage))}%` }}
        />
        <div
          className="absolute top-0 bottom-0 w-0.5 bg-info-blue"
          style={{ left: `${targetPercentage}%` }}
          title={`Target: ${targetPercentage}%`}
        />
      </div>
      {totalWrong > 0 ? (
        <div className="text-xs text-text-secondary mt-1">
          Tagged {taggedCount} of {totalWrong} mistakes
          {remaining > 0 && percentage < targetPercentage
            ? ` · ${remaining}% to target`
            : ''}
        </div>
      ) : (
        <div className="text-xs text-text-secondary mt-1">
          No mistakes in recent set
        </div>
      )}
    </div>
  )
}
