import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Search } from 'lucide-react'

export default function AdminDashboard() {
  const [rcs, setRcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const nav = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/rcs')
        setRcs(data)
      } catch (e) { setError(e?.response?.data?.error || e.message) }
      finally { setLoading(false) }
    })()
  }, [])

  const filtered = useMemo(() => {
    return rcs.filter(r => (statusFilter === 'all' || r.status === statusFilter) && (!search || r.title.toLowerCase().includes(search.toLowerCase())))
  }, [rcs, statusFilter, search])

  if (loading) return (
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
  if (error) return <div className="min-h-screen flex flex-col p-6 bg-error-red/10 border border-error-red/40 text-error-red rounded">{error}</div>

  return (
    <div className="min-h-screen flex flex-col py-6 space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Admin: RCs</h1>
          <p className="text-sm text-text-secondary">Manage reading comprehension items, scheduling and status.</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 bg-card-surface border border-white/5 rounded px-3 py-2">
            <div className="text-sm">Total</div>
            <div className="font-medium">{rcs.length}</div>
            <div className="ml-3 text-xs text-text-secondary">Live: {rcs.filter(r => r.status === 'live').length}</div>
            <div className="ml-2 text-xs text-text-secondary">Scheduled: {rcs.filter(r => r.status === 'scheduled').length}</div>
          </div>
          <Button variant="outline" onClick={() => nav('/admin/schedule')}>Schedule</Button>
          <Button onClick={() => nav('/admin/rcs/new')}>Upload New RC</Button>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <div className="flex items-center bg-background border border-white/10 rounded px-2 py-1 gap-2 w-full max-w-lg">
          <Search size={16} className="text-text-secondary" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search title or id..." className="bg-transparent outline-none text-sm w-full" />
        </div>

        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="bg-background border border-white/10 rounded px-2 py-1 text-sm">
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <div className="text-lg font-medium mb-2">No RCs found</div>
              <div className="text-sm text-text-secondary mb-4">Try adjusting your filters or upload a new RC.</div>
              <div className="flex items-center justify-center gap-2">
                <Button onClick={() => setStatusFilter('all')} variant="outline">Reset Filters</Button>
                <Button onClick={() => nav('/admin/rcs/new')}>Upload New RC</Button>
              </div>
            </CardContent>
          </Card>
        ) : (
          filtered.map(rc => (
            <Card key={rc._id}>
              <CardHeader className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="font-medium truncate">{rc.title}</div>
                  <div className="text-xs text-text-secondary truncate">{rc._id} · {rc.scheduledDate ? new Date(rc.scheduledDate).toDateString() : 'Unscheduled'}</div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge color={rc.status === 'live' ? 'success' : rc.status === 'scheduled' ? 'warning' : 'default'}>{rc.status}</Badge>
                  <Button as="a" variant="outline" href={`/test/${rc._id}?preview=1`}>Preview</Button>
                  <Button variant="outline" onClick={() => nav(`/admin/rcs/${rc._id}`)}>Edit</Button>
                </div>
              </CardHeader>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
