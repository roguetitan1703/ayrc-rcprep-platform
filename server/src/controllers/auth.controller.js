import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { User } from '../models/User.js'
import { signJwt } from '../utils/jwt.js'
import { success, badRequest } from '../utils/http.js'
import { Attempt } from '../models/Attempt.js'
import { startOfIST, endOfIST } from '../utils/date.js'

const registerSchema = z
  .object({
    name: z.string().min(1),
    email: z.string().email(),
    phoneNumber: z.string().optional(),
    password: z.string().min(6),
    passwordConfirm: z.string().min(6),
  })
  .refine((d) => d.password === d.passwordConfirm, {
    message: 'Passwords do not match',
    path: ['passwordConfirm'],
  })

export async function register(req, res, next) {
  try {
    const data = registerSchema.parse(req.body)
    const exists = await User.findOne({ email: data.email })
    if (exists) throw badRequest('Email already in use')
    // Let the User model pre-save middleware hash the password and remove passwordConfirm
    const user = await User.create({ ...data })
    await user.updateDailyStreak()
    return success(res, { id: user._id })
  } catch (e) {
    next(e)
  }
}

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
})

export async function login(req, res, next) {
  try {
    const parseResult = loginSchema.safeParse(req.body)
    if (!parseResult.success) {
      return res.status(400).json({ message: "Invalid credentials" })
    }

    const { email, password } = parseResult.data

    const user = await User.findOne({ email }).select('+password')
    if (!user || !user.password) throw badRequest('Invalid credentials')
    
    const ok = await user.correctPassword(password, user.password)
    if (!ok) throw badRequest('Invalid credentials')

    const token = signJwt({ id: user._id, role: user.role, name: user.name })
    await user.updateDailyStreak()
    res.cookie('token', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: false,
      maxAge: 7 * 24 * 3600 * 1000,
    })
    // Log login analytics event (non-blocking)
    try {
      AnalyticsEvent.create({ userId: user._id, type: 'login', payload: { at: new Date() } })
    } catch (e) {}
    return success(res, { token })
  } catch (e) {
    next(e)
  }
}

export async function me(req, res, next) {
  try {
    const user = await User.findById(req.user.id).select('-password')
    res.set('Cache-Control', 'private, max-age=30')
    return success(res, user)
  } catch (e) {
    next(e)
  }
}

export async function updateMe(req, res, next) {
  try {
    const { name } = req.body
    if (!name) throw badRequest('Name required')
    await User.findByIdAndUpdate(req.user.id, { name })
    return success(res, { ok: true })
  } catch (e) {
    next(e)
  }
}

export async function changePassword(req, res, next) {
  try {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword || newPassword.length < 6) throw badRequest('Invalid input')

    const user = await User.findById(req.user.id).select('+password')
    if (!user || !user.password) throw badRequest('Invalid user')

    const ok = await user.correctPassword(oldPassword, user.password)
    if (!ok) throw badRequest('Invalid old password')

    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    return success(res, { ok: true })
  } catch (e) {
    next(e)
  }
}

export async function stats(req, res, next) {
  try {
    const userId = req.user.id
    const attempts = await Attempt.find({ userId, attemptType: 'official' }).select(
      'score attemptedAt'
    )
    const totalAttempts = attempts.length // official attempts only
    const totalCorrect = attempts.reduce((a, c) => a + (c.score || 0), 0) // each score is #correct
    const accuracy =
      totalAttempts > 0 ? Number(((totalCorrect / (totalAttempts * 4)) * 100).toFixed(1)) : 0
    // last 7 days streak-like continuity (based on actual attempt days) and per-day attempt presence
    const today = startOfIST()
    const daySet = new Set(
      attempts.map((a) => startOfIST(a.attemptedAt || a.createdAt).toISOString())
    )
    let rolling = 0
    for (let i = 0; i < 7; i++) {
      const d = new Date(today)
      d.setDate(today.getDate() - i)
      if (daySet.has(startOfIST(d).toISOString())) rolling++
      else break
    }
    return success(res, { totalAttempts, accuracy, rollingConsistentDays: rolling })
  } catch (e) {
    next(e)
  }
}

// Topic accuracy & recent trends (last 30 days)
export async function analytics(req, res, next) {
  try {
    const userId = req.user.id
    const since = new Date()
    since.setDate(since.getDate() - 30)
    const attempts = await Attempt.find({ userId, attemptedAt: { $gte: since } }).select(
      'score answers attemptedAt rcPassageId attemptType'
    )
    const rcMap = new Map()
    const passageIds = attempts.map((a) => a.rcPassageId)
    const passages = await RcModel.find({ _id: { $in: passageIds } }).select('topicTags questions')
    passages.forEach((p) => rcMap.set(p._id.toString(), p))
    const topicStats = new Map()
    for (const a of attempts) {
      const p = rcMap.get(a.rcPassageId.toString())
      if (!p) continue
      p.topicTags.forEach((tag) => {
        if (!topicStats.has(tag)) topicStats.set(tag, { tag, correct: 0, total: 0 })
      })
      // per question correctness
      p.questions.forEach((q, i) => {
        const correct = a.answers[i] && a.answers[i] === q.correctAnswerId
        p.topicTags.forEach((tag) => {
          const t = topicStats.get(tag)
          t.total += 1
          if (correct) t.correct += 1
        })
      })
    }
    const topics = Array.from(topicStats.values()).map((t) => ({
      tag: t.tag,
      accuracy: t.total ? Number(((t.correct / t.total) * 100).toFixed(1)) : 0,
      totalQuestions: t.total,
    }))
    topics.sort((a, b) => a.tag.localeCompare(b.tag))
    // simple trend: attempts per day last 7 days
    const today = startOfIST()
    const trend = []
    for (let i = 6; i >= 0; i--) {
      const d = new Date(today)
      d.setDate(d.getDate() - i)
      const key = startOfIST(d).toISOString()
      const count = attempts.filter(
        (a) => startOfIST(a.attemptedAt).toISOString() === key && a.attemptType === 'official'
      ).length
      trend.push({ date: key.slice(0, 10), attempts: count })
    }
    return success(res, { topics, trend })
  } catch (e) {
    next(e)
  }
}

// Minimal email-less reset flow stubs for MVP (can be wired to email service later)
export async function forgotPassword(req, res, next) {
  try {
    // Normally generate token and email it; for MVP, respond OK to avoid blocking
    return success(res, { ok: true })
  } catch (e) {
    next(e)
  }
}

export async function resetPassword(req, res, next) {
  try {
    // Accept email and newPassword for MVP
    const { email, newPassword } = req.body
    if (!email || !newPassword || newPassword.length < 6) throw badRequest('Invalid input')
    const user = await User.findOne({ email })
    if (!user) throw badRequest('Invalid reset link')
    user.password = await bcrypt.hash(newPassword, 10)
    await user.save()
    return success(res, { ok: true })
  } catch (e) {
    next(e)
  }
}

// DEV ONLY: upsert an admin user for local setup
export async function devSeedAdmin(req, res, next) {
  try {
    if (process.env.NODE_ENV === 'production') return next(badRequest('Not allowed'))
    const src = { ...(req.body || {}), ...(req.query || {}) }
    const { email, name = 'Admin', password = 'admin123' } = src
    if (!email) throw badRequest('Email required')
    const hash = await bcrypt.hash(password, 10)
    const existing = await User.findOne({ email })
    if (existing) {
      existing.name = name
      existing.role = 'admin'
      existing.password = hash
      await existing.save()
      return success(res, { updated: true })
    }
    const u = await User.create({ name, email, password: hash, role: 'admin' })
    return success(res, { created: true, id: u._id })
  } catch (e) {
    next(e)
  }
}

// dashboardBundle has been moved to dashboard.controller.js for better separation of concerns
