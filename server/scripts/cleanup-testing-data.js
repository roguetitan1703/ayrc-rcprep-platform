import mongoose from 'mongoose'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'
import dotenv from 'dotenv'
import readline from 'readline'

import { User } from '../src/models/User.js'
import { RcPassage } from '../src/models/RcPassage.js'
import { Feedback } from '../src/models/Feedback.js'
import { FeedbackQuestion } from '../src/models/FeedbackQuestion.js'
import { Subscription } from '../src/models/Subscription.js'
import { Transaction } from '../src/models/Transaction.js'
import { Attempt } from '../src/models/Attempt.js'


const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, '../.env') })
console.log('Loaded MONGODB_URI:', process.env.MONGODB_URI)


const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
})

function ask(question) {
  return new Promise((resolve) => rl.question(question, resolve))
}

async function main() {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('\n✅ Connected to MongoDB\n')

    // Count records before deletion for summary
    const counts = await Promise.all([
      User.countDocuments(),
      RcPassage.countDocuments(),
      Feedback.countDocuments(),
      FeedbackQuestion.countDocuments(),
      Subscription.countDocuments(),
      Transaction.countDocuments(),
      Attempt.countDocuments(),
    ])

    console.log(`📊 Current Data Snapshot:`)
    console.log(`  Users: ${counts[0]}`)
    console.log(`  RC Passages: ${counts[1]}`)
    console.log(`  Feedback: ${counts[2]}`)
    console.log(`  Feedback Questions: ${counts[3]}`)
    console.log(`  Subscriptions: ${counts[4]}`)
    console.log(`  Transactions: ${counts[5]}`)
    console.log(`  Attempts: ${counts[6]}\n`)

    const answer = await ask('⚠️  Are you sure you want to DELETE all test data? (yes/no): ')
    if (answer.toLowerCase() !== 'yes') {
      console.log('❎ Cleanup aborted.')
      process.exit(0)
    }

    // Preserve core admin(s)
    const preservedAdmins = ['admin@arcplatform.com'] // <-- edit with your real admin email(s)

    const userRes = await User.deleteMany({
      role: { $ne: 'admin' },
      email: { $nin: preservedAdmins },
    })
    console.log(`🧍‍♂️ Deleted ${userRes.deletedCount} non-admin users`)

    const rcRes = await RcPassage.deleteMany({})
    console.log(`📘 Deleted ${rcRes.deletedCount} RC passages`)

    const fbRes = await Feedback.deleteMany({})
    console.log(`💬 Deleted ${fbRes.deletedCount} feedback submissions`)

    const fqRes = await FeedbackQuestion.deleteMany({})
    console.log(`❓ Deleted ${fqRes.deletedCount} feedback questions`)

    const subRes = await Subscription.deleteMany({})
    console.log(`📦 Deleted ${subRes.deletedCount} subscription records`)

    const txnRes = await Transaction.deleteMany({})
    console.log(`💳 Deleted ${txnRes.deletedCount} transactions`)

    const attRes = await Attempt.deleteMany({})
    console.log(`🧠 Deleted ${attRes.deletedCount} attempts`)

    console.log('\n🎉 Cleanup complete! Your ARC test database is now empty (except plans & admins).')

    await mongoose.disconnect()
    rl.close()
  } catch (err) {
    console.error('❌ Error during cleanup:', err)
    rl.close()
    process.exit(1)
  }
}

main()
