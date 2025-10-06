import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'
dotenv.config()
import { connectDB } from '../src/lib/db.js'
import { User } from '../src/models/User.js'
import { RcPassage } from '../src/models/RcPassage.js'
import { Attempt } from '../src/models/Attempt.js'
import { AnalyticsEvent } from '../src/models/AnalyticsEvent.js'
import bcrypt from 'bcryptjs'

// Usage: node seed-large-analytics.js [userCount] [rcLimit] [maxAttemptsPerRc]
// Example: node seed-large-analytics.js 500 25

function randChoice(arr) { return arr[Math.floor(Math.random() * arr.length)] }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min }
function daysAgo(n) { const d = new Date(); d.setDate(d.getDate() - n); return d }

async function ensureUser(email, password) {
    let u = await User.findOne({ email })
    if (u) return u
    // create user with plain password so mongoose pre-save will hash it
    u = await User.create({ name: email.split('@')[0], email, password, passwordConfirm: password, role: 'aspirant' })
    return u
}

async function main() {
    const userCount = Number(process.argv[2] || process.env.SEED_USER_COUNT || 50)
    const rcLimit = Number(process.argv[3] || process.env.SEED_RC_LIMIT || 20)
    const maxAttemptsPerRc = Number(process.argv[4] || process.env.SEED_ATTEMPTS_PER_RC || 2)

    console.log('Connecting to DB...')
    await connectDB()

    const rcList = await RcPassage.find().limit(rcLimit)
    if (!rcList || rcList.length === 0) {
        console.error('No RCs found. Run scripts/seed-rcs.js first or increase rcLimit.')
        process.exit(1)
    }

    console.log(`Using ${rcList.length} RCs; will create ${userCount} users`)

    const createdUsers = []
    for (let i = 1; i <= userCount; i++) {
        const email = `seed-user-${i}@arc.local`
        try {
            const u = await ensureUser(email, 'test1234')
            createdUsers.push(u)
            if (i % 50 === 0) console.log(`Created/ensured ${i} users`)
        } catch (e) {
            console.error('User create err', email, e.message)
        }
    }

    console.log(`Ensured ${createdUsers.length} users. Creating attempts and analytics events...`)

    let attemptsCreated = 0
    let eventsCreated = 0

    // For each user, create attempts across a subset of RCs
    for (let ui = 0; ui < createdUsers.length; ui++) {
        const user = createdUsers[ui]
        // create some login events across last 30 days
        const logins = randInt(3, 12)
        const loginEvents = []
        for (let l = 0; l < logins; l++) {
            const d = daysAgo(randInt(0, 29))
            loginEvents.push({ userId: user._id, type: 'login', payload: { at: d }, createdAt: d })
        }
        if (loginEvents.length) {
            await AnalyticsEvent.insertMany(loginEvents)
            eventsCreated += loginEvents.length
        }

        // choose a subset of RCs for this user
        const rcCountForUser = Math.max(1, Math.floor(rcList.length * (0.3 + Math.random() * 0.7)))
        const shuffled = [...rcList].sort(() => 0.5 - Math.random()).slice(0, rcCountForUser)

        for (const rc of shuffled) {
            // We'll create up to two attempts per rc: official and practice (upsert to avoid unique constraint errors)
            const types = ['official', 'practice']
            for (const attemptType of types.slice(0, Math.min(maxAttemptsPerRc, types.length))) {
                const q_details = rc.questions.map((q, idx) => ({ questionIndex: idx, timeSpent: randInt(8, 90), wasReviewed: Math.random() > 0.7, isCorrect: Math.random() > 0.5, qType: q.qType || 'inference', qCategory: rc.topicTags?.[0] || 'general' }))
                const answers = rc.questions.map((q, idx) => q_details[idx].isCorrect ? q.correctAnswerId : (['A', 'B', 'C', 'D'].find(x => x !== q.correctAnswerId)))
                const durationSeconds = q_details.reduce((s, q) => s + q.timeSpent, 0)
                const attemptedAt = daysAgo(randInt(0, 29))

                try {
                    await Attempt.findOneAndUpdate({ userId: user._id, rcPassageId: rc._id, attemptType }, {
                        userId: user._id,
                        rcPassageId: rc._id,
                        answers,
                        score: answers.reduce((s, a, i) => s + (a === rc.questions[i].correctAnswerId ? 1 : 0), 0),
                        durationSeconds,
                        deviceType: Math.random() > 0.5 ? 'mobile' : 'desktop',
                        q_details,
                        attemptedAt,
                        attemptType
                    }, { upsert: true, new: true, setDefaultsOnInsert: true })
                    attemptsCreated++
                } catch (e) {
                    console.error('Attempt upsert error', e.message)
                }

                // create analytics event for attempt_submission
                try {
                    await AnalyticsEvent.create({ userId: user._id, type: 'attempt_submission', payload: { rcPassageId: rc._id, durationSeconds, deviceType: Math.random() > 0.5 ? 'mobile' : 'desktop', attemptType }, createdAt: attemptedAt })
                    eventsCreated++
                } catch (e) {
                    console.error('Analytics event create error', e.message)
                }

                // some explanation_open events
                const opens = randInt(0, 3)
                const opensBatch = []
                for (let k = 0; k < opens; k++) {
                    opensBatch.push({ userId: user._id, type: 'explanation_open', payload: { rcPassageId: rc._id, questionIndex: randInt(0, rc.questions.length - 1) }, createdAt: daysAgo(randInt(0, 29)) })
                }
                if (opensBatch.length) {
                    await AnalyticsEvent.insertMany(opensBatch)
                    eventsCreated += opensBatch.length
                }
            }
        }

        if ((ui + 1) % 20 === 0) console.log(`Progress: ${ui + 1}/${createdUsers.length} users processed — attempts: ${attemptsCreated}, events: ${eventsCreated}`)
    }

    console.log('Seeding complete:', { attemptsCreated, eventsCreated, usersCreated: createdUsers.length })
    process.exit(0)
}

main().catch(e => { console.error(e); process.exit(1) })
