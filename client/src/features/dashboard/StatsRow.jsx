import { Card, CardContent } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { Activity, Target, Tag } from 'lucide-react'

export function StatsRow({ stats, analytics, loading }) {
  if (loading) {
    return (
      <div className="grid sm:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => (
          <Card key={i} className="bg-white border border-border-soft">
            <CardContent className="p-6">
              <Skeleton className="h-4 w-20 mb-2" />
              <Skeleton className="h-8 w-16" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats && !analytics) return null

  const tiles = [
    {
      label: 'Attempts (7 days)',
      value: stats?.attempts7d ?? analytics?.attempts7d ?? '0',
      icon: Activity,
      color: 'text-[#3B82F6]',
      bgColor: 'bg-[#3B82F6]/10'
    },
    {
      label: 'Accuracy (7 days)',
      value: stats?.accuracy ? `${stats.accuracy}%` : '0%',
      icon: Target,
      color: 'text-[#23A094]',
      bgColor: 'bg-[#23A094]/10'
    },
    {
      label: 'Reason Coverage',
      value: `${stats?.coverage ?? analytics?.coverage ?? '0'}%`,
      subtext: '70% target',
      icon: Tag,
      color: 'text-[#D33F49]',
      bgColor: 'bg-[#D33F49]/10'
    }
  ]

  return (
    <div className="grid sm:grid-cols-3 gap-4" aria-label="Key performance metrics">
      {tiles.map(({ label, value, subtext, icon: Icon, color, bgColor }) => (
        <Card key={label} className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-border-soft hover:shadow-lg transition-shadow duration-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs uppercase tracking-wider font-semibold text-text-secondary">
                {label}
              </div>
              <div className={`${bgColor} p-2 rounded-lg`}>
                <Icon className={`h-4 w-4 ${color}`} />
              </div>
            </div>
            <div className="text-3xl font-bold text-text-primary">{value}</div>
            {subtext && (
              <div className="text-xs text-text-secondary mt-2">{subtext}</div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
