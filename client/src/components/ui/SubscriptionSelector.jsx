import React, { useState } from "react"
import content from '../../content/static.json'
import { Button } from "./Button"
import { createOrder } from "../../lib/subs"
import { useAuth } from "../auth/AuthContext"

function loadRazorpayScript() {
    return new Promise((resolve, reject) => {
        if (typeof window === "undefined") return reject(new Error("No window"))
        if (window.Razorpay) return resolve(true)
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.onerror = () => reject(new Error("Failed to load Razorpay script"))
        script.onload = () => resolve(true)
        document.body.appendChild(script)
    })
}

export default function SubscriptionSelector({ onSuccess, plan }) {
    // Legacy selector removed: this component only renders a plan summary and
    // a subscribe button when a server-backed `plan` is supplied. If `plan` is
    // not provided, it renders an instructional message and disables purchase.
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()

    async function handleSubscribe() {
        setError(null)
        setLoading(true)
        try {
            if (!plan || !plan.raw || !plan.raw._id) throw new Error('No valid plan selected')
            const order = await createOrder({ planId: plan.raw._id })
            await loadRazorpayScript()

            const key =
                import.meta.env.VITE_NODE_ENV === 'production'
                    ? import.meta.env.VITE_RAZORPAY_KEY_PROD
                    : import.meta.env.VITE_RAZORPAY_KEY

            const options = {
                key,
                amount: order.amount,
                currency: order.currency || 'INR',
                name: content.platformName || 'AYRC',
                description: `${plan.name} Subscription`,
                image: import.meta.env.VITE_APP_LOGO || undefined,
                order_id: order.id,
                handler: (response) => {
                    if (onSuccess) onSuccess(response)
                },
                prefill: {
                    name: user?.name || '',
                    email: user?.username || '',
                    contact: user?.phone || '',
                },
                theme: { color: '#D33F49' },
            }

            const rzp = new window.Razorpay(options)
            rzp.on('payment.failed', (response) => {
                setError('Payment failed: ' + (response.error?.description || 'An unknown error occurred'))
            })
            rzp.open()
        } catch (err) {
            console.error(err)
            setError(err?.message || 'Error creating order')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-card-surface border border-soft rounded-xl shadow-card p-6 space-y-5 transition hover:shadow-card-hover">
            <h3 className="text-lg font-medium text-text-primary">
                {plan ? `Subscribe to ${plan.name}` : 'Select a plan from the page to continue'}
            </h3>

            {plan ? (
                <div className="p-4 rounded-md border border-soft bg-surface-muted">
                    <div className="flex items-center justify-between">
                        <div>
                            <div className="font-medium text-text-primary">{plan.name}</div>
                            <div className="text-sm text-text-secondary">{plan.description}</div>
                        </div>
                        <div className="text-right">
                            <div className="text-2xl font-bold">₹{plan.price}</div>
                            <div className="text-sm text-text-secondary">/{plan.period}</div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="text-sm text-text-secondary">No plan selected. Choose a plan card or refresh the page.</div>
            )}

            {error && <div className="text-sm text-error-red bg-error-red/10 p-2 rounded-md">{error}</div>}

            <div className="pt-2">
                <Button onClick={handleSubscribe} disabled={loading || !plan} variant="primary" className="w-full">
                    {loading ? 'Creating Order...' : plan ? `Subscribe — ₹${plan.price} / ${plan.period}` : 'Select a plan'}
                </Button>
            </div>
        </div>
    )
}
