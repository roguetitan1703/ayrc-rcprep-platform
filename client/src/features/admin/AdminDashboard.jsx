import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { Skeleton } from '../../components/ui/Skeleton'
import { Modal } from '../../components/ui/Modal'
import { Search } from 'lucide-react'
import { Line } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  LineElement,
  PointElement,
  LinearScale,
  CategoryScale,
  Tooltip,
  Legend,
} from 'chart.js'

ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend)

export default function AdminDashboard() {
  const [rcs, setRcs] = useState([])
  const [rcAnalytics, setRcAnalytics] = useState([])
  const [platformAnalytics, setPlatformAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [error, setError] = useState('')
  const [view, setView] = useState('rcs') // 'rcs' | 'analytics'

  const [modalOpen, setModalOpen] = useState(false)
  const [modalRc, setModalRc] = useState(null)
  const [modalRcAnalytics, setModalRcAnalytics] = useState(null)
  const nav = useNavigate()

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/admin/rcs')
        setRcs(data)
        // fetch analytics too
        try {
          const { data: a } = await api.get('/admin/rcs-analytics')
          setRcAnalytics(a)
        } catch (e) { /* non-fatal */ }
        // fetch platform analytics (admin gets platform bundle from /users/me/dashboard)
        try {
          const { data: p } = await api.get('/users/me/dashboard')
          setPlatformAnalytics(p)
        } catch (e) { /* non-fatal */ }
      } catch (e) { setError(e?.response?.data?.error || e.message) }
      finally { setLoading(false) }
    })()
  }, [])

  const filtered = useMemo(() => {
    return rcs.filter(r => (statusFilter === 'all' || r.status === statusFilter) && (!search || r.title.toLowerCase().includes(search.toLowerCase())))
  }, [rcs, statusFilter, search])

  // helper: compute aggregated device mix from rcAnalytics (counts -> fractions)
  const platformDeviceMix = useMemo(() => {
    if (!rcAnalytics || rcAnalytics.length === 0) return null
    const counts = {}
    let total = 0
    rcAnalytics.forEach(r => {
      if (r.deviceMix) {
        Object.entries(r.deviceMix).forEach(([k, v]) => { counts[k] = (counts[k] || 0) + v; total += v })
      }
    })
    if (total === 0) return { web: 0, mobile: 0, unknown: 0 }
    return { web: (counts.web || 0) / total, mobile: (counts.mobile || 0) / total, unknown: (counts.unknown || 0) / total }
  }, [rcAnalytics])

  if (loading) return (
    <div className="min-h-screen flex flex-col py-6 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-semibold">Admin: RCs</h1>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-28" />
          <Skeleton className="h-9 w-36" />
        </div>
      </div>

      {rcAnalytics.length > 0 && (
        <div>
          <h2 className="text-lg font-medium">RC Analytics</h2>
          <div className="grid gap-2 my-2">
            {rcAnalytics.map(a => (
              <Card key={a.id}>
                <CardContent className="p-3 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-medium truncate">{a.title}</div>
                    <div className="text-xs text-text-secondary">Attempts: {a.attemptsCount} · Avg Score: {a.avgScore} · Avg Dur: {a.avgDuration}s</div>
                  </div>
                  <div className="text-xs text-text-secondary text-right flex flex-col items-end gap-1">
                    <div>Coverage: {a.coverage}%</div>
                    <div className="mt-1">Top Reason: {a.reasons.top?.[0]?.reason ?? '—'}</div>
                    {a.trend && (
                      <div className="mt-1 w-24">
                        <Line
                          options={{
                            responsive: true,
                            plugins: { legend: { display: false } },
                            scales: { x: { display: false }, y: { display: false } },
                          }}
                          data={{ labels: a.trend.map((_, i) => i), datasets: [{ data: a.trend, borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.12)', tension: 0.3, pointRadius: 0 }] }}
                        />
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}
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
          <div className="hidden sm:flex items-center bg-background border border-white/5 rounded px-2 py-1">
            <button onClick={() => setView('rcs')} className={`px-3 py-1 text-sm ${view === 'rcs' ? 'font-medium' : 'text-text-secondary'}`}>RCs</button>
            <button onClick={() => setView('analytics')} className={`px-3 py-1 text-sm ${view === 'analytics' ? 'font-medium' : 'text-text-secondary'}`}>Analytics</button>
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

      {view === 'analytics' ? (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {/* Platform analytics summary cards */}
          <Card>
            <CardHeader>Completion Rate</CardHeader>
            <CardContent>
              {/* map to backend: analytics.coverage exists (percent), stats.accuracy exists */}
              <div className="text-3xl font-semibold">{platformAnalytics?.analytics?.coverage != null ? `${Math.round(platformAnalytics.analytics.coverage)}%` : (platformAnalytics?.stats?.accuracy != null ? `${Math.round(platformAnalytics.stats.accuracy)}%` : '—')}</div>
              <div className="text-sm text-text-secondary mt-2">Coverage (percent of untagged wrong answers covered) · Accuracy shown as fallback</div>
              <div className="mt-3">
                <div className="w-full bg-white/5 h-2 rounded overflow-hidden">
                  <div style={{ width: `${platformAnalytics?.analytics?.coverage ?? platformAnalytics?.stats?.accuracy ?? 0}%` }} className="h-2 bg-emerald-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>Device Mix</CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <div className="flex-1">
                  <div className="text-sm text-text-secondary">Web</div>
                  <div className="h-3 bg-white/5 rounded mt-1 overflow-hidden"><div style={{ width: `${(platformDeviceMix?.web ?? 0) * 100}%` }} className="h-3 bg-sky-500" /></div>
                  <div className="text-sm mt-2">Mobile</div>
                  <div className="h-3 bg-white/5 rounded mt-1 overflow-hidden"><div style={{ width: `${(platformDeviceMix?.mobile ?? 0) * 100}%` }} className="h-3 bg-indigo-500" /></div>
                </div>
                <div className="w-28 text-center text-sm">
                  <div className="font-medium">{Math.round((platformDeviceMix?.web ?? 0) * 100)}%</div>
                  <div className="text-text-secondary text-xs">web</div>
                  <div className="font-medium mt-2">{Math.round((platformDeviceMix?.mobile ?? 0) * 100)}%</div>
                  <div className="text-text-secondary text-xs">mobile</div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>Login vs Attempt Gap</CardHeader>
            <CardContent>
              <div className="text-sm text-text-secondary">Rolling consistent days (7d) — proxy for engagement</div>
              <div className="text-2xl font-semibold mt-2">{platformAnalytics?.stats?.rollingConsistentDays != null ? `${platformAnalytics.stats.rollingConsistentDays}d` : '—'}</div>
              {/* small sparkline if trend exists (analytics.trend is array of {date, attempts}) */}
              {platformAnalytics?.analytics?.trend && (
                <div className="mt-3 w-full" style={{ maxWidth: 220 }}>
                  <Line
                    options={{
                      responsive: true,
                      plugins: { legend: { display: false }, tooltip: { enabled: true } },
                      scales: { x: { display: false }, y: { display: false } },
                    }}
                    data={{
                      labels: platformAnalytics.analytics.trend.map(t => t.date),
                      datasets: [{ data: platformAnalytics.analytics.trend.map(t => t.attempts), borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.12)', tension: 0.3, pointRadius: 0 }],
                    }}
                  />
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>Practice → Official Conversion</CardHeader>
            <CardContent>
              {/* platform-level practice conversion is not currently computed in dashboardBundle; show attempts7d as context and fallback to N/A */}
              <div className="text-3xl font-semibold">{platformAnalytics?.analytics?.attempts7d != null ? `${platformAnalytics.analytics.attempts7d}` : '—'}</div>
              <div className="text-sm text-text-secondary mt-2">Attempts (7d) — platform activity; per-RC conversion shown in RC modal</div>
              <div className="mt-3 w-full bg-white/5 h-2 rounded"><div style={{ width: `${Math.min((platformAnalytics?.analytics?.attempts7d ?? 0), 100)}%` }} className="h-2 bg-amber-400" /></div>
            </CardContent>
          </Card>
        </div>
      ) : (
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
                    <Button variant="ghost" onClick={async () => {
                      setModalRc(rc)
                      setModalOpen(true)
                      setModalRcAnalytics(null)
                      try {
                        const { data } = await api.get(`/admin/rcs/${rc._id}/analytics`)
                        // attach trend from rcAnalytics (fetched earlier) when available
                        const trendItem = rcAnalytics.find(x => String(x.id) === String(rc._id))
                        if (trendItem && trendItem.trend) data.trend = trendItem.trend
                        setModalRcAnalytics(data)
                      } catch (e) {
                        setModalRcAnalytics({ error: e?.response?.data?.error || e.message })
                      }
                    }}>View Analytics</Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      )}

      {/* RC Analytics modal */}
      <Modal open={modalOpen} onClose={() => setModalOpen(false)} title={modalRc ? `Analytics · ${modalRc.title}` : 'RC Analytics'} footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={() => { setModalOpen(false); if (modalRc) nav(`/admin/rcs/${modalRc._id}/analytics`) }}>Open full analytics</Button><Button onClick={() => setModalOpen(false)}>Close</Button></div>}>
        {modalRcAnalytics == null ? (
          <div className="py-6">Loading...</div>
        ) : modalRcAnalytics.error ? (
          <div className="py-6 text-error-red">{modalRcAnalytics.error}</div>
        ) : (
          <div className="space-y-4">
            <div>
              <div className="text-sm text-text-secondary">Coverage</div>
              <div className="text-2xl font-semibold">{modalRcAnalytics.coverage != null ? `${Math.round(modalRcAnalytics.coverage)}%` : '—'}</div>
              <div className="mt-2 w-full bg-white/5 h-2 rounded overflow-hidden"><div style={{ width: `${modalRcAnalytics.coverage ?? 0}%` }} className="h-2 bg-emerald-400" /></div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Device Mix</div>
              <div className="flex items-center gap-4 mt-2">
                <div className="flex-1">
                  <div className="text-xs text-text-secondary">Web</div>
                  <div className="h-3 bg-white/5 rounded mt-1 overflow-hidden"><div style={{ width: `${((modalRcAnalytics.deviceMix && Object.values(modalRcAnalytics.deviceMix).reduce((s, n) => s + n, 0)) ? ((modalRcAnalytics.deviceMix.web || 0) / (Object.values(modalRcAnalytics.deviceMix).reduce((s, n) => s + n, 0))) * 100 : 0)}%` }} className="h-3 bg-sky-500" /></div>
                  <div className="text-xs text-text-secondary mt-2">Mobile</div>
                  <div className="h-3 bg-white/5 rounded mt-1 overflow-hidden"><div style={{ width: `${((modalRcAnalytics.deviceMix && Object.values(modalRcAnalytics.deviceMix).reduce((s, n) => s + n, 0)) ? ((modalRcAnalytics.deviceMix.mobile || 0) / (Object.values(modalRcAnalytics.deviceMix).reduce((s, n) => s + n, 0))) * 100 : 0)}%` }} className="h-3 bg-indigo-500" /></div>
                </div>
                <div className="w-28 text-center text-sm">
                  {(() => {
                    const tot = modalRcAnalytics.deviceMix ? Object.values(modalRcAnalytics.deviceMix).reduce((s, n) => s + n, 0) : 0; return (
                      <>
                        <div className="font-medium">{tot ? Math.round(((modalRcAnalytics.deviceMix.web || 0) / tot) * 100) : 0}%</div>
                        <div className="text-text-secondary text-xs">web</div>
                        <div className="font-medium mt-2">{tot ? Math.round(((modalRcAnalytics.deviceMix.mobile || 0) / tot) * 100) : 0}%</div>
                        <div className="text-text-secondary text-xs">mobile</div>
                      </>
                    )
                  })()}
                </div>
              </div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Attempts · Avg Duration</div>
              <div className="flex items-baseline gap-4">
                <div className="text-lg font-semibold">{modalRcAnalytics.attemptsCount ?? '—'}</div>
                <div className="text-sm text-text-secondary">avg {modalRcAnalytics.avgDuration != null ? `${modalRcAnalytics.avgDuration}s` : '—'}</div>
              </div>
            </div>

            <div>
              <div className="text-sm text-text-secondary">Practice → Official Conversion</div>
              <div className="text-lg font-semibold mt-1">{modalRcAnalytics.practiceConversionRate != null ? `${modalRcAnalytics.practiceConversionRate}%` : '—'}</div>
              <div className="mt-2 w-full bg-white/5 h-2 rounded overflow-hidden"><div style={{ width: `${modalRcAnalytics.practiceConversionRate ?? 0}%` }} className="h-2 bg-amber-400" /></div>
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
                    data={{ labels: modalRcAnalytics.trend.map((v, i) => i), datasets: [{ data: modalRcAnalytics.trend, borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.12)', tension: 0.3 }] }}
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

// modal renders above; component ends here
