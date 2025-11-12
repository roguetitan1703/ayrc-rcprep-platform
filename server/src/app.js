const originalLog = console.log;
const originalerr = console.error
const originalwarn = console.warn

console.log = function (...args) {
  const timestamp = new Date().toISOString();
  originalLog(`[log ${timestamp}]`, ...args);
};
console.error = function (...args) {
  const timestamp = new Date().toISOString();
  originalerr(`[Err ${timestamp}]`, ...args);
};

console.warn = function (...args) {
  const timestamp = new Date().toISOString();
  originalwarn(`[War ${timestamp}]`, ...args);
};

import 'dotenv/config'
import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import cookieParser from 'cookie-parser'
import morgan from 'morgan'
import rateLimit from 'express-rate-limit'
import chalk from 'chalk'
import authRoutes from './routes/auth.js'
import userRoutes from './routes/users.js'
import rcRoutes from './routes/rcs.js'
import adminRoutes from './routes/admin.js'
import attemptRoutes from './routes/attempts.js'
import feedbackRoutes from './routes/feedback.js'
import subRoutes from './routes/subs.js'
import transactionsRoutes from './routes/transactions.js'
import aggregationRoutes from './routes/aggregation.js'
import { notFound, errorHandler } from './middleware/errors.js'
import cron from 'node-cron'
import { nullifyExpiredSubscriptions } from './services/subscription.service.js'

const app = express()

// CORS setup
const ORIGINS = [process.env.CLIENT_URL, 'https://www.ayrc-rcprep-9r4a.vercel.app', 'http://localhost:5173']
  .filter(Boolean)
  .map((s) => s.trim())

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
// Capture raw body for webhook signature verification (e.g. Razorpay)
app.use(
  express.json({
    limit: '1mb',
    verify: (req, _res, buf) => {
      // Store raw body buffer for later signature verification
      req.rawBody = buf
    },
  })
)
app.use(express.urlencoded({ extended: true }))

const morganMiddleware = morgan(function (tokens, req, res) {
  function statusColor() {
    const status = tokens.status(req, res);
    if (status >= 100 && status < 200) {
      return chalk.grey.bold(tokens.status(req, res));
    } else if (status >= 200 && status < 300) {
      return chalk.green.bold(tokens.status(req, res));
    } else if (status >= 300 && status < 400) {
      return chalk.red.bold(tokens.status(req, res));
    } else if (status >= 400 && status < 500) {
      return chalk.blue.bold(tokens.status(req, res));
    } else {
      // Default color for status codes outside the expected range
      return chalk.yellow.bold(tokens.status(req, res));
    }
  }

  return [
    chalk.hex("#34ace0").bold(tokens.method(req, res)),
    statusColor(),
    chalk.hex("#ff5252").bold(tokens.url(req, res)),
    chalk.hex("#2ed573").bold(tokens["response-time"](req, res) + " ms"),
    chalk.hex("#f78fb3").bold("@ " + tokens.date(req, res)),
    chalk.yellow(tokens["remote-addr"](req, res)),
    chalk.hex("#fffa65").bold("from " + tokens.referrer(req, res)),
    chalk.hex("#1e90ff")(tokens["user-agent"](req, res)),
    "\n",
  ].join(" ");
});
if (process.env.NODE_ENV !== "production") {
  app.use(morganMiddleware);
} else {
  app.use(morganMiddleware);
}
// Global rate limit
const limiter = rateLimit({ windowMs: 60 * 1000, max: 800 })
app.use(limiter)

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    ok: true,
    ip: req.ip,
    xForwardedFor: req.headers['x-forwarded-for'],
  })
})

// Routes
app.use('/api/v1/auth', authRoutes)
app.set('trust proxy', 1)
// Minimal request id middleware
app.use((req, _res, next) => {
  req.id = req.headers['x-request-id'] || Math.random().toString(36).slice(2)
  next()
})
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/rcs', rcRoutes)
app.use('/api/v1/attempts', attemptRoutes)
app.use('/api/v1/feedback', feedbackRoutes)
app.use('/api/v1/admin/feedback', feedbackRoutes) // Admin feedback routes
app.use('/api/v1/admin', adminRoutes)
app.use('/api/v1/sub', subRoutes)
app.use('/api/v1/transactions', transactionsRoutes)
app.use('/api/v1/all', aggregationRoutes)

// Scheduler: always-on subscription maintenance (run once at startup and daily at midnight)
// Skip background jobs when running tests to avoid open handles and flakiness.
if (process.env.NODE_ENV !== 'test') {
  ; (async () => {
    try {
      await nullifyExpiredSubscriptions({ dryRun: false })
      console.log('✅ Initial subscription nullification completed')
    } catch (err) {
      console.error('Error in initial nullification:', err)
    }
  })()

  // Daily at midnight
  cron.schedule('0 0 * * *', async () => {
    console.log(`[CRON] Running daily subscription nullification at ${new Date().toISOString()}`)
    try {
      await nullifyExpiredSubscriptions({ dryRun: false })
    } catch (err) {
      console.error('[CRON] Error nullifying subscriptions:', err)
    }
  })
}

// Error handlers
app.use(notFound)
app.use(errorHandler)

export default app
