                                                                                                         import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import AuthShell from '../../components/layout/AuthShell'
import { Mail, CheckCircle } from 'lucide-react'
import { useToast } from '../../components/ui/Toast'

export default function Forgot(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const toast = useToast()

  async function onSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    try{
      await api.post('/auth/forgot-password', { email })
      setSent(true)
      toast.show('Check your email for the reset link', { variant: 'success' })
    }catch(err){ setError(err?.response?.data?.error || err.message) 
     toast.show(err?.response?.data?.error || err.message, { variant: 'error' })

    }
    finally{ setLoading(false) }
  }

  return (
    <AuthShell title="Forgot Password?" subtitle="No worries, we'll send you reset instructions" showTerms={false}>
      <div className="space-y-6">
        {sent ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-green/10 mb-4">
              <CheckCircle className="w-8 h-8 text-success-green" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">Check your email</h3>
            <p className="text-sm text-text-secondary mb-6">
              We've sent password reset instructions to <span className="font-medium text-text-primary">{email}</span>
            </p>
            <Link to="/login" className="inline-flex items-center justify-center h-12 px-6 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors">
              Back to Sign in
            </Link>
          </div>
        ) : (
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
            <Button 
              className="w-full h-12 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors" 
              type="submit" 
              disabled={loading}
            >
              {loading? 'Sending...' : 'Send Reset Link'}
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary">← Back to Sign in</Link>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  )
}
