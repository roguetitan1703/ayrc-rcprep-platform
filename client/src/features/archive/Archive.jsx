import React, { useEffect, useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../components/auth/AuthContext'
import { getEffectiveSubscriptionSlug } from '../../lib/subscription'
import rcApi from '../../lib/rcs'
import { Card, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import Table from '../../components/ui/Table'
import { Archive as ArchiveIcon, Calendar, TrendingUp, Award, Search, Filter } from 'lucide-react'

export default function Archive() {
  const { user } = useAuth()

  // data
  const [allRcs, setAllRcs] = useState([]) // full dataset (after availability/free-plan filters)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // UI controls
  const [searchQuery, setSearchQuery] = useState('')
  const [sortField, setSortField] = useState('scheduledDate') // date, score, title
  const [sortOrder, setSortOrder] = useState('desc') // asc | desc
  const [showOnlyUnattempted, setShowOnlyUnattempted] = useState(false)

  // pagination state for Table
  const [currentPage, setCurrentPage] = useState(1)
  const rowsPerPage = 10

  // compute free plan
  const isFreePlan = (() => {
    const slug = getEffectiveSubscriptionSlug(user)
    return !!slug && String(slug).toLowerCase() === 'free'
  })()

  // Helper: fetch all pages from rcApi.getArchive(page, pageSize)
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      setLoading(true)
      setError('')
      try {
        const pageSize = 50
        let pageIdx = 1
        let accum = []
        while (true) {
          // call API (existing API used before)
          const dataResp = await rcApi.getArchive(pageIdx, pageSize)
          // the API shape previously was either data.data or data
          const fetched = Array.isArray(dataResp?.data)
            ? dataResp.data
            : Array.isArray(dataResp)
            ? dataResp
            : []

          if (fetched.length === 0) break

          accum = [...accum, ...fetched]

          if (fetched.length < pageSize) break
          pageIdx += 1
        }

        if (cancelled) return

        // Apply availability filter: hide scheduled RCs that are not yet available
        const now = new Date()
        let processed = accum.filter((rc) => {
          const isAvailable = rc.scheduledDate ? new Date(rc.scheduledDate) <= now : true
          return rc.attempted || isAvailable
        })

        // For free users: only show attempted RCs
        if (isFreePlan) {
          processed = processed.filter((rc) => rc.attempted)
        }

        // Deduplicate by id/_id and keep latest occurrence
        const uniqueMap = new Map()
        processed.forEach((r) => uniqueMap.set(r._id || r.id, r))
        const unique = Array.from(uniqueMap.values())

        setAllRcs(unique)
      } catch (e) {
        console.error('Archive fetch error:', e)
        setError(e?.response?.data?.error || e?.message || 'Failed to load archive')
      } finally {
        if (!cancelled) setLoading(false)
      }
    })()

    return () => {
      cancelled = true
    }
  }, [isFreePlan, user]) // re-run if plan changes or user changes

  // Stats computed from the full dataset (so they remain stable regardless of table "paging")
  const stats = useMemo(() => {
    const attempted = allRcs.filter((rc) => rc.attempted)
    const unattempted = allRcs.filter((rc) => !rc.attempted)
    const totalScore = attempted.reduce((sum, rc) => sum + (rc.score || 0), 0)
    const avgScore = attempted.length > 0 ? (totalScore / attempted.length).toFixed(1) : 0
    const topics = new Set()
    attempted.forEach((rc) => rc.topicTags?.forEach((t) => topics.add(t)))

    return {
      attemptedCount: attempted.length,
      unattemptedCount: unattempted.length,
      avgScore,
      uniqueTopics: topics.size,
    }
  }, [allRcs])

  // Client-side search + sort + unattempted filter (derive table rows)
  const filteredSorted = useMemo(() => {
    const q = (searchQuery || '').trim().toLowerCase()
    let list = [...allRcs]

    if (q) {
      list = list.filter(
        (rc) =>
          (rc.title || '').toLowerCase().includes(q) ||
          (rc.topicTags || []).some((t) => String(t).toLowerCase().includes(q))
      )
    }

    if (showOnlyUnattempted) {
      list = list.filter((rc) => !rc.attempted)
    }

    list.sort((a, b) => {
      // score sort (number)
      if (sortField === 'score') {
        const va = typeof a.score === 'number' ? a.score : 0
        const vb = typeof b.score === 'number' ? b.score : 0
        return sortOrder === 'asc' ? va - vb : vb - va
      }

      // title sort (string)
      if (sortField === 'title') {
        const sa = (a.title || '').toLowerCase()
        const sb = (b.title || '').toLowerCase()
        if (sa < sb) return sortOrder === 'asc' ? -1 : 1
        if (sa > sb) return sortOrder === 'asc' ? 1 : -1
        return 0
      }

      // fallback: scheduledDate (date)
      const ta = a.scheduledDate ? new Date(a.scheduledDate).getTime() : 0
      const tb = b.scheduledDate ? new Date(b.scheduledDate).getTime() : 0
      return sortOrder === 'asc' ? ta - tb : tb - ta
    })

    return list
  }, [allRcs, searchQuery, sortField, sortOrder, showOnlyUnattempted])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortField, sortOrder, showOnlyUnattempted, allRcs])

  // Handle Table sort requests
  const handleSort = (field) => {
    if (sortField === field) {
      setSortOrder((o) => (o === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortField(field)
      setSortOrder('asc')
    }
  }

  // Columns for Table (use render functions to match existing cards' content)
  const columns = [
    {
      header: 'Title',
      field: 'title',
      sortable: true,
      render: (rc) => <div className="font-medium text-text-primary line-clamp-2">{rc.title}</div>,
    },
    {
      header: 'Date',
      field: 'scheduledDate',
      sortable: true,
      render: (rc) => {
        const d = rc.scheduledDate ? new Date(rc.scheduledDate) : null
        return (
          <div className="flex items-center gap-2 text-sm text-text-secondary">
            <Calendar size={14} />
            <span>
              {d
                ? d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
                : '—'}
            </span>
          </div>
        )
      },
    },
    {
      header: 'Score',
      field: 'score',
      sortable: true,
      render: (rc) => {
        if (!rc.attempted) return <div className="text-sm text-text-secondary">—</div>
        // preserve original scoreColor logic (project likely resolves these tokens via CSS variables)
        const scoreColor =
          (rc.score || 0) >= 3.5
            ? 'success-green'
            : (rc.score || 0) >= 2.5
            ? 'info-blue'
            : (rc.score || 0) >= 1.5
            ? 'accent-amber'
            : 'error-red'

        return (
          <Badge
            style={{
              backgroundColor: `${scoreColor}15`,
              color: scoreColor,
              border: `1px solid ${scoreColor}30`,
            }}
            className="text-sm font-bold"
          >
            {rc.score}/4
          </Badge>
        )
      },
      cellClassName: 'text-center',
    },
    {
      header: 'Topics',
      field: 'topicTags',
      render: (rc) => {
        if (!rc.topicTags || rc.topicTags.length === 0)
          return <span className="text-sm text-text-secondary">—</span>
        return (
          <div className="flex flex-wrap gap-1">
            {rc.topicTags.slice(0, 3).map((t, i) => (
              <span
                key={i}
                className="px-2 py-0.5 bg-surface-muted text-text-primary rounded text-[11px] font-medium"
              >
                {t}
              </span>
            ))}
            {rc.topicTags.length > 3 && (
              <span className="text-xs text-text-secondary">+{rc.topicTags.length - 3}</span>
            )}
          </div>
        )
      },
    },
    {
      header: 'Actions',
      field: 'actions',
      render: (rc) => {
        const id = rc._id || rc.id
        const attempted = !!rc.attempted
        return (
          <div className="inline-flex items-center gap-2">
            {attempted && (
              <Link to={`/attempts/${id}`}>
                <Button size="sm" variant="primary">
                  View
                </Button>
              </Link>
            )}
            {/* Attempted: "Practice" with ?mode=practice
                Not attempted: "Take Test" without the param */}
            <Link to={attempted ? `/test/${id}?mode=practice` : `/test/${id}`}>
              <Button size="sm" variant={attempted ? 'secondary' : 'primary'}>
                {attempted ? 'Practice' : 'Take Test'}
              </Button>
            </Link>
          </div>
        )
      },
      cellClassName: 'whitespace-nowrap',
    },
  ]

  // If user toggled "only unattempted" and none found => show custom message
  const showAllAttemptedEmptyState =
    showOnlyUnattempted && filteredSorted.length === 0 && !loading && !error

  // Paginate the filtered + sorted data
  const paginatedData = useMemo(() => {
    const startIdx = (currentPage - 1) * rowsPerPage
    return filteredSorted.slice(startIdx, startIdx + rowsPerPage)
  }, [filteredSorted, currentPage, rowsPerPage])

  return (
    <div className="flex flex-col space-y-6 p-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary mb-2">Archive</h1>
        <p className="text-sm text-text-secondary">
          Your complete practice history and performance insights
        </p>
      </div>

      {/* Stats — now 4 cards (Attempted, Unattempted, Average Score, Topics Covered) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-border-soft">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <div className="text-sm text-text-secondary mb-1">Attempted</div>
              <div className="text-3xl font-bold text-text-primary">{stats.attemptedCount}</div>
            </div>
            <div className="bg-info-blue/10 p-2 rounded-lg">
              <ArchiveIcon size={20} className="text-info-blue" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-border-soft">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <div className="text-sm text-text-secondary mb-1">Unattempted</div>
              <div className="text-3xl font-bold text-text-primary">{stats.unattemptedCount}</div>
            </div>
            <div className="bg-accent-amber/10 p-2 rounded-lg">
              <Filter size={20} className="text-accent-amber" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-border-soft">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <div className="text-sm text-text-secondary mb-1">Average Score</div>
              <div className="text-3xl font-bold text-text-primary">{stats.avgScore}/4</div>
            </div>
            <div className="bg-success-green/10 p-2 rounded-lg">
              <TrendingUp size={20} className="text-success-green" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-border-soft">
          <CardContent className="p-5 flex items-start justify-between">
            <div>
              <div className="text-sm text-text-secondary mb-1">Topics Covered</div>
              <div className="text-3xl font-bold text-text-primary">{stats.uniqueTopics}</div>
            </div>
            <div className="bg-primary/10 p-2 rounded-lg">
              <Award size={20} className="text-primary" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search + Unattempted Toggle (replaced sort dropdown + asc/desc) */}
      <Card className="bg-white border border-border-soft">
        <CardContent className="p-6 flex flex-col sm:flex-row gap-4 items-center">
          <div className="flex-1 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-secondary"
            />
            <input
              type="text"
              placeholder="Search by title or topic..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-background border border-border-soft rounded-lg text-sm text-text-primary placeholder:text-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
            />
          </div>

          <div className="flex items-center gap-2">
            <Filter size={18} className="text-text-secondary" />
            <div className="inline-flex items-center gap-2">
              <Button
                size="sm"
                variant={showOnlyUnattempted ? 'primary' : 'secondary'}
                onClick={() => setShowOnlyUnattempted((s) => !s)}
              >
                {showOnlyUnattempted ? 'Showing: Unattempted' : 'Show only unattempted'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* If "show only unattempted" is on and there are none — show custom message */}
      {showAllAttemptedEmptyState ? (
        <Card className="bg-white border border-border-soft">
          <CardContent className="p-12 text-center">
            <ArchiveIcon size={48} className="mx-auto text-[#8B95A8] mb-4" />
            <div className="text-lg font-semibold text-text-primary mb-2">
              You’ve attempted all available RCs!
            </div>
            <p className="text-sm text-text-secondary">
              Great job — keep practising to improve your scores.
            </p>
          </CardContent>
        </Card>
      ) : (
        // Table (paginated at 10 rows per page)
        <Table
          columns={columns}
          data={paginatedData}
          loading={loading}
          error={error}
          page={currentPage}
          total={filteredSorted.length}
          pageSize={rowsPerPage}
          onPageChange={(p) => setCurrentPage(p)}
          onSort={handleSort}
          sortField={sortField}
          sortOrder={sortOrder}
        />
      )}
    </div>
  )
}
