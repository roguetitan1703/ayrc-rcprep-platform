import { useEffect, useMemo, useState } from 'react'
import { useLocation, useNavigate, useParams, Link } from 'react-router-dom'
import { Badge } from '../../components/ui/Badge'
import { Button } from '../../components/ui/Button'
import { api } from '../../lib/api'
import { QUESTION_COUNT } from '../../lib/constants'

export default function Results(){
  const { id } = useParams()
  const { search } = useLocation()
  const params = new URLSearchParams(search)
  const [score, setScore] = useState(params.get('score')? Number(params.get('score')) : null)
  const [time, setTime] = useState(params.get('time')? Number(params.get('time')) : null)
  const accuracy = Math.round((score/QUESTION_COUNT)*100)
  const [streak, setStreak] = useState(null)
  const [topics, setTopics] = useState([])
  const [loading, setLoading] = useState(false)
  const [showFeedbackCta, setShowFeedbackCta] = useState(false)

  useEffect(()=>{
    (async()=>{
      try{
        setLoading(true)
        setLoading(true)
        const a = await api.get(`/attempts/analysis/${id}`)
        setTopics(a.data?.rc?.topicTags || a.data?.topics || [])
        if(score===null) setScore(a.data?.score ?? 0)
        if(time===null) setTime(a.data?.timeTaken ?? 0)
        setStreak(a.data?.streak ?? null)
      }catch{}
      finally{ setLoading(false) }
      try{
        // Determine if feedback needed: call lock status (if locking because missing feedback & both attempts done elsewhere)
        const lock = await api.get('/feedback/lock-status')
        if(lock.data?.lock === true && lock.data?.reason === 'feedback_missing') setShowFeedbackCta(true)
      }catch{}
    })()
  },[id])

  const color = score===QUESTION_COUNT ? 'success' : score===QUESTION_COUNT-1 ? 'warning' : 'default'
  const feedback = score===QUESTION_COUNT ? 'Excellent work! Perfect score!' : score<=1 ? 'A great learning opportunity. Let’s improve.' : 'Nice job—review the analysis to solidify.'

  if(loading || score===null || time===null){
    return <div className="max-w-lg mx-auto bg-card-surface rounded p-6 text-center">Loading results…</div>
  }

  return (
    <div className="max-w-xl mx-auto bg-card-surface rounded p-6 text-center space-y-4">
  <h1 className="h3">Result</h1>
  <div className="text-4xl font-bold" role="status" aria-label={`Score ${score} out of ${QUESTION_COUNT}`}><span className={color==='success'?'text-success-green': color==='warning'?'text-accent-amber':''}>{score}/{QUESTION_COUNT}</span></div>
  <div className="text-sm text-text-secondary" role="group" aria-label="Performance metrics">Accuracy: {accuracy}% · Time: {Math.floor(time/60)}m {time%60}s</div>
  {streak!==null && <div className="text-sm text-text-secondary">Streak: {streak} days</div>}
  {topics.length>0 && (
    <div className="flex flex-wrap gap-1 justify-center" role="list" aria-label="Topic tags">
      {topics.map(t=> <span key={t} role="listitem" className="px-2 py-0.5 rounded bg-white/5 text-[10px] uppercase tracking-wide text-text-secondary">{t}</span>)}
    </div>
  )}
      <div className="text-text-secondary">{feedback}</div>
      <div className="pt-2">
        <Button size="lg" as="a" href={`/analysis/${id}`} className="w-full">View Detailed Analysis</Button>
      </div>
      <div className="flex items-center justify-center gap-3">
        <Button variant="outline" as="a" href={`/test/${id}?mode=practice`}>Practice Again</Button>
        <Link to="/dashboard" className="text-sm text-text-secondary underline">Back to Dashboard</Link>
      </div>
      {showFeedbackCta && (
        <div className="pt-2">
          <Button as="a" href="/feedback" className="w-full" variant="primary">Submit Daily Feedback</Button>
        </div>
      )}
      <div>
        <a
          className="text-xs text-text-secondary underline"
          href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(`I scored ${score}/${QUESTION_COUNT} on today’s ARC RC! #ARC`)}`}
          target="_blank" rel="noreferrer"
        >Share your score</a>
      </div>
    </div>
  )
}
