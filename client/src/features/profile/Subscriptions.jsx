import React from "react"
import SubscriptionSelector from "../../components/ui/SubscriptionSelector"
import { useAuth } from "../../components/auth/AuthContext"

export default function Subscriptions() {
  const { user } = useAuth()

  return (
    <main className="max-w-4xl mx-auto px-6 py-12">
      {/* Page Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-sans font-semibold text-text-primary">
          Subscriptions
        </h1>
        <p className="text-sm text-text-secondary mt-1">
          Manage your plan and billing preferences.
        </p>
      </header>

      {/* Card Container */}
      <section className="bg-card-surface border border-soft rounded-2xl shadow-card hover:shadow-card-hover transition p-6 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium text-text-primary">
              Current Plan
            </h2>
            <p className="text-sm text-text-secondary">
              {user?.subscription || "None"}
            </p>
          </div>

          <button
            type="button"
            className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-primary-hover active:bg-primary-dark transition focus:outline-none focus:ring-2 focus:ring-focus-ring focus:ring-offset-2 focus:ring-offset-background"
          >
            Upgrade
          </button>
        </div>

        <div className="pt-4 border-t border-soft">
          <SubscriptionSelector
            onSuccess={(data) => {
              alert(
                "Order created. In production, this would complete the payment flow."
              )
              console.log(data)
            }}
          />
        </div>
      </section>
    </main>
  )
}
