import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') })
import http from 'http'

function requestJson(method, url, body = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const u = new URL(url)
        const opts = { method, hostname: u.hostname, port: u.port, path: u.pathname + (u.search || ''), headers: { 'content-type': 'application/json', ...headers } }
        const req = http.request(opts, res => {
            let data = ''
            res.on('data', c => data += c)
            res.on('end', () => {
                try { const json = JSON.parse(data); resolve({ status: res.statusCode, body: json }) } catch (e) { resolve({ status: res.statusCode, body: data }) }
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
    const email = process.argv[2] || 'admin@arc.local'
    const password = process.argv[3] || 'admin123'
    const login = await requestJson('POST', base + '/auth/login', { email, password })
    const token = login.body?.data?.token
    if (!token) { console.error('Login failed', login); process.exit(1) }
    const analytics = await requestJson('GET', base + '/admin/rcs-analytics', null, { authorization: `Bearer ${token}` })
    console.log(JSON.stringify(analytics.body, null, 2))
    process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
