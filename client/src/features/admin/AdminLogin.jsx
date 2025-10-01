import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { useAuth } from '../../components/auth/AuthContext'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@arc.local')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { setUser } = useAuth() // ensure user/admin is set on login

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.token) localStorage.setItem('arc_token', data.token)
      const { data: me } = await api.get('/users/me')
      setUser(me) // important to set user/admin in context
      if (me?.role !== 'admin') throw new Error('Not an admin')
      nav('/admin')
    } catch (err) {
      setError(err?.response?.data?.error || err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className='min-h-screen'>
    <div className="max-w-md mx-auto py-16">
      <Card>
        <CardHeader>
          <h1 className="text-lg font-semibold">Admin Login</h1>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && <div className="text-error-red text-sm">{error}</div>}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
    </div>
  )
}
