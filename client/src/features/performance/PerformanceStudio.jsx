import { useState, useEffect } from 'react'
import { api } from '../../lib/api'
import { Skeleton } from '../../components/ui/Skeleton'
import { RangeSelector } from './components/RangeSelector'
import { OverviewMetrics } from './components/OverviewMetrics'
import { RadarChart } from './components/RadarChart'
import { QuestionTypeTable } from './components/QuestionTypeTable'
import { ProgressTimeline } from './components/ProgressTimeline'
import { RecentAttempts } from './components/RecentAttempts'
import { AlertCircle } from 'lucide-react'

export default function PerformanceStudio() {
  const [range, setRange] = useState(30)
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchPerformance()
  }, [range])

  async function fetchPerformance() {
    try {
      setLoading(true)
      setError(null)
      const endDate = new Date().toISOString().split('T')[0]
      const startDate = new Date(Date.now() - range * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0]
      
      const response = await api.get(`/all/performance?startDate=${startDate}&endDate=${endDate}`)
      setData(response.data)
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    } finally {
      setLoading(false)
    }
  }

  if (error) {
    return (
      <div className="p-6 bg-[#E4572E]/10 border-2 border-[#E4572E]/40 text-[#E4572E] rounded-xl flex items-start gap-3">
        <AlertCircle size={20} className="mt-0.5 flex-shrink-0" />
        <div>
          <div className="font-semibold mb-1">Error loading performance data</div>
          <div className="text-sm opacity-90">{error}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#273043] mb-1">Performance Studio</h1>
          <p className="text-sm text-[#5C6784]">
            Deep insights into your reading comprehension skills
          </p>
        </div>
        <RangeSelector value={range} onChange={setRange} />
      </div>

      {/* Loading State */}
      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map(i => (
              <Skeleton key={i} className="h-32 w-full rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-96 w-full rounded-xl" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      )}

      {/* Content */}
      {!loading && data && (
        <>
          <OverviewMetrics metrics={data.overview} />
          
          <div className="grid lg:grid-cols-2 gap-6">
            <RadarChart data={data.radarData} />
            <QuestionTypeTable data={data.questionRollups.byType} />
          </div>

          <ProgressTimeline data={data.progressTimeline} />
          
          <RecentAttempts 
            attempts={data.progressTimeline.slice(-10).reverse()} 
            personalBest={data.overview.personalBest}
          />
        </>
      )}
    </div>
  )
}
