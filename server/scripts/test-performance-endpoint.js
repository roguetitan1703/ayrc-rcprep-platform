import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') })
import http from 'http'

function requestJson(method, url, body = null, headers = {}) {
  return new Promise((resolve, reject) => {
    const u = new URL(url)
    const opts = {
      method,
      hostname: u.hostname,
      port: u.port,
      path: u.pathname + (u.search || ''),
      headers: { 'content-type': 'application/json', ...headers },
    }
    const req = http.request(opts, (res) => {
      let data = ''
      res.on('data', (c) => (data += c))
      res.on('end', () => {
        try {
          const json = JSON.parse(data)
          resolve({ status: res.statusCode, body: json })
        } catch (e) {
          resolve({ status: res.statusCode, body: data })
        }
      })
    })
    req.on('error', reject)
    if (body) req.write(JSON.stringify(body))
    req.end()
  })
}

async function main() {
  const port = process.env.PORT || 4000
  const base = `http://localhost:${port}`

  // Login with test user
  const email = 'analytics.test@example.com'
  const password = 'Test@1234'

  console.log('🔐 Logging in as test user...\n')
  const login = await requestJson('POST', base + '/api/v1/auth/login', { email, password })
  const token = login.body?.token || login.body?.data?.token

  if (!token) {
    console.error('❌ Login failed', login)
    process.exit(1)
  }

  console.log('✅ Login successful!\n')

  // Test user ID from seeding script
  const userId = '68e5935c0c1062fd3eaa886f'

  console.log('🧪 Testing Performance Endpoint...\n')
  console.log(`📊 User ID: ${userId}\n`)

  const response = await requestJson(
    'GET',
    `${base}/api/v1/all/performance?userId=${userId}`,
    null,
    { authorization: `Bearer ${token}` }
  )

  if (response.status === 200) {
    console.log('✅ Performance endpoint working!\n')
    console.log('='.repeat(80))
    console.log('QUESTION TYPE ROLLUPS')
    console.log('='.repeat(80))
    console.log(JSON.stringify(response.body.questionRollups, null, 2))

    console.log('\n' + '='.repeat(80))
    console.log('PROGRESS TIMELINE (last 10 attempts)')
    console.log('='.repeat(80))
    console.log(JSON.stringify(response.body.progressTimeline.slice(-10), null, 2))

    console.log('\n' + '='.repeat(80))
    console.log('RADAR CHART DATA')
    console.log('='.repeat(80))
    console.log(JSON.stringify(response.body.radarData, null, 2))

    console.log('\n' + '='.repeat(80))
    console.log('RECENT ATTEMPTS')
    console.log('='.repeat(80))
    console.log(JSON.stringify(response.body.recentAttempts, null, 2))
  } else {
    console.error('❌ Error:', response.status)
    console.error(JSON.stringify(response.body, null, 2))
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
