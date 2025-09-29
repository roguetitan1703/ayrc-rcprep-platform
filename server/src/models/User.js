import mongoose from "mongoose";

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
    password: {
      type: String,
      required: [true, "Please provide a password"],
      minlength: 8,
      select: false,
    },
    passwordConfirm: {
      type: String,
      required: [true, "Please confirm your password"],
      validate: {
        // This only works on CREATE and SAVE!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not the same!",
      },
      select: false,
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    role: { type: String, enum: ["aspirant", "admin"], default: "aspirant" },
    dailyStreak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
    subscription: {
      type: String,
      enum: ["Yearly", "Monthly", "Quarterly", "Half-Yearly", "none"],
      default: "none",
    },
    subon: Date,
    subexp: Date,
    issubexp: {
      type: Boolean,
      default: true,
    },
    referralCode: { type: String, unique: true },
    parentrefCode: {
      type: String,
      ref: "User.referralCode",
      default: "0000000001",
    },
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" }
  }
);
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );

    return JWTTimestamp < changedTimestamp;
  }

  // False means NOT changed
  return false;
};

userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString("hex");

  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  // console.log({ resetToken }, this.passwordResetToken);
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  console.log(this);
  return this.passwordResetToken;
};

userSchema.pre("save", function (next) {
  const user = this;
  if (!user.referralCode) {
    // Function to generate a unique referral code
    const generateCode = () => {
      const codeLength = 6;
      const characters =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
      let code = "";
      for (let i = 0; i < codeLength; i++) {
        code += characters.charAt(
          Math.floor(Math.random() * characters.length)
        );
      }
      return code;
    };

    // Check for uniqueness and retry if necessary
    async function findUniqueCode() {
      let code = generateCode();
      const existingUser = await User.findOne({ referralCode: code });
      if (!existingUser) {
        user.referralCode = code;
        return;
      }
      return findUniqueCode(); // Retry if code exists
    }

    findUniqueCode().then(() => next());
  } else {
    next();
  }
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    this.passwordConfirm = undefined;
    return next();
  } else {
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordConfirm = undefined;
    next();
  }
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();
  this.passwordChangedAt = Date.now() - 1000;
  next();
});
export const User = mongoose.model("User", userSchema);
