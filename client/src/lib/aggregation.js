// lib/aggregation.js
import { api } from './api'

export async function getleaderboard() {
    const { data } = await api.get('/all/leaderboard')
    return data
}
