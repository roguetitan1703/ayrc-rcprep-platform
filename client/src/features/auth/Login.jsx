import { useEffect, useState } from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import AuthShell from '../../components/layout/AuthShell'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const nav = useNavigate()
  const { user, setUser } = useAuth() // ensure user is set on login
  useEffect(()=>{ if(!user) return; if(user.role==='admin') nav('/admin'); else nav('/dashboard') },[user])

  async function onSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    try{
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.token) localStorage.setItem('arc_token', data.token)
      // Fetch role to decide redirect; lightweight re-query
      try {
        const me = await api.get('/users/me')
        setUser(me.data) // important to set user in context
        if(me?.data?.role === 'admin') nav('/admin'); else nav('/dashboard')
      } catch { nav('/dashboard') }
  }catch(err){ const msg = extractErrorMessage(err,'Login failed'); setError(msg); toast.show(msg,{ variant:'error'}) }
    finally{ setLoading(false) }
  }

  return (
    <AuthShell title="Sign In" subtitle="Welcome back. Let’s continue your practice.">
      <Card>
        <CardContent>
          {error && <div className="sr-only" role="alert">{error}</div>}
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
              <p className="mt-1 text-xs text-text-secondary">Use 8+ chars with a mix of letters & numbers.</p>
            </div>
            <Button size="lg" type="submit" disabled={loading}>{loading? 'Signing in...' : 'Sign In'}</Button>
          </form>
          <div className="text-sm text-text-secondary mt-3">
            <Link to="/forgot" className="underline">Forgot password?</Link> · <Link to="/register" className="underline">Create account</Link>
          </div>
        </CardContent>
      </Card>
    </AuthShell>
  )
}
