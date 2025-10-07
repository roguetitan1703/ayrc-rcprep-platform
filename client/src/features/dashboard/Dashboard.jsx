import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatsRow } from './StatsRow'
import { AnalyticsPanel } from './AnalyticsPanel'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { useAuth } from '../../components/auth/AuthContext'
import SubFeedbackBlocker from '../../components/ui/SubFeedbackWall'
export default function Dashboard() {
  const nav = useNavigate()
  const { user } = useAuth()
  const [today, setToday] = useState([])
  const [feedbackRequired, setFeedbackRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const toast = useToast()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me/dashboard')
        setToday(data.today || [])
        setStats(data.stats)
        setAnalytics(data.analytics)

        const hasSub = user?.subscription && user.subscription !== 'none'
        const feedbackPending = !data.feedback?.submitted && (data.today || []).length > 0 && (data.today || []).every(r => r.status === 'attempted')

        setFeedbackRequired(!hasSub && feedbackPending)
      } catch (e) {
        const msg = extractErrorMessage(e)
        setError(msg)
        toast.show(msg, { variant: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [user])

  if (loading) return (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-text-secondary text-sm mb-1">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</p>
        <h1 className="h2">Today's Practice</h1>
      </div>
      <StatsRow stats={stats} analytics={analytics} loading={true} />
      <AnalyticsPanel analytics={analytics} loading={true} />
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-3">
        <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader></Card>
      </div>
    </div>
  )

  if (error) return (
    <div className="flex items-center justify-center p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">{error}</div>
  )

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-text-secondary text-sm mb-1">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</p>
        <h1 className="h2">Today's Practice</h1>
      </div>

      <StatsRow stats={stats} analytics={analytics} loading={false} />

      <SubFeedbackBlocker user={user} feedbackStatus={{ submitted: feedbackRequired }} />

      <div className="grid gap-3">
        {today.length === 0 && (
          <div className="text-text-secondary">Today's RCs are being prepared. Please check back shortly!</div>
        )}

        {today.map(rc => {
          const blocked = feedbackRequired && (!user?.subscription || user.subscription === 'none')

          return (
            <Card key={rc.id} className={blocked ? 'opacity-60 pointer-events-none' : ''}>
              <CardHeader className="flex items-center justify-between">
                <div>
                  <div className="font-medium">{rc.title}</div>
                  <div className="text-xs text-text-secondary flex gap-2 flex-wrap">
                    <span>{new Date(rc.scheduledDate).toDateString()}</span>
                    {rc.topicTags?.slice(0, 3).map(t => (
                      <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] uppercase tracking-wide">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {rc.status === 'attempted' && <Badge color="success">Attempted {rc.score}/4</Badge>}
                  {!blocked ? (
                    rc.status === 'attempted' ? (
                      <>
                        <Button variant="outline" onClick={() => nav(`/results/${rc.id}`)}>View Results</Button>
                        <Button onClick={() => nav(`/test/${rc.id}?mode=practice`)}>Practice</Button>
                      </>
                    ) : (
                      <Button onClick={() => nav(`/test/${rc.id}`)}>Start Test</Button>
                    )
                  ) : (
                    <div className="text-sm text-text-secondary italic">Unlock by submitting feedback or subscribing</div>
                  )}
                </div>
              </CardHeader>
            </Card>
          )
        })}
      </div>
      <AnalyticsPanel analytics={analytics} loading={false} />
    </div>
  )
}
