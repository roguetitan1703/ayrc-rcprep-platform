import { useEffect, useState } from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input, PasswordInput } from '../../components/ui/Input'
import AuthShell from '../../components/layout/AuthShell'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { Mail } from 'lucide-react'

export default function Login(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()
  const nav = useNavigate()
  const { user, setUser } = useAuth()
  useEffect(()=>{ if(!user) return; if(user.role==='admin') nav('/admin'); else nav('/dashboard') },[user])

  async function onSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    try{
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.token) localStorage.setItem('arc_token', data.token)
      try {
        const me = await api.get('/users/me')
        setUser(me.data)
        if(me?.data?.role === 'admin') nav('/admin'); else nav('/dashboard')
      } catch { nav('/dashboard') }
    }catch(err){ const msg = extractErrorMessage(err,'Login failed'); setError(msg); toast.show(msg,{ variant:'error'}) }
    finally{ setLoading(false) }
  }

  return (
    <AuthShell title="Welcome back to ARYC">
      <div className="space-y-6">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Email Address</label>
            <Input 
              type="email" 
              value={email} 
              onChange={e=>setEmail(e.target.value)} 
              placeholder="johndoe@gmail.com"
              icon={Mail}
              required 
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Password</label>
            <PasswordInput 
              value={password} 
              onChange={e=>setPassword(e.target.value)} 
              placeholder="••••••••"
              required 
            />
          </div>
          
          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" className="w-4 h-4 rounded border-neutral-grey/30 text-text-primary focus:ring-primary" />
              <span className="text-text-secondary">Remember me</span>
            </label>
            <Link to="/forgot" className="text-text-primary hover:text-primary font-medium transition-colors">Forgot Password</Link>
          </div>
          
          <Button 
            className="w-full h-12 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors" 
            type="submit" 
            disabled={loading}
          >
            {loading ? 'Signing in...' : 'Sign in'}
          </Button>
        </form>
        
        <div className="text-center text-sm text-text-secondary">
          Don't have an account? <Link to="/register" className="text-text-primary font-semibold hover:text-primary">Sign up</Link>
        </div>
      </div>
    </AuthShell>
  )
}