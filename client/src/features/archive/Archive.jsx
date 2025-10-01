import { useEffect, useState } from 'react'
import { api } from '../../lib/api'
import { Card, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Skeleton } from '../../components/ui/Skeleton'

export default function Archive(){
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)

  useEffect(()=>{
    (async()=>{
      try{
        setLoading(true)
  const { data } = await api.get(`/rcs/archive?page=${page}&limit=10`)
  setItems(data)
  setHasMore(data.length===10)
      }catch(e){ setError(e?.response?.data?.error || e.message) }
      finally{ setLoading(false) }
    })()
  },[page])

  if(loading) return (
    <div className="min-h-screen flex flex-col space-y-4">
  <h1 className="h3">Archive</h1>
      <Card><CardHeader><Skeleton className="h-6 w-1/2" /></CardHeader></Card>
      <Card><CardHeader><Skeleton className="h-6 w-2/5" /></CardHeader></Card>
    </div>
  )
  if(error) return <div className="min-h-screen flex flex-col p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">{error}</div>

  return (
    <div className="min-h-screen flex flex-col space-y-4">
  <h1 className="h3">Archive</h1>
      <div className="grid gap-3">
        {items.length===0 && <div className="text-text-secondary">Your practice history will appear here once you complete your first RC.</div>}
        {items.map(rc=> (
          <Card key={rc._id || rc.id}>
            <CardHeader className="flex items-center justify-between">
              <div>
                <div className="font-medium">{rc.title}</div>
                <div className="text-xs text-text-secondary">{rc.topicTags?.join(', ') || '-'}</div>
              </div>
              <div className="flex items-center gap-2">
                {rc.attempted && <Button as="a" href={`/results/${rc._id || rc.id}`} variant="outline">View Results</Button>}
                <Button as="a" href={`/test/${rc._id || rc.id}?mode=practice`} variant="outline">Practice</Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
      <div className="flex items-center gap-2">
        <Button variant="outline" disabled={page<=1} onClick={()=> setPage(p=> p-1)}>Prev</Button>
        <span className="text-sm text-text-secondary">Page {page}</span>
  <Button variant="outline" disabled={!hasMore} onClick={()=> setPage(p=> p+1)}>Next</Button>
      </div>
    </div>
  )
}
