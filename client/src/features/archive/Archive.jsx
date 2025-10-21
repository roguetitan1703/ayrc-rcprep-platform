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
  Clock,
  Award,
  Search,
  Filter,
  TrendingUp,
} from 'lucide-react'

export default function Archive() {
  const { user } = useAuth()
  const [items, setItems] = useState([])
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [hasMore, setHasMore] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [sortBy, setSortBy] = useState('date') // date, score, title

  // Calculate stats
  const stats = useMemo(() => {
    const attempted = items.filter((rc) => rc.attempted)
    const totalScore = attempted.reduce((sum, rc) => sum + (rc.score || 0), 0)
    const avgScore = attempted.length > 0 ? (totalScore / attempted.length).toFixed(1) : 0
    const topics = new Set()
    attempted.forEach((rc) => rc.topicTags?.forEach((tag) => topics.add(tag)))

    return {
      totalArchived: items.length,
      avgScore,
      uniqueTopics: topics.size,
    }
  }, [items])

  // Filter and sort items
  const filteredItems = useMemo(() => {
    let filtered = items.filter(
      (rc) =>
        rc.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        rc.topicTags?.some((tag) => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    )

    filtered.sort((a, b) => {
      if (sortBy === 'score') return (b.score || 0) - (a.score || 0)
      if (sortBy === 'title') return (a.title || '').localeCompare(b.title || '')
      return new Date(b.scheduledDate || 0) - new Date(a.scheduledDate || 0)
    })

    return filtered
  }, [items, searchQuery, sortBy])

  // Detect free plan from context user
  const isFreePlan = user && (user.subscription || '').toLowerCase() === 'free'

  useEffect(() => {
    if (isFreePlan) {
      setLoading(false)
      setItems([])
      setHasMore(false)
      return
    }
    ;(async () => {
      try {
        setLoading(true)
        const data = await rcApi.getArchive(page, 10)
        // Debug: log archive data and user info
        console.log('Archive fetch:', { archive: data, user })
        // If backend returns {data: [], message: ...}, use data.data
        if (data && Array.isArray(data.data)) {
          setItems(data.data)
          setHasMore(data.data.length === 10)
        } else {
          setItems(Array.isArray(data) ? data : [])
          setHasMore(Array.isArray(data) && data.length === 10)
        }
      } catch (e) {
        setError(e?.response?.data?.error || e.message)
        // Debug: log error
        console.error('Archive fetch error:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [page, isFreePlan, user])

  if (isFreePlan) {
    return (
      <div className="flex flex-col space-y-6 items-center justify-center min-h-[60vh]">
        <ArchiveIcon size={64} className="mx-auto text-[#8B95A8] mb-6" />
        <h1 className="text-3xl font-bold text-[#273043] mb-2">Archive Unavailable</h1>
        <p className="text-lg text-[#5C6784] mb-4">
          Archive RCs are not available for free plan users.
        </p>
        <Link to="/test">
          <Button variant="primary">Start Practicing</Button>
        </Link>
      </div>
    )
  }

  if (loading)
    return (
      <div className="flex flex-col space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-[#273043] mb-2">Archive</h1>
          <p className="text-sm text-[#5C6784]">Your complete practice history</p>
        </div>
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
      <div className="p-6 bg-[#E4572E]/10 border-2 border-[#E4572E]/40 text-[#E4572E] rounded-xl flex items-start gap-3">
        <Icon icon="alertCircle" size={20} className="flex-shrink-0 mt-0.5" />
        <div>
          <div className="font-semibold">Error Loading Archive</div>
          <div className="text-sm mt-1">{error}</div>
        </div>
      </div>
    )

  return (
    <div className="flex flex-col space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#273043] mb-2">Archive</h1>
        <p className="text-sm text-[#5C6784]">
          Your complete practice history and performance insights
        </p>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-[#D8DEE9] hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-[#5C6784] mb-1">Total Archived</div>
                <div className="text-3xl font-bold text-[#273043]">{stats.totalArchived}</div>
              </div>
              <div className="bg-[#3B82F6]/10 p-3 rounded-lg">
                <ArchiveIcon size={24} className="text-[#3B82F6]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-[#D8DEE9] hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-[#5C6784] mb-1">Average Score</div>
                <div className="text-3xl font-bold text-[#273043]">{stats.avgScore}/4</div>
              </div>
              <div className="bg-[#23A094]/10 p-3 rounded-lg">
                <TrendingUp size={24} className="text-[#23A094]" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-primary/5 via-info-blue/5 to-success-green/5 border border-[#D8DEE9] hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <div className="text-sm text-[#5C6784] mb-1">Topics Covered</div>
                <div className="text-3xl font-bold text-[#273043]">{stats.uniqueTopics}</div>
              </div>
              <div className="bg-[#D33F49]/10 p-3 rounded-lg">
                <Award size={24} className="text-[#D33F49]" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="bg-white border border-[#D8DEE9]">
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search
                size={18}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5C6784]"
              />
              <input
                type="text"
                placeholder="Search by title or topic..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-[#F7F8FC] border border-[#D8DEE9] rounded-lg text-sm text-[#273043] placeholder:text-[#8B95A8] focus:outline-none focus:ring-2 focus:ring-[#1A2A6C] focus:border-transparent"
              />
            </div>

            {/* Sort */}
            <div className="flex items-center gap-2">
              <Filter size={18} className="text-[#5C6784]" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="px-4 py-2.5 bg-[#F7F8FC] border border-[#D8DEE9] rounded-lg text-sm text-[#273043] focus:outline-none focus:ring-2 focus:ring-[#1A2A6C] focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="score">Sort by Score</option>
                <option value="title">Sort by Title</option>
              </select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* RC Cards Grid */}
      {filteredItems.length === 0 ? (
        <Card className="bg-white border border-[#D8DEE9]">
          <CardContent className="p-12 text-center">
            <ArchiveIcon size={48} className="mx-auto text-[#8B95A8] mb-4" />
            <div className="text-lg font-semibold text-[#273043] mb-2">
              {searchQuery ? 'No matching passages found' : 'No archived passages yet'}
            </div>
            <p className="text-sm text-[#5C6784] mb-6">
              {searchQuery
                ? 'Try adjusting your search query'
                : 'Your practice history will appear here once you complete your first RC'}
            </p>
            {!searchQuery && (
              <Link to="/test">
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
                  ? '#23A094'
                  : (rc.score || 0) >= 2.5
                  ? '#3B82F6'
                  : (rc.score || 0) >= 1.5
                  ? '#F6B26B'
                  : '#E4572E'

              return (
                <Card
                  key={rc._id || rc.id}
                  className="bg-white border border-[#D8DEE9] hover:border-[#D33F49]/30 transition-all duration-200"
                >
                  <CardHeader className="p-4 border-b border-[#D8DEE9]">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-[#273043] line-clamp-2">
                        {rc.title}
                      </h3>
                      {rc.attempted && (
                        <div className="flex-shrink-0">
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
                        </div>
                      )}
                    </div>
                  </CardHeader>

                  <CardContent className="p-4 space-y-3">
                    {/* Metadata */}
                    <div className="flex flex-col gap-2 text-xs text-[#5C6784]">
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
                      {rc.topicTags && rc.topicTags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {rc.topicTags.slice(0, 3).map((tag, idx) => (
                            <span
                              key={idx}
                              className="px-2 py-0.5 bg-[#EEF1FA] text-[#273043] rounded text-[10px] font-medium"
                            >
                              {tag}
                            </span>
                          ))}
                          {rc.topicTags.length > 3 && (
                            <span className="px-2 py-0.5 text-[10px] text-[#5C6784]">
                              +{rc.topicTags.length - 3}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2">
                      {rc.attempted && (
                        <Link to={`/analysis/${rc._id || rc.id}`} className="flex-1">
                          <Button variant="primary" className="w-full">
                            View Analysis
                          </Button>
                        </Link>
                      )}
                      <Link
                        to={`/test/${rc._id || rc.id}?mode=practice`}
                        className={rc.attempted ? 'flex-1' : 'w-full'}
                      >
                        <Button variant={rc.attempted ? 'secondary' : 'primary'} className="w-full">
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
            <span className="text-sm text-[#5C6784] font-medium">Page {page}</span>
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
