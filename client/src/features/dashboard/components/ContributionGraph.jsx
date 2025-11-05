import { useMemo, useState, useEffect } from 'react'

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
 * Hybrid behavior: default to last 365 days, but auto-zoom to a tighter
 * window when user's activity only spans a smaller range (e.g., <= 90 days).
 */
export function ContributionGraph({ attempts = [], defaultDays = 365, autoZoomThreshold = 90 }) {
  // Box sizing - use constants so sizing is applied everywhere
  const CELL = 16 // px (increased for visibility)
  const GAP = 4 // px
  const WEEK_WIDTH = CELL + GAP
  const DAY_LABEL_WIDTH = 44 // px - fixed width for the weekday labels column

  // Compute earliest valid attempt date
  const earliestDate = useMemo(() => {
    let min = null
    attempts.forEach((a) => {
      const d = new Date(a.createdAt)
      if (isNaN(d)) return
      if (!min || d < min) min = d
    })
    return min
  }, [attempts])

  // Determine initial numDays: if user's activity span <= autoZoomThreshold, zoom to span+padding
  const initialNumDays = useMemo(() => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    if (!earliestDate) return defaultDays
    const spanMs = today.getTime() - new Date(earliestDate).getTime()
    const spanDays = Math.ceil(spanMs / (1000 * 60 * 60 * 24)) + 1
    if (spanDays <= autoZoomThreshold) {
      // keep zoomed view but not too tiny — use 90 days minimum for readability
      const padded = Math.max(90, spanDays + 7)
      return Math.min(defaultDays, padded)
    }
    return defaultDays
  }, [earliestDate, defaultDays, autoZoomThreshold])

  const [numDays, setNumDays] = useState(initialNumDays)
  const [showAll, setShowAll] = useState(numDays === defaultDays)

  // If attempts change and we are not in explicit 'showAll' mode, update zoom
  useEffect(() => {
    if (!showAll) setNumDays(initialNumDays)
  }, [initialNumDays, showAll])

  const weeks = useMemo(() => {
    // End date: today (local midnight)
    const endDate = new Date()
    endDate.setHours(0, 0, 0, 0)
    const startDate = new Date(endDate)
    startDate.setDate(startDate.getDate() - (numDays - 1))

    const daysData = {}
    for (let i = 0; i < numDays; i++) {
      // console.log('Initializing day in contribution graph:', i)
      const date = new Date(startDate)
      // console.log('Date before increment:', date)
      date.setDate(date.getDate() + i)
      // console.log('Date after increment:', date)
      const key = date.toLocaleDateString('en-CA') // 'YYYY-MM-DD' format in local time
      // console.log('Day key:', key)
      daysData[key] = { date, count: 0 }
      // console.log('Initialized day in contribution graph:', key, date)
    }

    // Fill attempt counts into daysData
    if (attempts && attempts.length > 0) {
      // console.log('Filling attempts into contribution graph:', attempts)
      attempts.forEach((attempt) => {
        const date = new Date(attempt.createdAt)
        if (isNaN(date)) return
        const key = date.toISOString().split('T')[0]
        // console.log('Processing attempt on date:', key)
        if (daysData[key]) daysData[key].count++
      })
    }

    // Group into weeks (Sunday start)
    const weeksArray = []
    const sortedDays = Object.values(daysData).sort((a, b) => a.date - b.date)

    // Pad start to align with Sunday
    const firstDay = sortedDays[0]?.date?.getDay() || 0
    if (firstDay !== 0) {
      for (let i = firstDay - 1; i >= 0; i--) {
        const paddingDate = new Date(sortedDays[0].date)
        paddingDate.setDate(paddingDate.getDate() - (firstDay - i))
        sortedDays.unshift({ date: paddingDate, count: null })
      }
    }

    let currentWeek = []
    sortedDays.forEach((day) => {
      currentWeek.push(day)
      if (currentWeek.length === 7) {
        weeksArray.push(currentWeek)
        currentWeek = []
      }
    })

    if (currentWeek.length > 0) {
      while (currentWeek.length < 7) {
        const lastDate = currentWeek[currentWeek.length - 1].date
        const paddingDate = new Date(lastDate)
        paddingDate.setDate(paddingDate.getDate() + 1)
        currentWeek.push({ date: paddingDate, count: null })
      }
      weeksArray.push(currentWeek)
    }

    // console.log('Computed weeks for contribution graph:', daysData)

    return weeksArray
  }, [attempts, numDays])

  const getColorClass = (count) => {
    if (count === null) return 'bg-transparent border-transparent cursor-default'
    if (count === 0) return 'bg-surface-muted border-border-soft'
    if (count === 1) return 'bg-[#D33F49]/30 border-[#D33F49]/40'
    if (count === 2) return 'bg-[#D33F49]/60 border-[#D33F49]/70'
    return 'bg-[#D33F49] border-[#D33F49]' // 3+
  }

  // Generate month labels based on the computed weeks and startDate so labels align
  const monthLabels = useMemo(() => {
    // If there are no weeks yet, return empty
    if (!weeks || weeks.length === 0) return []

    const labels = []
    const seen = new Set()

    // For each week, pick the first real day and use its month if not seen
    weeks.forEach((week, weekIdx) => {
      const firstRealDay = week.find((d) => d && d.date && d.count !== null)
      const labelDate = firstRealDay ? firstRealDay.date : week[0].date
      if (!labelDate) return
      const monthKey = `${labelDate.getFullYear()}-${labelDate.getMonth()}`
      if (!seen.has(monthKey)) {
        seen.add(monthKey)
        labels.push({
          month: labelDate.toLocaleString('default', { month: 'short' }),
          weekIndex: weekIdx,
        })
      }
    })

    return labels
  }, [weeks])

  return (
    // allow horizontal scrolling but keep vertical overflow visible so tooltips don't get clipped
    <div className="space-y-3 w-full overflow-x-auto overflow-y-visible pb-4">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-text-primary">
          Activity (Oct 2025 - Sep 2026)
        </div>
        <div className="flex items-center gap-2 text-xs text-text-secondary">
          <span>Less</span>
          <div className="flex gap-1">
            <div className="w-3 h-3 rounded-sm bg-surface-muted border border-border-soft" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49]/30 border border-[#D33F49]/40" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49]/60 border border-[#D33F49]/70" />
            <div className="w-3 h-3 rounded-sm bg-[#D33F49] border border-[#D33F49]" />
          </div>
          <span>More</span>
        </div>
      </div>

      <div className="relative">
        <div className="flex">
          {/* Fixed-width weekday labels column */}
          <div
            style={{ width: DAY_LABEL_WIDTH }}
            className="flex flex-col gap-[3px] text-[10px] text-text-secondary font-medium justify-between py-1"
          >
            <div className="h-[11px] leading-[11px]">Sun</div>
            <div className="h-[11px] leading-[11px]">Mon</div>
            <div className="h-[11px] leading-[11px]">Tue</div>
            <div className="h-[11px] leading-[11px]">Wed</div>
            <div className="h-[11px] leading-[11px]">Thu</div>
            <div className="h-[11px] leading-[11px]">Fri</div>
            <div className="h-[11px] leading-[11px]">Sat</div>
          </div>

          {/* Centered grid wrapper sized to the number of weeks so month labels and boxes align */}
          <div
            className="relative"
            style={{
              minWidth: Math.max(1, weeks.length) * WEEK_WIDTH,
              margin: '0 auto',
              paddingTop: 20, // space for month labels
            }}
          >
            {/* Month labels placed absolutely inside this wrapper so left positions line up with columns */}
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-[11px] text-text-secondary font-medium absolute"
                style={{
                  left: `${label.weekIndex * WEEK_WIDTH}px`,
                  top: 0,
                }}
              >
                {label.month}
              </div>
            ))}

            {/* The grid itself */}
            <div className="flex gap-[3px]" style={{ alignItems: 'flex-start' }}>
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col" style={{ gap: `${GAP}px` }}>
                  {week.map((day, dayIdx) => {
                    if (day.count === null) {
                      return (
                        <div
                          key={dayIdx}
                          style={{ width: CELL, height: CELL }}
                          className="rounded-sm"
                        />
                      )
                    }

                    const dateStr = day.date.toLocaleDateString('default', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })

                    return (
                      <Tooltip
                        key={dayIdx}
                        content={`${day.count} ${
                          day.count === 1 ? 'attempt' : 'attempts'
                        } on ${dateStr}`}
                      >
                        <div
                          className={`rounded-sm border transition-all cursor-pointer hover:ring-2 hover:ring-[#D33F49]/30 ${getColorClass(
                            day.count
                          )}`}
                          style={{ width: CELL, height: CELL }}
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
        <div className="bg-white rounded-xl border border-border-soft p-6 shadow-sm">
          <h1 className="text-xl font-bold text-text-primary mb-4">Yearly Performance Activity</h1>
          <ContributionGraph attempts={sampleAttempts} />
        </div>
      </div>
    </div>
  )
}
