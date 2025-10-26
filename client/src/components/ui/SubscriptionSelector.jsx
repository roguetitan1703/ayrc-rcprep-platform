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

export default function SubscriptionSelector({ onSuccess }) {
    const [type, setType] = useState("Monthly")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)
    const { user } = useAuth()

    async function handleSubscribe() {
        setError(null)
        setLoading(true)
        try {
            const order = await createOrder(type)

            // Load Razorpay
            await loadRazorpayScript()

            const key =
                import.meta.env.VITE_NODE_ENV === "production"
                    ? import.meta.env.VITE_RAZORPAY_KEY_PROD
                    : import.meta.env.VITE_RAZORPAY_KEY

            const options = {
                key,
                amount: order.amount,
                currency: order.currency || "INR",
                name: content.platformName || "AYRC",
                description: `${order.notes?.subtype || type} Subscription`,
                image: import.meta.env.VITE_APP_LOGO || undefined,
                order_id: order.id,
                handler: (response) => {
                    if (onSuccess) onSuccess(response)
                    try {
                        window.location.href = "/profile"
                    } catch (e) { }
                },
                prefill: {
                    name: user?.name || "",
                    email: user?.username || "",
                    contact: user?.phone || "",
                },
                theme: { color: "#D33F49" }, // still OK since Razorpay requires a hex input
            }

            const rzp = new window.Razorpay(options)
            rzp.on("payment.failed", (response) => {
                setError(
                    "Payment failed: " +
                    (response.error?.description || "An unknown error occurred")
                )
            })
            rzp.open()
        } catch (err) {
            console.error(err)
            setError(err?.message || "Error creating order")
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="bg-card-surface border border-soft rounded-xl shadow-card p-6 space-y-5 transition hover:shadow-card-hover">
            <h3 className="text-lg font-medium text-text-primary">
                Choose a subscription
            </h3>

            <div className="space-y-3">
                {["Monthly", "Yearly"].map((option) => (
                    <label
                        key={option}
                        className={`flex items-center justify-between p-4 rounded-lg border cursor-pointer transition ${type === option
                            ? "border-primary bg-surface-muted"
                            : "border-soft hover:bg-surface-muted"
                            }`}
                    >
                        <div className="flex items-center space-x-3">
                            <input
                                type="radio"
                                name="subtype"
                                value={option}
                                checked={type === option}
                                onChange={() => setType(option)}
                                className="h-4 w-4 text-primary focus:ring-focus-ring border-soft"
                            />
                            <div>
                                <div className="font-medium text-text-primary">{option}</div>
                                <div className="text-sm text-text-secondary">
                                    {option === "Monthly"
                                        ? "₹150 / month"
                                        : "₹1700 / year (save 5%)"}
                                </div>
                            </div>
                        </div>
                        {type === option && (
                            <span className="text-sm font-medium text-primary">Selected</span>
                        )}
                    </label>
                ))}
            </div>

            {error && (
                <div className="text-sm text-error-red bg-error-red/10 p-2 rounded-md">
                    {error}
                </div>
            )}

            <div className="pt-2">
                <Button
                    onClick={handleSubscribe}
                    disabled={loading}
                    variant="primary"
                    className="w-full"
                >
                    {loading ? "Creating Order..." : `Subscribe (${type})`}
                </Button>
            </div>
        </div>
    )
}
