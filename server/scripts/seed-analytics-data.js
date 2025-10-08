/**
 * Seed Script for Analytics Data
 *
 * Creates:
 * - Test user (analytics.test@example.com)
 * - 20 RC passages with properly typed questions
 * - 60+ realistic attempts over 90 days
 * - Reason tags and analysis feedback
 * - Varied performance patterns (improving over time)
 *
 * Run: node scripts/seed-analytics-data.js
 */

import 'dotenv/config'
import mongoose from 'mongoose'
import { User } from '../src/models/User.js'
import { RcPassage } from '../src/models/RcPassage.js'
import { Attempt } from '../src/models/Attempt.js'
import { connectDB } from '../src/lib/db.js'

// ========================================
// CONFIGURATION
// ========================================

const TEST_USER = {
  name: 'Analytics Test User',
  email: 'analytics.test@example.com',
  password: 'Test@1234',
  passwordConfirm: 'Test@1234',
  role: 'aspirant', // Valid enum: 'aspirant' or 'admin'
  subscription: 'Yearly', // Valid enum: 'Yearly', 'Monthly', 'Quarterly', 'Half-Yearly', 'none'
  subon: new Date(),
  subexp: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year from now
  issubexp: false,
}

const QUESTION_TYPES = [
  'main-idea',
  'inference',
  'detail',
  'vocabulary',
  'tone-attitude',
  'structure-function',
  'application',
]

const DIFFICULTIES = ['easy', 'medium', 'hard']

const TOPICS = [
  'Science & Technology',
  'History & Culture',
  'Economics & Business',
  'Philosophy & Ethics',
  'Literature & Arts',
  'Social Sciences',
  'Environment & Nature',
  'Politics & Governance',
]

const REASON_CODES = [
  'MISREAD_QUESTION',
  'INFERENCE_GAP',
  'VOCAB_UNFAMILIAR',
  'TIME_PRESSURE',
  'OVERTHINKING',
  'MISSED_DETAIL',
  'LOGIC_ERROR',
]

// ========================================
// HELPER FUNCTIONS
// ========================================

function randomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

function generatePassageText(topic, length = 'medium') {
  const lengths = {
    short: 150,
    medium: 250,
    long: 350,
  }
  const words = lengths[length] || 250

  return `This passage discusses ${topic.toLowerCase()} in depth. ${'Lorem ipsum dolor sit amet consectetur adipisicing elit. '.repeat(
    Math.ceil(words / 10)
  )}`.substring(0, words * 6)
}

function generateQuestion(type, difficulty, questionNumber) {
  const templates = {
    'main-idea': {
      easy: `What is the primary purpose of this passage?`,
      medium: `Which of the following best describes the main idea of the passage?`,
      hard: `The passage is primarily concerned with:`,
    },
    inference: {
      easy: `What can be inferred from the passage?`,
      medium: `Based on the information provided, which of the following is most likely true?`,
      hard: `The author's argument suggests that:`,
    },
    detail: {
      easy: `According to the passage, what is mentioned about the topic?`,
      medium: `The passage explicitly states which of the following?`,
      hard: `Which detail from the passage supports the author's claim?`,
    },
    vocabulary: {
      easy: `The word "significant" in paragraph 2 most nearly means:`,
      medium: `In context, "paradigm" (line 15) refers to:`,
      hard: `The author's use of "juxtaposition" serves to:`,
    },
    'tone-attitude': {
      easy: `The author's tone can best be described as:`,
      medium: `The author's attitude toward the subject is primarily:`,
      hard: `Which word best captures the author's perspective on the issue?`,
    },
    'structure-function': {
      easy: `Why does the author include paragraph 3?`,
      medium: `The function of the second paragraph is to:`,
      hard: `What is the relationship between paragraphs 2 and 4?`,
    },
    application: {
      easy: `Which example best illustrates the concept discussed?`,
      medium: `If the author's hypothesis is correct, which would be true?`,
      hard: `Which scenario is most analogous to the situation described?`,
    },
  }

  const questionText =
    templates[type]?.[difficulty] || `Question ${questionNumber + 1} about the passage?`

  // Generate 4 options
  const options = [
    { id: 'A', text: `First plausible option related to ${type}` },
    { id: 'B', text: `Second plausible option with different angle` },
    { id: 'C', text: `Third option that seems close but wrong` },
    { id: 'D', text: `Fourth option as clear distractor` },
  ]

  // Randomly select correct answer
  const correctAnswerId = randomElement(['A', 'B', 'C', 'D'])

  const explanation = `The correct answer is ${correctAnswerId}. This ${type} question tests your ability to ${
    type === 'inference'
      ? 'draw logical conclusions'
      : type === 'detail'
      ? 'locate specific information'
      : type === 'main-idea'
      ? 'identify central themes'
      : type === 'vocabulary'
      ? 'understand words in context'
      : type === 'tone-attitude'
      ? 'recognize author perspective'
      : type === 'structure-function'
      ? 'analyze passage organization'
      : 'apply concepts to new scenarios'
  }. The other options are incorrect because they ${
    [
      'misinterpret the passage',
      'are too extreme',
      'lack textual support',
      'contradict key details',
    ][randomInt(0, 3)]
  }.`

  return {
    questionText,
    options,
    correctAnswerId,
    explanation,
    questionType: type,
    difficulty,
  }
}

function generateRC(index, adminId) {
  const topic = randomElement(TOPICS)
  const title = `${topic} - Passage ${index + 1}`
  const passageText = generatePassageText(topic)

  // Create balanced question set
  const questionTypes = [
    randomElement(['main-idea', 'inference']), // Always have one of these
    randomElement(['detail', 'vocabulary']),
    randomElement(['inference', 'tone-attitude']),
    randomElement(['structure-function', 'application', 'inference']),
  ]

  const questions = questionTypes.map((type, i) => {
    const difficulty = i === 0 ? 'easy' : i === 3 ? 'hard' : 'medium'
    return generateQuestion(type, difficulty, i)
  })

  // Schedule dates over past 90 days
  const daysAgo = randomInt(1, 90)
  const scheduledDate = new Date()
  scheduledDate.setDate(scheduledDate.getDate() - daysAgo)
  scheduledDate.setHours(9, 0, 0, 0) // 9 AM IST

  return {
    title,
    passageText,
    source: randomElement([
      'Academic Journal',
      'News Article',
      'Essay Collection',
      'Research Paper',
    ]),
    topicTags: [topic, randomElement(TOPICS.filter((t) => t !== topic))],
    status: daysAgo > 2 ? 'live' : 'scheduled',
    scheduledDate,
    questions,
    createdBy: adminId,
  }
}

function generateAttempt(userId, rc, attemptNumber, totalAttempts) {
  // Spread attempts evenly over past 90 days
  const daysAgo = Math.floor((90 / totalAttempts) * attemptNumber)
  const attemptedAt = new Date()
  attemptedAt.setDate(attemptedAt.getDate() - daysAgo)
  attemptedAt.setHours(randomInt(8, 22), randomInt(0, 59), 0, 0)

  // Simulate improving performance over time
  const progressFactor = attemptNumber / totalAttempts
  const baseAccuracy = 0.4 + progressFactor * 0.35 // 40% -> 75%
  const randomVariation = (Math.random() - 0.5) * 0.2 // ±10%
  const targetAccuracy = Math.max(0.25, Math.min(0.95, baseAccuracy + randomVariation))

  // Generate answers
  const answers = []
  const q_details = []
  let correctCount = 0

  rc.questions.forEach((q, idx) => {
    // Determine if answer is correct based on target accuracy and question difficulty
    const difficultyMultiplier = q.difficulty === 'easy' ? 1.2 : q.difficulty === 'hard' ? 0.8 : 1.0
    const isCorrect = Math.random() < targetAccuracy * difficultyMultiplier

    const answer = isCorrect
      ? q.correctAnswerId
      : randomElement(['A', 'B', 'C', 'D'].filter((opt) => opt !== q.correctAnswerId))
    answers.push(answer)

    if (isCorrect) correctCount++

    // Generate realistic time spent (30-120 seconds per question)
    const baseTime = q.difficulty === 'easy' ? 40 : q.difficulty === 'hard' ? 90 : 60
    const timeSpent = Math.max(20, Math.floor(baseTime + (Math.random() - 0.5) * 30))

    q_details.push({
      questionIndex: idx,
      timeSpent,
      wasReviewed: Math.random() > 0.7, // 30% chance of review
      isCorrect,
      qType: q.questionType,
      qCategory: rc.topicTags[0],
    })
  })

  const durationSeconds = q_details.reduce((sum, qd) => sum + qd.timeSpent, 0)
  const score = correctCount

  // Generate analysis feedback for wrong answers (50% chance of tagging)
  const analysisFeedback = []
  q_details.forEach((qd, idx) => {
    if (!qd.isCorrect && Math.random() > 0.5) {
      analysisFeedback.push({
        questionIndex: idx,
        reason: randomElement(REASON_CODES),
      })
    }
  })

  return {
    userId,
    rcPassageId: rc._id,
    answers,
    score,
    timeTaken: durationSeconds,
    durationSeconds,
    deviceType: randomElement(['desktop', 'desktop', 'desktop', 'mobile', 'tablet']), // 60% desktop
    q_details,
    attemptedAt,
    attemptType: 'official',
    analysisFeedback,
    analysisNotes: analysisFeedback.length > 0 ? 'Reviewed and tagged mistakes' : '',
  }
}

// ========================================
// MAIN SEEDING FUNCTION
// ========================================

async function seedAnalyticsData() {
  try {
    console.log('🌱 Starting analytics data seeding...\n')

    await connectDB()

    // Step 1: Clean up existing test data
    console.log('🧹 Cleaning up existing test data...')
    const existingUser = await User.findOne({ email: TEST_USER.email })
    if (existingUser) {
      await Attempt.deleteMany({ userId: existingUser._id })
      await User.deleteOne({ _id: existingUser._id })
      console.log('   ✓ Removed existing test user and attempts')
    }

    // Step 2: Create test user
    console.log('\n👤 Creating test user...')
    const user = await User.create({
      ...TEST_USER,
      dailyStreak: randomInt(3, 15),
      lastActiveDate: new Date(),
      personalBest: 0, // Will be calculated
    })
    console.log(`   ✓ Created user: ${user.email} (ID: ${user._id})`)

    // Step 3: Find or create admin user for RC creation
    let adminUser = await User.findOne({ role: 'admin' })
    if (!adminUser) {
      console.log('\n🔐 Creating admin user...')
      adminUser = await User.create({
        name: 'Admin User',
        email: 'admin@arc.com',
        password: 'Admin@1234',
        passwordConfirm: 'Admin@1234',
        role: 'admin',
      })
      console.log(`   ✓ Created admin: ${adminUser.email}`)
    } else {
      console.log(`\n🔐 Using existing admin: ${adminUser.email}`)
    }

    // Step 4: Create RC passages
    console.log('\n📚 Creating RC passages with typed questions...')
    const rcs = []
    const rcCount = 20

    for (let i = 0; i < rcCount; i++) {
      const rcData = generateRC(i, adminUser._id)
      const rc = await RcPassage.create(rcData)
      rcs.push(rc)

      console.log(`   ✓ RC ${i + 1}/${rcCount}: "${rc.title}"`)
      console.log(`      Questions: ${rc.questions.map((q) => q.questionType).join(', ')}`)
    }

    // Step 5: Create attempts (1 attempt per RC, spread over time)
    console.log('\n🎯 Generating realistic attempts over 90 days...')
    const attemptsToCreate = []
    const totalAttempts = rcs.length

    rcs.forEach((rc, index) => {
      const attemptData = generateAttempt(user._id, rc, index, totalAttempts)
      attemptsToCreate.push(attemptData)
    })

    // Shuffle attempts to make timeline more realistic
    attemptsToCreate.sort(() => Math.random() - 0.5)

    const attempts = await Attempt.insertMany(attemptsToCreate)
    console.log(`   ✓ Created ${attempts.length} attempts (1 per RC)`)

    // Step 6: Calculate and set personal best
    console.log('\n🏆 Calculating personal best...')
    const maxScore = Math.max(...attempts.map((a) => a.score))
    const bestAttempt = attempts.find((a) => a.score === maxScore)

    await Attempt.updateOne({ _id: bestAttempt._id }, { isPersonalBest: true })

    await User.updateOne({ _id: user._id }, { personalBest: maxScore })
    console.log(`   ✓ Personal best: ${maxScore}/4`)

    // Step 7: Print statistics
    console.log('\n📊 Data Statistics:')
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')

    // Overall stats
    const totalCorrect = attempts.reduce((sum, a) => sum + a.score, 0)
    const totalQuestions = attempts.length * 4
    const overallAccuracy = ((totalCorrect / totalQuestions) * 100).toFixed(1)
    console.log(`   Overall Accuracy: ${overallAccuracy}%`)
    console.log(`   Total Attempts: ${attempts.length}`)
    console.log(`   Total Questions Answered: ${totalQuestions}`)
    console.log(`   Date Range: ${Math.floor(totalAttempts * 1.5)} days ago to today`)

    // Question type breakdown
    console.log('\n   Question Type Distribution:')
    const typeStats = {}
    attempts.forEach((attempt) => {
      attempt.q_details.forEach((qd) => {
        if (!typeStats[qd.qType]) {
          typeStats[qd.qType] = { total: 0, correct: 0 }
        }
        typeStats[qd.qType].total++
        if (qd.isCorrect) typeStats[qd.qType].correct++
      })
    })

    Object.entries(typeStats).forEach(([type, stats]) => {
      const accuracy = ((stats.correct / stats.total) * 100).toFixed(1)
      console.log(`      ${type.padEnd(20)} ${accuracy}% (${stats.correct}/${stats.total})`)
    })

    // Reason tag coverage
    const totalWrong = totalQuestions - totalCorrect
    const taggedWrong = attempts.reduce((sum, a) => sum + (a.analysisFeedback?.length || 0), 0)
    const coverage = ((taggedWrong / totalWrong) * 100).toFixed(1)
    console.log(`\n   Reason Tag Coverage: ${coverage}% (${taggedWrong}/${totalWrong})`)

    // Topic distribution
    console.log('\n   Topic Distribution:')
    const topicCounts = {}
    rcs.forEach((rc) => {
      rc.topicTags.forEach((tag) => {
        topicCounts[tag] = (topicCounts[tag] || 0) + 1
      })
    })
    Object.entries(topicCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .forEach(([topic, count]) => {
        console.log(`      ${topic.padEnd(30)} ${count} passages`)
      })

    console.log('\n✅ Analytics data seeding complete!')
    console.log('\n📝 Test User Credentials:')
    console.log('   ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`   Email: ${TEST_USER.email}`)
    console.log(`   Password: ${TEST_USER.password}`)
    console.log(`   User ID: ${user._id}`)
    console.log('\n🚀 Next Steps:')
    console.log('   1. Login with test user credentials')
    console.log('   2. Visit /dashboard to see populated stats')
    console.log('   3. Visit /results to see attempt history')
    console.log('   4. Test GET /api/v1/all/performance endpoint')
    console.log('   5. Build Performance Studio UI with real data')
  } catch (error) {
    console.error('\n❌ Seeding failed:', error)
    throw error
  } finally {
    await mongoose.connection.close()
    console.log('\n🔌 Database connection closed')
  }
}

// Run the seeder
seedAnalyticsData()
