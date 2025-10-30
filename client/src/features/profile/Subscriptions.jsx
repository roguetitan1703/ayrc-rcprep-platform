import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
// SubscriptionSelector modal removed — direct checkout is used from plan cards
import { Card, CardHeader, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { useAuth } from "../../components/auth/AuthContext"
import { Crown, Check, Zap, Target, Calendar } from "lucide-react"
import plansApi from '../../lib/plans'
import { startCheckout } from '../../lib/checkout'
import { useToast } from '../../components/ui/Toast'
import { getEffectiveSubscriptionSlug } from '../../lib/subscription'
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton'

export default function Subscriptions() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  // modal & selector removed; direct checkout from plan cards
  // null = loading, array = loaded
  const [plans, setPlans] = useState(null)
  // local UI for the (removed) selector fallback
  const [selectedPlan, setSelectedPlan] = useState(null)
  const [showSelector, setShowSelector] = useState(false)

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
          month: 'short',
          day: 'numeric',
          year: 'numeric',
        })
      : 'Not set'

  // fallback plans (used when API fails)
  const fallbackPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Get started and practice daily',
      icon: Target,
      color: '#5C6784',
      features: [
        'Access 2 RCs per day',
        'View RCs only after attempting and giving feedback',
        'Cannot see RCs uploaded before joining',
        'Question explanations after attempt',
        'Basic performance tracking',
        'Community support'
      ],
      limitations: [
        'Must provide feedback to attempt RC',
        'RCs missed cannot be accessed later',
        'No advanced analytics',
        'No personalized insights'
      ]
    },
    {
      id: 'weekly',
      name: '1 Week Plan',
      price: 199,
      period: 'week',
      description: 'Practice daily with limited archive access',
      icon: Zap,
      color: '#3B82F6',
      recommended: true,
      features: [
        'Access 2 RCs per day',
        'RCs uploaded from the day of joining are accessible for 7 days',
        'Question explanations',
        'Performance tracking with recent 7-day history',
        'Community support'
      ],
      limitations: [
        'RCs uploaded before joining are not visible',
        'Access to RCs expires after 7 days',
        'No extended analytics',
        'Limited personalized insights'
      ]
    },
    {
      id: 'till-cat',
      name: 'Till CAT 2025',
      price: 499,
      period: 'until CAT 2025',
      description: 'Unlimited access to all RCs till CAT 2025',
      icon: Crown,
      color: '#D33F49',
      features: [
        'Access 2 RCs per day',
        'Full archive access including RCs uploaded before joining',
        'Question explanations',
        'Advanced performance analytics',
        'Extended history of attempts',
        'Personalized insights and recommendations',
        'Priority community support',
        'Download practice materials'
      ],
      limitations: [
        'None – full access till CAT 2025'
      ]
    }
  ]

  function normalizePlan(p) {
    if (!p) return null
    // Keep fallback intact
    const slug = p.slug || p.id || (p._id ? String(p._id) : undefined) || 'unknown'
    // price normalization: server uses finalPriceCents
    const price = p.finalPriceCents != null ? Number(p.finalPriceCents) / 100 : (p.price != null ? p.price : 0)
    // period normalization
    let period = 'forever'
    if (p.durationDays) period = `${p.durationDays}d`
    else if (p.period) period = p.period
    else if (p.accessUntil) period = 'until'

    // Normalize features: server returns object (features.archive, feedbackLock, dailyLimits)
    let featuresArr = []
    if (Array.isArray(p.features)) {
      featuresArr = p.features
    } else if (p.features && typeof p.features === 'object') {
      const f = p.features
      // archive description
      if (f.archive) {
        if (f.archive.type === 'all') featuresArr.push('Full archive access')
        else if (f.archive.type === 'window') featuresArr.push(`Archive window: ${f.archive.windowDays ?? p.durationDays ?? 0} days`)
        else featuresArr.push('Archive: attempted-only')
      }
      // feedback lock
      if (f.feedbackLock && f.feedbackLock.enabled) featuresArr.push('Require daily feedback')
      // daily limits
      if (f.dailyLimits) {
        if (f.dailyLimits.dailyRcs != null) featuresArr.push(`Daily RCs: ${f.dailyLimits.dailyRcs}`)
        if (f.dailyLimits.dailyAttempts != null) featuresArr.push(`Daily Attempts: ${f.dailyLimits.dailyAttempts}`)
      }
    }

    // icon/color mapping for known slugs
    const slugKey = String(slug).toLowerCase()
    const iconMap = { free: Target, weekly: Zap, 'till-cat': Crown, 'till-cat-2026': Crown }
    const colorMap = { free: '#5C6784', weekly: '#3B82F6', 'till-cat': '#D33F49', 'till-cat-2026': '#D33F49' }

    return {
      id: slugKey,
      name: p.name || slugKey,
      description: p.description || '',
      price,
      period,
      icon: iconMap[slugKey] || Target,
      color: colorMap[slugKey] || '#5C6784',
      features: featuresArr.length ? featuresArr : (p.featuresList || []),
      limitations: p.limitations || [],
      recommended: !!p.recommended,
      savings: p.savings || null,
      // copy through any raw fields for debugging
      raw: p,
    }
  }

  useEffect(() => {
    let mounted = true

    ;(async () => {
      try {
        const data = await plansApi.publicListPlans()
        if (mounted && Array.isArray(data) && data.length) {
          // prefer server-provided plans; normalize minimal fields into UI-friendly shape
          const normalized = data.map(normalizePlan).filter(Boolean)
          setPlans(normalized)
        } else if (mounted) {
          setPlans(fallbackPlans)
        }
      } catch (err) {
        // fallback
        if (mounted) setPlans(fallbackPlans)
        // eslint-disable-next-line no-console
        console.warn('Could not fetch public plans', err)
      }
    })()

    return () => { mounted = false }
  }, [])

  // helper to poll /users/me until subscriptionPlan appears (used after checkout)
  async function refreshUserUntilUpdated(attempts = 6) {
    try {
      const { api } = await import('../../lib/api')
      const res = await api.get('/users/me')
      if (res && res.data) {
        setUser(res.data)
        if (res.data.subscriptionPlan || attempts <= 1) return
      }
      if (attempts > 1) {
        await new Promise((r) => setTimeout(r, 1000))
        return refreshUserUntilUpdated(attempts - 1)
      }
    } catch (err) {
      // swallow — caller will log if needed
      return
    }
  }

  // pick a sensible default for quick-upgrade actions (guard when plans are loading)
  const recommendedPlan = plans ? (plans.find(p => p.recommended) || plans.find(p => p.id !== 'free') || plans[0]) : null

  const userPlanSlug = getEffectiveSubscriptionSlug(user)
  const userPlanId = userPlanSlug ? String(userPlanSlug).toLowerCase() : 'free'
  const currentPlan = plans ? (plans.find(p => p.id === userPlanId) || plans[0]) : fallbackPlans[0]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Subscriptions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Choose the plan that works best for your preparation journey
        </p>
      </div>

      {/* Current Usage Card */}
      <Card className="bg-gradient-to-br from-[#D33F49]/10 via-[#3B82F6]/5 to-[#23A094]/10 border border-border-soft hover:shadow-lg transition-shadow">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            {/* Current Plan Info */}
            <div className="flex items-start gap-4">
              <div 
                className="p-4 rounded-2xl shadow-md"
                style={{ backgroundColor: `${currentPlan.color}15` }}
              >
                {React.createElement(currentPlan.icon, { 
                  className: "h-8 w-8",
                  style: { color: currentPlan.color }
                })}
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h2 className="text-2xl font-bold text-text-primary">
                    {currentPlan.name} Plan
                  </h2>
                  {currentPlan.recommended && (
                    <Badge className="bg-[#D33F49]/10 text-[#D33F49] border-[#D33F49]/30">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-text-secondary mb-4">
                  {currentPlan.description}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  {user?.subon && (
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Calendar size={14} />
                      <span>Started: {formatDate(user.subon)}</span>
                    </div>
                  )}
                  {user?.subexp && (
                    <div className="flex items-center gap-2 text-text-secondary">
                      <Calendar size={14} />
                      <span 
                        className={user.issubexp ? 'text-[#E4572E] font-semibold' : ''}
                      >
                        {user.issubexp ? 'Expired' : 'Expires'}: {formatDate(user.subexp)}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="flex flex-col gap-3">
              {currentPlan.id === 'free' && (
                <Button 
                  onClick={async () => {
                    const fallbackChoice = recommendedPlan || fallbackPlans.find(p => p.id !== 'free') || fallbackPlans[0]
                    // If server-provided plan metadata exists, start direct checkout.
                    if (recommendedPlan && recommendedPlan.raw && recommendedPlan.raw._id) {
                      try {
                        await startCheckout({ plan: recommendedPlan, user, onSuccess: async () => {
                          // refresh user (poll until updated)
                          try {
                            await refreshUserUntilUpdated()
                          } catch (err) {
                            console.warn('Could not refresh user after payment', err)
                          }
                          toast.show(`Subscription active — ${recommendedPlan.name}`, { variant: 'success' })
                        }, onError: (err) => {
                          console.warn('Payment error', err)
                          toast.show('Payment failed. Please try again.', { variant: 'error' })
                        } })
                      } catch (err) {
                        console.error(err)
                        toast.show('Could not start checkout. Try again later.', { variant: 'error' })
                      }
                    } else {
                      // plans not loaded from server yet — open selector so user can pick when available
                      setSelectedPlan(fallbackChoice)
                      setShowSelector(true)
                      toast.show('Loading plans — please select a plan to continue', { variant: 'default' })
                    }
                  }}
                  className="bg-[#D33F49] hover:bg-[#B83441] text-white font-semibold whitespace-nowrap"
                >
                  Upgrade Now
                </Button>
              )}
              {currentPlan.id !== 'free' && !user?.issubexp && (
                <Link to="/profile">
                  <Button variant="secondary" className="w-full">
                    Manage Subscription
                  </Button>
                </Link>
              )}
              {/** Renew button temporarily removed per product request. */}
              {/*
              {user?.issubexp && (
                <Button 
                  onClick={() => setShowSelector(!showSelector)}
                  className="bg-[#D33F49] hover:bg-[#B83441] text-white font-semibold"
                >
                  Renew Subscription
                </Button>
              )}
              */}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* The legacy selector modal has been removed. Purchases start directly from plan cards or the header. */}

      {/* Pricing Cards */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Available Plans</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
          {plans === null ? (
            // show skeletons while plans load
            Array.from({ length: 4 }).map((_, i) => (
              <Card key={`skeleton-${i}`} className="min-h-[120px]">
                <CardHeader className="p-3 border-b border-border-soft">
                  <div className="flex items-start justify-between mb-2">
                    <Skeleton className="h-8 w-8 rounded-full" />
                  </div>
                  <Skeleton className="h-4 w-1/3 mb-2" />
                  <Skeleton className="h-3 w-2/3" />
                </CardHeader>
                <CardContent className="p-3">
                  <Skeleton className="h-6 w-1/4 mb-3" />
                  <SkeletonText lines={3} />
                </CardContent>
              </Card>
            ))
          ) : plans.map((plan, idx) => {
            const Icon = plan.icon
            const isCurrent = plan.id === userPlanId

            return (
              <Card
                key={plan.id}
                className={`
                  relative bg-white border transition-all duration-200 text-sm rounded-lg
                  ${plan.recommended 
                    ? 'border-[#3B82F6] shadow-md' 
                    : 'border-border-soft hover:border-[#3B82F6]/40 hover:shadow-sm'
                  }
                  ${isCurrent ? 'ring-1 ring-[#23A094] ring-offset-1' : ''}
                `}
              >
                {/* Recommended Badge */}
                {plan.recommended && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                    <Badge className="bg-[#3B82F6] text-white px-4 py-1 shadow-lg">
                      Most Popular
                    </Badge>
                  </div>
                )}

                {/* Current Plan Badge */}
                {isCurrent && (
                  <div className="absolute -top-3 right-4">
                    <Badge className="bg-[#23A094] text-white px-3 py-1 shadow-lg flex items-center gap-1">
                      <Check size={14} />
                      Current
                    </Badge>
                  </div>
                )}

                <div className="flex items-center p-3 gap-3">
                  <div className="flex-shrink-0 p-2 rounded-md" style={{ backgroundColor: `${plan.color}15` }}>
                    <Icon className="h-5 w-5" style={{ color: plan.color }} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-sm font-semibold text-text-primary truncate">{plan.name}</h3>
                      <div className="text-right">
                        <div className="text-sm font-bold">₹{plan.price}</div>
                        <div className="text-xs text-text-secondary">/{plan.period}</div>
                      </div>
                    </div>
                    <p className="text-xs text-text-secondary truncate mt-1">{plan.description}</p>
                    <div className="mt-2 text-xs text-text-secondary">
                      {plan.features && plan.features[0] && (
                        <div className="flex items-center gap-2">
                          <Check size={12} className="text-[#23A094]" />
                          <span className="truncate">{plan.features[0]}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0">
                  {isCurrent ? (
                    <Button variant="secondary" className="w-full cursor-default py-2" disabled>
                      Current Plan
                    </Button>
                  ) : plan.id === 'free' ? (
                    <Link to="/profile">
                      <Button variant="secondary" className="w-full py-2">Manage Account</Button>
                    </Link>
                  ) : (
                    <Button
                      onClick={async () => {
                        if (plan && plan.raw && plan.raw._id) {
                          try {
                            await startCheckout({ plan, user, onSuccess: async () => {
                              try { await refreshUserUntilUpdated() } catch (err) { console.warn('Could not refresh user after payment', err) }
                              toast.show(`Subscription active — ${plan.name}`, { variant: 'success' })
                            }, onError: (err) => { console.warn('Payment error', err); toast.show('Payment failed. Please try again.', { variant: 'error' }) } })
                          } catch (err) {
                            console.error(err)
                            toast.show('Could not start checkout. Try again later.', { variant: 'error' })
                          }
                        } else {
                          setSelectedPlan(plan)
                          setShowSelector(true)
                          toast.show('Select a plan to continue', { variant: 'default' })
                        }
                      }}
                      className="w-full bg-[#D33F49] hover:bg-[#B83441] text-white font-semibold py-2"
                    >
                      Upgrade
                    </Button>
                  )}
                </div>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <Card className="bg-white border border-border-soft">
        <CardHeader className="p-4 border-b border-border-soft">
          <h2 className="text-lg font-semibold text-text-primary">Feature Comparison</h2>
          <p className="text-sm text-text-secondary mt-1">Feature data is under review and will be published soon.</p>
        </CardHeader>
        <CardContent className="p-4">
          <div className="text-sm text-text-secondary">We're reviewing feature mappings for accuracy. The comparison table has been temporarily hidden to prevent showing incorrect information.</div>
        </CardContent>
      </Card>

      {/* FAQ or Additional Info */}
      <Card className="bg-gradient-to-br from-[#3B82F6]/5 to-[#D33F49]/5 border border-border-soft">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-text-primary mb-2">
              Have questions about our plans?
            </h3>
            <p className="text-sm text-text-secondary mb-4">
              We're here to help you choose the right plan for your preparation journey
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/dashboard/help">
                <Button variant="secondary">
                  Visit Help Center
                </Button>
              </Link>
              <Link to="/feedback">
                <Button variant="primary">
                  Contact Support
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
