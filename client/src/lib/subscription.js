export function getEffectiveSubscriptionSlug(user) {
  if (!user) return null
  // Prefer new subscriptionPlan pointer (object or string)
  if (user.subscriptionPlan) {
    if (typeof user.subscriptionPlan === 'string') return user.subscriptionPlan
    if (typeof user.subscriptionPlan === 'object' && user.subscriptionPlan.slug) return user.subscriptionPlan.slug
  }
  // Fallback to legacy string field, but treat 'none' as no-subscription
  if (typeof user.subscription === 'string' && user.subscription !== 'none') return user.subscription
  return null
}

export function hasEffectiveSubscription(user) {
  return !!getEffectiveSubscriptionSlug(user)
}
