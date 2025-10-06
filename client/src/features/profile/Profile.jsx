import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Skeleton } from '../../components/ui/Skeleton'
import { useToast } from '../../components/ui/Toast'
import SubscriptionSelector from '../../components/ui/SubscriptionSelector'

export default function Profile() {
  const [me, setMe] = useState(null)
  const [name, setName] = useState('')
  const [msg, setMsg] = useState('')
  const toast = useToast()
  const [error, setError] = useState('')
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false)

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
      <div className="max-w-lg space-y-4">
        <h1 className="h3">My Profile</h1>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-2/3" />
      </div>
    )

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-GB', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })
      : '-'

  return (
    <div className="max-w-lg min-h-screen flex flex-col space-y-4">
      <h1 className="h3">My Profile</h1>

      {/* Daily Streak */}
      {me?.dailyStreak >= 0 && (
        <div className="flex items-center gap-2 bg-card-surface rounded-xl p-3 text-sm shadow-card">
          <span className="text-text-secondary">Current Streak:</span>
          <span className="font-medium">{me.dailyStreak} day{me.dailyStreak === 1 ? '' : 's'}</span>
        </div>
      )}

      {/* Subscription Card */}
      <div className="p-4 bg-card-surface border border-soft rounded-xl shadow-card space-y-3">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-semibold">Subscription</h2>
          <Link to="/subscriptions">
            <Button size="sm" >
              Manage
            </Button>
          </Link>
        </div>

        <div className="flex justify-between text-sm text-text-secondary">
          <span>Type:</span>
          <span>{me.subscription || 'None'}</span>
        </div>
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Started:</span>
          <span>{formatDate(me.subon)}</span>
        </div>
        <div className="flex justify-between text-sm text-text-secondary">
          <span>Expires:</span>
          <span>{formatDate(me.subexp)}</span>
        </div>
        <div className="text-sm">
          Status:{' '}
          <span
            className={
              me.issubexp
                ? 'text-error-red font-medium'
                : 'text-success-green font-medium'
            }
          >
            {me.issubexp ? 'Expired' : 'Active'}
          </span>
        </div>
      </div>


      {/* Profile Form */}
      <div className="space-y-2">
        <div className="text-sm text-text-secondary">Email</div>
        <div className="text-sm">{me.email}</div>
      </div>

      <div>
        <label className="block text-sm mb-1">Name</label>
        <Input value={name} onChange={(e) => setName(e.target.value)} />
      </div>

      {/* Messages */}
      {msg && <div className="text-success-green text-sm">{msg}</div>}
      {error && (
        <div className="bg-error-red/10 border border-error-red/40 text-error-red text-sm rounded p-2">
          {error}
        </div>
      )}

      <div className="flex items-center gap-3">
        <Button onClick={save}>Save</Button>
        <Link
          to="/profile/change-password"
          className="text-sm underline text-text-secondary"
        >
          Change password
        </Link>
      </div>
    </div>
  )
}
