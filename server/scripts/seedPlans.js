import 'dotenv/config'
import { connectDB } from '../src/lib/db.js'
import { Plan } from '../src/models/Plan.js'
import { toIST, endOfIST } from '../src/utils/date.js'

async function main() {
  await connectDB()

  const plans = [
    {
      name: 'Free',
      slug: 'free',
      description: 'Free plan - only RCs you attempted',
      active: true,
      currency: 'INR',
      finalPriceCents: 0,
      markupPriceCents: null,
      billingType: 'duration_days',
      durationDays: 0,
      features: { archive: { type: 'attempted-only' } },
    },
    {
      name: 'Weekly',
      slug: 'weekly',
      description: '7 day access to weekly archives',
      active: true,
      currency: 'INR',
      finalPriceCents: 15000,
      markupPriceCents: 20000,
      billingType: 'duration_days',
      durationDays: 7,
      features: { archive: { type: 'window', windowDays: 7, includeAttempted: true } },
    },
    {
      name: 'Till CAT 2026',
      slug: 'till-cat-2026',
      description: 'Access to archives until CAT 2026',
      active: true,
      currency: 'INR',
      finalPriceCents: 170000,
      billingType: 'till_date',
      // accessUntil will be set to end-of-day IST for 2026-12-31
      accessUntil: new Date('2026-12-31T18:29:59.999Z'),
      features: { archive: { type: 'all' } },
    },
  ]

  for (const p of plans) {
    const existing = await Plan.findOne({ slug: p.slug })
    if (existing) {
      console.log('Plan exists, skipping:', p.slug)
      continue
    }
    const plan = new Plan(p)
    await plan.save()
    console.log('Created plan:', p.slug)
  }

  process.exit(0)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
