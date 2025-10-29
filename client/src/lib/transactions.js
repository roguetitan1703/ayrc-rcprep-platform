import { api } from './api'

export default {
  listTransactions: async (params = {}) => {
    const { data } = await api.get('/transactions', { params })
    // server returns { rows, total, page, limit }
    // normalize to { rows, meta }
    if (data && Array.isArray(data.rows)) {
      return { rows: data.rows, meta: { total: data.total, page: data.page, limit: data.limit } }
    }
    // fallback: if API returned array directly
    if (Array.isArray(data))
      return { rows: data, meta: { total: data.length, page: 1, limit: data.length } }
    return { rows: [], meta: { total: 0, page: 1, limit: 0 } }
  },
  getTransaction: async (id) => {
    const { data } = await api.get(`/transactions/${id}`)
    return data
  },
}
