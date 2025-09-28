import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import { connectDB } from './lib/db.js'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import rcRoutes from './routes/rcs.js'
import adminRoutes from './routes/admin.js'
import attemptRoutes from './routes/attempts.js'
import feedbackRoutes from './routes/feedback.js'
import { notFound, errorHandler } from './middleware/errors.js'

const app = express()

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173'
app.use(cors({ origin: CLIENT_URL, credentials: true }))
const ORIGINS = (process.env.CORS_ORIGINS || process.env.CLIENT_URL || 'http://localhost:5173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ORIGINS.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)
app.use(cookieParser())
// Parse JSON and urlencoded bodies before routes
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'))

// Global rate limit (relaxed for GET-heavy dashboard loads); sensitive routes add their own if needed.
const limiter = rateLimit({ windowMs: 60 * 1000, max: 800 })
app.use(limiter)

app.get('/health', (req, res) => res.json({ ok: true }))

app.use('/api/v1/auth', authRoutes)

// Minimal request id middleware for traceability
app.use((req, _res, next) => {
  req.id = req.headers['x-request-id'] || Math.random().toString(36).slice(2)
  next()
})
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/rcs', rcRoutes)
app.use('/api/v1/attempts', attemptRoutes)
app.use('/api/v1/feedback', feedbackRoutes)
app.use('/api/v1/admin', adminRoutes)

app.use(notFound)
app.use(errorHandler)

const PORT = process.env.PORT || 4000
connectDB().then(() => {
  app.listen(PORT, '0.0.0.0', () => console.log(`API listening on :${PORT}`))
})

export default app
