import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input, PasswordInput } from '../../components/ui/Input'
import { useAuth } from '../../components/auth/AuthContext'
import AuthShell from '../../components/layout/AuthShell'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { Mail, Shield } from 'lucide-react'

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@arc.local')
  const [password, setPassword] = useState('admin123')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()
  const { setUser } = useAuth()
  const toast = useToast()

  async function onSubmit(e) {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.token) localStorage.setItem('arc_token', data.token)
      const { data: me } = await api.get('/users/me')
      setUser(me)
      if (me?.role !== 'admin') throw new Error('Not an admin account')
      nav('/admin')
    } catch (err) {
      const msg = extractErrorMessage(err, 'Admin login failed')
      setError(msg)
      toast.show(msg, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell
      title="Welcome back to ARYC Admin"
      showTerms={false}
    >
      <div className="space-y-6">
        <div className="bg-primary/10 border border-primary/20 rounded-lg p-3 flex items-start gap-3">
          <Shield className="w-5 h-5 text-primary shrink-0 mt-0.5" />
          <p className="text-xs text-text-secondary">
            This area is restricted to authorized administrators only. All access is monitored and logged.
          </p>
        </div>
        
        
        
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Admin Email</label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@aryc.local"
              icon={Mail}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Admin Password</label>
            <PasswordInput
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <Button 
            className="w-full h-12 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Authenticating...' : 'Sign In as Admin'}
          </Button>
        </form>
      </div>
    </AuthShell>
  )
}
