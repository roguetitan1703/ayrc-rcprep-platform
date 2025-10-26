import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import rcApi from '../../lib/rcs'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../components/auth/AuthContext'
import { useFeedbackStatus } from '../../hooks/useFeedbackStatus'
import SubFeedbackBlocker from '../../components/ui/SubFeedbackWall'
export default function TestToday() {
  const nav = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const { status, loading: fbLoading } = useFeedbackStatus()

  const [rcs, setRcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const feedbackRequired = !fbLoading && !status?.submitted && rcs.length > 0 && rcs.every(r => r.status !== 'attempted')
  const hasSub = user?.subscription && user.subscription !== 'none'
  const blocked = !hasSub && feedbackRequired

  useEffect(() => {
    (async () => {
      try {
        setLoading(true)
        const data = await rcApi.getTodayRcs()
        setRcs(data)
      } catch (e) {
        const msg = e?.response?.data?.error || e.message
        setError(msg)
        toast.show(msg, { variant: 'error' })
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  if (loading || fbLoading) return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Today's RC</h2>
      <Skeleton className="h-6 w-1/2" />
      <Skeleton className="h-6 w-2/5" />
      <Skeleton className="h-32 w-full" />
    </div>
  )

  if (error) return (
    <div className="p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">
      {error}
    </div>
  )

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-semibold">Today's RC</h2>

      {/* Subscription / Feedback Wall */}
      <SubFeedbackBlocker user={user} feedbackStatus={status} />

      {rcs.length === 0 && !blocked && (
        <div className="text-text-secondary">
          No RCs scheduled for today. Please check back later.
        </div>
      )}

      <div className="grid gap-3">
        {rcs.map(rc => (
          <Card key={rc._id || rc.id}>
            <CardHeader className="flex items-center justify-between">
              <div>
                <div className="font-medium">{rc.title}</div>
                <div className="text-xs text-text-secondary flex gap-2 flex-wrap">
                  <span>{new Date(rc.scheduledDate).toDateString()}</span>
                  {rc.topicTags?.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="px-1.5 py-0.5 rounded bg-white/5 text-[10px] uppercase tracking-wide"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {rc.status === 'attempted' && (
                  <Badge color="success">Attempted {rc.score}/4</Badge>
                )}
                {!blocked ? (
                  rc.status === 'attempted' ? (
                    <>
                      <Button variant="outline" onClick={() => nav(`/attempts/${rc.id}/analysis`)}>View Analysis</Button>
                      <Button onClick={() => nav(`/test/${rc.id}?mode=practice`)}>Practice</Button>
                    </>
                  ) : (
                    <Button onClick={() => nav(`/test/${rc.id}`)}>Start Test</Button>
                  )
                ) : null}
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
