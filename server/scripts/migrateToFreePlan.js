#!/usr/bin/env node
import 'dotenv/config'
import mongoose from 'mongoose'
import { Plan } from '../src/models/Plan.js'
import { User } from '../src/models/User.js'

async function connect(uri) {
  await mongoose.connect(uri, { dbName: process.env.MONGO_DB_NAME || undefined })
}

function parseArgs() {
  const argv = process.argv.slice(2)
  return {
    dry: argv.includes('--dry'),
    apply: argv.includes('--apply'),
    onlyExpired: argv.includes('--only-expired'),
    batchSize: (() => {
      const i = argv.indexOf('--batch-size')
      if (i === -1) return 1000
      const val = Number(argv[i + 1])
      return Number.isInteger(val) && val > 0 ? val : 1000
    })(),
    mongoUri: (() => {
      const i = argv.indexOf('--mongo')
      if (i === -1) return process.env.MONGO_URI || process.env.MONGODB_URI
      return argv[i + 1]
    })(),
  }
}

function buildQuery(onlyExpired) {
  // Candidates: legacy subscription == 'none' OR missing subscriptionPlan
  const base = [
    { subscription: 'none' },
    { subscription: null },
    { subscriptionPlan: { $exists: false } },
    { subscriptionPlan: null },
  ]

  const q = { $or: base }
  if (onlyExpired) {
    q.issubexp = true
  }
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

async function applyMigration(freePlanId, query, batchSize) {
  console.log('Applying migration in batches of', batchSize)
  const cursor = User.find(query).cursor()
  let batch = []
  let processed = 0
  for await (const user of cursor) {
    batch.push(user._id)
    if (batch.length >= batchSize) {
      const res = await User.updateMany(
        { _id: { $in: batch } },
        { $set: { subscriptionPlan: freePlanId, issubexp: true } }
      )
      processed += res.modifiedCount || batch.length
      console.log(`Updated batch: ${processed} users (last batch size ${batch.length})`)
      batch = []
    }
  }
  if (batch.length > 0) {
    const res = await User.updateMany(
      { _id: { $in: batch } },
      { $set: { subscriptionPlan: freePlanId, issubexp: true } }
    )
    processed += res.modifiedCount || batch.length
    console.log(`Updated final batch: total processed ${processed}`)
  }
  return processed
}

async function main() {
  const args = parseArgs()
  const uri = args.mongoUri
  if (!uri) {
    console.error('No Mongo URI provided. Set MONGO_URI or pass --mongo <uri>')
    process.exit(2)
  }

  console.log('Connecting to Mongo...')
  await connect(uri)
  console.log('Connected to Mongo')

  // find free plan
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
    process.exit(0)
  }

  // If apply present, perform dry-run first and ask interactive confirmation
  const { count } = await dryRun(freePlanId, query, 5)
  if (!args.apply) {
    console.log('No --apply flag provided. Exiting after dry-run.')
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
