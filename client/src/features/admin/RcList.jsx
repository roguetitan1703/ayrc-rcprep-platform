import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Search, ChevronUp, ChevronDown } from 'lucide-react'

export default function RcList() {
  const [rcs, setRcs] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [sortBy, setSortBy] = useState('scheduledDate')
  const [sortDir, setSortDir] = useState('desc')
  const [page, setPage] = useState(1)
  const [pageSize] = useState(15)
  const nav = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/admin/rcs')
        setRcs(data)
      } catch (e) {
        console.error('Error loading RCs:', e)
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

  const toggleSort = (field) => {
    if (sortBy === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc')
    } else {
      setSortBy(field)
      setSortDir('desc')
    }
  }

  const SortIcon = ({ field }) => {
    if (sortBy !== field) return <div className="w-4 h-4" />
    return sortDir === 'asc' ? (
      <ChevronUp size={16} className="text-primary" />
    ) : (
      <ChevronDown size={16} className="text-primary" />
    )
  }

  if (loading) {
    return (
      <div className="w-full p-6 md:p-8 space-y-6">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-12 w-full" />
        <div className="space-y-3">
          {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-6">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-text-primary">RC Inventory</h1>
          <p className="text-sm text-text-secondary">Manage all reading comprehension passages and track their status.</p>
        </div>

        {/* Filters Section */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center flex-wrap">
          <div className="flex items-center bg-background border border-white/10 rounded px-3 py-2 gap-2 flex-1 sm:flex-initial min-w-0 sm:min-w-64">
            <Search size={16} className="text-text-secondary flex-shrink-0" />
            <input
              className="bg-transparent outline-none text-sm w-full"
              placeholder="Search by title or ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="bg-background border border-white/10 rounded px-3 py-2 text-sm cursor-pointer"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">All Status</option>
            <option value="draft">Draft</option>
            <option value="scheduled">Scheduled</option>
            <option value="live">Live</option>
            <option value="archived">Archived</option>
          </select>

          <div className="flex gap-2 ml-auto flex-shrink-0">
            <Button onClick={() => nav('/admin')} variant="outline" size="sm">
              Back to Dashboard
            </Button>
            <Button onClick={() => nav('/admin/rcs/new')} size="sm">
              Upload New RC
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">All Reading Comprehension Items</h2>
            <p className="text-sm text-text-secondary mt-1">
              Total: <span className="font-semibold text-text-primary">{filtered.length}</span> item{filtered.length !== 1 ? 's' : ''}
            </p>
          </div>
          {filtered.length > 0 && (
            <div className="text-xs text-text-secondary">
              Page {page} of {totalPages}
            </div>
          )}
        </CardHeader>

        <CardContent>
          {loading ? (
            <div className="space-y-3">
              {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-16" />)}
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-lg font-medium mb-2">No RCs found</div>
              <div className="text-sm text-text-secondary mb-6">Try adjusting your filters or upload a new RC to get started.</div>
              <div className="flex items-center justify-center gap-2 flex-wrap">
                <Button onClick={() => setStatusFilter('all')} variant="outline">
                  Reset Filters
                </Button>
                <Button onClick={() => nav('/admin/rcs/new')}>
                  Upload New RC
                </Button>
              </div>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-white/5">
                  <thead className="bg-card-surface/30">
                    <tr>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => toggleSort('title')}
                          className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
                        >
                          Title & ID
                          <SortIcon field="title" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => toggleSort('scheduledDate')}
                          className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
                        >
                          Scheduled Date
                          <SortIcon field="scheduledDate" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left">
                        <button
                          onClick={() => toggleSort('status')}
                          className="flex items-center gap-2 text-xs font-semibold text-text-secondary uppercase tracking-wider hover:text-text-primary transition-colors"
                        >
                          Status
                          <SortIcon field="status" />
                        </button>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Topics
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-background divide-y divide-white/5">
                    {paged.map((rc) => (
                      <tr key={rc._id} className="hover:bg-card-surface/20 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-medium text-text-primary">{rc.title}</div>
                          <div className="text-xs text-text-secondary mt-1 font-mono">{rc._id}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                          {rc.scheduledDate ? (
                            new Date(rc.scheduledDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          ) : (
                            <span className="text-text-secondary/60 italic">Unscheduled</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
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
                            {rc.status.charAt(0).toUpperCase() + rc.status.slice(1)}
                          </Badge>
                        </td>
                        <td className="px-6 py-4">
                          {rc.topicTags && rc.topicTags.length > 0 ? (
                            <div className="flex flex-wrap gap-1">
                              {rc.topicTags.slice(0, 2).map((tag, idx) => (
                                <Badge key={idx} color="neutral" size="sm">
                                  {tag}
                                </Badge>
                              ))}
                              {rc.topicTags.length > 2 && (
                                <Badge color="neutral" size="sm">
                                  +{rc.topicTags.length - 2}
                                </Badge>
                              )}
                            </div>
                          ) : (
                            <span className="text-text-secondary/60 text-sm">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          <div className="flex items-center justify-end gap-2">
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
                              onClick={() => nav(`/admin/rcs/${rc._id}`)}
                            >
                              Edit
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => nav(`/admin/rcs/${rc._id}/analytics`)}
                            >
                              Analytics
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-white/5">
                  <div className="text-sm text-text-secondary">
                    Showing{' '}
                    <span className="font-semibold text-text-primary">{(page - 1) * pageSize + 1}</span> to{' '}
                    <span className="font-semibold text-text-primary">{Math.min(page * pageSize, filtered.length)}</span> of{' '}
                    <span className="font-semibold text-text-primary">{filtered.length}</span> results
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      disabled={page === 1}
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                    >
                      Previous
                    </Button>
                    <div className="text-sm text-text-secondary px-3">
                      Page {page} of {totalPages}
                    </div>
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
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
