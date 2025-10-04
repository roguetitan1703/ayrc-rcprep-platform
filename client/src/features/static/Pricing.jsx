import React, { useState, useEffect } from 'react'
import { CheckCircle, DollarSign } from 'lucide-react'
import StaticPage from '../../components/layout/StaticPage'

// CountdownTimer Component
const CountdownTimer = ({ targetDate, offerName }) => {
  const calculateTimeLeft = () => {
    const difference = +new Date(targetDate) - +new Date()
    let timeLeft = {}
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      }
    }
    return timeLeft
  }
  const [timeLeft, setTimeLeft] = useState(calculateTimeLeft())
  useEffect(() => {
    if (!targetDate) return
    const timer = setInterval(() => setTimeLeft(calculateTimeLeft()), 1000)
    return () => clearInterval(timer)
  }, [targetDate])
  const formatTime = (time) => String(time || 0).padStart(2, '0')
  if (Object.keys(timeLeft).length === 0) return null
  return (
    <div className="my-3 text-center animate-pulse">
      <p className="text-xs font-bold text-info-blue">{offerName || 'Offer Ends In'}</p>
      <p className="font-mono text-base text-info-blue">
        {timeLeft.days ? `${timeLeft.days}d ` : ''}
        {formatTime(timeLeft.hours)}h : {formatTime(timeLeft.minutes)}m :{' '}
        {formatTime(timeLeft.seconds)}s
      </p>
    </div>
  )
}

// Static Plans Data (kept as originally provided)
const plans = [
  {
    id: 'basic-reader',
    name: 'Basic Reader',
    isRecommended: false,
    tiers: [
      {
        id: 'basic-monthly',
        durationText: 'Monthly',
        price: 499,
        originalPrice: 599,
        hasOffer: true,
        offerPrice: 399,
        offerEndTime: '2025-12-31',
        offerName: 'Launch Offer',
      },
      {
        id: 'basic-quarterly',
        durationText: 'Quarterly',
        price: 1299,
      },
    ],
    features: ['10 RC passages/month', 'Basic feedback', 'Daily practice sets'],
  },
  {
    id: 'pro-reader',
    name: 'Pro Reader',
    isRecommended: true,
    tiers: [
      {
        id: 'pro-monthly',
        durationText: 'Monthly',
        price: 999,
      },
      {
        id: 'pro-quarterly',
        durationText: 'Quarterly',
        price: 2599,
        originalPrice: 2999,
        hasOffer: true,
        offerPrice: 1999,
        offerEndTime: '2025-12-31',
        offerName: 'Launch Offer',
      },
    ],
    features: ['30 RC passages/month', 'Advanced feedback', 'Daily practice sets', 'Mock tests'],
  },
  {
    id: 'elite-reader',
    name: 'Elite Reader',
    isRecommended: false,
    tiers: [
      {
        id: 'elite-monthly',
        durationText: 'Monthly',
        price: 1499,
        originalPrice: 1799,
        hasOffer: true,
        offerPrice: 1199,
        offerEndTime: '2025-12-31',
        offerName: 'Launch Offer',
      },
      {
        id: 'elite-quarterly',
        durationText: 'Quarterly',
        price: 3999,
      },
    ],
    features: [
      'Unlimited RC passages',
      'Personalized feedback',
      'Daily practice sets',
      'Mock tests',
      'Priority support',
    ],
  },
]

// PlanCard Component
const PlanCard = ({ plan }) => {
  const [selectedTier, setSelectedTier] = useState(plan.tiers[0])

  const firstActiveOfferTier = plan.tiers.find(
    (tier) => tier.hasOffer && tier.offerEndTime && new Date(tier.offerEndTime) > new Date()
  )

  const calculateDiscountPercentage = (originalPrice, newPrice) => {
    if (!originalPrice || !newPrice || originalPrice <= newPrice) return 0
    return Math.round(((originalPrice - newPrice) / originalPrice) * 100)
  }

  return (
    <div
      className={`relative bg-card-surface/80 backdrop-blur-sm p-6 rounded-xl border ${
        plan.isRecommended
          ? 'border-primary shadow-[0_20px_40px_rgba(211,63,73,0.08)]'
          : 'border-border-soft'
      } hover:border-primary/40 hover:scale-105 transition-all duration-300 ease-in-out group w-full max-w-sm flex flex-col`}
    >
      {plan.isRecommended && (
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-primary text-white font-bold px-3 py-1 text-xs rounded-full shadow-md">
          Recommended
        </div>
      )}
      <div className="flex-grow">
        <div className="text-center mt-2">
          <h3 className="text-xl font-semibold text-text-primary mb-2">{plan.name}</h3>
        </div>

        {firstActiveOfferTier && (
          <CountdownTimer
            targetDate={firstActiveOfferTier.offerEndTime}
            offerName={firstActiveOfferTier.offerName}
          />
        )}

        <div className="my-4 space-y-2">
          {plan.tiers.map((tier) => {
            const isOfferActive =
              tier.hasOffer && tier.offerEndTime && new Date(tier.offerEndTime) > new Date()
            const currentPrice = isOfferActive ? tier.offerPrice : tier.price
            const originalPrice = tier.originalPrice || (isOfferActive ? tier.price : null)
            const tierDiscount = calculateDiscountPercentage(originalPrice, currentPrice)
            const isSelected = tier.id === selectedTier.id
            return (
              <button
                key={tier.id}
                onClick={() => setSelectedTier(tier)}
                className={`w-full p-2.5 rounded-lg text-left flex justify-between items-center transition-all duration-300 ${
                  isSelected
                    ? 'bg-primary text-white scale-105 shadow-lg'
                    : 'bg-surface-muted/80 hover:bg-background text-text-primary'
                }`}
              >
                <div className="flex items-center space-x-2">
                  <span className="font-semibold text-sm">{tier.durationText}</span>
                  {tierDiscount > 0 && (
                    <span className="bg-warning-amber text-white text-xs font-bold px-2 py-0.5 rounded-full">
                      {tierDiscount}% OFF
                    </span>
                  )}
                </div>
                <div className="flex items-baseline space-x-1.5">
                  {tierDiscount > 0 && originalPrice && (
                    <span
                      className={`text-xs ${
                        isSelected ? 'text-white/70' : 'text-text-secondary'
                      } line-through`}
                    >
                      ₹{originalPrice}
                    </span>
                  )}
                  <span
                    className={`font-bold text-base ${
                      isSelected ? 'text-white' : 'text-accent-amber'
                    }`}
                  >
                    ₹{currentPrice}
                  </span>
                </div>
              </button>
            )
          })}
        </div>

        <div className="border-t border-border-soft my-3"></div>
        <div>
          <h4 className="text-sm font-semibold text-text-primary mb-2">What's Included:</h4>
          <ul className="space-y-1.5 text-text-secondary">
            {plan.features.map((feature, index) => (
              <li key={index} className="flex items-start">
                <CheckCircle className="w-4 h-4 text-success-green mr-2 mt-0.5 flex-shrink-0" />
                <span className="text-xs">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      <div className="mt-5 flex-shrink-0">
        <a
          href="#"
          className="w-full py-2.5 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          <DollarSign className="w-4 h-4" />
          Buy Now
        </a>
      </div>
    </div>
  )
}

// PricingPage Component
export default function PricingPage() {
  return (
    <div className="min-h-screen bg-background">
      <StaticPage
        title="Choose Your Plan"
        subtitle="Select a plan to unlock expert-curated reading comprehension passages, daily practice, and more for your CAT preparation."
      >
        <div className="mt-12 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <PlanCard key={plan.id} plan={plan} />
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-text-secondary mb-8">
            Need help choosing? Check out our{' '}
            <a
              href="/faq"
              className="text-primary hover:text-primary-light transition-colors font-medium"
            >
              Frequently Asked Questions
            </a>
          </p>
        </div>

        <p className="text-text-secondary mb-4">
          Start a free trial today! No credit card required.
        </p>
        <a
          href="/register"
          className="w-44 text-center mx-auto py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary-dark hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2 group"
        >
          Create Account
        </a>
      </StaticPage>
    </div>
  )
}
