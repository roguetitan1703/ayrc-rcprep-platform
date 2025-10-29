import { Clock } from 'lucide-react'

const RANGES = [
  { value: 7, label: '7 Days' },
  { value: 30, label: '30 Days' },
  { value: 90, label: '90 Days' }
]

export function RangeSelector({ value, onChange }) {
  return (
    <div className="inline-flex items-center gap-2 bg-surface-muted rounded-lg p-1">
      <Clock size={16} className="text-text-secondary ml-2" />
      {RANGES.map(range => (
        <button
          key={range.value}
          onClick={() => onChange(range.value)}
          className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
            value === range.value
              ? 'bg-[#D33F49] text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary hover:bg-white/50'
          }`}
        >
          {range.label}
        </button>
      ))}
    </div>
  )
}
