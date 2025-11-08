import { Line, Bar, Pie } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js'
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
)
import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Modal } from '../../components/ui/Modal'
import { Search } from 'lucide-react'

export default function AdminDashboard() {
  const [rcs, setRcs] = useState([])
  const [analytics, setAnalytics] = useState({})
  const [feedback, setFeedback] = useState({ submitted: false, lockStatus: { lock: false } })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalRc, setModalRc] = useState(null)
  const [modalRcAnalytics, setModalRcAnalytics] = useState(null)
  const nav = useNavigate()

  // Defensive defaults for all analytics fields
  const attemptsByDay = analytics.attemptsByDay ?? []
  const attemptsToday = analytics.attemptsToday ?? 0
  const attemptsWeek = analytics.attemptsWeek ?? 0
  const totalAttempts = analytics.totalAttempts ?? 0
  const activeUsersTrend = analytics.activeUsersTrend ?? []
  const activeUsersToday = analytics.activeUsersToday ?? 0
  const activeUsersWeek = analytics.activeUsersWeek ?? 0
  const avgAccuracy = analytics.avgAccuracy ?? 0
  const ratingsDist = analytics.ratingsDist ?? []
  const topics = analytics.topics ?? []
  const coverage = analytics.coverage ?? 0
  const reasons = analytics.reasons ?? { top: [] }
  const attempts7d = analytics.attempts7d ?? 0
  const taggedWrong = analytics.taggedWrong ?? 0
  const totalWrong = analytics.totalWrong ?? 0

  useEffect(() => {
    ;(async () => {
      try {
        const { data: rcsData } = await api.get('/admin/rcs')
        setRcs(rcsData)
        const { data: analyticsData } = await api.get('/users/me/dashboard')
        console.log('Admin dashboard analytics:', analyticsData)
        setAnalytics(analyticsData.analytics || {})
        // Fetch feedback data
        try {
          const { data: feedbackData } = await api.get('/admin/feedback')
          setFeedback(feedbackData || { submitted: false, lockStatus: { lock: false } })
        } catch (e) {
          setFeedback({ submitted: false, lockStatus: { lock: false } })
        }
      } catch (e) {
        console.error('Error loading dashboard data:', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  const filtered = useMemo(() => {
    return rcs.filter(
      (r) =>
        (statusFilter === 'all' || r.status === statusFilter) &&
        (!search || r.title.toLowerCase().includes(search.toLowerCase()) || r._id.includes(search))
    )
  }, [rcs, statusFilter, search])

  // Summary counts
  const total = rcs.length
  const live = rcs.filter((r) => r.status === 'live').length
  const scheduled = rcs.filter((r) => r.status === 'scheduled').length
  const draft = rcs.filter((r) => r.status === 'draft').length

  // Latest RCs (top 5 by createdAt or scheduledDate desc)
  const latest = [...rcs]
    .sort(
      (a, b) => new Date(b.scheduledDate || b.createdAt) - new Date(a.scheduledDate || a.createdAt)
    )
    .slice(0, 5)

  if (loading) {
    return (
      <div className="w-full p-6 md:p-8 space-y-8">
        <Skeleton className="h-16 w-1/2" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {Array(6)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-24" />
            ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {Array(3)
            .fill(0)
            .map((_, i) => (
              <Skeleton key={i} className="h-80" />
            ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-6 md:p-8 space-y-8">
      {/* Hero Section / Title */}
      <div className="w-full flex flex-col items-start mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-primary mb-1">Admin Dashboard</h1>
        <p className="text-sm text-text-secondary">
          Monitor, manage, and analyze all RCs, user activity, and platform performance in one
          place.
        </p>
      </div>

      {/* KPI Cards - 6 column grid on desktop */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total RCs */}
        <Card className="h-full">
          <CardContent className="h-full bg-gradient-to-br from-success-green/10 to-primary/10 rounded-lg flex flex-col items-center justify-center py-6">
            <div className="text-xs text-text-secondary mb-2 font-semibold uppercase">
              Total RCs
            </div>
            <div className="text-3xl font-bold text-text-primary">
              {total > 0 ? total : 'No data'}
            </div>
          </CardContent>
        </Card>

        {/* Live RCs */}
        <Card className="h-full">
          <CardContent className="h-full bg-gradient-to-br from-primary/10 to-accent-amber/10 rounded-lg flex flex-col items-center justify-center py-6">
            <div className="text-xs text-text-secondary mb-2 font-semibold uppercase">Live RCs</div>
            <div className="text-3xl font-bold text-success-green">{live > 0 ? live : '0'}</div>
          </CardContent>
        </Card>

        {/* Active Users (Today / This Week) */}
        <Card className="h-full">
          <CardContent className="h-full bg-gradient-to-br from-accent-amber/10 to-success-green/10 rounded-lg flex flex-col items-center justify-center py-6">
            <div className="text-xs text-text-secondary mb-2 font-semibold uppercase">
              Active Users
            </div>
            <div className="text-2xl font-bold text-primary">
              {activeUsersToday > 0 ? activeUsersToday : 'No data'}{' '}
              <span className="text-xs text-text-secondary font-normal">today</span>
            </div>
            <div className="text-lg font-semibold text-success-green">
              {activeUsersWeek > 0 ? activeUsersWeek : 'No data'}{' '}
              <span className="text-xs text-text-secondary font-normal">this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Attempts (Today / This Week) */}
        <Card className="h-full">
          <CardContent className="h-full bg-gradient-to-br from-success-green/10 to-primary/10 rounded-lg flex flex-col items-center justify-center py-6">
            <div className="text-xs text-text-secondary mb-2 font-semibold uppercase">Attempts</div>
            <div className="text-2xl font-bold text-accent-amber">
              {attemptsToday > 0 ? attemptsToday : 'No data'}{' '}
              <span className="text-xs text-text-secondary font-normal">today</span>
            </div>
            <div className="text-lg font-semibold text-primary">
              {attemptsWeek > 0 ? attemptsWeek : 'No data'}{' '}
              <span className="text-xs text-text-secondary font-normal">this week</span>
            </div>
          </CardContent>
        </Card>

        {/* Avg Accuracy % */}
        <Card className="h-full">
          <CardContent className="h-full bg-gradient-to-br from-primary/10 to-success-green/10 rounded-lg flex flex-col items-center justify-center py-6">
            <div className="text-xs text-text-secondary mb-2 font-semibold uppercase">
              Avg Accuracy %
            </div>
            <div className="text-3xl font-bold text-success-green">
              {avgAccuracy > 0 ? `${avgAccuracy}%` : 'No data'}
            </div>
          </CardContent>
        </Card>

        {/* Retention Rate */}
        <Card className="h-full">
          <CardContent className="h-full bg-gradient-to-br from-primary/10 to-success-green/10 rounded-lg flex flex-col items-center justify-center py-6">
            <div className="text-xs text-text-secondary mb-2 font-semibold uppercase">
              Retention Rate
            </div>
            <div className="text-3xl font-bold text-primary">
              {typeof analytics.retentionRate === 'number' && analytics.retentionRate >= 0
                ? `${analytics.retentionRate}%`
                : 'No data'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section - 3 column grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Attempts Overview with Bar Chart */}
        <Card>
          <CardHeader>Attempts Overview</CardHeader>
          <CardContent>
            <div className="h-48 mb-4">
              {attemptsByDay.length > 0 && attemptsByDay.some((d) => d.attempts > 0) ? (
                <Bar
                  data={{
                    labels: attemptsByDay.map((d) => d.date),
                    datasets: [
                      {
                        label: 'Attempts',
                        data: attemptsByDay.map((d) => d.attempts),
                        backgroundColor: '#3B82F6',
                        borderRadius: 6,
                        borderSkipped: false,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { display: false },
                      tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#5C6784' } },
                      y: { beginAtZero: true, ticks: { color: '#5C6784' } },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                  No attempts in last 7 days
                </div>
              )}
            </div>
            <div className="grid grid-cols-3 gap-2 text-center text-sm">
              <div>
                <div className="text-lg font-bold">{analytics?.totalAttempts ?? 76}</div>
                <div className="text-xs text-text-secondary">Total</div>
              </div>
              <div>
                <div className="text-lg font-bold">{analytics?.attemptsToday ?? 8}</div>
                <div className="text-xs text-text-secondary">Today</div>
              </div>
              <div>
                <div className="text-lg font-bold">{analytics?.attemptsWeek ?? 54}</div>
                <div className="text-xs text-text-secondary">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Active Learners with Line Chart */}
        <Card>
          <CardHeader>Active Learners</CardHeader>
          <CardContent>
            <div className="h-48 mb-4">
              {activeUsersTrend.length > 0 && activeUsersTrend.some((d) => d.count > 0) ? (
                <Line
                  data={{
                    labels: activeUsersTrend.map((d) => d.date),
                    datasets: [
                      {
                        label: 'Active Users',
                        data: activeUsersTrend.map((d) => d.count),
                        borderColor: '#23A094',
                        backgroundColor: 'rgba(35, 160, 148, 0.12)',
                        tension: 0.4,
                        fill: true,
                        pointBackgroundColor: '#23A094',
                        pointBorderColor: '#FFFFFF',
                        pointBorderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { display: false },
                      tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    },
                    scales: {
                      x: { grid: { display: false }, ticks: { color: '#5C6784' } },
                      y: { beginAtZero: true, ticks: { color: '#5C6784' } },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                  No active users in last 7 days
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-2 text-center text-sm">
              <div>
                <div className="text-lg font-bold">{analytics?.activeUsersToday ?? 9}</div>
                <div className="text-xs text-text-secondary">Active Today</div>
              </div>
              <div>
                <div className="text-lg font-bold">{analytics?.activeUsersWeek ?? 49}</div>
                <div className="text-xs text-text-secondary">This Week</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Learner Feedback & Reviews with Pie Chart */}
        <Card>
          <CardHeader>Learner Feedback & Reviews</CardHeader>
          <CardContent>
            <div className="h-48 mb-4">
              {ratingsDist.length > 0 && ratingsDist.some((v) => v > 0) ? (
                <Pie
                  data={{
                    labels: ['5★', '4★', '3★', '2★', '1★'],
                    datasets: [
                      {
                        label: 'Ratings',
                        data: ratingsDist,
                        backgroundColor: ['#23A094', '#3B82F6', '#F6B26B', '#FB923C', '#E4572E'],
                        borderColor: '#FFFFFF',
                        borderWidth: 2,
                      },
                    ],
                  }}
                  options={{
                    plugins: {
                      legend: { position: 'bottom', labels: { color: '#5C6784', padding: 12 } },
                      tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                    },
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              ) : (
                <div className="flex items-center justify-center h-full text-text-secondary">
                  No ratings submitted yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
        <div className="flex items-center bg-background border border-white/10 rounded px-3 py-2 gap-2 flex-1 sm:flex-initial max-w-md">
          <Search size={16} className="text-text-secondary" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or ID..."
            className="bg-transparent outline-none text-sm w-full"
          />
        </div>

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="bg-background border border-white/10 rounded px-3 py-2 text-sm cursor-pointer"
        >
          <option value="all">All Status</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>

        <div className="flex gap-2 ml-auto">
          <Button onClick={() => nav('/admin/rcs/new')}>Upload New RC</Button>
          <Button variant="outline" onClick={() => nav('/admin/schedule')}>
            Schedule RC
          </Button>
          <Button variant="ghost" onClick={() => nav('/admin/plans')}>
            Plans
          </Button>
          <Button variant="ghost" onClick={() => nav('/admin/transactions')}>
            Transactions
          </Button>
        </div>
      </div>

      {/* Latest RCs Table */}
      <Card>
        <CardHeader className="flex items-center justify-between">
          <span>Latest RCs</span>
          <span className="text-sm text-text-secondary font-normal">
            Showing {filtered.length} of {rcs.length}
          </span>
        </CardHeader>
        <CardContent>
          {filtered.length === 0 ? (
            <div className="py-12 text-center">
              <div className="text-lg font-medium mb-2">No RCs found</div>
              <div className="text-sm text-text-secondary mb-4">
                Try adjusting your filters or upload a new RC.
              </div>
              <div className="flex items-center justify-center gap-2">
                <Button onClick={() => setStatusFilter('all')} variant="outline">
                  Reset Filters
                </Button>
                <Button onClick={() => nav('/admin/rcs/new')}>Upload New RC</Button>
              </div>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-white/5">
                <thead className="bg-card-surface/30">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                      Title & ID
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                      Scheduled Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-text-secondary uppercase">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-semibold text-text-secondary uppercase">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-background divide-y divide-white/5">
                  {latest.map((rc) => (
                    <tr key={rc._id} className="hover:bg-card-surface/20 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium">{rc.title}</div>
                        <div className="text-xs text-text-secondary mt-1">{rc._id}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                        {rc.scheduledDate ? (
                          new Date(rc.scheduledDate).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          })
                        ) : (
                          <span className="text-text-secondary/60">Unscheduled</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <Badge
                          color={
                            rc.status === 'live'
                              ? 'success'
                              : rc.status === 'scheduled'
                              ? 'warning'
                              : 'default'
                          }
                        >
                          {rc.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
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
                            onClick={async () => {
                              setModalRc(rc)
                              setModalOpen(true)
                              setModalRcAnalytics(null)
                              try {
                                const { data } = await api.get(`/admin/rcs/${rc._id}/analytics`)
                                setModalRcAnalytics(data)
                              } catch (e) {
                                setModalRcAnalytics({
                                  error: e?.response?.data?.error || e.message,
                                })
                              }
                            }}
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
          )}
        </CardContent>
      </Card>

      {/* Analytics Modal */}
      <Modal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalRc ? `Analytics · ${modalRc.title}` : 'RC Analytics'}
      >
        {modalRcAnalytics == null ? (
          <div className="py-6">Loading...</div>
        ) : modalRcAnalytics.error ? (
          <div className="py-6 text-error-red">{modalRcAnalytics.error}</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-text-secondary">Coverage</div>
              <div className="text-2xl font-semibold">
                {modalRcAnalytics.coverage != null
                  ? `${Math.round(modalRcAnalytics.coverage)}%`
                  : '—'}
              </div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Attempts · Avg Duration</div>
              <div className="flex items-baseline gap-4">
                <div className="text-lg font-semibold">{modalRcAnalytics.attemptsCount ?? '—'}</div>
                <div className="text-sm text-text-secondary">
                  avg{' '}
                  {modalRcAnalytics.avgDuration != null ? `${modalRcAnalytics.avgDuration}s` : '—'}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Score Trend (7d)</div>
              {modalRcAnalytics.trend && modalRcAnalytics.trend.length > 0 ? (
                <div className="mt-2 h-48">
                  <Line
                    options={{
                      responsive: true,
                      plugins: {
                        legend: { display: false },
                        tooltip: { backgroundColor: 'rgba(0, 0, 0, 0.8)' },
                      },
                      scales: {
                        x: { display: false },
                        y: { display: true, ticks: { color: '#5C6784' } },
                      },
                      maintainAspectRatio: false,
                    }}
                    data={{
                      labels: modalRcAnalytics.trend.map((v, i) => i),
                      datasets: [
                        {
                          data: modalRcAnalytics.trend,
                          borderColor: '#3B82F6',
                          backgroundColor: 'rgba(59, 130, 246, 0.12)',
                          tension: 0.3,
                          pointBackgroundColor: '#3B82F6',
                          pointBorderColor: '#FFFFFF',
                          pointBorderWidth: 2,
                        },
                      ],
                    }}
                  />
                </div>
              ) : (
                <div className="text-sm text-text-secondary mt-2">No trend data</div>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
