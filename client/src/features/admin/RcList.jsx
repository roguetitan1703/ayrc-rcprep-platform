import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'

export default function RcList() {
  const [rcs, setRcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('scheduledDate')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(10)
  const nav = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/admin/rcs')
        setRcs(data)
      } catch (e) {
        // handle error
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    let arr = rcs.filter(
      (r) =>
        (statusFilter === 'all' || r.status === statusFilter) &&
        (!search || r.title.toLowerCase().includes(search.toLowerCase()) || r._id.includes(search))
    )
    arr = arr.sort((a, b) => {
      let aVal = a[sortBy] || ''
      let bVal = b[sortBy] || ''
      if (sortBy === 'scheduledDate') {
        aVal = aVal ? new Date(aVal) : new Date(0)
        bVal = bVal ? new Date(bVal) : new Date(0)
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1
      return 0
    })
    return arr
  }, [rcs, search, statusFilter, sortBy, sortDir])

  // Pagination
  const totalPages = Math.ceil(filtered.length / pageSize)
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize)

  return (
    <div className="max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
        <h1 className="text-2xl font-semibold">RC Inventory</h1>
        <div className="flex flex-wrap gap-2 items-center">
          <Button onClick={() => nav('/admin/rcs/new')}>Upload New RC</Button>
          <input
            className="bg-background border border-white/10 rounded px-2 py-1 text-sm"
            placeholder="Search by title or ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <select
            className="bg-background border border-white/10 rounded px-7 py-1 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="archived">Archived</option>
          </select>
          <select
            className="bg-background border border-white/10 rounded px-7 py-1 text-sm"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="scheduledDate">Scheduled Date</option>
            <option value="title">Title</option>
            <option value="status">Status</option>
          </select>
          <select
            className="bg-background border border-white/10 rounded px-7 py-1 text-sm"
            value={sortDir}
            onChange={(e) => setSortDir(e.target.value)}
          >
            <option value="desc">Desc</option>
            <option value="asc">Asc</option>
          </select>
        </div>
      </div>

      <Card>
        <CardHeader>All RCs</CardHeader>
        <CardContent>
          {loading ? (
            <Skeleton className="h-32 w-full" />
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5">
                <thead>
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary uppercase">
                      Title & ID
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary uppercase">
                      Scheduled Date
                    </th>
                    <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary uppercase">
                      Status
                    </th>
                    
                    <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary uppercase">
                      Tags
                    </th>
                    <th className="px-4 py-2 text-right text-xs font-semibold text-text-secondary uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-white/5">
                  {paged.map((rc) => (
                    <tr key={rc._id}>
                      <td className="px-4 py-2">
                        <div className="font-medium">{rc.title}</div>
                        <div className="text-xs text-text-secondary mt-1">{rc._id}</div>
                      </td>
                      <td className="px-4 py-2">
                        {rc.scheduledDate ? (
                          new Date(rc.scheduledDate).toLocaleDateString()
                        ) : (
                          <span className="text-text-secondary/60">Unscheduled</span>
                        )}
                      </td>
                      <td className="px-4 py-2">
                        <Badge
                          color={
                            rc.status === 'live'
                              ? 'success'
                              : rc.status === 'scheduled'
                              ? 'warning'
                              : rc.status === 'draft'
                              ? 'default'
                              : 'default'
                          }
                        >
                          {rc.status}
                        </Badge>
                      </td>
                      
                      <td className="px-4 py-2">
                        {rc.topicTags && rc.topicTags.length > 0 ? rc.topicTags.join(', ') : '-'}
                      </td>
                      <td className="px-4 py-2 text-right">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => nav(`/admin/rcs/${rc._id}`)}
                        >
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => window.open(`/test/${rc._id}?preview=1`, '_blank')}
                        >
                          Preview
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => nav(`/admin/rcs/${rc._id}/analytics`)}
                        >
                          View Analytics
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {/* Pagination */}
              <div className="flex justify-end gap-2 mt-4">
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                >
                  Prev
                </Button>
                <span className="text-sm px-2">
                  Page {page} of {totalPages}
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
