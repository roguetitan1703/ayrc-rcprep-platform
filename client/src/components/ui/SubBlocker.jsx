import React from 'react'
import { useAuth } from '../../components/auth/AuthContext'
import { useFeedbackStatus } from '../../hooks/useFeedbackStatus'
import { Button } from './Button'
import { FaLock, FaGift } from 'react-icons/fa'

export default function SubBlocker({ children, fallback }) {
  const { user, loading } = useAuth()
  const { loading: fbLoading, status } = useFeedbackStatus()

  if (loading || fbLoading) return null

  const hasSub = user && user.subscription && user.subscription !== 'none'
  const unlockedByFeedback = status && status.submitted === true

  if (hasSub || unlockedByFeedback) return children

  return (
    <div className="p-6 rounded-2xl border border-white/10 bg-gradient-to-br from-white/5 to-white/2 shadow-lg animate-fadeIn max-w-md mx-auto">
      {fallback ? (
        fallback
      ) : (
        <div className="space-y-4 text-center">
          <div className="flex justify-center mb-2">
            <FaLock className="text-4xl text-red-500 animate-pulse" />
          </div>
          <div className="text-xl font-bold">Subscription Required</div>
          <div className="text-sm text-muted">
            This feature is reserved for subscribers. You can either subscribe or submit today's feedback to unlock access temporarily.
          </div>

          <div className="flex justify-center gap-3 mt-4 flex-wrap">
            <Button as="a" href="/subscriptions" className="flex items-center gap-2">
              <FaLock /> Subscribe
            </Button>

            <Button
              variant="secondary"
              as="a"
              href="/feedback"
              className="flex items-center gap-2"
            >
              <FaGift /> Unlock via Feedback
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
