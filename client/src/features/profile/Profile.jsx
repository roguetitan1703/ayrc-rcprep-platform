import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import { User, Mail, Calendar, Award, Crown, TrendingUp, Target, Clock } from 'lucide-react'

export default function Profile() {
  const [me, setMe] = useState(null)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const toast = useToast()
  const [error, setError] = useState('')

  useEffect(() => {
    (async () => {
      try {
        const { data } = await api.get('/users/me')
        setMe(data)
        setName(data.name || '')
      } catch (e) {
        setError(e?.response?.data?.error || e.message)
      }
    })()
  }, [])

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

  if (!me)
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
          <p className="text-text-secondary mt-1">Manage your account and track your progress</p>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
          <div>
            <Skeleton className="h-64 w-full rounded-xl" />
          </div>
        </div>
      </div>
    )

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      : 'Not set'

  // Static performance stats (would come from API in production)
  const stats = [
    { label: 'Total Attempts', value: '24', icon: Target, color: '#3B82F6' },
    { label: 'Avg Accuracy', value: '68%', icon: TrendingUp, color: '#23A094' },
    { label: 'Practice Hours', value: '12.5', icon: Clock, color: '#F6B26B' },
    { label: 'Streak Record', value: `${me.dailyStreak || 0}`, icon: Award, color: '#D33F49' }
  ]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">My Profile</h1>
        <p className="text-text-secondary mt-1">Manage your account and track your progress</p>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Info */}
        <div className="lg:col-span-2 space-y-6">
          {/* User Info Card */}
          <Card className="bg-white border border-border-soft hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-4 border-b border-border-soft">
              <div className="flex items-center gap-4">
                <div className="bg-gradient-to-br from-[#D33F49] to-[#E4572E] p-4 rounded-2xl shadow-md">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary">Account Information</h2>
                  <p className="text-sm text-text-secondary mt-0.5">Your personal details</p>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 space-y-4">
              {/* Email - Read Only */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <Mail className="h-4 w-4 text-text-secondary" />
                  Email Address
                </label>
                <div className="px-4 py-3 bg-surface-muted/50 border border-border-soft rounded-lg text-sm text-text-secondary">
                  {me.email}
                </div>
              </div>

              {/* Name - Editable */}
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-sm font-semibold text-text-primary">
                  <User className="h-4 w-4 text-text-secondary" />
                  Display Name
                </label>
                <Input 
                  value={name} 
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="border-border-soft focus:border-[#3B82F6] focus:ring-[#3B82F6]/20"
                />
              </div>

              {/* Messages */}
              {msg && (
                <div className="bg-[#23A094]/10 border border-[#23A094]/40 text-[#23A094] text-sm rounded-lg p-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#23A094]"></div>
                  {msg}
                </div>
              )}
              {error && (
                <div className="bg-[#E4572E]/10 border border-[#E4572E]/40 text-[#E4572E] text-sm rounded-lg p-3 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#E4572E]"></div>
                  {error}
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-4 border-t border-border-soft">
                <Button 
                  onClick={save}
                  className="bg-[#D33F49] hover:bg-[#B83441] text-white font-semibold px-6"
                >
                  Save Changes
                </Button>
                <Link
                  to="/profile/change-password"
                  className="text-sm font-semibold text-[#3B82F6] hover:text-[#D33F49] transition-colors"
                >
                  Change Password →
                </Link>
              </div>
            </CardContent>
          </Card>

          {/* Performance Stats Grid */}
          <Card className="bg-white border border-border-soft hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-6 border-b border-border-soft">
              <h2 className="text-lg font-semibold text-text-primary">Performance Overview</h2>
              <p className="text-sm text-text-secondary mt-1">Your practice statistics at a glance</p>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {stats.map((stat, idx) => {
                  const Icon = stat.icon
                  return (
                    <div
                      key={idx}
                      className="p-4 bg-surface-muted/30 border border-border-soft rounded-xl hover:shadow-md hover:border-[#3B82F6]/40 hover:-translate-y-0.5 transition-all duration-200 group cursor-pointer"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div
                          className="p-2 rounded-lg group-hover:scale-110 transition-transform duration-200"
                          style={{ backgroundColor: `${stat.color}15` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: stat.color }} />
                        </div>
                      </div>
                      <div className="text-2xl font-bold text-text-primary mb-1 group-hover:text-[#3B82F6] transition-colors duration-200">
                        {stat.value}
                      </div>
                      <div className="text-xs text-text-secondary font-medium">
                        {stat.label}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Subscription & Streak */}
        <div className="space-y-6">
          {/* Daily Streak Card */}
          {me?.dailyStreak >= 0 && (
            <Card className="bg-gradient-to-br from-[#F6B26B]/20 to-[#F6B26B]/5 border border-[#F6B26B]/30 hover:shadow-lg transition-shadow duration-200">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="text-sm font-semibold text-text-primary mb-1">Current Streak</div>
                    <div className="text-4xl font-bold text-text-primary">
                      {me.dailyStreak}
                      <span className="text-xl text-text-secondary ml-1">
                        {me.dailyStreak === 1 ? 'day' : 'days'}
                      </span>
                    </div>
                  </div>
                  <div className="bg-[#F6B26B] p-3 rounded-xl shadow-md">
                    <Award className="h-6 w-6 text-white" />
                  </div>
                </div>
                <div className="text-xs text-text-secondary font-medium">
                  Keep practicing daily to maintain your streak! 🔥
                </div>
              </CardContent>
            </Card>
          )}

          {/* Subscription Card */}
          <Card className="bg-white border border-border-soft hover:shadow-lg transition-shadow duration-200">
            <CardHeader className="p-6 border-b border-border-soft">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#D33F49]/10 p-2 rounded-lg">
                    <Crown className="h-5 w-5 text-[#D33F49]" />
                  </div>
                  <h2 className="text-lg font-semibold text-text-primary">Subscription</h2>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              {/* Plan Type */}
              <div className="flex items-center justify-between py-3 border-b border-border-soft">
                <span className="text-sm text-text-secondary font-medium">Plan</span>
                <span className="text-sm font-bold text-text-primary uppercase tracking-wide">
                  {me.subscription || 'Free'}
                </span>
              </div>

              {/* Status */}
              <div className="flex items-center justify-between py-3 border-b border-border-soft">
                <span className="text-sm text-text-secondary font-medium">Status</span>
                <span
                  className={`text-sm font-bold ${
                    me.issubexp ? 'text-[#E4572E]' : 'text-[#23A094]'
                  }`}
                >
                  {me.issubexp ? 'Expired' : 'Active'}
                </span>
              </div>

              {/* Started */}
              <div className="flex items-center justify-between py-3 border-b border-border-soft">
                <span className="text-sm text-text-secondary font-medium">Started</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                  <span className="text-sm text-text-primary">{formatDate(me.subon)}</span>
                </div>
              </div>

              {/* Expires */}
              <div className="flex items-center justify-between py-3">
                <span className="text-sm text-text-secondary font-medium">Expires</span>
                <div className="flex items-center gap-2">
                  <Calendar className="h-3.5 w-3.5 text-text-secondary" />
                  <span className="text-sm text-text-primary">{formatDate(me.subexp)}</span>
                </div>
              </div>

              {/* Manage Button */}
              <div className="pt-4">
                <Link to="/subscriptions" className="block">
                  <Button className="w-full bg-[#3B82F6] hover:bg-[#2563EB] text-white font-semibold">
                    Manage Subscription
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
