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
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Modal } from '../../components/ui/Modal'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

export default function AdminDashboard() {
  const [rcs, setRcs] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [modalOpen, setModalOpen] = useState(false)
  const [modalRc, setModalRc] = useState(null)
  const [modalRcAnalytics, setModalRcAnalytics] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    ;(async () => {
      try {
        const { data } = await api.get('/admin/rcs')
        setRcs(data)
        const { data: analyticsData } = await api.get('/users/me/dashboard')
        setAnalytics(analyticsData.analytics || {})
      } catch (e) {
        // handle error
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

  // Latest RCs (top 3 by createdAt or scheduledDate desc)
  const latest = [...rcs]
    .sort(
      (a, b) => new Date(b.scheduledDate || b.createdAt) - new Date(a.scheduledDate || a.createdAt)
    )
    .slice(0, 3)

  return (
    <div className="mx-auto p-4 space-y-8">
      {/* Hero Section / Title */}
      <div className="mb-8 text-center">
        <h1 className="text-3xl sm:text-4xl font-extrabold text-primary mb-2">
          ARC Admin Dashboard
        </h1>
        <p className="text-lg text-text-secondary max-w-2xl mx-auto">
          Welcome to the ARC Reading Comprehension Platform Admin Panel.
          <br />
          <span className="font-semibold text-accent-amber">Monitor, manage, and analyze</span> all
          RCs, user activity, and platform performance in one place.
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {/* Total RCs */}
        <Card>
          <CardContent className="bg-gradient-to-r from-success-green/10 to-primary/10 rounded-lg flex flex-col items-center justify-center py-4">
            <div className="text-xs text-text-secondary mb-1">Total RCs</div>
            <div className="text-2xl font-bold">{total}</div>
            <div className="text-xs text-success-green flex items-center gap-1 mt-1">
              ▲ +5% this week
            </div>
          </CardContent>
        </Card>
        {/* Live RCs */}
        <Card>
          <CardContent className="bg-gradient-to-r from-primary/10 to-accent-amber/10 rounded-lg flex flex-col items-center justify-center py-4">
            <div className="text-xs text-text-secondary mb-1">Live RCs</div>
            <div className="text-2xl font-bold text-success-green">{live}</div>
            <div className="text-xs text-success-green flex items-center gap-1 mt-1">
              ▲ +2% this week
            </div>
          </CardContent>
        </Card>
        {/* Active Users */}
        <Card>
          <CardContent className="bg-gradient-to-r from-accent-amber/10 to-success-green/10 rounded-lg flex flex-col items-center justify-center py-4">
            <div className="text-xs text-text-secondary mb-1">Active Users</div>
            <div className="text-2xl font-bold text-primary">
              {analytics?.activeUsersToday ?? 9}
            </div>
            <div className="text-xs text-error-red flex items-center gap-1 mt-1">▼ −3% users</div>
          </CardContent>
        </Card>
        {/* Attempts Today */}
        <Card>
          <CardContent className="bg-gradient-to-r from-success-green/10 to-primary/10 rounded-lg flex flex-col items-center justify-center py-4">
            <div className="text-xs text-text-secondary mb-1">Attempts Today</div>
            <div className="text-2xl font-bold text-accent-amber">
              {analytics?.attemptsToday ?? 8}
            </div>
            <div className="text-xs text-success-green flex items-center gap-1 mt-1">
              ▲ +4% today
            </div>
          </CardContent>
        </Card>
        {/* Avg Accuracy % */}
        <Card>
          <CardContent className="bg-gradient-to-r from-primary/10 to-success-green/10 rounded-lg flex flex-col items-center justify-center py-4">
            <div className="text-xs text-text-secondary mb-1">Avg Accuracy %</div>
            <div className="text-2xl font-bold text-success-green">
              {analytics?.avgAccuracy ?? 82}%
            </div>
            <div className="text-xs text-success-green flex items-center gap-1 mt-1">
              ▲ +1.2% this week
            </div>
          </CardContent>
        </Card>
        {/* Retention Rate */}
        <Card>
          <CardContent className="bg-gradient-to-r from-accent-amber/10 to-primary/10 rounded-lg flex flex-col items-center justify-center py-4">
            <div className="text-xs text-text-secondary mb-1">Retention Rate</div>
            <div className="text-2xl font-bold text-primary">{analytics?.retentionRate ?? 67}%</div>
            <div className="text-xs text-success-green flex items-center gap-1 mt-1">
              ▲ +0.8% this week
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Attempts Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
        {/* Attempts Overview with Bar Chart */}
        <Card>
          <CardHeader>Attempts Overview</CardHeader>
          <CardContent>
            <div className="mb-2">
              <Bar
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Attempts',
                      data: analytics?.attemptsByDay ?? [12, 19, 7, 15, 10, 5, 8],
                      backgroundColor: 'rgba(96,165,250,0.7)',
                      borderRadius: 6,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                height={120}
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-lg font-bold">{analytics?.totalAttempts ?? 76}</div>
              <div className="text-xs text-text-secondary">Total Attempts</div>
              <div className="text-lg font-bold">{analytics?.attemptsToday ?? 8}</div>
              <div className="text-xs text-text-secondary">Attempts Today</div>
              <div className="text-lg font-bold">{analytics?.attemptsWeek ?? 54}</div>
              <div className="text-xs text-text-secondary">Attempts This Week</div>
            </div>
          </CardContent>
        </Card>
        {/* Active Learners with Line Chart */}
        <Card>
          <CardHeader>Active Learners</CardHeader>
          <CardContent>
            <div className="mb-2">
              <Line
                data={{
                  labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
                  datasets: [
                    {
                      label: 'Active Users',
                      data: analytics?.activeUsersTrend ?? [5, 8, 6, 10, 7, 4, 9],
                      borderColor: '#34d399',
                      backgroundColor: 'rgba(52,211,153,0.12)',
                      tension: 0.4,
                      fill: true,
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { display: false } },
                  scales: { x: { grid: { display: false } }, y: { beginAtZero: true } },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                height={120}
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-lg font-bold">{analytics?.activeUsersToday ?? 9}</div>
              <div className="text-xs text-text-secondary">Active Today</div>
              <div className="text-lg font-bold">{analytics?.activeUsersWeek ?? 49}</div>
              <div className="text-xs text-text-secondary">Active This Week</div>
            </div>
          </CardContent>
        </Card>
        {/* Learner Feedback & Reviews with Pie Chart */}
        <Card>
          <CardHeader>Learner Feedback & Reviews</CardHeader>
          <CardContent>
            <div className="mb-2">
              <Pie
                data={{
                  labels: ['5★', '4★', '3★', '2★', '1★'],
                  datasets: [
                    {
                      label: 'Ratings',
                      data: analytics?.ratingsDist ?? [12, 7, 3, 2, 1],
                      backgroundColor: ['#fbbf24', '#fde68a', '#a7f3d0', '#fca5a5', '#d1d5db'],
                    },
                  ],
                }}
                options={{
                  plugins: { legend: { position: 'bottom' } },
                  responsive: true,
                  maintainAspectRatio: false,
                }}
                height={120}
              />
            </div>
            <div className="flex flex-col gap-2 mt-2">
              <div className="text-xs text-text-secondary">Top-rated RCs:</div>
              <ul className="list-disc ml-4 text-sm">
                {(
                  analytics?.topRatedRCs ?? [
                    { title: 'RC1', rating: 5 },
                    { title: 'RC2', rating: 4.8 },
                  ]
                ).map((rc, i) => (
                  <li key={i}>
                    {rc.title} <span className="text-accent-amber">★ {rc.rating}</span>
                  </li>
                ))}
              </ul>
              <div className="text-xs text-text-secondary mt-2">Common Issues/Suggestions:</div>
              <ul className="list-disc ml-4 text-sm">
                {(analytics?.commonIssues ?? ['Typo in RC2', 'Unclear instructions in RC5']).map(
                  (issue, i) => (
                    <li key={i}>{issue}</li>
                  )
                )}
              </ul>
              <div className="text-xs text-text-secondary mt-2">Word Cloud (comments):</div>
              <div className="bg-background border border-white/10 rounded p-2 text-xs text-text-secondary">
                [Word cloud visualization here]
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-3 items-center">
        <Button onClick={() => nav('/admin/rcs/new')}>Upload New RC</Button>
        <Button variant="outline" onClick={() => nav('/admin/schedule')}>
          Schedule RC
        </Button>
        <input
          className="bg-background border border-white/10 rounded px-2 py-1 text-sm ml-2"
          placeholder="Search by title or ID..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          className="bg-background border border-white/10 rounded px-2 py-1 text-sm"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">All</option>
          <option value="draft">Draft</option>
          <option value="scheduled">Scheduled</option>
          <option value="live">Live</option>
          <option value="archived">Archived</option>
        </select>
      </div>

      {/* Latest RCs Table */}
      <Card>
        <CardHeader>Latest RCs</CardHeader>
        <CardContent>
          <table className="min-w-full divide-y divide-white/5">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary uppercase">
                  Title
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary uppercase">
                  Status
                </th>
                <th className="px-4 py-2 text-left text-xs font-semibold text-text-secondary uppercase">
                  Scheduled Date
                </th>
                <th className="px-4 py-2 text-right text-xs font-semibold text-text-secondary uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-background divide-y divide-white/5">
              {latest.map((rc) => (
                <tr key={rc._id}>
                  <td className="px-4 py-2 font-medium">{rc.title}</td>
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
                    {rc.scheduledDate ? (
                      new Date(rc.scheduledDate).toLocaleDateString()
                    ) : (
                      <span className="text-text-secondary/60">Unscheduled</span>
                    )}
                  </td>
                  <td className="px-4 py-2 text-right">
                    <Button size="sm" variant="ghost" onClick={() => nav(`/admin/rcs/${rc._id}`)}>
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
                      onClick={async () => {
                        setModalRc(rc)
                        setModalOpen(true)
                        setModalRcAnalytics(null)
                        try {
                          const { data } = await api.get(`/admin/rcs/${rc._id}/analytics`)
                          setModalRcAnalytics(data)
                        } catch (e) {
                          setModalRcAnalytics({ error: e?.response?.data?.error || e.message })
                        }
                      }}
                    >
                      View Analytics
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
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
              <div className="text-sm text-text-secondary">Device Mix</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <div className="text-xs text-text-secondary">Web</div>
                  <div className="h-3 bg-white/5 rounded mt-1 overflow-hidden">
                    <div
                      style={{
                        width: `${
                          modalRcAnalytics.deviceMix &&
                          Object.values(modalRcAnalytics.deviceMix).reduce((s, n) => s + n, 0)
                            ? ((modalRcAnalytics.deviceMix.web || 0) /
                                Object.values(modalRcAnalytics.deviceMix).reduce(
                                  (s, n) => s + n,
                                  0
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                      className="h-3 bg-sky-500"
                    />
                  </div>
                  <div className="text-xs text-text-secondary mt-2">Mobile</div>
                  <div className="h-3 bg-white/5 rounded mt-1 overflow-hidden">
                    <div
                      style={{
                        width: `${
                          modalRcAnalytics.deviceMix &&
                          Object.values(modalRcAnalytics.deviceMix).reduce((s, n) => s + n, 0)
                            ? ((modalRcAnalytics.deviceMix.mobile || 0) /
                                Object.values(modalRcAnalytics.deviceMix).reduce(
                                  (s, n) => s + n,
                                  0
                                )) *
                              100
                            : 0
                        }%`,
                      }}
                      className="h-3 bg-indigo-500"
                    />
                  </div>
                </div>
                <div className="w-28 text-center text-sm">
                  {(() => {
                    const tot = modalRcAnalytics.deviceMix
                      ? Object.values(modalRcAnalytics.deviceMix).reduce((s, n) => s + n, 0)
                      : 0
                    return (
                      <>
                        <div className="font-medium">
                          {tot
                            ? Math.round(((modalRcAnalytics.deviceMix.web || 0) / tot) * 100)
                            : 0}
                          %
                        </div>
                        <div className="text-text-secondary text-xs">web</div>
                        <div className="font-medium mt-2">
                          {tot
                            ? Math.round(((modalRcAnalytics.deviceMix.mobile || 0) / tot) * 100)
                            : 0}
                          %
                        </div>
                        <div className="text-text-secondary text-xs">mobile</div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>
            <div>
              <div className="text-sm text-text-secondary">Score Trend (7d)</div>
              {modalRcAnalytics.trend && modalRcAnalytics.trend.length > 0 ? (
                <div className="mt-2">
                  <Line
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false } },
                      scales: { x: { display: false }, y: { display: true } },
                    }}
                    data={{
                      labels: modalRcAnalytics.trend.map((v, i) => i),
                      datasets: [
                        {
                          data: modalRcAnalytics.trend,
                          borderColor: '#60a5fa',
                          backgroundColor: 'rgba(96,165,250,0.12)',
                          tension: 0.3,
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
