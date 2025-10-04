import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
dotenv.config({ path: path.join(path.dirname(fileURLToPath(import.meta.url)), '.env') })
import { connectDB } from '../src/lib/db.js'
import { User } from '../src/models/User.js'
import { RcPassage } from '../src/models/RcPassage.js'
import { Attempt } from '../src/models/Attempt.js'
import { AnalyticsEvent } from '../src/models/AnalyticsEvent.js'
import bcrypt from 'bcryptjs'

function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d }

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)] }

async function ensureUser(email, password) {
    let u = await User.findOne({ email })
    if (u) return u
    const hash = await bcrypt.hash(password, 10)
    u = await User.create({ name: email.split('@')[0], email, password, passwordConfirm: password, role: 'aspirant' })
    return u
}

async function main() {
    await connectDB()
    const rcList = await RcPassage.find().limit(20)
    if (!rcList.length) { console.error('No RCs found. Run seed-rcs.js first.'); process.exit(1) }

    const users = []
    users.push(await ensureUser('seed-student-1@arc.local', 'test1234'))
    users.push(await ensureUser('seed-student-2@arc.local', 'test1234'))
    users.push(await ensureUser('seed-student@arc.local', 'test1234'))

    let createdAttempts = 0
    let createdEvents = 0

    for (const u of users) {
        // create login events across last 10 days
        for (let d = 1; d <= 7; d++) {
            await AnalyticsEvent.create({ userId: u._id, type: 'login', payload: { at: daysAgo(d) }, createdAt: daysAgo(d) })
            createdEvents++
        }

        // create attempts for random RCs
        for (let i = 0; i < 6; i++) {
            const rc = randChoice(rcList)
            const q_details = rc.questions.map((q, idx) => ({ questionIndex: idx, timeSpent: Math.floor(Math.random() * 80) + 10, wasReviewed: Math.random() > 0.7, isCorrect: Math.random() > 0.5, qType: q.qType || 'inference', qCategory: rc.topicTags?.[0] || 'general' }))
            const answers = rc.questions.map((q, idx) => q_details[idx].isCorrect ? q.correctAnswerId : (['A', 'B', 'C', 'D'].find(x => x !== q.correctAnswerId)))
            const durationSeconds = q_details.reduce((s, q) => s + q.timeSpent, 0)
            const attemptedAt = daysAgo(Math.floor(Math.random() * 10))
            // upsert using attemptType random
            const attemptType = Math.random() > 0.5 ? 'official' : 'practice'
            await Attempt.findOneAndUpdate({ userId: u._id, rcPassageId: rc._id, attemptType }, {
                userId: u._id,
                rcPassageId: rc._id,
                answers,
                score: answers.reduce((s, a, i) => s + (a === rc.questions[i].correctAnswerId ? 1 : 0), 0),
                durationSeconds,
                deviceType: Math.random() > 0.5 ? 'mobile' : 'desktop',
                q_details,
                attemptedAt,
                attemptType
            }, { upsert: true, new: true, setDefaultsOnInsert: true })
            createdAttempts++
            // create attempt_submission event
            await AnalyticsEvent.create({ userId: u._id, type: 'attempt_submission', payload: { rcPassageId: rc._id, durationSeconds, deviceType: Math.random() > 0.5 ? 'mobile' : 'desktop' }, createdAt: attemptedAt })
            createdEvents++
            // create some explanation_open events
            const opens = Math.floor(Math.random() * 3)
            for (let k = 0; k < opens; k++) {
                await AnalyticsEvent.create({ userId: u._id, type: 'explanation_open', payload: { rcPassageId: rc._id, questionIndex: Math.floor(Math.random() * 4) }, createdAt: daysAgo(Math.floor(Math.random() * 10)) })
                createdEvents++
            }
        }
    }

    console.log('Dummy analytics seeded:', { createdAttempts, createdEvents })
    process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
