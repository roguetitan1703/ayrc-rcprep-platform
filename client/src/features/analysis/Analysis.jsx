import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Badge } from '../../components/ui/Badge'
import { useToast } from '../../components/ui/Toast'
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton'
import { extractErrorMessage } from '../../lib/utils'

export default function Analysis() {
  const { id } = useParams()
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [reasons, setReasons] = useState({})
  const [saved, setSaved] = useState('')
  const toast = useToast()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get(`/attempts/analysis/${id}`)
        setData(data)
      } catch (e) {
        setError(extractErrorMessage(e))
      } finally {
        setLoading(false)
      }
    })()
  }, [id])

  async function saveFeedback() {
    try {
      const items = Object.entries(reasons)
        .filter(([k, v]) => (v || '').trim().length > 0)
        .map(([k, v]) => ({ questionIndex: Number(k), reason: v }))
      if (items.length === 0) {
        setSaved('')
        return
      }
      await api.patch(`/attempts/${data.attemptId}/analysis-feedback`, { feedback: items })
      setSaved('Thanks! Your feedback helps improve explanations.')
      setTimeout(() => setSaved(''), 2000)
      toast.show('Feedback saved', { variant: 'success' })
    } catch (e) {
      const msg = extractErrorMessage(e)
      setError(msg)
      toast.show(msg, { variant: 'error' })
    }
  }

  if (loading) return (
    <div className="space-y-6">
      <h1 className="h3">Analysis</h1>
      <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader><CardContent><SkeletonText lines={4} /></CardContent></Card>
      <Card><CardHeader><Skeleton className="h-6 w-1/4" /></CardHeader><CardContent><SkeletonText lines={5} /></CardContent></Card>
    </div>
  )

  if (error) return (
    <div className="p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">{error}</div>
  )

  return (
    <div className="space-y-6">

      {/* Title */}
      <h1 className="h3">{data.rc.title}</h1>
      {saved && <div className="text-success-green text-sm">{saved}</div>}

      {/* Questions */}
      {data.questions.map((q, i) => (
        <Card key={i} className="shadow-card hover:shadow-card-hover transition-shadow">
          <CardHeader className="flex items-center justify-between">
            <div className="font-medium text-sm sm:text-base">Question {i + 1}</div>
            <Badge color={q.isCorrect ? 'success' : 'error'}>
              {q.isCorrect ? 'Correct' : 'Incorrect'}
            </Badge>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">{q.questionText}</div>
            <div className="text-sm text-text-secondary">
              Your answer: <span className="font-medium">{q.userAnswer || '-'}</span> · Correct: <span className="font-medium">{q.correctAnswerId}</span>
            </div>
            <div className="text-sm">{q.explanation}</div>

            {/* Feedback input */}
            <div className="mt-2">
              <label className="block text-xs text-text-secondary mb-1">What confused you? (optional)</label>
              <textarea
                value={reasons[i] || ''}
                onChange={e => setReasons(r => ({ ...r, [i]: e.target.value }))}
                rows={2}
                className="w-full bg-background border border-white/10 rounded p-2 text-sm placeholder:text-text-secondary"
                placeholder="e.g., Option C felt similar to B"
              />
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Save button */}
      <div className="flex justify-end">
        <button
          onClick={saveFeedback}
          className="px-5 py-2 rounded-lg bg-accent-amber text-black font-medium hover:bg-accent-amber/90 transition"
        >
          Save Feedback
        </button>
      </div>
    </div>
  )
}
