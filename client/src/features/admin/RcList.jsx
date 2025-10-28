import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Search } from 'lucide-react'
import Table from '../../components/ui/Table'

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



  // Note: don't early-return on loading; Table will render skeleton rows while data loads

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
          {/* Table-driven UI preserves sorting, pagination and actions */}
          <Table
            columns={[
              {
                header: 'Title & ID',
                field: 'title',
                sortable: true,
                render: (rc) => (
                  <div>
                    <div className="font-medium text-text-primary">{rc.title}</div>
                    <div className="text-xs text-text-secondary mt-1 font-mono">{rc._id}</div>
                  </div>
                ),
              },
              {
                header: 'Scheduled Date',
                field: 'scheduledDate',
                sortable: true,
                render: (rc) => (
                  rc.scheduledDate ? (
                    new Date(rc.scheduledDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
                  ) : (
                    <span className="text-text-secondary/60 italic">Unscheduled</span>
                  )
                ),
              },
              {
                header: 'Status',
                field: 'status',
                sortable: true,
                render: (rc) => (
                  <Badge color={rc.status === 'live' ? 'success' : rc.status === 'scheduled' ? 'warning' : 'default'}>
                    {rc.status.charAt(0).toUpperCase() + rc.status.slice(1)}
                  </Badge>
                ),
              },
              {
                header: 'Topics',
                field: 'topicTags',
                render: (rc) => (
                  rc.topicTags && rc.topicTags.length > 0 ? (
                    <div className="flex flex-wrap gap-1">
                      {rc.topicTags.slice(0, 2).map((tag, idx) => (
                        <Badge key={idx} color="neutral" size="sm">{tag}</Badge>
                      ))}
                      {rc.topicTags.length > 2 && (
                        <Badge color="neutral" size="sm">+{rc.topicTags.length - 2}</Badge>
                      )}
                    </div>
                  ) : (
                    <span className="text-text-secondary/60 text-sm">—</span>
                  )
                ),
              },
              {
                header: 'Actions',
                field: 'actions',
                render: (rc) => (
                  <div className="inline-flex items-center justify-center gap-1">
                    <Button size="sm" variant="ghost" onClick={() => window.open(`/test/${rc._id}?preview=1`, '_blank')}>Preview</Button>
                    <Button size="sm" variant="ghost" onClick={() => nav(`/admin/rcs/${rc._id}`)}>Edit</Button>
                    <Button size="sm" variant="ghost" onClick={() => nav(`/admin/rcs/${rc._id}/analytics`)}>Analytics</Button>
                  </div>
                ),
                cellClassName: 'px-2 py-2 text-center whitespace-nowrap',
              },
            ]}
            data={paged}
            loading={loading}
            page={page}
            pageSize={pageSize}
            total={filtered.length}
            onPageChange={(p) => setPage(p)}
            onSort={(field) => toggleSort(field)}
            sortField={sortBy}
            sortOrder={sortDir}
          />
        </CardContent>
      </Card>
    </div>
  )
}
