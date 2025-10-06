import dotenv from 'dotenv'
import path from 'path'
import { fileURLToPath } from 'url'

// Load .env located in the same scripts directory (workdir may be repo root)
const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })
import { connectDB } from "../src/lib/db.js";
import { User } from "../src/models/User.js";
import { RcPassage } from "../src/models/RcPassage.js";
import { Attempt } from "../src/models/Attempt.js";
import { AnalyticsEvent } from "../src/models/AnalyticsEvent.js";
import bcrypt from "bcryptjs";

function daysAgo(n) {
    const d = new Date();
    d.setDate(d.getDate() - n);
    return d;
}

function pickCorrectness(i, len) {
    // simple pattern: alternate correctness to give variety
    return i % 2 === 0;
}

async function main() {
    await connectDB();
    // ensure admin exists (not strictly required but helpful)
    const adminEmail = process.argv[2] || "admin@arc.local";
    const adminPass = process.argv[3] || "admin123";
    let admin = await User.findOne({ email: adminEmail });
    if (!admin) {
        const hash = await bcrypt.hash(adminPass, 10);
        admin = await User.create({ name: "Admin", email: adminEmail, password: hash, role: "admin" });
        console.log("Created admin:", adminEmail);
    } else {
        console.log("Admin exists:", adminEmail);
    }

    // create a seed student
    const studentEmail = process.argv[4] || "seed-student@arc.local";
    const studentPass = process.argv[5] || "test1234";
    let student = await User.findOne({ email: studentEmail });
    if (!student) {
        // create with plain password and passwordConfirm to satisfy mongoose validators
        student = await User.create({ name: "Seed Student", email: studentEmail, password: studentPass, passwordConfirm: studentPass, role: "aspirant" });
        console.log("Created test student:", studentEmail);
    } else {
        console.log("Test student exists:", studentEmail);
    }

    // grab some RCs to attach attempts to
    const rcs = await RcPassage.find().limit(8);
    if (!rcs || rcs.length === 0) {
        console.error("No RCs found. Seed RCs first (run scripts/seed-rcs.js).");
        process.exit(1);
    }

    let created = 0;
    for (let idx = 0; idx < rcs.length; idx++) {
        const rc = rcs[idx];
        // create one official and one practice attempt for variety (if unique constraint allows)
        const attemptsToMake = ["official", "practice"];
        for (let t = 0; t < attemptsToMake.length; t++) {
            const attemptType = attemptsToMake[t];
            // assemble answers and q_details
            const answers = [];
            const q_details = [];
            rc.questions.forEach((q, i) => {
                const isCorrect = pickCorrectness(i, rc.questions.length);
                const chosen = isCorrect ? q.correctAnswerId : (['A', 'B', 'C', 'D'].find(x => x !== q.correctAnswerId));
                answers.push(chosen);
                q_details.push({ questionIndex: i, timeSpent: Math.floor(Math.random() * 60) + 10, wasReviewed: Math.random() > 0.7, isCorrect, qType: q.qType || 'inference', qCategory: rc.topicTags && rc.topicTags[0] ? rc.topicTags[0] : 'general' });
            });

            const score = answers.reduce((s, a, i) => s + (a === rc.questions[i].correctAnswerId ? 1 : 0), 0);
            const attemptedAt = daysAgo((idx * 2) + t); // stagger over days

            // some attempts have analysisFeedback tags for a subset of wrong answers
            const analysisFeedback = [];
            q_details.forEach((qd) => {
                if (!qd.isCorrect && Math.random() > 0.5) {
                    analysisFeedback.push({ questionIndex: qd.questionIndex, reason: ['Misread', 'Conceptual', 'Skipped'][Math.floor(Math.random() * 3)] });
                }
            });

            // upsert attempt (to avoid unique index errors) — use findOneAndUpdate with upsert
            const a = await Attempt.findOneAndUpdate(
                { userId: student._id, rcPassageId: rc._id, attemptType },
                {
                    userId: student._id,
                    rcPassageId: rc._id,
                    answers,
                    score,
                    durationSeconds: q_details.reduce((s, q) => s + q.timeSpent, 0),
                    isTimed: true,
                    deviceType: Math.random() > 0.5 ? 'mobile' : 'desktop',
                    q_details,
                    attemptedAt,
                    analysisFeedback,
                    attemptType,
                },
                { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            // create analytics events
            await AnalyticsEvent.create({ userId: student._id, type: 'attempt_submission', payload: { rcPassageId: rc._id, attemptId: a._id, durationSeconds: a.durationSeconds, deviceType: a.deviceType, attemptType: a.attemptType, attemptedAt } });
            // log a login event near the attempt for a subset
            if (Math.random() > 0.6) {
                await AnalyticsEvent.create({ userId: student._id, type: 'login', payload: { at: daysAgo((idx * 2) + t + 1) } });
            }
            created++;
        }
    }

    console.log(`Seeded ${created} attempts/analytics for user ${studentEmail}`);
    process.exit(0);
}

main().catch((e) => { console.error(e); process.exit(1); });
