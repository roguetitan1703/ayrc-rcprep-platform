import { ShieldDown } from './shapes/ShieldDown'
import { ShieldUp } from './shapes/ShieldUp'
import { Square } from './shapes/Square'
import { Circle } from './shapes/Circle'

/**
 * QuestionStatusLegend - Visual legend showing 5 question status types
 * Matches CAT exam interface legend with shapes and labels
 */
export function QuestionStatusLegend() {
  const legendItems = [
    {
      label: 'Answered',
      shape: <ShieldDown size={32} className="text-success-green" />,
      color: 'text-success-green',
    },
    {
      label: 'Not Answered',
      shape: <ShieldUp size={32} className="text-error-red" />,
      color: 'text-error-red',
    },
    {
      label: 'Not Visited',
      shape: <Square size={32} className="text-card-surface border-2 border-border-soft" />,
      color: 'text-text-secondary',
    },
    {
      label: 'Marked for Review',
      shape: <Circle size={32} className="text-[#7B68EE]" />,
      color: 'text-[#7B68EE]',
    },
    {
      label: 'Answered & Marked',
      shape: (
        <div className="relative">
          <Circle size={28} className="text-[#7B68EE]" />
          <div className="absolute bottom-0 right-0 w-2 h-2 rounded-full bg-success-green border-2 border-card-surface" />
        </div>
      ),
      color: 'text-[#7B68EE]',
    },
  ]

  return (
    <div className="bg-card-surface rounded-lg p-4 border border-border-soft shadow-sm">
      <div className="text-xs font-bold text-text-primary uppercase tracking-wider mb-3 pb-2 border-b border-border-soft">
        Question Status
      </div>
      <div className="space-y-2.5">
        {legendItems.map((item, idx) => (
          <div key={idx} className="flex items-center gap-3">
            <div className="flex-shrink-0 w-8 h-8 flex items-center justify-center">
              {item.shape}
            </div>
            <span className="text-xs font-medium text-text-secondary">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}
