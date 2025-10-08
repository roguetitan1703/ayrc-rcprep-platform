import { useMemo } from 'react'
import { Tooltip } from '../../../components/ui/Tooltip'

/**
 * GitHub-style contribution graph showing daily activity
 * Shows last 12 weeks of attempts with color intensity based on count
 */
export function ContributionGraph({ attempts = [] }) {
  const weeks = useMemo(() => {
    // Generate last 12 weeks (84 days)
    const today = new Date()
    const daysData = {}
    
    // Initialize all days with 0 attempts
    for (let i = 83; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      const key = date.toISOString().split('T')[0]
      daysData[key] = { date, count: 0 }
    }
    
    // Fill in actual attempt counts
    if (attempts && attempts.length > 0) {
      attempts.forEach(attempt => {
        const date = new Date(attempt.createdAt)
        const key = date.toISOString().split('T')[0]
        if (daysData[key]) {
          daysData[key].count++
        }
      })
    }
    
    // Group into weeks (Sunday start)
    const weeksArray = []
    const sortedDays = Object.values(daysData).sort((a, b) => a.date - b.date)
    
    // Find the first Sunday
    let currentWeek = []
    sortedDays.forEach(day => {
      currentWeek.push(day)
      if (day.date.getDay() === 6 || day === sortedDays[sortedDays.length - 1]) { // Saturday or last day
        weeksArray.push(currentWeek)
        currentWeek = []
      }
    })
    
    return weeksArray
  }, [attempts])
  
  const getColorClass = (count) => {
    if (count === 0) return 'bg-[#EEF1FA] border-[#D8DEE9]'
    if (count === 1) return 'bg-[#D33F49]/30 border-[#D33F49]/40'
    if (count === 2) return 'bg-[#D33F49]/60 border-[#D33F49]/70'
    return 'bg-[#D33F49] border-[#D33F49]' // 3+
  }
  
  const monthLabels = useMemo(() => {
    const labels = []
    const today = new Date()
    
    for (let i = 11; i >= 0; i--) {
      const date = new Date(today)
      date.setMonth(date.getMonth() - i)
      labels.push({
        month: date.toLocaleString('default', { month: 'short' }),
        index: 11 - i
      })
    }
    
    return labels.filter((label, idx, arr) => 
      idx === 0 || label.month !== arr[idx - 1]?.month
    )
  }, [])
  
  return (
    <div className="space-y-3 w-full overflow-x-auto">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[#273043]">
          Activity (last 12 weeks)
        </div>
        <div className="flex items-center gap-2 text-xs text-[#5C6784]">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#EEF1FA] border border-[#D8DEE9]" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49]/30 border-[#D33F49]/40" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49]/60 border-[#D33F49]/70" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49] border-[#D33F49]" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="relative min-w-max">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-1 pl-8">
          {monthLabels.map((label, idx) => (
            <div
              key={idx}
              className="text-[10px] text-[#5C6784] font-medium"
              style={{ 
                marginLeft: idx === 0 ? 0 : `${(label.index - (monthLabels[idx - 1]?.index || 0)) * 14}px`,
                width: '28px'
              }}
            >
              {label.month}
            </div>
          ))}
        </div>
        
        {/* Day labels and grid */}
        <div className="flex gap-2">
          <div className="flex flex-col gap-[3px] text-[10px] text-[#5C6784] font-medium justify-between py-1">
            <div className="h-[11px] leading-[11px]">Sun</div>
            <div className="h-[11px] leading-[11px]">Mon</div>
            <div className="h-[11px] leading-[11px]">Tue</div>
            <div className="h-[11px] leading-[11px]">Wed</div>
            <div className="h-[11px] leading-[11px]">Thu</div>
            <div className="h-[11px] leading-[11px]">Fri</div>
            <div className="h-[11px] leading-[11px]">Sat</div>
          </div>
          
          {/* Contribution grid */}
          <div className="flex gap-[3px] flex-1">
            {weeks.map((week, weekIdx) => (
              <div key={weekIdx} className="flex flex-col gap-[3px]">
                {week.map((day, dayIdx) => {
                  const dateStr = day.date.toLocaleDateString('default', { 
                    month: 'short', 
                    day: 'numeric',
                    year: 'numeric'
                  })
                  
                  return (
                    <Tooltip
                      key={dayIdx}
                      content={`${day.count} ${day.count === 1 ? 'attempt' : 'attempts'} on ${dateStr}`}
                    >
                      <div
                        className={`w-[11px] h-[11px] rounded-sm border transition-all cursor-pointer hover:ring-2 hover:ring-[#D33F49]/30 ${getColorClass(day.count)}`}
                        aria-label={`${day.count} contributions on ${dateStr}`}
                      />
                    </Tooltip>
                  )
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
