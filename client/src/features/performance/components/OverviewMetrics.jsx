import { Card, CardContent } from '../../../components/ui/Card'
import { TrendingUp, Target, Activity, Award } from 'lucide-react'

export function OverviewMetrics({ metrics }) {
  const tiles = [
    {
      label: 'Daily Streak',
      value: `${metrics.dailyStreak} days`,
      icon: TrendingUp,
      color: 'text-[#23A094]',
      bgColor: 'bg-[#23A094]/10'
    },
    {
      label: 'Personal Best',
      value: `${metrics.personalBest}/4`,
      icon: Award,
      color: 'text-[#D33F49]',
      bgColor: 'bg-[#D33F49]/10'
    },
    {
      label: 'Total Attempts',
      value: metrics.totalAttempts,
      icon: Activity,
      color: 'text-[#3B82F6]',
      bgColor: 'bg-[#3B82F6]/10'
    },
    {
      label: 'Average Score',
      value: `${metrics.avgScore.toFixed(1)}/4`,
      icon: Target,
      color: 'text-[#F6B26B]',
      bgColor: 'bg-[#F6B26B]/10'
    }
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {tiles.map(({ label, value, icon: Icon, color, bgColor }) => (
        <Card key={label} className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-[#D8DEE9] hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wider font-semibold text-[#5C6784]">
                {label}
              </div>
              <div className={`${bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-[#273043]">{value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
