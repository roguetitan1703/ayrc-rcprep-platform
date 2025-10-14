import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'
import crypto from 'crypto'

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      index: true,
    },
    phoneNumber: { type: String },
    location: {
      type: String,
      trim: true,
      default: null,
    }, // For local cohort leaderboards
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: 8,
      select: false,
    },   
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: { type: String, enum: ['aspirant', 'admin'], default: 'aspirant' },
    // Daily Streak fields
    dailyStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    // Personal best score (out of 4)
    personalBest: { type: Number, default: 0, min: 0, max: 4 },
    // Subscription fields
    subscription: {
      type: String,
      enum: ['Yearly', 'Monthly', 'Quarterly', 'Half-Yearly', 'none'],
      default: 'none',
    },
    subon: Date,
    subexp: Date,
    issubexp: {
      type: Boolean,
      default: true,
    },
    // Referral fields
    referralCode: { type: String, unique: true, sparse: true }, // Added sparse for better handling of index
    parentrefCode: {
      type: String,
      ref: 'User.referralCode', // Note: Mongoose ref typically points to the model name ("User")
      default: '0000000001',
    },
  },
  { timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' } }
)

// --- INSTANCE METHODS ---

/**
 * Checks if the provided candidate password matches the user's password.
 * @param {string} candidatePassword The password provided by the user.
 * @param {string} userPassword The hashed password from the database.
 * @returns {Promise<boolean>} True if passwords match, false otherwise.
 */
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword)
}

/**
 * Checks if the password has been changed after the given JWT timestamp.
 * @param {number} JWTTimestamp The timestamp from the JWT 'iat' field.
 * @returns {boolean} True if password was changed after the token was issued, false otherwise.
 */
userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(this.passwordChangedAt.getTime() / 1000, 10)

    return JWTTimestamp < changedTimestamp
  }

  // False means NOT changed
  return false
}

/**
 * Generates and hashes a password reset token, and sets the expiry time.
 * @returns {string} The plaintext reset token (which should be sent to the user).
 */
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex')

  this.passwordResetToken = crypto.createHash('sha256').update(resetToken).digest('hex')

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000 // 10 minutes
  return resetToken // Return the *unhashed* token to be sent via email
}

/**
 * Logic to check and update the user's daily streak.
 * Must be called when a user performs a daily action (e.g., login, task completion).
 * @returns {Promise<number>} The updated daily streak count.
 */
userSchema.methods.updateDailyStreak = async function () {
  const today = new Date()
  // Set today's date to midnight for comparison (to ignore time)
  today.setHours(0, 0, 0, 0)

  const lastActive = this.lastActiveDate

  // 1. Handle first time activity
  if (!lastActive || this.dailyStreak === 0) {
    this.dailyStreak = 1
    this.lastActiveDate = today
    await this.save()
    return this.dailyStreak
  }

  // Set last active date to midnight for comparison
  const lastActiveMidnight = new Date(lastActive)
  lastActiveMidnight.setHours(0, 0, 0, 0)

  // Calculate the difference in milliseconds
  const diffTime = today.getTime() - lastActiveMidnight.getTime()
  // Calculate the difference in days (1000ms * 60s * 60m * 24h)
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  if (diffDays === 1) {
    // 2. Active yesterday: Continue streak
    this.dailyStreak += 1
    this.lastActiveDate = today
  } else if (diffDays > 1) {
    // 3. Streak broken: Reset to 1
    this.dailyStreak = 1
    this.lastActiveDate = today
  } else if (diffDays === 0) {
    // 4. Already active today: Do nothing
    return this.dailyStreak
  }

  // Only save if the streak or lastActiveDate has been modified (diffDays !== 0)
  if (this.isModified('dailyStreak') || this.isModified('lastActiveDate')) {
    // Disable pre('save') hooks for password hashing/confirm
    await this.save({ validateBeforeSave: false })
  }

  return this.dailyStreak
}

// --- PRE-SAVE MIDDLEWARE (HOOKS) ---

// Pre-save hook for generating a unique referral code
userSchema.pre('save', async function (next) {
  const user = this

  // Check if the User model has been defined globally or needs to be imported/defined here
  // NOTE: In a modular setup, you might need to use mongoose.model('User') inside the async function
  const User = mongoose.models.User || mongoose.model('User')

  if (!user.referralCode && user.isNew) {
    // Function to generate a random code
    const generateCode = () => {
      const codeLength = 6
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < codeLength; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length))
      }
      return code
    }

    // Check for uniqueness and retry if necessary
    const findUniqueCode = async () => {
      let code = generateCode()
      const existingUser = await User.findOne({ referralCode: code })
      if (!existingUser) {
        user.referralCode = code
        return
      }
      return findUniqueCode() // Retry if code exists
    }

    await findUniqueCode()
    next()
  } else {
    next()
  }
})

// Pre-save hook for hashing the password and unsetting passwordConfirm
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    this.passwordConfirm = undefined // Ensure it's undefined even if not modified, for safety
    return next()
  } else {
    this.password = await bcrypt.hash(this.password, 12)
    this.passwordConfirm = undefined
    next()
  }
})

// Pre-save hook for setting passwordChangedAt field
userSchema.pre('save', function (next) {
  if (!this.isModified('password') || this.isNew) return next()

  // Subtract 1 second to ensure the token is created *after* the password is changed
  this.passwordChangedAt = Date.now() - 1000
  next()
})

export const User = mongoose.model('User', userSchema)
