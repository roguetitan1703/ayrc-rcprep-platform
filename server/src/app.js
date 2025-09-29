import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'

import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import rcRoutes from './routes/rcs.js'
import adminRoutes from './routes/admin.js'
import attemptRoutes from './routes/attempts.js'
import feedbackRoutes from './routes/feedback.js'
import subRoutes from './routes/subs.js'
import { notFound, errorHandler } from './middleware/errors.js'

const app = express()

// CORS setup
const ORIGINS = [
  process.env.CLIENT_URL,
  'http://localhost:5173'
]
  .filter(Boolean)
  .map((s) => s.trim());

app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || ORIGINS.includes(origin)) return cb(null, true)
      return cb(new Error('Not allowed by CORS'))
    },
    credentials: true,
  })
)

app.use(helmet())
app.use(cookieParser())
app.use(express.json({ limit: '1mb' }))
app.use(express.urlencoded({ extended: true }))


morgan.token('date', () => new Date().toISOString()) // ISO timestamp
app.use(morgan(':date[iso] :method :url :status :response-time ms - :res[content-length]'))

// Global rate limit
const limiter = rateLimit({ windowMs: 60 * 1000, max: 800 })
app.use(limiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    ip: req.ip,
    xForwardedFor: req.headers['x-forwarded-for']
  })
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.set("trust proxy", 1);
// Minimal request id middleware
app.use((req, _res, next) => {
  req.id = req.headers['x-request-id'] || Math.random().toString(36).slice(2)
  next()
})
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/rcs', rcRoutes)
app.use('/api/v1/attempts', attemptRoutes)
app.use('/api/v1/feedback', feedbackRoutes)
app.use('/api/v1/admin', adminRoutes)
app.use("/api/v1/sub", subRoutes);

// Error handlers
app.use(notFound)
app.use(errorHandler)

export default app
