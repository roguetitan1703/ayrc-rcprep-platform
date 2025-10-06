import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton} from '../../components/ui/Skeleton'
import { StatsRow } from './StatsRow'
import { AnalyticsPanel } from './AnalyticsPanel'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { useAuth } from '../../components/auth/AuthContext'

export default function Dashboard(){
  const nav = useNavigate()
  const { user } = useAuth()
  const [today, setToday] = useState([])
  const [feedbackRequired, setFeedbackRequired] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const toast = useToast()

  useEffect(()=>{
    (async()=>{
      try {
        const { data } = await api.get('/users/me/dashboard')
        setToday(data.today||[])
        setStatsBundle(data.stats)
        setAnalyticsBundle(data.analytics)
        setFeedbackRequired(!data.feedback?.submitted && (data.today||[]).length>0 && (data.today||[]).every(r=> r.status==='attempted'))
      } catch(e){ const msg = extractErrorMessage(e); setError(msg); toast.show(msg,{ variant:'error'}) }
      finally{ setLoading(false) }
    })()
  },[])

  const [statsBundle, setStatsBundle] = useState(null)
  const [analyticsBundle, setAnalyticsBundle] = useState(null)

  if(loading) return (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-text-secondary text-sm mb-1">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</p>
        <h1 className="h2">Today's Practice</h1>
      </div>
      <StatsRow initial={statsBundle} />
      <AnalyticsPanel initial={analyticsBundle} />
      <Skeleton className="h-12 w-full" />
      <div className="grid gap-3">
        <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader></Card>
        <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader></Card>
      </div>
    </div>
  )
  if(error) return <div className="flex items-center justify-center p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">{error}</div>

  return (
    <div className="flex flex-col space-y-6">
      <div>
        <p className="text-text-secondary text-sm mb-1">Welcome back, {user?.name?.split(' ')[0] || 'there'}!</p>
        <h1 className="h2">Today's Practice</h1>
      </div>
      <StatsRow />
      {feedbackRequired && (
        <div className="bg-accent-amber/10 border border-accent-amber/40 text-accent-amber rounded p-3 flex items-center justify-between">
          <div className="text-sm">Thanks for practicing! Please submit today’s quick feedback to unlock tomorrow.</div>
          <Button onClick={()=> nav('/feedback')} variant="outline">Give Feedback</Button>
        </div>
      )}
      <div className="grid gap-3">
        {today.length===0 && (
          <div className="text-text-secondary">Today's RCs are being prepared. Please check back shortly!</div>
        )}
        {today.map(rc=> (
          <Card key={rc.id}>
            <CardHeader className="flex items-center justify-between">
              <div>
                <div className="font-medium">{rc.title}</div>
                <div className="text-xs text-text-secondary flex gap-2 flex-wrap">
                  <span>{new Date(rc.scheduledDate).toDateString()}</span>
                  {rc.topicTags?.slice(0,3).map(t=> <span key={t} className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] uppercase tracking-wide">{t}</span>)}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rc.status==='attempted' && <Badge color="success">Attempted {rc.score}/4</Badge>}
                {rc.status==='attempted' ? (
                  <>
                    <Button variant="outline" onClick={()=> nav(`/results/${rc.id}`)}>View Results</Button>
                    <Button onClick={()=> nav(`/test/${rc.id}?mode=practice`)}>Practice</Button>
                  </>
                ) : (
                  <Button disabled={feedbackRequired} onClick={()=> nav(`/test/${rc.id}`)}>Start Test</Button>
                )}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
