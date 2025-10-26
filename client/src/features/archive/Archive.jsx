import { useEffect, useState, useMemo } from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import { Link } from 'react-router-dom'
import rcApi from '../../lib/rcs'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Icon } from '../../components/ui/Icon'
import {
Archive as ArchiveIcon,
Calendar,
Filter,
TrendingUp,
Award,
Search,
} from 'lucide-react'

export default function Archive() {
const { user } = useAuth()
const [items, setItems] = useState([])
const [allItems, setAllItems] = useState([])
const [page, setPage] = useState(1)
const [loading, setLoading] = useState(true)
const [error, setError] = useState('')
const [hasMore, setHasMore] = useState(false)
const [searchQuery, setSearchQuery] = useState('')
const [sortBy, setSortBy] = useState('date') // date, score, title

const isFreePlan = user && (user.subscription || '').toLowerCase() === 'free'

useEffect(() => {
;(async () => {
try {
setLoading(true)
setError('')

    const data = await rcApi.getArchive(page, 10)
    let fetched = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data)
      ? data
      : []

    const now = new Date()

    // 1️⃣ Filter scheduled RCs not yet available
   fetched = fetched.filter((rc) => {
  const isAvailable = new Date(rc.scheduledDate) <= now
  return rc.attempted || isAvailable
})
    // 2️⃣ For free users, only show attempted RCs
    if (isFreePlan) {
      fetched = fetched.filter((rc) => rc.attempted)
    }

    setItems(fetched)
    setHasMore(fetched.length === 10)

    // 3️⃣ Keep a global list of all fetched RCs (for stats)
    setAllItems((prev) => {
      const merged = [...prev, ...fetched]
      const unique = Array.from(
        new Map(merged.map((i) => [i._id || i.id, i])).values()
      )
      return unique
    })
  } catch (e) {
    console.error('Archive fetch error:', e)
    setError(e?.response?.data?.error || e.message)
  } finally {
    setLoading(false)
  }
})()
}, [page, isFreePlan])

// 📊 Stats use allItems (not just current page)
const stats = useMemo(() => {
const attempted = allItems.filter((rc) => rc.attempted)
const totalScore = attempted.reduce((sum, rc) => sum + (rc.score || 0), 0)
const avgScore =
attempted.length > 0 ? (totalScore / attempted.length).toFixed(1) : 0
const topics = new Set()
attempted.forEach((rc) => rc.topicTags?.forEach((t) => topics.add(t)))

return {
  totalArchived: attempted.length,
  avgScore,
  uniqueTopics: topics.size,
}
}, [allItems])

// 🔍 Search + Sort
const filteredItems = useMemo(() => {
let filtered = items.filter(
(rc) =>
rc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
rc.topicTags?.some((tag) =>
tag.toLowerCase().includes(searchQuery.toLowerCase())
)
)

filtered.sort((a, b) => {
  if (sortBy === 'score') return (b.score || 0) - (a.score || 0)
  if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
  return new Date(b.scheduledDate || 0) - new Date(a.scheduledDate || 0)
})

return filtered


}, [items, searchQuery, sortBy])

if (loading)
return (
<div className="flex flex-col space-y-6">
<h1 className="text-3xl font-bold text-text-primary mb-2">Archive</h1>
<p className="text-sm text-text-secondary">Your complete practice history</p>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
<Skeleton className="h-24 rounded-xl" />
<Skeleton className="h-24 rounded-xl" />
<Skeleton className="h-24 rounded-xl" />
</div>
<div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
<Skeleton className="h-48 rounded-xl" />
<Skeleton className="h-48 rounded-xl" />
<Skeleton className="h-48 rounded-xl" />
</div>
</div>
)

if (error)
return (
<div className="p-6 bg-error-red/10 border-2 border-error-red/40 text-error-red rounded-xl flex items-start gap-3">
<Icon icon="alertCircle" size={20} className="flex-shrink-0 mt-0.5" />
<div>
<div className="font-semibold">Error Loading Archive</div>
<div className="text-sm mt-1">{error}</div>
</div>
</div>
)

//  Render
return (
<div className="flex flex-col space-y-6">
{/* Header */}
<div>
<h1 className="text-3xl font-bold text-text-primary mb-2">Archive</h1>
<p className="text-sm text-seconsary">
Your complete practice history and performance insights
</p>
</div>

  {/* Stats */}
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-border-soft">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <div className="text-sm text-text-secondary mb-1">Total Attempted</div>
          <div className="text-3xl font-bold text-text-primary">
            {stats.totalArchived}
          </div>
        </div>
        <div className="bg-info-blue/10 p-3 rounded-lg">
          <ArchiveIcon size={24} className="text-info-blue" />
        </div>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-border-soft">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <div className="text-sm text-text-secondary mb-1">Average Score</div>
          <div className="text-3xl font-bold text-text-primary">
            {stats.avgScore}/4
          </div>
        </div>
        <div className="bg-success-green/10 p-3 rounded-lg">
          <TrendingUp size={24} className="text-success-green" />
        </div>
      </CardContent>
    </Card>

    <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-border-soft">
      <CardContent className="p-6 flex items-start justify-between">
        <div>
          <div className="text-sm text-text-secondary mb-1">Topics Covered</div>
          <div className="text-3xl font-bold text-text-primary">
            {stats.uniqueTopics}
          </div>
        </div>
        <div className="bg-primary/10 p-3 rounded-lg">
          <Award size={24} className="text-primary" />
        </div>
      </CardContent>
    </Card>
  </div>

  {/* Search + Sort */}
  <Card className="bg-white border border-border-soft">
    <CardContent className="p-6 flex flex-col sm:flex-row gap-4">
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
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 bg-background border border-border-soft rounded-lg text-sm text-text-primary focus:outline-none focus:ring-2 focus:ring-focus-ring focus:border-transparent"
        >
          <option value="date">Sort by Date</option>
          <option value="score">Sort by Score</option>
          <option value="title">Sort by Title</option>
        </select>
      </div>
    </CardContent> 
  </Card>

  {/* RC Cards */}
  {filteredItems.length === 0 ? (
    <Card className="bg-white border border-border-soft">
      <CardContent className="p-12 text-center">
        <ArchiveIcon size={48} className="mx-auto text-[#8B95A8] mb-4" />
        <div className="text-lg font-semibold text-text-primary mb-2">
          {searchQuery
            ? 'No matching passages found'
            : 'No archived passages yet'}
        </div>
        <p className="text-sm text-text-secondary mb-6">
          {searchQuery
            ? 'Try adjusting your search query'
            : 'Your practice history will appear here once you complete your first RC'}
        </p>
        {!searchQuery && (
          <Link to="/test/today">
            <Button variant="primary">Start Practicing</Button>
          </Link>
        )}
      </CardContent>
    </Card>
  ) : (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredItems.map((rc) => {
          const scoreColor =
            (rc.score || 0) >= 3.5
              ? 'success-green'
              : (rc.score || 0) >= 2.5
              ? 'info-blue'
              : (rc.score || 0) >= 1.5
              ? 'accent-amber'
              : 'error-red'

          return (
            <Card
              key={rc._id || rc.id}
              className="bg-white border border-border-soft hover:border-primary/30 transition-all"
            >
              <CardHeader className="p-4 border-b border-border-soft flex items-start justify-between">
                <h3 className="text-base font-semibold text-text-primary line-clamp-2">
                  {rc.title}
                </h3>
                {rc.attempted && (
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
                )}
              </CardHeader>

              <CardContent className="p-4 space-y-3 text-xs text-text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar size={14} />
                  <span>
                    {new Date(rc.scheduledDate).toLocaleDateString('en-US', {
                      month: 'short',
                      day: 'numeric',
                      year: 'numeric',
                    })}
                  </span>
                </div>

                {rc.topicTags?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {rc.topicTags.slice(0, 3).map((tag, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-surface-muted text-text-primary rounded text-[10px] font-medium"
                      >
                        {tag}
                      </span>
                    ))}
                    {rc.topicTags.length > 3 && (
                      <span className="px-2 py-0.5 text-[10px] text-text-secondary">
                        +{rc.topicTags.length - 3}
                      </span>
                    )}
                  </div>
                )}

                <div className="flex gap-2">
                  {rc.attempted && (
                    <Link to={`/attempts/${rc._id || rc.id}/analysis`} className="flex-1">
                      <Button variant="primary" className="w-full">
                        View Analysis
                      </Button>
                    </Link>
                  )}
                  <Link
                    to={`/test/${rc._id || rc.id}?mode=practice`}
                    className={rc.attempted ? 'flex-1' : 'w-full'}
                  >
                    <Button
                      variant={rc.attempted ? 'secondary' : 'primary'}
                      className="w-full"
                    >
                      {rc.attempted ? 'Retry' : 'Practice'}
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-center gap-4 pt-4">
        <Button
          variant="secondary"
          disabled={page <= 1}
          onClick={() => setPage((p) => p - 1)}
          className="flex items-center gap-2"
        >
          <Icon icon="chevronLeft" size={16} />
          Previous
        </Button>

        <Badge
          variant="outline"
          className="px-3 py-1 text-sm text-text-primary bg-surface-muted"
        >
          Page {page} of {Math.ceil(allItems.length / 10) || 1}
        </Badge>

        <Button
          variant="secondary"
          disabled={!hasMore}
          onClick={() => setPage((p) => p + 1)}
          className="flex items-center gap-2"
        >
          Next
          <Icon icon="chevronRight" size={16} />
        </Button>
      </div>
    </>
  )}
</div>


)
}