import React from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from './Button'

export default function SubFeedbackWall({ user, feedbackStatus }) {
    const nav = useNavigate()

    const hasSub = user?.subscription && user.subscription !== 'none'
    const feedbackRequired = feedbackStatus && feedbackStatus.submitted === false
    const blocked = !hasSub && feedbackRequired

    if (!blocked) return null

    return (
        <div className="bg-accent-amber/10 border border-accent-amber/40 text-accent-amber rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 transition-shadow hover:shadow-card-hover">
            <div className="flex-1 text-sm">
                Access to this content is blocked. Submit your feedback for yesterday or choose a subscription plan to unlock daily practice.
            </div>
            <div className="flex gap-2 flex-wrap sm:flex-nowrap w-full sm:w-auto">
                <Button onClick={() => nav('/feedback')} variant="outline" className="flex-1 sm:flex-none">
                    Give Feedback
                </Button>
                <span className="hidden sm:inline self-center font-medium text-accent-amber/80">or</span>
                <Button as="a" href="/subscriptions" className="flex-1 sm:flex-none bg-primary text-white hover:bg-primary-light">
                    Choose a Plan
                </Button>
            </div>
        </div>
    )
}
