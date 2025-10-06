import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') })
import { connectDB } from '../src/lib/db.js'
import { User } from '../src/models/User.js'
import { Attempt } from '../src/models/Attempt.js'
import { AnalyticsEvent } from '../src/models/AnalyticsEvent.js'

async function main(){
  await connectDB()
  const email = process.argv[2] || 'seed-student@arc.local'
  const user = await User.findOne({ email })
  if(!user){ console.log('No user found with email', email); process.exit(0) }
  console.log('User:', user.email, user._id.toString())
  const attempts = await Attempt.find({ userId: user._id }).limit(50).lean()
  console.log('Attempts found:', attempts.length)
  attempts.slice(0,5).forEach((a,i)=>{
    console.log(i+1, 'rc:', a.rcPassageId.toString(), 'score:', a.score, 'duration:', a.durationSeconds, 'q_details:', a.q_details?.length)
  })
  const events = await AnalyticsEvent.find({ userId: user._id }).limit(50).lean()
  console.log('AnalyticsEvents found:', events.length)
  events.slice(0,5).forEach((e,i)=>{
    console.log(i+1, e.type, e.payload && (e.payload.at || e.payload.attemptedAt || e.payload.attemptId || JSON.stringify(e.payload).slice(0,60)))
  })
  process.exit(0)
}
main().catch(e=>{ console.error(e); process.exit(1) })
