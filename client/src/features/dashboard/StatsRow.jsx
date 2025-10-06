import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardContent } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'

export function StatsRow({ initial, analytics }) {
  const [stats, setStats] = useState(initial || null)
  const [loading, setLoading] = useState(!initial)
  const [error, setError] = useState('')

  useEffect(() => {
    if (initial) return
    (async () => {
      try { const { data } = await api.get('/users/me/stats'); setStats(data) }
      catch (e) { setError(e?.response?.data?.error || e.message) }
      finally { setLoading(false) }
    })()
  }, [initial])

  if (loading) return (
    <div className="grid sm:grid-cols-3 gap-3">
      <Card><CardContent><Skeleton className="h-6 w-1/3 mb-2" /><Skeleton className="h-4 w-2/5" /></CardContent></Card>
      <Card className="hidden sm:block"><CardContent><Skeleton className="h-6 w-1/3 mb-2" /><Skeleton className="h-4 w-2/5" /></CardContent></Card>
      <Card className="hidden sm:block"><CardContent><Skeleton className="h-6 w-1/3 mb-2" /><Skeleton className="h-4 w-2/5" /></CardContent></Card>
    </div>
  )
  if (error) return <div className="text-error-red text-sm">{error}</div>
  if (!stats && !analytics) return null
  const attempts7d = stats?.attempts7d ?? analytics?.attempts7d ?? '-'
  const coverage = stats?.coverage ?? analytics?.coverage ?? '-'
  return (
    <div className="grid sm:grid-cols-3 gap-3" aria-label="Key performance metrics">
      <Metric title="Total Attempts" value={stats?.totalAttempts ?? '-'} />
      <Metric title="Accuracy" value={stats?.accuracy ? stats.accuracy + '%' : '-'} />
      <Metric title="Attempts (7d) / Coverage" value={`${attempts7d} / ${coverage}%`} />
    </div>
  )
}

function Metric({ title, value }) {
  return (
    <Card>
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wide text-text-secondary mb-1">{title}</div>
        <div className="text-lg font-semibold">{value}</div>
      </CardContent>
    </Card>
  )
}
