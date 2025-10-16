import { useMemo } from 'react'

/**
 * Tooltip component (placeholder - replace with your actual Tooltip)
 */
function Tooltip({ content, children }) {
  return (
    <div className="group relative inline-block">
      {children}
      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
        {content}
      </div>
    </div>
  )
}

/**
 * GitHub-style contribution graph showing daily activity
 * Shows full year starting from October 1, 2025 (365 days forward)
 */
export function ContributionGraph({ attempts = [] }) {
  const weeks = useMemo(() => {
    // Start date: October 1, 2025
    const startDate = new Date('2025-10-01')
    const daysData = {}
    
    // Initialize 365 days starting from Oct 1, 2025
    const NUM_DAYS = 365
    for (let i = 0; i < NUM_DAYS; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
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
    
    // Pad start to align with Sunday
    const firstDay = sortedDays[0].date.getDay()
    if (firstDay !== 0) {
      // Add empty days before the start
      for (let i = firstDay - 1; i >= 0; i--) {
        const paddingDate = new Date(sortedDays[0].date)
        paddingDate.setDate(paddingDate.getDate() - (firstDay - i))
        sortedDays.unshift({ date: paddingDate, count: null }) // null = no data
      }
    }
    
    // Group into weeks
    let currentWeek = []
    sortedDays.forEach((day, idx) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek)
        currentWeek = []
      }
    })
    
    // Add remaining days
    if (currentWeek.length > 0) {
      // Pad end to complete the week
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1].date
        const paddingDate = new Date(lastDate)
        paddingDate.setDate(paddingDate.getDate() + 1)
        currentWeek.push({ date: paddingDate, count: null })
      }
      weeksArray.push(currentWeek)
    }
    
    return weeksArray
  }, [attempts])
  
  const getColorClass = (count) => {
    if (count === null) return 'bg-transparent border-transparent cursor-default'
    if (count === 0) return 'bg-[#EEF1FA] border-[#D8DEE9]'
    if (count === 1) return 'bg-[#D33F49]/30 border-[#D33F49]/40'
    if (count === 2) return 'bg-[#D33F49]/60 border-[#D33F49]/70'
    return 'bg-[#D33F49] border-[#D33F49]' // 3+
  }
  
  const monthLabels = useMemo(() => {
    const startDate = new Date('2025-10-01')
    const labels = []
    const seenMonths = new Set()
    
    // Generate month labels for all 365 days
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate)
      date.setDate(date.getDate() + i)
      const monthYear = `${date.getFullYear()}-${date.getMonth()}`
      
      // Only add label on first occurrence of month
      if (!seenMonths.has(monthYear) && date.getDate() <= 7) {
        labels.push({
          month: date.toLocaleString('default', { month: 'short' }),
          weekIndex: Math.floor(i / 7)
        })
        seenMonths.add(monthYear)
      }
    }
    
    return labels
  }, [])
  
  return (
    <div className="space-y-3 w-full overflow-x-auto pb-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-[#273043]">
          Activity (Oct 2025 - Sep 2026)
        </div>
        <div className="flex items-center gap-2 text-xs text-[#5C6784]">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-[#EEF1FA] border border-[#D8DEE9]" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49]/30 border border-[#D33F49]/40" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49]/60 border border-[#D33F49]/70" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49] border border-[#D33F49]" />
          </div>
          <span>More</span>
        </div>
      </div>
      
      <div className="relative min-w-max">
        {/* Month labels */}
        <div className="flex gap-[3px] mb-5 pl-8">
          {monthLabels.map((label, idx) => (
            <div
              key={idx}
              className="text-[10px] text-[#5C6784] font-medium"
              style={{ 
                position: 'absolute',
                left: `${label.weekIndex * 14 + 32}px`
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
                  if (day.count === null) {
                    return <div key={dayIdx} className="w-[11px] h-[11px]" />
                  }
                  
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

// Demo with sample data
export default function App() {
  // Generate sample attempts data
  const sampleAttempts = useMemo(() => {
    const attempts = []
    const startDate = new Date('2025-10-01')
    
    // Random attempts throughout the year
    for (let i = 0; i < 200; i++) {
      const randomDay = Math.floor(Math.random() * 365)
      const date = new Date(startDate)
      date.setDate(date.getDate() + randomDay)
      attempts.push({ createdAt: date.toISOString() })
    }
    
    return attempts
  }, [])
  
  return (
    <div className="p-8 bg-[#F7F8FC] min-h-screen">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl border border-[#D8DEE9] p-6 shadow-sm">
          <h1 className="text-xl font-bold text-[#273043] mb-4">
            Yearly Performance Activity
          </h1>
          <ContributionGraph attempts={sampleAttempts} />
        </div>
      </div>
    </div>
  )
}