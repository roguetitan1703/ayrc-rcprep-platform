import React, { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import SubscriptionSelector from "../../components/ui/SubscriptionSelector"
import { Card, CardHeader, CardContent } from "../../components/ui/Card"
import { Button } from "../../components/ui/Button"
import { Badge } from "../../components/ui/Badge"
import { useAuth } from "../../components/auth/AuthContext"
import { Crown, Check, Zap, TrendingUp, Target, Award, Calendar, CreditCard } from "lucide-react"

export default function Subscriptions() {
  const { user } = useAuth()
  const [showSelector, setShowSelector] = useState(false)

  const formatDate = (date) =>
    date
      ? new Date(date).toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
      : 'Not set'

  // Pricing plans
  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: 0,
      period: 'forever',
      description: 'Perfect for getting started',
      icon: Target,
      color: '#5C6784',
      features: [
        'Daily RCs access',
        'Basic performance tracking',
        'Question explanations',
        'Community support'
      ],
      limitations: [
        'Limited to 2 RCs per day',
        'No advanced analytics',
        'No personalized insights'
      ]
    },
    {
      id: 'monthly',
      name: 'Premium',
      price: 499,
      period: 'month',
      description: 'Unlock your full potential',
      icon: Zap,
      color: '#3B82F6',
      recommended: true,
      features: [
        'Unlimited RC practice',
        'Advanced performance analytics',
        'Personalized insights & recommendations',
        'Detailed mistake analysis',
        'Priority support',
        'Download practice materials',
        'No daily limits'
      ]
    },
    {
      id: 'annual',
      name: 'Premium Annual',
      price: 4999,
      savings: 1000,
      period: 'year',
      description: 'Best value - Save ₹1000',
      icon: Crown,
      color: '#D33F49',
      features: [
        'All Premium features',
        'Save ₹1000 annually',
        'Extended analytics history',
        'Early access to new features',
        'Exclusive study materials',
        'Priority support',
        '1-on-1 strategy session'
      ]
    }
  ]

  const currentPlan = plans.find(p => p.id === (user?.subscription || 'free')?.toLowerCase()) || plans[0]

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-[#273043]">Subscriptions</h1>
        <p className="text-sm text-[#5C6784] mt-1">
          Choose the plan that works best for your preparation journey
        </p>
      </div>

      {/* Current Usage Card */}
      <Card className="bg-gradient-to-br from-[#D33F49]/10 via-[#3B82F6]/5 to-[#23A094]/10 border border-[#D8DEE9] hover:shadow-lg transition-shadow">
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
                  <h2 className="text-2xl font-bold text-[#273043]">
                    {currentPlan.name} Plan
                  </h2>
                  {currentPlan.recommended && (
                    <Badge className="bg-[#D33F49]/10 text-[#D33F49] border-[#D33F49]/30">
                      Active
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-[#5C6784] mb-4">
                  {currentPlan.description}
                </p>
                <div className="flex items-center gap-6 text-sm">
                  {user?.subon && (
                    <div className="flex items-center gap-2 text-[#5C6784]">
                      <Calendar size={14} />
                      <span>Started: {formatDate(user.subon)}</span>
                    </div>
                  )}
                  {user?.subexp && (
                    <div className="flex items-center gap-2 text-[#5C6784]">
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
                  onClick={() => setShowSelector(!showSelector)}
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
              {user?.issubexp && (
                <Button 
                  onClick={() => setShowSelector(!showSelector)}
                  className="bg-[#D33F49] hover:bg-[#B83441] text-white font-semibold"
                >
                  Renew Subscription
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Subscription Selector */}
      {showSelector && (
        <Card className="bg-white border-2 border-[#3B82F6] shadow-xl">
          <CardHeader className="p-6 border-b border-[#D8DEE9] bg-[#3B82F6]/5">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[#273043]">Select Your Plan</h3>
              <button
                onClick={() => setShowSelector(false)}
                className="text-[#5C6784] hover:text-[#273043] transition-colors"
              >
                ✕
              </button>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <SubscriptionSelector
              onSuccess={(data) => {
                alert("Payment successful! Your subscription is now active.")
                console.log(data)
                window.location.reload()
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Pricing Cards */}
      <div>
        <h2 className="text-2xl font-bold text-[#273043] mb-6">Available Plans</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((plan, idx) => {
            const Icon = plan.icon
            const isCurrent = plan.id === (user?.subscription || 'free')?.toLowerCase()

            return (
              <Card
                key={plan.id}
                className={`
                  relative bg-white border-2 transition-all duration-200
                  ${plan.recommended 
                    ? 'border-[#3B82F6] shadow-xl scale-105' 
                    : 'border-[#D8DEE9] hover:border-[#3B82F6]/40 hover:shadow-lg'
                  }
                  ${isCurrent ? 'ring-2 ring-[#23A094] ring-offset-2' : ''}
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

                <CardHeader className="p-6 border-b border-[#D8DEE9]">
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className="p-3 rounded-xl shadow-md"
                      style={{ backgroundColor: `${plan.color}15` }}
                    >
                      <Icon className="h-6 w-6" style={{ color: plan.color }} />
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#273043] mb-2">
                    {plan.name}
                  </h3>
                  <p className="text-sm text-[#5C6784] mb-4">
                    {plan.description}
                  </p>

                  {/* Price */}
                  <div className="flex items-baseline gap-2">
                    <span className="text-4xl font-bold text-[#273043]">
                      ₹{plan.price}
                    </span>
                    <span className="text-sm text-[#5C6784]">
                      /{plan.period}
                    </span>
                  </div>

                  {plan.savings && (
                    <div className="mt-2">
                      <Badge className="bg-[#23A094]/10 text-[#23A094] border-[#23A094]/30">
                        Save ₹{plan.savings}
                      </Badge>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="p-6 space-y-4">
                  {/* Features */}
                  <div className="space-y-3">
                    {plan.features.map((feature, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-3">
                        <Check size={18} className="text-[#23A094] flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-[#273043]">{feature}</span>
                      </div>
                    ))}
                  </div>

                  {/* Limitations (for free plan) */}
                  {plan.limitations && (
                    <div className="pt-4 border-t border-[#D8DEE9] space-y-2">
                      {plan.limitations.map((limitation, lIdx) => (
                        <div key={lIdx} className="flex items-start gap-3">
                          <span className="text-[#E4572E] text-sm flex-shrink-0">✕</span>
                          <span className="text-sm text-[#5C6784]">{limitation}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* CTA */}
                  <div className="pt-4">
                    {isCurrent ? (
                      <Button 
                        variant="secondary" 
                        className="w-full cursor-default"
                        disabled
                      >
                        Current Plan
                      </Button>
                    ) : plan.id === 'free' ? (
                      <Link to="/profile">
                        <Button variant="secondary" className="w-full">
                          Manage Account
                        </Button>
                      </Link>
                    ) : (
                      <Button
                        onClick={() => setShowSelector(true)}
                        className="w-full bg-[#D33F49] hover:bg-[#B83441] text-white font-semibold"
                      >
                        Upgrade to {plan.name}
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Feature Comparison Table */}
      <Card className="bg-white border border-[#D8DEE9]">
        <CardHeader className="p-6 border-b border-[#D8DEE9]">
          <h2 className="text-xl font-bold text-[#273043]">Feature Comparison</h2>
          <p className="text-sm text-[#5C6784] mt-1">Compare all features across plans</p>
        </CardHeader>
        <CardContent className="p-6">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b-2 border-[#D8DEE9]">
                  <th className="text-left py-3 px-4 text-sm font-semibold text-[#273043]">Feature</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-[#273043]">Free</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-[#3B82F6]">Premium</th>
                  <th className="text-center py-3 px-4 text-sm font-semibold text-[#D33F49]">Annual</th>
                </tr>
              </thead>
              <tbody className="text-sm">
                <tr className="border-b border-[#D8DEE9]">
                  <td className="py-3 px-4 text-[#273043]">Daily RCs</td>
                  <td className="text-center py-3 px-4 text-[#5C6784]">2 per day</td>
                  <td className="text-center py-3 px-4 text-[#23A094] font-semibold">Unlimited</td>
                  <td className="text-center py-3 px-4 text-[#23A094] font-semibold">Unlimited</td>
                </tr>
                <tr className="border-b border-[#D8DEE9]">
                  <td className="py-3 px-4 text-[#273043]">Performance Analytics</td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#5C6784] mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#D8DEE9]">
                  <td className="py-3 px-4 text-[#273043]">Personalized Insights</td>
                  <td className="text-center py-3 px-4"><span className="text-[#E4572E]">✕</span></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#D8DEE9]">
                  <td className="py-3 px-4 text-[#273043]">Mistake Analysis</td>
                  <td className="text-center py-3 px-4"><span className="text-[#E4572E]">✕</span></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#D8DEE9]">
                  <td className="py-3 px-4 text-[#273043]">Download Materials</td>
                  <td className="text-center py-3 px-4"><span className="text-[#E4572E]">✕</span></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                </tr>
                <tr className="border-b border-[#D8DEE9]">
                  <td className="py-3 px-4 text-[#273043]">Priority Support</td>
                  <td className="text-center py-3 px-4"><span className="text-[#E4572E]">✕</span></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                </tr>
                <tr>
                  <td className="py-3 px-4 text-[#273043]">1-on-1 Strategy Session</td>
                  <td className="text-center py-3 px-4"><span className="text-[#E4572E]">✕</span></td>
                  <td className="text-center py-3 px-4"><span className="text-[#E4572E]">✕</span></td>
                  <td className="text-center py-3 px-4"><Check size={18} className="text-[#23A094] mx-auto" /></td>
                </tr>
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* FAQ or Additional Info */}
      <Card className="bg-gradient-to-br from-[#3B82F6]/5 to-[#D33F49]/5 border border-[#D8DEE9]">
        <CardContent className="p-6">
          <div className="text-center">
            <h3 className="text-lg font-bold text-[#273043] mb-2">
              Have questions about our plans?
            </h3>
            <p className="text-sm text-[#5C6784] mb-4">
              We're here to help you choose the right plan for your preparation journey
            </p>
            <div className="flex justify-center gap-3">
              <Link to="/help">
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
