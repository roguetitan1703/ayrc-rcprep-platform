import { useState } from 'react'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { useToast } from '../../components/ui/Toast'
import { extractErrorMessage } from '../../lib/utils'
import { Input } from '../../components/ui/Input'

export default function ChangePassword(){
  const [current, setCurrent] = useState('')
  const [next, setNext] = useState('')
  const [confirm, setConfirm] = useState('')
  const [msg, setMsg] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const toast = useToast()
  const strong = next.length >= 8

  async function submit(){
    if(next!==confirm){ setError('Passwords do not match'); return }
    try{
      setLoading(true)
      await api.post('/users/me/change-password', { oldPassword: current, newPassword: next })
      setMsg('Password updated')
      setError('')
      setCurrent(''); setNext(''); setConfirm('')
  }catch(e){ const msg = extractErrorMessage(e,'Update failed'); setError(msg); toast.show(msg,{ variant:'error'}) }
    finally{ setLoading(false) }
  }

  return (
    <div className="max-w-md mx-auto bg-card-surface rounded p-6 space-y-4">
      <h1 className="h3">Change Password</h1>
      {msg && <div className="text-success-green text-sm">{msg}</div>}
      {error && <div className="bg-error-red/10 border border-error-red/40 text-error-red text-sm rounded p-2">{error}</div>}
      <div className="space-y-3">
        <Input type="password" value={current} onChange={e=>setCurrent(e.target.value)} placeholder="Current password" />
        <div>
          <Input type="password" value={next} onChange={e=>setNext(e.target.value)} placeholder="New password" />
          <div className={`text-xs mt-1 ${strong ? 'text-success-green' : 'text-text-secondary'}`}>Use at least 8 characters.</div>
        </div>
        <Input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Confirm new password" />
      </div>
      <div>
        <Button disabled={loading || !strong || !current || !confirm} onClick={submit} className="w-full">Update</Button>
      </div>
    </div>
  )
}
