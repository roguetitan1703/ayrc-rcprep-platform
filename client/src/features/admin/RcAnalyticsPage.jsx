import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Line, Bar } from 'react-chartjs-2'
import { Chart as ChartJS, LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, ArcElement, BarElement } from 'chart.js'
ChartJS.register(LineElement, PointElement, LinearScale, CategoryScale, Tooltip, Legend, ArcElement, BarElement)

export default function RcAnalyticsPage() {
    const { id } = useParams()
    const nav = useNavigate()
    const [data, setData] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => {
        (async () => {
            try {
                const { data } = await api.get(`/admin/rcs/${id}/analytics`)
                setData(data)
            } catch (e) { setError(e?.response?.data?.error || e.message) }
            finally { setLoading(false) }
        })()
    }, [id])

    if (loading) return <div className="py-6">Loading...</div>
    if (error) return <div className="py-6 text-error-red">{error}</div>
    if (!data) return <div className="py-6">No data</div>

    const trend = data.trend || []
    const momentum = data.momentum30 || []
    const deviceMix = data.deviceMix || {}
    const deviceTotal = Object.values(deviceMix).reduce((s, n) => s + n, 0) || 1
    const deviceLabels = Object.keys(deviceMix)
    const deviceValues = deviceLabels.map(k => deviceMix[k])

    return (
        <div className="min-h-screen">
            <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-semibold">RC Analytics · {data.title}</h1>
                <div className="flex items-center gap-2">
                    <Button variant="outline" onClick={() => nav('/admin')}>Back</Button>
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>Score Trend (7d)</CardHeader>
                    <CardContent>
                        {trend.length > 0 ? (
                            <Line options={{ plugins: { legend: { display: false } } }} data={{ labels: trend.map((t, i) => t.date || i), datasets: [{ data: trend, borderColor: '#60a5fa', backgroundColor: 'rgba(96,165,250,0.12)', tension: 0.3 }] }} />
                        ) : <div className="text-sm text-text-secondary">No trend data</div>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Device Mix</CardHeader>
                    <CardContent>
                        <div className="flex items-center gap-4">
                            <div className="flex-1">
                                <div className="text-sm text-text-secondary">Web</div>
                                <div className="h-3 bg-white/5 rounded mt-1 overflow-hidden"><div style={{ width: `${((deviceMix.web || 0) / deviceTotal) * 100}%` }} className="h-3 bg-sky-500" /></div>
                                <div className="text-sm mt-2">Mobile</div>
                                <div className="h-3 bg-white/5 rounded mt-1 overflow-hidden"><div style={{ width: `${((deviceMix.mobile || 0) / deviceTotal) * 100}%` }} className="h-3 bg-indigo-500" /></div>
                            </div>
                            <div className="w-28 text-center text-sm">
                                <div className="font-medium">{Math.round(((deviceMix.web || 0) / deviceTotal) * 100)}%</div>
                                <div className="text-text-secondary text-xs">web</div>
                                <div className="font-medium mt-2">{Math.round(((deviceMix.mobile || 0) / deviceTotal) * 100)}%</div>
                                <div className="text-text-secondary text-xs">mobile</div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Attempts & Avg Duration</CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">{data.attemptsCount ?? '—'}</div>
                        <div className="text-sm text-text-secondary">Avg duration: {data.avgDuration != null ? `${data.avgDuration}s` : '—'}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Practice → Official Conversion</CardHeader>
                    <CardContent>
                        <div className="text-lg font-semibold">{data.practiceConversionRate != null ? `${data.practiceConversionRate}%` : '—'}</div>
                        <div className="text-sm text-text-secondary">Users who moved from practice to official</div>
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>30-day Momentum (attempts/day)</CardHeader>
                    <CardContent>
                        {momentum.length > 0 ? (
                            <Line options={{ plugins: { legend: { display: false } } }} data={{ labels: momentum.map(m => m.date), datasets: [{ data: momentum.map(m => m.attempts), borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.12)', tension: 0.2 }] }} />
                        ) : <div className="text-sm text-text-secondary">No momentum data</div>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Time-to-Mastery</CardHeader>
                    <CardContent>
                        {data.timeToMaster ? (
                            <div>
                                <Bar options={{ plugins: { legend: { display: false } } }} data={{ labels: Object.keys(data.timeToMaster.buckets), datasets: [{ data: Object.values(data.timeToMaster.buckets), backgroundColor: ['#60a5fa', '#93c5fd', '#f59e0b', '#fb923c', '#ef4444'] }] }} />
                                <div className="mt-2 text-sm text-text-secondary">Median attempts to mastery: {data.timeToMaster.median ?? '—'}</div>
                            </div>
                        ) : <div className="text-sm text-text-secondary">No mastery data</div>}
                    </CardContent>
                </Card>
            </div>

            <div className="mt-6 grid gap-4 lg:grid-cols-2">
                <Card>
                    <CardHeader>Accuracy by Question Type</CardHeader>
                    <CardContent>
                        {data.accuracyByQType && data.accuracyByQType.length > 0 ? (
                            <ul className="space-y-2">
                                {data.accuracyByQType.map(a => (
                                    <li key={a.qType} className="flex items-center justify-between">
                                        <div className="text-sm">{a.qType}</div>
                                        <div className="text-sm font-medium">{a.accuracy}%</div>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="text-sm text-text-secondary">No data</div>}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>Top Reasons</CardHeader>
                    <CardContent>
                        {data.reasons?.top && data.reasons.top.length > 0 ? (
                            <ul className="space-y-2">
                                {data.reasons.top.map(r => (
                                    <li key={r.reason} className="flex items-center justify-between">
                                        <div className="text-sm">{r.reason}</div>
                                        <div className="text-sm font-medium">{r.count}</div>
                                    </li>
                                ))}
                            </ul>
                        ) : <div className="text-sm text-text-secondary">No reasons recorded</div>}
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
