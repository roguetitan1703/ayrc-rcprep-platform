import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardHeader, CardContent } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { useAuth } from '../../components/auth/AuthContext'
import { Crown, Check, Zap, Target, Calendar } from 'lucide-react'
import plansApi from '../../lib/plans'
import { startCheckout } from '../../lib/checkout'
import { useToast } from '../../components/ui/Toast'
import { getEffectiveSubscriptionSlug } from '../../lib/subscription'
import { Skeleton, SkeletonText } from '../../components/ui/Skeleton'

const iconMap = {
  free: Target,
  'weekly-test': Zap,
  'cat-2025': Crown,
}

export default function Subscriptions() {
  const { user, setUser } = useAuth()
  const toast = useToast()
  const [plans, setPlans] = useState(null)
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

  // fallback plans (used only in comparison / static UI)
  const fallbackPlans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Get started and practice daily',
      icon: Target,
      features: [
        'Access 2 RCs per day',
        'Question explanations',
        'View RCs only after attempting and giving feedback',
        'Cannot see RCs uploaded before joining',
        'Basic performance tracking',
      ],
      limitations: [
        'Must provide feedback to attempt RC',
        'RCs missed cannot be accessed later',
        'No advanced analytics',
        'No personalized insights',
      ],
    },
    {
      id: 'weekly',
      name: '1 Week Plan',
      price: 149,
      period: 'week',
      description: 'Practice daily with limited archive access',
      icon: Zap,
      recommended: true,
      features: [
        'Access 2 RCs per day',
        'RCs uploaded from the day of joining are accessible for 7 days',
        'Question explanations',
        'Performance tracking with recent 7-day history',
      ],
      limitations: [
        'RCs uploaded before joining are not visible',
        'Access to RCs expires after 7 days',
        'No extended analytics',
        'Limited personalized insights',
      ],
    },
    {
      id: 'cat25',
      name: 'Cat 2025',
      price: 449,
      period: 'until CAT 2025',
      description: 'Unlimited access to all RCs till CAT 2025',
      icon: Crown,
      features: [
        'Access 2 RCs per day',
        'Full archive access including RCs uploaded before joining',
        'Question explanations',
        'Advanced performance analytics for every attempt',
        'Extended history of attempts',
        'Personalized insights and recommendations',
        'No need to renew weekly — single subscription till exam',
      ],
      limitations: ['None – full access till CAT 2025'],
    },
  ]

  function normalizePlan(p) {
    if (!p) return null
    const slug = p.slug || p.id || (p._id ? String(p._id) : undefined) || 'unknown'
    const slugKey = String(slug).toLowerCase()

    // unified primary color (crimson)
    const color = '#D33F49'

    const price =
      p.finalPriceCents != null ? Number(p.finalPriceCents) / 100 : p.price != null ? p.price : 0
    let period = 'forever'
    if (p.durationDays) period = `${p.durationDays}d`
    else if (p.period) period = p.period
    else if (p.accessUntil) period = 'until'

    let featuresArr = []
    if (Array.isArray(p.features)) {
      featuresArr = p.features
    } else if (p.features && typeof p.features === 'object') {
      const f = p.features
      if (f.archive) {
        if (f.archive.type === 'all') featuresArr.push('Full archive access')
        else if (f.archive.type === 'window')
          featuresArr.push(`Archive window: ${f.archive.windowDays ?? p.durationDays ?? 0} days`)
        else featuresArr.push('Archive: attempted-only')
      }
      if (f.feedbackLock && f.feedbackLock.enabled) featuresArr.push('Require daily feedback')
      if (f.dailyLimits) {
        if (f.dailyLimits.dailyRcs != null) featuresArr.push(`Daily RCs: ${f.dailyLimits.dailyRcs}`)
        if (f.dailyLimits.dailyAttempts != null)
          featuresArr.push(`Daily Attempts: ${f.dailyLimits.dailyAttempts}`)
      }
    }

    return {
      id: p._id,
      name: p.name || slug,
      description: p.description || '',
      slug: p.slug || slug,
      price,
      period,
      icon: iconMap[slugKey] || Target,
      colorClass: 'text-primary bg-primary/10 border-primary/30',
      features: featuresArr.length ? featuresArr : p.featuresList || [],
      limitations: p.limitations || [],
      recommended: !!p.recommended,
      savings: p.savings || null,
      raw: p,
    }
  }

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        const data = await plansApi.publicListPlans()
        if (mounted && Array.isArray(data) && data.length) {
          const normalized = data.map(normalizePlan).filter(Boolean)
          setPlans(normalized)
        } else if (mounted) {
          // Do NOT use fallback plans as the visual fallback.
          // Set plans to empty array to indicate "no plans" (API responded but no data)
          setPlans([])
        }
      } catch (err) {
        if (mounted) {
          // On error, set to empty array so UI can show appropriate empty state.
          setPlans([])
        }
        console.warn('Could not fetch public plans', err)
      }
    })()
    return () => {
      mounted = false
    }
  }, [])

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
      return
    }
  }

  const recommendedPlan = plans
    ? plans.find((p) => p.recommended) || plans.find((p) => p.id !== 'free') || plans[0]
    : null

  // Get user's plan identifier which may be either:
  // - an ObjectId string (old behaviour), or
  // - a slug (new behaviour returned from populated subscriptionPlan)
  const userPlanSlug = getEffectiveSubscriptionSlug(user)
  const userPlanKey = userPlanSlug ? String(userPlanSlug).toLowerCase() : null

  // Resolve currentPlan by matching either plan id or plan slug against the user key.
  // While plans === null, keep currentPlan null (loading state).
  const currentPlan =
    plans === null
      ? null
      : plans.find((p) => {
          const planId = p.id ? String(p.id).toLowerCase() : ''
          const planSlug = p.slug ? String(p.slug).toLowerCase() : ''
          return userPlanKey && (planId === userPlanKey || planSlug === userPlanKey)
        }) ||
        plans[0] ||
        null

  console.log('plans', plans)
  console.log('currentPlan', currentPlan)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-text-primary">Subscriptions</h1>
        <p className="text-sm text-text-secondary mt-1">
          Choose the plan that works best for your preparation journey
        </p>
      </div>

      {/* Current Plan Card */}
      {currentPlan === null ? (
        <Card className="min-h-[140px]">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl shadow-md" style={{ backgroundColor: '#D33F4915' }}>
                  <Skeleton className="h-8 w-8 rounded-full" />
                </div>
                <div className="flex-1">
                  <Skeleton className="h-6 w-1/3 mb-2" />
                  <Skeleton className="h-4 w-2/3 mb-4" />
                  <div className="flex items-center gap-6 text-sm">
                    <Skeleton className="h-4 w-20" />
                    <Skeleton className="h-4 w-24" />
                  </div>
                </div>
              </div>

              {/* Actions skeleton */}
              <div className="flex flex-col gap-3">
                <Skeleton className="h-10 w-36" />
                <Skeleton className="h-10 w-36" />
              </div>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="bg-gradient-to-br from-primary/10 via-info-blue/5 to-success-green/10 border border-border-soft hover:shadow-lg transition-shadow">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="flex items-start gap-4">
                <div className="p-4 rounded-2xl shadow-md" style={{ backgroundColor: '#D33F4915' }}>
                  {React.createElement(currentPlan.icon, {
                    className: `h-8 w-8`,
                    style: { color: '#D33F49' },
                  })}
                </div>
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-bold text-text-primary">
                      {currentPlan.name} Plan
                    </h2>
                    {currentPlan.recommended && (
                      <Badge
                        variant="custom"
                        className="bg-primary text-white border border-primary/30 shadow-sm"
                      >
                        Active
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-text-secondary mb-4">{currentPlan.description}</p>
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
                        <span className={user.issubexp ? 'text-[#E4572E] font-semibold' : ''}>
                          {user.issubexp ? 'Expired' : 'Expires'}: {formatDate(user.subexp)}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="flex flex-col gap-3">
                {currentPlan.id === 'free' && (
                  <Button
                    onClick={async () => {
                      const fallbackChoice =
                        recommendedPlan ||
                        fallbackPlans.find((p) => p.id !== 'free') ||
                        fallbackPlans[0]
                      if (recommendedPlan && recommendedPlan.raw && recommendedPlan.raw._id) {
                        try {
                          await startCheckout({
                            plan: recommendedPlan,
                            user,
                            onSuccess: async () => {
                              try {
                                await refreshUserUntilUpdated()
                              } catch (err) {
                                console.warn('Could not refresh user after payment', err)
                              }
                              toast.show(`Subscription active — ${recommendedPlan.name}`, {
                                variant: 'success',
                              })
                            },
                            onError: (err) => {
                              console.warn('Payment error', err)
                              toast.show('Payment failed. Please try again.', {
                                variant: 'error',
                              })
                            },
                          })
                        } catch (err) {
                          console.error(err)
                          toast.show('Could not start checkout. Try again later.', {
                            variant: 'error',
                          })
                        }
                      } else {
                        setSelectedPlan(fallbackChoice)
                        setShowSelector(true)
                        toast.show('Loading plans — please select a plan to continue', {
                          variant: 'default',
                        })
                      }
                    }}
                    className="bg-primary hover:bg-[#B83441] text-white font-semibold whitespace-nowrap"
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Plan Cards */}
      <div>
        <h2 className="text-2xl font-bold text-text-primary mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {plans === null
            ? Array.from({ length: 4 }).map((_, i) => (
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
            : plans
                .filter((p) => p.slug !== 'free')
                .map((plan, idx) => {
                  const Icon = plan.icon
                  // Determine if this plan is the currently active one by comparing resolved currentPlan's id
                  const isCurrent = currentPlan ? String(plan.id) === String(currentPlan.id) : false

                  return (
                    <Card
                      key={plan.id}
                      className={`relative bg-white border transition-all duration-200 text-sm rounded-lg ${
                        plan.recommended
                          ? 'border-info-blue shadow-md'
                          : 'border-border-soft hover:border-info-blue/40 hover:shadow-sm'
                      } ${isCurrent ? 'ring-1 ring-success-green' : ''}`}
                    >
                      {plan.recommended && (
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                          <Badge className="bg-info-blue text-white px-4 py-1 shadow-lg">
                            Most Popular
                          </Badge>
                        </div>
                      )}
                      {isCurrent && (
                        <div className="absolute -top-4 right-4">
                          <Badge
                            variant="custom"
                            className="bg-primary text-white border border-primary/30 px-3 py-1 shadow-sm font-semibold"
                          >
                            Current
                          </Badge>
                        </div>
                      )}

                      <div className="flex items-center p-3 gap-3">
                        <div
                          className="flex-shrink-0 p-2 rounded-md"
                          style={{ backgroundColor: `#D33F4915` }}
                        >
                          <Icon className="h-5 w-5" style={{ color: '#D33F49' }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-3">
                            <h3 className="text-sm font-semibold text-text-primary truncate">
                              {plan.name}
                            </h3>
                            <div className="text-right">
                              <div className="text-sm font-bold">₹{plan.price}</div>
                              <div className="text-xs text-text-secondary">/{plan.period}</div>
                            </div>
                          </div>
                          <p className="text-xs text-text-secondary truncate mt-1">
                            {plan.description}
                          </p>
                          <div className="mt-2 text-xs text-text-secondary">
                            {plan.features && plan.features[0] && (
                              <div className="flex items-center gap-2">
                                <Check size={12} className="text-success-green" />
                                <span className="truncate">{plan.features[0]}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="p-3 pt-0">
                        {isCurrent ? (
                          <Button
                            variant="secondary"
                            className="w-full cursor-default py-2"
                            disabled
                          >
                            Current Plan
                          </Button>
                        ) : plan.id === 'free' ? (
                          <Link to="/profile">
                            <Button variant="secondary" className="w-full py-2">
                              Manage Account
                            </Button>
                          </Link>
                        ) : (
                          <Button
                            onClick={async () => {
                              if (plan && plan.raw && plan.raw._id) {
                                try {
                                  await startCheckout({
                                    plan,
                                    user,
                                    onSuccess: async () => {
                                      try {
                                        await refreshUserUntilUpdated()
                                      } catch (err) {
                                        console.warn('Could not refresh user after payment', err)
                                      }
                                      toast.show(`Subscription active — ${plan.name}`, {
                                        variant: 'success',
                                      })
                                    },
                                    onError: (err) => {
                                      console.warn('Payment error', err)
                                      toast.show('Payment failed. Please try again.', {
                                        variant: 'error',
                                      })
                                    },
                                  })
                                } catch (err) {
                                  console.error(err)
                                  toast.show('Could not start checkout. Try again later.', {
                                    variant: 'error',
                                  })
                                }
                              } else {
                                setSelectedPlan(plan)
                                setShowSelector(true)
                                toast.show('Select a plan to continue', { variant: 'default' })
                              }
                            }}
                            className="w-full bg-primary hover:bg-[#B83441] text-white font-semibold py-2"
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

      {/* Feature Comparison */}
      <Card className="bg-white border border-border-soft">
        <CardHeader className="p-4 border-b border-border-soft">
          <h2 className="text-lg font-semibold text-text-primary">Feature Comparison</h2>
          <p className="text-sm text-text-secondary mt-1">
            Compare what’s included in each subscription plan.
          </p>
        </CardHeader>
        <CardContent className="p-4 overflow-x-auto">
          {fallbackPlans && fallbackPlans.length > 0 ? (
            <table className="min-w-full border-collapse text-sm">
              <thead>
                <tr>
                  <th className="text-left py-2 px-3 text-text-secondary font-medium">Feature</th>
                  {fallbackPlans
                    .filter((p) => p.slug !== 'free')
                    .map((plan) => (
                      <th
                        key={plan.id}
                        className="text-center py-2 px-3 text-text-primary font-semibold"
                      >
                        {plan.name}
                      </th>
                    ))}
                </tr>
              </thead>

              <tbody>
                {/** Collect all unique features across all plans */}
                {Array.from(new Set(fallbackPlans.flatMap((p) => p.features || []))).map(
                  (feature, idx) => (
                    <tr key={idx} className={idx % 2 === 0 ? 'bg-muted/5' : ''}>
                      <td className="py-2 px-3 text-text-secondary">{feature}</td>
                      {fallbackPlans
                        .filter((p) => p.slug !== 'free')
                        .map((plan) => (
                          <td key={plan.id} className="text-center py-2 px-3">
                            {plan.features?.includes(feature) ? (
                              <span className="text-success-green font-medium">✔</span>
                            ) : (
                              <span className="text-text-secondary/40">—</span>
                            )}
                          </td>
                        ))}
                    </tr>
                  )
                )}
              </tbody>
            </table>
          ) : (
            <div className="text-sm text-text-secondary">
              No plan data available for comparison.
            </div>
          )}
        </CardContent>
      </Card>

      {/* FAQ */}
      <Card className="bg-gradient-to-br from-info-blue/5 to-primary/5 border border-border-soft">
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
                <Button variant="primary">Visit Help Center</Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
