#!/usr/bin/env node
/**
 * migrateToFreePlan.js
 *
 * Consolidated migration script.
 *
 * Purpose:
 *  - Find candidate users (legacy `subscription` values that indicate no paid plan,
 *    or missing/null `subscriptionPlan`) and assign them the canonical Free plan
 *    (slug: 'free').
 *  - On --apply: set `subscriptionPlan` to free plan id, unset `subscription`, set
 *    `issubexp=false`, and set `subon` if missing.
 *  - On --dry: show candidate count and a small sample (no writes).
 *
 * Usage examples (PowerShell):
 *  $env:MONGO_URI="<uri>"; node .\server\scripts\migrateToFreePlan.js --dry
 *  node .\server\scripts\migrateToFreePlan.js --mongo "<uri>" --apply --batch-size 500
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { Plan } from '../src/models/Plan.js'
import { User } from '../src/models/User.js'

function parseArgs() {
  const argv = process.argv.slice(2)
  return {
    dry: argv.includes('--dry'),
    apply: argv.includes('--apply'),
    onlyExpired: argv.includes('--only-expired'),
    batchSize: (() => {
      const i = argv.indexOf('--batch-size')
      if (i === -1) return 500
      const val = Number(argv[i + 1])
      return Number.isInteger(val) && val > 0 ? val : 500
    })(),
    mongoUri: (() => {
      const i = argv.indexOf('--mongo')
      if (i === -1) return process.env.MONGO_URI || process.env.MONGODB_URI
      return argv[i + 1]
    })(),
  }
}

function buildQuery(onlyExpired) {
  // Candidates: legacy subscription values that indicate no paid plan OR missing/null subscriptionPlan
  const base = [
    { subscription: 'none' },
    { subscription: null },
    { subscriptionPlan: { $exists: false } },
    { subscriptionPlan: null },
  ]

  const q = { $or: base }
  if (onlyExpired) q.issubexp = true
  return q
}

async function dryRun(freePlanId, query, limit = 20) {
  console.log('DRY RUN: Query sample (limit %s):', limit)
  const count = await User.countDocuments(query)
  console.log('Candidates count:', count)
  const sample = await User.find(query).limit(limit).select('_id email subon subexp subscription subscriptionPlan issubexp').lean()
  console.log('Sample results:')
  sample.forEach((u) => console.log(JSON.stringify(u)))
  return { count, sample }
}

async function applyBatch(ids, freePlanId) {
  if (!ids || ids.length === 0) return { matched: 0, modified: 0 }
  const now = new Date()
  // We'll build bulk ops so we can set subon only when missing per-user.
  const users = await User.find({ _id: { $in: ids } }).select('subon').lean()
  const bulkOps = users.map((u) => {
    const set = { subscriptionPlan: freePlanId, issubexp: false }
    if (!u.subon) set.subon = now
    return {
      updateOne: {
        filter: { _id: u._id },
        update: { $set: set, $unset: { subscription: '' } },
      },
    }
  })
  if (bulkOps.length === 0) return { matched: 0, modified: 0 }
  const res = await User.bulkWrite(bulkOps)
  // bulkWrite returns an object with ok/modifiedCount on modern drivers; return summary
  return { result: res }
}

async function applyMigration(freePlanId, query, batchSize) {
  console.log('Applying migration in batches of', batchSize)
  const cursor = User.find(query).cursor()
  let batch = []
  let processed = 0
  for await (const user of cursor) {
    batch.push(user._id)
    if (batch.length >= batchSize) {
      await applyBatch(batch, freePlanId)
      processed += batch.length
      console.log(`Updated batch: ${processed} users (last batch size ${batch.length})`)
      batch = []
    }
  }
  if (batch.length > 0) {
    await applyBatch(batch, freePlanId)
    processed += batch.length
    console.log(`Updated final batch: total processed ${processed}`)
  }
  return processed
}

async function main() {
  const args = parseArgs()
  if (!args.dry && !args.apply) {
    console.log('Please provide --dry or --apply')
    process.exit(1)
  }

  const uri = args.mongoUri
  if (!uri) {
    console.error('No Mongo URI provided. Set MONGO_URI or pass --mongo <uri>')
    process.exit(2)
  }

  console.log('Connecting to Mongo...')
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || undefined })
  console.log('Connected to Mongo')

  const freePlan = await Plan.findOne({ slug: 'free' })
  if (!freePlan) {
    console.error('Free plan (slug="free") not found in plans collection. Aborting.')
    process.exit(3)
  }
  const freePlanId = freePlan._id
  console.log('Free plan id:', String(freePlanId))

  const query = buildQuery(args.onlyExpired)

  if (args.dry && !args.apply) {
    await dryRun(freePlanId, query, 20)
    console.log('\nDRY RUN complete. To apply, re-run with --apply (and optionally --batch-size N).')
    await mongoose.disconnect()
    process.exit(0)
  }

  // If apply present, do a small dry-run first to show counts
  const { count } = await dryRun(freePlanId, query, 5)
  if (!args.apply) {
    console.log('No --apply flag provided. Exiting after dry-run.')
    await mongoose.disconnect()
    process.exit(0)
  }

  console.log(`About to apply migration to ${count} users. Proceeding...`)
  const processed = await applyMigration(freePlanId, query, args.batchSize)
  console.log(`Migration complete. Processed ${processed} users.`)
  await mongoose.disconnect()
  process.exit(0)
}

main().catch((err) => {
  console.error('Migration script error:', err)
  process.exit(1)
})
