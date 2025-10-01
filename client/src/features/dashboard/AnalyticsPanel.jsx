import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'

export function AnalyticsPanel({ initial }) {
  const [data, setData] = useState(initial || null)
  const [loading, setLoading] = useState(!initial)
  const toast = useToast()
  useEffect(() => {
    if (initial) return
    ;(async () => {
      try {
        const { data } = await api.get('/users/me/analytics')
        setData(data)
      } catch (e) {
        toast.show(extractErrorMessage(e), 'error')
      } finally {
        setLoading(false)
      }
    })()
  }, [initial])

  if (loading)
    return (
      <Card>
        <CardHeader>
          <div className="h4">Analytics</div>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-4 w-1/3 mb-2" />
          <Skeleton className="h-4 w-2/5 mb-2" />
          <Skeleton className="h-4 w-1/4" />
        </CardContent>
      </Card>
    )
  if (!data) return null
  return (
    <Card>
      <CardHeader>
        <div className="h4">Analytics</div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="min-h-screen flex flex-col">
          <div className="text-xs text-text-secondary mb-1">Topic Accuracy (last 30 days)</div>
          <div className="flex flex-wrap gap-2">
            {data.topics.length === 0 && (
              <div className="text-xs text-text-secondary">No attempts yet.</div>
            )}
            {data.topics.map((t) => (
              <div
                key={t.tag}
                className="px-2 py-1 rounded bg-white/5 text-xs flex items-center gap-2"
              >
                <span className="font-medium uppercase tracking-wide text-[10px]">{t.tag}</span>
                <span className="text-text-secondary">{t.accuracy}%</span>
              </div>
            ))}
          </div>
        </div>
        <div>
          <div className="text-xs text-text-secondary mb-1">Attempt Trend (7 days)</div>
          <div className="flex items-end gap-1 h-20">
            {data.trend.map((d) => {
              const h = d.attempts === 0 ? 4 : d.attempts >= 2 ? 32 : 20
              return (
                <div
                  key={d.date}
                  title={`${d.date}: ${d.attempts} attempts`}
                  className="flex flex-col items-center justify-end"
                >
                  <div style={{ height: h }} className="w-4 rounded bg-accent-amber/60"></div>
                  <div className="text-[9px] mt-1 text-text-secondary">{d.date.slice(5, 10)}</div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
