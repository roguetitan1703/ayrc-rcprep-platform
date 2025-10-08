import { useEffect, useState, useRef } from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input, PasswordInput } from '../../components/ui/Input'
import AuthShell from '../../components/layout/AuthShell'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { Mail, User, Phone, MapPin } from 'lucide-react'

export default function Register(){
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [countryCode, setCountryCode] = useState('+91')
  const [phoneNumber, setPhone] = useState('')
  const [location, setLocation] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()
  const toast = useToast()
  const { user } = useAuth()
  const phoneInputRef = useRef(null)
  const phoneGroupRef = useRef(null)
  useEffect(()=>{ if(user) nav('/dashboard') },[user])

  async function onSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    try{
      // Combine country code and local number before sending
      const phone = `${countryCode}${phoneNumber}`
      const payload = { 
        name, 
        email, 
        phoneNumber: phone,
        location: location || null, // Optional field
        password, 
        passwordConfirm: password 
      }
      // debug: ensure payload contains passwordConfirm
      console.log('Register payload ->', payload)
      // include passwordConfirm to satisfy server-side validation
      await api.post('/auth/register', payload)
      const { data } = await api.post('/auth/login', { email, password })
      if (data?.token) localStorage.setItem('arc_token', data.token)
  // show toast on next tick to ensure portal has mounted
  setTimeout(() => toast.show('Account created successfully', { variant: 'success' }), 0)
      nav('/dashboard')
    } catch(err){
      // Try to parse detailed server-side validation errors (mongoose)
      let msg = extractErrorMessage(err,'Registration failed')
      try{
        const srv = err?.response?.data
        if(srv){
          // mongoose validation format: { errors: { field: { message } } }
          if(srv.errors && typeof srv.errors === 'object'){
            const vals = Object.values(srv.errors).map(v => v.message).filter(Boolean)
            if(vals.length) msg = vals.join(', ')
          } else if (srv.error) {
            msg = srv.error
          }
        }
      }catch(e){ console.warn('Error parsing server validation', e) }
      setError(msg)
  // ensure portal is available before showing toast
  setTimeout(() => toast.show(msg, { variant: 'error' }), 0)
    } finally{ setLoading(false) }
  }

  return (
    <AuthShell title="Create Account" subtitle="Start your RC mastery journey today">
      <div className="space-y-6">
        <form className="space-y-5" onSubmit={onSubmit}>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">Full Name</label>
            <Input 
              value={name} 
              onChange={e=>setName(e.target.value)} 
              placeholder="John Doe"
              icon={User}
              required 
            />
          </div>
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
            <label className="block text-sm font-medium text-text-primary mb-2">Phone Number</label>
            <div
              ref={phoneGroupRef}
              tabIndex={0}
              onFocus={() => { phoneInputRef.current?.focus() }}
              onKeyDown={(e)=>{ if(e.key === 'Enter' || e.key === ' ') { e.preventDefault(); phoneInputRef.current?.focus() } }}
              onMouseDown={(e)=>{
                // if clicking the native select, let it handle focus; otherwise forward focus to the number input
                const target = e.target
                if (target && (target.tagName === 'SELECT' || target.closest && target.closest('select'))) return
                // ensure focus after the mouse event
                setTimeout(()=>phoneInputRef.current?.focus(),0)
              }}
              className="w-full rounded-xl border border-neutral-grey/30 bg-card-surface flex items-center overflow-hidden focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 transition-colors">
              <div className="pl-3 pr-2 py-3 text-neutral-grey">
                {/* Dial icon */}
                <Phone className="w-5 h-5" />
              </div>
              <div className="px-3 py-2 text-sm text-text-primary">
                <select
                  value={countryCode}
                  onChange={(e) => setCountryCode(e.target.value)}
                  className="w-full appearance-none bg-transparent outline-none text-text-primary text-sm cursor-pointer border-none focus:outline-none focus:ring-0 focus-visible:outline-none"
                  tabIndex={-1}
                  aria-label="Country code"
                  style={{ WebkitAppearance: 'none', MozAppearance: 'none' }}>
                  <option value="+91">+91</option>
                  <option value="+1">+1</option>
                  <option value="+44">+44</option>
                  <option value="+61">+61</option>
                </select>
              </div>
              <input
                type="tel"
                value={phoneNumber}
                onChange={e=>setPhone(e.target.value)}
                placeholder="98765 43210"
                ref={phoneInputRef}
                className="flex-1 bg-transparent outline-none border-0 text-base py-3 px-4 placeholder:text-neutral-grey focus:outline-none focus:ring-0 focus-visible:outline-none" 
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-text-primary mb-2">
              Location
            </label>
            <Input 
              value={location} 
              onChange={e=>setLocation(e.target.value)} 
              placeholder="City, State or Country"
              icon={MapPin}
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
            <PasswordStrength password={password} />
          </div>
          <Button 
            className="w-full h-12 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors" 
            type="submit" 
            disabled={loading}
          >
            {loading? 'Creating account...' : 'Create Account'}
          </Button>
        </form>
        
        <div className="text-center text-sm text-text-secondary">
          Already have an account? <Link to="/login" className="text-text-primary font-semibold hover:text-primary">Sign in</Link>
        </div>
      </div>
    </AuthShell>
  )
}

function PasswordStrength({ password }){
  if(!password) return <p className="mt-2 text-xs text-text-secondary">Use 8+ characters with letters & numbers</p>
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
    <div className="mt-2">
      <div className="h-1.5 w-full bg-neutral-grey/20 rounded-full overflow-hidden">
        <div className={`h-full rounded-full ${levels[idx].color} transition-all`} style={{ width: `${((idx+1)/levels.length)*100}%` }} />
      </div>
      <p className="mt-1 text-xs text-text-secondary">Strength: {levels[idx].label}</p>
    </div>
  )
}

