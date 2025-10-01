import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'

export default function AdminDashboard(){
  const [rcs, setRcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(()=>{
    (async()=>{
      try{
        const { data } = await api.get('/admin/rcs')
        setRcs(data)
      }catch(e){ setError(e?.response?.data?.error || e.message) }
      finally{ setLoading(false) }
    })()
  },[])

  const filtered = useMemo(()=>{
    return rcs.filter(r=> (statusFilter==='all' || r.status===statusFilter) && (!search || r.title.toLowerCase().includes(search.toLowerCase())))
  },[rcs, statusFilter, search])

  if(loading) return (
    <div className="min-h-screen flex flex-col py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin: RCs</h1>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>
      <div className="grid gap-3">
        <Card><CardHeader><Skeleton className="h-6 w-1/3" /></CardHeader></Card>
        <Card><CardHeader><Skeleton className="h-6 w-2/5" /></CardHeader></Card>
      </div>
    </div>
  )
  if(error) return <div className="min-h-screen flex flex-col p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">{error}</div>

  return (
    <div className="min-h-screen flex flex-col py-6 space-y-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl font-semibold">Admin: RCs</h1>
        <div className="flex flex-wrap items-center gap-2">
          <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-background border border-white/10 rounded px-2 py-1 text-sm">
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="archived">Archived</option>
          </select>
          <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search title..." className="bg-background border border-white/10 rounded px-2 py-1 text-sm" />
          <Button variant="outline" onClick={()=>nav('/admin/schedule')}>Schedule</Button>
          <Button onClick={()=>nav('/admin/rcs/new')}>Upload New RC</Button>
        </div>
      </div>
      <div className="grid gap-3">
  {filtered.map(rc=> (
          <Card key={rc._id}>
            <CardHeader className="flex items-center justify-between">
              <div>
                <div className="font-medium">{rc.title}</div>
                <div className="text-xs text-text-secondary">{new Date(rc.scheduledDate).toDateString()}</div>
              </div>
              <div className="flex items-center gap-2">
                <Badge color={rc.status==='live'?'success': rc.status==='scheduled'?'warning':'default'}>{rc.status}</Badge>
                <Button as="a" variant="outline" href={`/test/${rc._id}?preview=1`}>Preview</Button>
                <Button variant="outline" onClick={()=>nav(`/admin/rcs/${rc._id}`)}>Edit</Button>
              </div>
            </CardHeader>
          </Card>
        ))}
      </div>
    </div>
  )
}
