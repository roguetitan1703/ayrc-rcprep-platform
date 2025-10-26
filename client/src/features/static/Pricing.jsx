// PricingPage Component
import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'

// Pricing page has been retired: redirect users to Subscriptions
export default function PricingPage() {
  const navigate = useNavigate()
  useEffect(() => {
    navigate('/subscriptions', { replace: true })
  }, [navigate])
  return null
}
