import mongoose from 'mongoose'
import { Plan } from '../src/models/Plan.js'

let mongod = null

async function tryStartInMemory() {
  try {
    // dynamic import so tests can still run if mongodb-memory-server isn't installed
    const { MongoMemoryServer } = await import('mongodb-memory-server')
    mongod = await MongoMemoryServer.create()
    const uri = mongod.getUri()
    await mongoose.connect(uri, { dbName: 'test' })
    return true
  } catch (e) {
    console.warn('mongodb-memory-server not available, falling back to MONGODB_URI if set')
    return false
  }
}

export async function setupTestDB() {
  const started = await tryStartInMemory()
  if (!started) {
    const uri = process.env.MONGODB_URI
    if (!uri) throw new Error('MONGODB_URI not set and mongodb-memory-server not installed')
    await mongoose.connect(uri, { dbName: process.env.MONGODB_DB || 'arc' })
  }

  // Ensure minimal required plans exist for tests
  await Plan.updateOne(
    { slug: 'free' },
    {
      $setOnInsert: {
        name: 'Free',
        slug: 'free',
        description: 'Free plan',
        active: true,
        currency: 'INR',
        finalPriceCents: 0,
        billingType: 'duration_days',
        durationDays: 0,
        features: { archive: { type: 'attempted-only' } },
      },
    },
    { upsert: true }
  )
}

export async function teardownTestDB() {
  try {
    await mongoose.disconnect()
  } finally {
    if (mongod) await mongod.stop()
    mongod = null
  }
}
