import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import AuthShell from '../../components/layout/AuthShell'

export default function Forgot(){
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function onSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    try{
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    }catch(err){ setError(err?.response?.data?.error || err.message) }
    finally{ setLoading(false) }
  }

  return (
    <AuthShell title="Forgot Password" subtitle="Enter your email to receive reset instructions.">
      <Card>
        <CardContent>
          {sent? <div className="text-success-green text-sm">Check your email for reset steps (mocked).</div> : (
            <form className="space-y-5" onSubmit={onSubmit}>
              {error && <div className="text-error-red text-sm mb-2">{error}</div>}
              <div>
                <label className="block text-sm mb-1">Email</label>
                <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
              </div>
              <Button size="lg" type="submit" disabled={loading}>{loading? 'Sending...' : 'Send Reset Link'}</Button>
            </form>
          )}
        </CardContent>
      </Card>
    </AuthShell>
  )
}
