import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { StatsRow } from './StatsRow'
import { AnalyticsPanel } from './AnalyticsPanel'
import { DashboardGreeting } from './DashboardGreeting'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { useAuth } from '../../components/auth/AuthContext'
import SubFeedbackBlocker from '../../components/ui/SubFeedbackWall'
import { hasEffectiveSubscription } from '../../lib/subscription'
export default function Dashboard() {
  const { user } = useAuth()
  const [today, setToday] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    if (user?.role === 'admin') {
      navigate('/admin', { replace: true })
    }
  }, [user, navigate])
  const [feedbackRequired, setFeedbackRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [analytics, setAnalytics] = useState(null)
  const [attempts, setAttempts] = useState([])
  const toast = useToast()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me/dashboard')
        setToday(data.today || [])
        setStats(data.stats)
        setAnalytics(data.analytics)
        
        // Fetch attempts for contribution graph
        try {
          // The backend exposes user attempts at GET /attempts with auth; not /attempts/me
          const { data: attemptsData } = await api.get('/attempts?limit=100')
          // Ensure each attempt has a createdAt timestamp (server returns attemptedAt)
          const normalized = (attemptsData.attempts || []).map((a) => ({
            ...a,
            createdAt: a.createdAt || a.attemptedAt || a.attemptedAt || null,
          }))
          setAttempts(normalized)
        } catch (err) {
          console.warn('Could not load attempts for activity graph:', err)
          // Fallback: use analytics.trend (if available) to synthesize attempts for ContributionGraph
          try {
            const trend = data.analytics?.trend || []
            const synthetic = []
            trend.forEach(t => {
              const count = Number(t.attempts || 0)
              for (let i = 0; i < count; i++) {
                synthetic.push({ createdAt: new Date(t.date).toISOString() })
              }
            })
            if (synthetic.length > 0) setAttempts(synthetic)
          } catch (e) {
            console.warn('Could not synthesize attempts from analytics.trend', e)
          }
        }

        const hasSub = hasEffectiveSubscription(user)
        const feedbackPending = !data.feedback?.submitted

        console.log({
        hasSub, 
        feedbackPending,
        feedbackRequired: !hasSub && feedbackPending,
        feedbackData: data.feedback
      })

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
      <DashboardGreeting streak={user?.dailyStreak || 0} />
      <StatsRow stats={stats} analytics={analytics} loading={true} />
      <AnalyticsPanel analytics={analytics} attempts={attempts} loading={true} />
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-4">
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
      <DashboardGreeting streak={user?.dailyStreak || 0} />

      <StatsRow stats={stats} analytics={analytics} loading={false} />
      
      <AnalyticsPanel analytics={analytics} attempts={attempts} loading={false} />

      <SubFeedbackBlocker user={user} feedbackStatus={{ submitted: !feedbackRequired}} />

      <div className="grid gap-4">
        {today.length === 0 && (
          <div className="text-text-secondary">Today's RCs are being prepared. Please check back shortly!</div>
        )}

        {today.map(rc => {
          const hasSubLocal = hasEffectiveSubscription(user)
          const blocked = feedbackRequired && !hasSubLocal

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
                        <Button variant="outline" onClick={() => navigate(`/attempts/${rc.id}`)}>View attempt details</Button>
                        <Button onClick={() => navigate(`/test/${rc.id}?mode=practice`)}>Practice</Button>
                      </>
                    ) : (
                      <Button onClick={() => navigate(`/test/${rc.id}`)}>Start Test</Button>
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
    </div>
  )
}
