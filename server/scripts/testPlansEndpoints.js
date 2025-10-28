import 'dotenv/config'
import axios from 'axios'

const API = process.env.TEST_API_URL || `http://localhost:${process.env.PORT || 3000}`

async function run() {
  try {
    console.log('GET /api/v1/sub/plans')
    const r = await axios.get(`${API}/api/v1/sub/plans`)
    console.log('status', r.status)
    console.log('plans:', r.data)
  } catch (e) {
    console.error('Error fetching plans:', e.response?.data || e.message)
  }
}

run()
