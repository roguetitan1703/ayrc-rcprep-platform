import { api } from './api'

export default {
  adminListPlans: async () => {
    const { data } = await api.get('/admin/plans')
    return data
  },
  publicListPlans: async () => {
    const { data } = await api.get('/sub/plans')
    return data
  },
  createPlan: async (payload) => {
    const { data } = await api.post('/admin/plans', payload)
    return data
  },
  updatePlan: async (id, payload) => {
    const { data } = await api.patch(`/admin/plans/${id}`, payload)
    return data
  },
  deactivatePlan: async (id) => {
    const { data } = await api.patch(`/admin/plans/${id}/deactivate`)
    return data
  },
  deletePlan: async (id) => {
    const { data } = await api.delete(`/admin/plans/${id}`)
    return data
  },
}
