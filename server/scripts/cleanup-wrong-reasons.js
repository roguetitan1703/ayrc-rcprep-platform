/**
 * Cleanup Script: Remove wrongReasons field
 *
 * ⚠️  WARNING: This script permanently removes the wrongReasons field
 * from all Attempt documents. Only run after:
 * 1. Migration script has been run successfully
 * 2. Data has been verified in production
 * 3. You've confirmed analysisFeedback contains all data
 *
 * Run with: node scripts/cleanup-wrong-reasons.js
 */

import mongoose from 'mongoose'
import { Attempt } from '../src/models/Attempt.js'
import dotenv from 'dotenv'
import readline from 'readline'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/arc-prep'

function askConfirmation(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  })

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close()
      resolve(answer.toLowerCase() === 'yes')
    })
  })
}

async function cleanup() {
  try {
    console.log('🔌 Connecting to MongoDB...')
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Check how many documents have wrongReasons
    const countWithWrongReasons = await Attempt.countDocuments({
      wrongReasons: { $exists: true, $ne: [] },
    })

    const countWithAnalysisFeedback = await Attempt.countDocuments({
      analysisFeedback: { $exists: true, $ne: [] },
    })

    console.log('\n📊 CURRENT STATE:')
    console.log(`  - Documents with wrongReasons: ${countWithWrongReasons}`)
    console.log(`  - Documents with analysisFeedback: ${countWithAnalysisFeedback}`)

    if (countWithWrongReasons > 0 && countWithAnalysisFeedback === 0) {
      console.log('\n⚠️  WARNING: analysisFeedback is empty but wrongReasons has data!')
      console.log('   You should run the migration script first:')
      console.log('   node scripts/migrate-wrong-reasons.js')
      process.exit(1)
    }

    console.log('\n⚠️  WARNING: This operation is IRREVERSIBLE!')
    console.log('   This will permanently delete the wrongReasons field from all documents.')
    console.log('')

    const confirmed = await askConfirmation(
      'Are you absolutely sure you want to proceed? (type "yes" to confirm): '
    )

    if (!confirmed) {
      console.log('\n❌ Operation cancelled by user')
      process.exit(0)
    }

    console.log('\n🗑️  Removing wrongReasons field...')

    const result = await Attempt.updateMany(
      { wrongReasons: { $exists: true } },
      { $unset: { wrongReasons: '' } }
    )

    console.log('\n✅ Cleanup completed!')
    console.log(`   Modified ${result.modifiedCount} documents`)

    console.log('\n📝 NEXT STEPS:')
    console.log('1. Update Attempt model to remove wrongReasons field definition')
    console.log('2. Remove wrongReasonSchema from models/Attempt.js')
    console.log('3. Deploy the updated model')
  } catch (error) {
    console.error('💥 Cleanup failed:', error)
    process.exit(1)
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 MongoDB connection closed')
  }
}

console.log('🗑️  Wrong Reasons Field Cleanup Script')
console.log('='.repeat(60))
cleanup()
