import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { TrendingUp, Activity } from 'lucide-react'
import { Link } from 'react-router-dom'
import { ContributionGraph } from './components/ContributionGraph'
import { TopicRingChart } from './components/TopicRingChart'

export function AnalyticsPanel({ analytics, loading, attempts }) {
  if (loading) {
    return (
      <Card className="bg-white border border-[#D8DEE9]">
        <CardHeader className="p-6 border-b border-[#D8DEE9]">
          <h3 className="text-lg font-semibold">Analytics Snapshot</h3>
        </CardHeader>
        <CardContent className="p-6 space-y-4">
          <Skeleton className="h-4 w-32 mb-2" />
          <Skeleton className="h-20 w-full" />
        </CardContent>
      </Card>
    )
  }

  if (!analytics) return null

  const data = analytics

  return (
    <Card className="bg-white border border-[#D8DEE9] hover:shadow-lg transition-shadow duration-200">
      <CardHeader className="p-6 border-b border-[#D8DEE9]">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-[#273043]">Analytics Snapshot</h3>
          <div className="bg-[#3B82F6]/10 p-2 rounded-lg">
            <TrendingUp className="h-5 w-5 text-[#3B82F6]" />
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-6 space-y-8">
        {/* Topic Accuracy Ring Chart */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="text-sm font-semibold text-[#273043]">
              Topic Distribution (last 30 days)
            </div>
            <div className="text-xs text-[#5C6784] font-medium">
              {data.topics.length} topics attempted
            </div>
          </div>
          <TopicRingChart topics={data.topics} />
        </div>

        {/* Contribution Graph */}
        <div className="pt-6 border-t border-[#D8DEE9]">
          <ContributionGraph attempts={attempts || []} />
        </div>

        {/* Quick Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[#D8DEE9]">
          <Link
            to="/performance"
            className="text-sm font-semibold text-[#3B82F6] hover:text-[#D33F49] transition-colors flex items-center gap-1"
          >
            View detailed analytics →
          </Link>
        </div>
      </CardContent>
    </Card>
  )
}
