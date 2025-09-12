import { useEffect, useState } from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import AuthShell from '../../components/layout/AuthShell'
import { OnboardingModal } from '../onboarding/OnboardingModal'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phoneNumber, setPhone] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()
  const [showOnboarding,setShowOnboarding] = useState(false)
  const toast = useToast()
  const { user } = useAuth()
  useEffect(()=>{ if(user) nav('/dashboard') },[user])

  async function onSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    try{
      await api.post('/auth/register', { name, email, phoneNumber, password })
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.token) localStorage.setItem('arc_token', data.token)
      if(!localStorage.getItem('onboardingComplete')){
        setShowOnboarding(true)
        localStorage.setItem('onboardingComplete','1')
      } else {
        nav('/dashboard')
      }
  }catch(err){ const msg = extractErrorMessage(err,'Registration failed'); setError(msg); toast.show(msg,{ variant:'error'}) }
    finally{ setLoading(false) }
  }

  return (
    <AuthShell title="Create Account" subtitle="Set up your ARC profile to start daily RC practice.">
      <Card>
        <CardContent>
          {error && <div className="sr-only" role="alert">{error}</div>}
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm mb-1">Name</label>
              <Input value={name} onChange={e=>setName(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">Phone (optional)</label>
              <Input value={phoneNumber} onChange={e=>setPhone(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm mb-1">Password</label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
              <PasswordStrength password={password} />
            </div>
            <Button size="lg" type="submit" disabled={loading}>{loading? 'Creating...' : 'Create Account'}</Button>
          </form>
          <div className="text-sm text-text-secondary mt-3">
            <Link to="/login" className="underline">Already have an account? Sign in</Link>
          </div>
        </CardContent>
      </Card>
      <OnboardingModal open={showOnboarding} onClose={()=> { setShowOnboarding(false); nav('/dashboard') }} />
    </AuthShell>
  )
}

function PasswordStrength({ password }){
  if(!password) return <p className="mt-1 text-xs text-text-secondary">Use 8+ chars with letters & numbers.</p>
  const lengthScore = password.length >= 12 ? 2 : password.length >= 8 ? 1 : 0
  const varietyScore = /[A-Z]/.test(password) + /[0-9]/.test(password) + /[^A-Za-z0-9]/.test(password)
  const score = lengthScore + varietyScore
  const levels = [
    { label: 'Weak', color: 'bg-error-red' },
    { label: 'Fair', color: 'bg-accent-amber' },
    { label: 'Good', color: 'bg-success-green' },
    { label: 'Strong', color: 'bg-success-green' },
    { label: 'Excellent', color: 'bg-success-green' },
  ]
  const idx = Math.min(levels.length-1, score)
  return (
    <div className="mt-1">
      <div className="h-1 w-full bg-white/10 rounded">
        <div className={`h-1 rounded ${levels[idx].color}`} style={{ width: `${((idx+1)/levels.length)*100}%` }} />
      </div>
      <p className="mt-1 text-xs text-text-secondary">Strength: {levels[idx].label}</p>
    </div>
  )
}

