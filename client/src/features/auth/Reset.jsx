import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { api } from '../../lib/api'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import AuthShell from '../../components/layout/AuthShell'
import { Lock, CheckCircle } from 'lucide-react'
import { useToast } from '../../components/ui/Toast'

export default function Reset() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const toast = useToast()
  const nav = useNavigate()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!token) {
      toast.show('Missing or invalid reset token', { variant: 'error' })
      return
    }
    if (password !== confirmPassword) {
      toast.show('Passwords do not match', { variant: 'error' })
      return
    }
    if (password.length < 8) {
      toast.show('Password must be at least 8 characters long', { variant: 'error' })
      return
    }

    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setSuccess(true)
      toast.show('Password reset successfully', { variant: 'success' })
    } catch (err) {
      // setError(err?.response?.data?.error || err.message)
      toast.show(err?.response?.data?.error || err.message, { variant: 'error' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthShell title="Reset Password" subtitle="Enter your new password below" showTerms={false}>
      <div className="space-y-6">
        {success ? (
          <div className="text-center py-8">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success-green/10 mb-4">
              <CheckCircle className="w-8 h-8 text-success-green" />
            </div>
            <h3 className="text-xl font-semibold text-text-primary mb-2">
              Password reset successful
            </h3>
            <p className="text-sm text-text-secondary mb-6">
              You can now sign in using your new password.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center justify-center h-12 px-6 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
            >
              Back to Sign in
            </Link>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={onSubmit}>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                New Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter new password"
                icon={Lock}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Confirm Password
              </label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm new password"
                icon={Lock}
                required
              />
            </div>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <Button
              className="w-full h-12 bg-primary hover:bg-primary-light active:bg-primary-dark text-white font-semibold rounded-xl transition-colors"
              type="submit"
              disabled={loading}
            >
              {loading ? 'Resetting...' : 'Reset Password'}
            </Button>
            <div className="text-center">
              <Link to="/login" className="text-sm text-text-secondary hover:text-text-primary">
                ← Back to Sign in
              </Link>
            </div>
          </form>
        )}
      </div>
    </AuthShell>
  )
}
