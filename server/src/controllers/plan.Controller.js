import { Plan } from '../models/Plan.js'
import { success, badRequest, notFoundErr } from '../utils/http.js'

function validateFeatures(features) {
  if (!features || typeof features !== 'object') return null

  const out = {}
  // archive
  if (features.archive) {
    const a = features.archive
    const allowed = ['attempted-only', 'window', 'all']
    if (!a.type || !allowed.includes(a.type)) throw new Error('Invalid archive.type')
    if (a.type === 'window') {
      const wd = Number(a.windowDays)
      if (!Number.isInteger(wd) || wd < 0)
        throw new Error('archive.windowDays must be a non-negative integer')
      out.archive = { type: a.type, windowDays: wd, includeAttempted: a.includeAttempted !== false }
    } else {
      out.archive = { type: a.type, includeAttempted: a.includeAttempted !== false }
    }
  }

  // feedbackLock
  if (features.feedbackLock) {
    const f = features.feedbackLock
    out.feedbackLock = { enabled: !!f.enabled }
    if (f.scope && !['free', 'all'].includes(f.scope)) throw new Error('feedbackLock.scope invalid')
    out.feedbackLock.scope = f.scope || 'all'
  }

  // dailyLimits
  if (features.dailyLimits) {
    const d = features.dailyLimits
    const outDL = {}
    if (d.dailyRcs != null) {
      const dr = Number(d.dailyRcs)
      if (!Number.isInteger(dr) || dr < 0)
        throw new Error('dailyLimits.dailyRcs must be a non-negative integer')
      outDL.dailyRcs = dr
    }
    if (d.dailyAttempts != null) {
      const da = Number(d.dailyAttempts)
      if (!Number.isInteger(da) || da < 0)
        throw new Error('dailyLimits.dailyAttempts must be a non-negative integer')
      outDL.dailyAttempts = da
    }
    out.dailyLimits = outDL
  }

  if (features.extras && typeof features.extras === 'object') out.extras = features.extras

  return out
}

// Public: list active plans (supports ?active=true|false)
export async function listPublicPlans(req, res, next) {
  try {
    const activeOnly = req.query.active === undefined ? true : String(req.query.active) === 'true'
    const q = activeOnly ? { active: true } : {}
    const plans = await Plan.find(q).select('-metadata').sort({ finalPriceCents: 1 })

    // Map to a compact client-friendly shape, compute discountPercent when possible
    const data = plans.map((p) => {
      let discountPercent = null
      if (p.markupPriceCents && p.markupPriceCents > p.finalPriceCents) {
        discountPercent = Math.round(
          ((p.markupPriceCents - p.finalPriceCents) / p.markupPriceCents) * 100
        )
      }
      return {
        _id: p._id,
        name: p.name,
        slug: p.slug,
        description: p.description,
        currency: p.currency,
        finalPriceCents: p.finalPriceCents,
        markupPriceCents: p.markupPriceCents,
        discountPercent,
        billingType: p.billingType,
        durationDays: p.durationDays,
        accessUntil: p.accessUntil,
        features: p.features,
      }
    })

    return success(res, data)
  } catch (err) {
    next(err)
  }
}

// Admin: list all plans with metadata
export async function adminListPlans(req, res, next) {
  try {
    const plans = await Plan.find({}).sort({ createdAt: -1 })
    return success(res, plans)
  } catch (err) {
    next(err)
  }
}

export async function createPlan(req, res, next) {
  try {
    const payload = req.body
    // Basic required fields
    if (!payload.name || !payload.slug || payload.finalPriceCents == null || !payload.billingType) {
      return next(
        badRequest('Missing required plan fields: name, slug, finalPriceCents, billingType')
      )
    }

    // slug validation
    const slug = String(payload.slug)
    if (!/^[a-z0-9\-]{2,50}$/.test(slug))
      return next(
        badRequest(
          'Slug must be 2-50 characters and contain only lowercase letters, numbers and hyphens'
        )
      )
    // Prevent creating a plan with slug 'free'
    if (slug.toLowerCase() === 'free') {
      return next(badRequest('Cannot create a plan with reserved slug `free`'))
    }

    // price validations
    const finalPrice = Number(payload.finalPriceCents)
    if (isNaN(finalPrice) || finalPrice < 0)
      return next(badRequest('finalPriceCents must be a non-negative number'))
    if (payload.markupPriceCents != null && payload.markupPriceCents !== '') {
      const markup = Number(payload.markupPriceCents)
      if (isNaN(markup) || markup < 0)
        return next(badRequest('markupPriceCents must be a non-negative number'))
      if (markup < finalPrice)
        return next(
          badRequest('markupPriceCents should be greater than or equal to finalPriceCents')
        )
    }

    // billing semantics
    if (!['duration_days', 'till_date'].includes(payload.billingType))
      return next(badRequest('billingType must be one of duration_days or till_date'))
    if (payload.billingType === 'duration_days') {
      const d = Number(payload.durationDays)
      if (!d || isNaN(d) || d <= 0)
        return next(badRequest('durationDays must be a positive integer for duration_days billing'))
    }
    if (payload.billingType === 'till_date') {
      if (!payload.accessUntil)
        return next(badRequest('accessUntil date required for till_date billing'))
      const ad = new Date(payload.accessUntil)
      if (isNaN(ad.getTime())) return next(badRequest('accessUntil must be a valid date'))
    }

    const plan = new Plan({
      name: payload.name,
      slug: payload.slug,
      description: payload.description || '',
      active: payload.active !== undefined ? !!payload.active : true,
      currency: payload.currency || 'INR',
      finalPriceCents: payload.finalPriceCents,
      markupPriceCents: payload.markupPriceCents || null,
      billingType: payload.billingType,
      durationDays: payload.durationDays || null,
      accessUntil: payload.accessUntil || null,
      features: payload.features ? validateFeatures(payload.features) : {},
      metadata: payload.metadata || {},
      createdBy: req.user?.id || null,
    })

    await plan.save()
    return success(res, plan)
  } catch (err) {
    next(err)
  }
}

export async function updatePlan(req, res, next) {
  try {
    const { id } = req.params
    const updates = { ...req.body }
    // Protect billing fields for the canonical Free plan
    try {
      const existingPlan = await Plan.findById(id)
      if (existingPlan && String(existingPlan.slug).toLowerCase() === 'free') {
        const prohibited = ['billingType', 'durationDays', 'accessUntil', 'finalPriceCents', 'markupPriceCents']
        if (prohibited.some((p) => Object.prototype.hasOwnProperty.call(updates, p))) {
          return next(badRequest('Cannot modify billing fields of the Free plan'))
        }
      }
    } catch (e) {
      // ignore lookup errors and continue; validations below will catch invalid ids
    }
    // Prevent editing slug to 'free'
    if (updates.slug && String(updates.slug).toLowerCase() === 'free') {
      return next(badRequest('Cannot set slug to reserved value `free`'))
    }

    // If slug provided, validate format
    if (updates.slug && !/^[a-z0-9\-]{2,50}$/.test(String(updates.slug)))
      return next(
        badRequest(
          'Slug must be 2-50 characters and contain only lowercase letters, numbers and hyphens'
        )
      )

    // If prices provided, validate
    if (updates.finalPriceCents != null) {
      const fp = Number(updates.finalPriceCents)
      if (isNaN(fp) || fp < 0)
        return next(badRequest('finalPriceCents must be a non-negative number'))
    }
    if (updates.markupPriceCents != null && updates.markupPriceCents !== '') {
      const mp = Number(updates.markupPriceCents)
      if (isNaN(mp) || mp < 0)
        return next(badRequest('markupPriceCents must be a non-negative number'))
      if (updates.finalPriceCents != null && mp < Number(updates.finalPriceCents))
        return next(
          badRequest('markupPriceCents should be greater than or equal to finalPriceCents')
        )
    }

    // billing semantics validations when present
    if (updates.billingType && !['duration_days', 'till_date'].includes(updates.billingType))
      return next(badRequest('billingType must be one of duration_days or till_date'))
    if (updates.billingType === 'duration_days' && updates.durationDays != null) {
      const d = Number(updates.durationDays)
      if (!d || isNaN(d) || d <= 0)
        return next(badRequest('durationDays must be a positive integer for duration_days billing'))
    }
    if (updates.billingType === 'till_date' && updates.accessUntil != null) {
      const ad = new Date(updates.accessUntil)
      if (isNaN(ad.getTime())) return next(badRequest('accessUntil must be a valid date'))
    }

    // Validate features if present
    if (updates.features) {
      try {
        updates.features = validateFeatures(updates.features)
      } catch (e) {
        return next(badRequest(e.message || 'Invalid features'))
      }
    }

    // Increment version
    updates.$inc = { version: 1 }

    const plan = await Plan.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
    if (!plan) return next(notFoundErr('Plan not found'))
    return success(res, plan)
  } catch (err) {
    next(err)
  }
}

export async function deactivatePlan(req, res, next) {
  try {
    const { id } = req.params
    const plan = await Plan.findById(id)
    if (!plan) return next(notFoundErr('Plan not found'))
    if (String(plan.slug).toLowerCase() === 'free')
      return next(badRequest('Cannot deactivate free plan'))
    plan.active = false
    plan.version = (plan.version || 1) + 1
    await plan.save()
    return success(res, plan)
  } catch (err) {
    next(err)
  }
}

export async function deletePlan(req, res, next) {
  try {
    const { id } = req.params
    const plan = await Plan.findById(id)
    if (!plan) return next(notFoundErr('Plan not found'))
    if (String(plan.slug).toLowerCase() === 'free')
      return next(badRequest('Cannot delete free plan'))
    await Plan.findByIdAndDelete(id)
    return success(res, { ok: true })
  } catch (err) {
    next(err)
  }
}
