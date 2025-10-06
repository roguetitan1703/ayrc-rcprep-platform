// lib/rcApi.js
import { api } from './api'

export async function getTodayRcs() {
    const { data } = await api.get('/rcs/today')
    return data
}

export async function getArchive(page = 1, limit = 10) {
    const { data } = await api.get(`/rcs/archive?page=${page}&limit=${limit}`)
    return data
}

export async function getRcById(id) {
    const { data } = await api.get(`/rcs/${id}`)
    return data
}

export default { getTodayRcs, getArchive, getRcById }
