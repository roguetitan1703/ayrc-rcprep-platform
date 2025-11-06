import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { useAuth } from '../../components/auth/AuthContext'
import {
  User,
  Mail,
  Calendar,
  Award,
  Crown,
  TrendingUp,
  Target,
  Clock,
  ListChecks,
} from 'lucide-react'

export default function Profile() {
  const [me, setMe] = useState(null)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)
  const toast = useToast()
  const { user } = useAuth()
  const isAdmin = user?.role === 'admin'

  // ✅ 1️⃣ Fetch user info
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)
        const { data } = await api.get('/users/me') // ✅ corrected route
        setMe(data)
        setName(data.name || '')
      } catch (e) {
        setError(e?.response?.data?.error || e.message)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ✅ 2️⃣ Fetch stats (prefer server-side, else compute locally)
  useEffect(() => {
    ;(async () => {
      try {
        setLoading(true)

        // Step 1: try fetching pre-computed stats
        const { data } = await api.get('users/me/stats')

        // If backend already gives totalAttempts etc., use it directly
        if (data && typeof data.totalAttempts === 'number' && typeof data.accuracy === 'number') {
          setStats(data)
          return
        }

        // Step 2: fallback — fetch raw attempts and compute manually
        const { data: attemptsResp } = await api.get('/attempts')
        const attempts = Array.isArray(attemptsResp)
          ? attemptsResp
          : Array.isArray(attemptsResp.attempts)
          ? attemptsResp.attempts
          : []

        if (!attempts.length) {
          setStats({ totalAttempts: 0, accuracy: 0, practiceHours: 0, rollingConsistentDays: 0 })
          return
        }

        // 👉 same calculations as before
        const totalAttempts = attempts.length
        const totalCorrect = attempts.reduce((sum, a) => sum + (a.score || 0), 0)
        const totalQuestions = totalAttempts * 4
        const accuracy = totalQuestions > 0 ? ((totalCorrect / totalQuestions) * 100).toFixed(1) : 0

        const totalMinutes = attempts.reduce((sum, a) => sum + (a.timeTaken || 0), 0)
        const practiceHours = (totalMinutes / 60).toFixed(1)

        const dates = [
          ...new Set(attempts.map((a) => new Date(a.attemptedAt || a.createdAt).toDateString())),
        ]
        const today = new Date()
        let rolling = 0
        for (let i = 0; i < 7; i++) {
          const d = new Date(today)
          d.setDate(today.getDate() - i)
          if (dates.includes(d.toDateString())) rolling++
          else break
        }

        setStats({ totalAttempts, accuracy, practiceHours, rollingConsistentDays: rolling })
      } catch (err) {
        console.error('Failed to fetch stats:', err)
        setError('Unable to load performance data.')
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  // ✅ Save updated name
  async function save() {
    try {
      await api.patch('/users/me', { name })
      setMsg('Updated')
      setTimeout(() => setMsg(''), 1500)
      toast.show('Profile updated', { variant: 'success' })
    } catch (e) {
      setError(e?.response?.data?.error || e.message)
    }
  }

  if (loading) {
    return (
      <Skeleton className="p-6 bg-surface-muted rounded-xl text-gray-400">
        Loading performance overview...
      </Skeleton>
    )
  }

  if (!stats) {
    return (
      <section className="p-6 bg-surface-muted rounded-xl text-gray-400">
        No performance data available
      </section>
    )
  }

  const { totalAttempts, accuracy, practiceHours, rollingConsistentDays } = stats
  // console.log(stats)
  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Not set'

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
        <p className="text-text-secondary mt-1">Manage your account and track your progress</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left section */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-white border border-border-soft">
            <CardHeader className="p-4 border-b border-border-soft flex items-center gap-4">
              <User className="h-8 w-8 text-[#D33F49]" />
              <h2 className="text-xl font-bold">Account Information</h2>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              <div>
                <label>Email</label>
                <div className="px-4 py-3 bg-gray-100 rounded-lg">{me?.email}</div>
              </div>
              <div>
                <label>Name</label>
                <Input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                />
              </div>
              <div className="flex items-center gap-3 pt-4 border-t">
                <Button onClick={save} className="bg-[#D33F49] text-white">
                  Save Changes
                </Button>
                <Link
                  to="/profile/change-password"
                  className="text-sm font-semibold text-info-blue"
                >
                  Change Password →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Stats */}
          {!isAdmin && (
            <Card className="bg-white border border-border-soft">
              <CardHeader className="p-6 border-b">
                <h2 className="text-lg font-semibold">Performance Overview</h2>
                <p className="text-sm text-gray-500">Your practice statistics at a glance</p>
              </CardHeader>
              <CardContent className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                  icon={<ListChecks className="w-5 h-5 text-blue-400" />}
                  label="Attempts"
                  value={totalAttempts}
                />
                <StatCard
                  icon={<Target className="w-5 h-5 text-green-400" />}
                  label="Accuracy"
                  value={`${accuracy}%`}
                />
                <StatCard
                  icon={<Clock className="w-5 h-5 text-yellow-400" />}
                  label="Hours"
                  value={practiceHours}
                />
                <StatCard
                  icon={<TrendingUp className="w-5 h-5 text-pink-400" />}
                  label="7-Day Streak"
                  value={rollingConsistentDays}
                />
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right section */}
        <div>
          {!isAdmin && me?.dailyStreak >= 0 && (
            <Card className="bg-gradient-to-br from-[#F6B26B]/20 to-[#F6B26B]/5 border border-[#F6B26B]/30">
              <CardContent className="p-6">
                <div className="text-sm font-semibold">Current Streak</div>
                <div className="text-4xl font-bold">{me.dailyStreak} days</div>
              </CardContent>
            </Card>
          )}
          {!isAdmin && (
            <Card className="bg-white border border-border-soft mt-4">
              <CardHeader className="p-6 border-b flex justify-between">
                <div className="flex items-center gap-3">
                  <Crown className="h-5 w-5 text-[#D33F49]" />
                  <h2 className="text-lg font-semibold">Subscription</h2>
                </div>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex justify-between border-b pb-2">
                  <span>Plan</span>
                  <span className="font-bold">{me.subscription || 'Free'}</span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Status</span>
                  <span className={`font-bold ${me.issubexp ? 'text-red-500' : 'text-green-500'}`}>
                    {me.issubexp ? 'Expired' : 'Active'}
                  </span>
                </div>
                <div className="flex justify-between border-b pb-2">
                  <span>Started</span>
                  <span>{formatDate(me.subon)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Expires</span>
                  <span>{formatDate(me.subexp)}</span>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ icon, label, value }) {
  return (
    <div className="p-8 bg-surface-muted/30 border border-border-soft rounded-xl hover:shadow-md hover:border-info-blue/40 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer flex items-center justify-between mb-3 gap-2">
      {icon}
      <div className="text-2xl font-bold text-text-primary mb-1 group-hover:text-info-blue transition-colors duration-200">
        {value}
      </div>
      <div className="text-xs text-text-secondary font-medium">{label}</div>
    </div>
  )
}
