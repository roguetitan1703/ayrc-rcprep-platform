import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardHeader } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'

export default function Reset(){
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const nav = useNavigate()

  async function onSubmit(e){
    e.preventDefault(); setLoading(true); setError('')
    try{
      await api.post('/auth/reset-password', { email, newPassword: password })
      nav('/login')
    }catch(err){ setError(err?.response?.data?.error || err.message) }
    finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto py-16">
      <Card>
        <CardHeader><h1 className="text-lg font-semibold">Reset Password</h1></CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={onSubmit}>
            {error && <div className="text-error-red text-sm mb-2">{error}</div>}
            <div>
              <label className="block text-sm mb-1">Email</label>
              <Input type="email" value={email} onChange={e=>setEmail(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm mb-1">New Password</label>
              <Input type="password" value={password} onChange={e=>setPassword(e.target.value)} required />
            </div>
            <Button type="submit" disabled={loading}>{loading? 'Resetting...' : 'Reset Password'}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
