import mongoose from 'mongoose'
import { Transaction } from '../models/Transaction.js'
import { success, badRequest, notFoundErr } from '../utils/http.js'

// GET /api/v1/transactions
// Query params: is_discrepant, userId, planId, from, to, page, limit
export async function listTransactions(req, res, next) {
  try {
    const { is_discrepant, userId, planId, from, to, page = 1, limit = 50 } = req.query || {}

    const q = {}
    if (typeof is_discrepant !== 'undefined') {
      q.is_discrepant = is_discrepant === 'true' || is_discrepant === true
    }
    if (userId && mongoose.isValidObjectId(userId)) q.user = userId
    if (planId && mongoose.isValidObjectId(planId)) q.plan = planId
    if (from || to) {
      q.createdAt = {}
      if (from) {
        const f = new Date(from)
        if (!isNaN(f)) q.createdAt.$gte = f
      }
      if (to) {
        const t = new Date(to)
        if (!isNaN(t)) q.createdAt.$lte = t
      }
      // clean up if empty
      if (Object.keys(q.createdAt).length === 0) delete q.createdAt
    }

    const pageNum = Math.max(1, Number(page) || 1)
    const lim = Math.min(500, Math.max(1, Number(limit) || 50))
    const skip = (pageNum - 1) * lim

    const [rows, total] = await Promise.all([
      Transaction.find(q)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(lim)
        .populate('user', 'name email')
        .populate('plan', 'slug finalPriceCents')
        .lean()
        .exec(),
      Transaction.countDocuments(q),
    ])

    return success(res, { rows, total, page: pageNum, limit: lim })
  } catch (err) {
    next(err)
  }
}

// GET /api/v1/transactions/:id
export async function getTransactionById(req, res, next) {
  try {
    const { id } = req.params
    if (!mongoose.isValidObjectId(id)) return next(notFoundErr('Transaction not found'))
    const tx = await Transaction.findById(id)
      .populate('user', 'name email')
      .populate('plan', 'slug finalPriceCents')
      .lean()
    if (!tx) return next(notFoundErr('Transaction not found'))
    return success(res, tx)
  } catch (err) {
    next(err)
  }
}

export default { listTransactions, getTransactionById }
