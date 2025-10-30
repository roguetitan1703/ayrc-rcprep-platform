import { api } from './api'

// Create a new order (already existing)
export async function createOrder({ planId, subtype } = {}) {
  // server expects planId in body; subtype retained for backward compat if needed
  const payload = {}
  if (planId) payload.planId = planId
  if (subtype) payload.subtype = subtype
  const { data } = await api.post('/sub/create-order', payload)
  return data.order
}

// Get all user subscriptions (admin)
export async function listAllSubscriptions() {
  const { data } = await api.get('/sub')
  return data // returns array of user subscriptions
}

// Revoke a subscription by user ID
export async function revokeSubscription(userId) {
  const { data } = await api.patch(`/sub/revoke/${userId}`)
  return data
}

// Extend a subscription by user ID and days
export async function extendSubscription(userId, days, extendType) {
  const { data } = await api.patch(`/sub/extend/${userId}`, { days, type: extendType })
  return data
}

export default {
  createOrder,
  listAllSubscriptions,
  revokeSubscription,
  extendSubscription,
  adminAssignSubscription: async (payload) => {
    const { data } = await api.post('/sub/admin/assign', payload)
    return data
  },
}
