import mongoose from 'mongoose'
import bcrypt from 'bcryptjs'

const userSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true, minlength: 6 },
  phone: { type: String, default: '' },
  role: { type: String, enum: ['candidat', 'recruiter', 'admin'], default: 'candidat' },
  avatar: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
  isEmailVerified: { type: Boolean, default: false },
  emailVerificationCode: String,
  emailVerificationExpire: Date,
  refreshToken: String,
  resetPasswordToken: String,
  resetPasswordExpire: Date,
  lastLogin: Date,
  loginAttempts: { type: Number, default: 0 },
  lockUntil: Date,
  onboardingCompleted: { type: Boolean, default: false },
  onboardingStep: { type: Number, default: 0 },
  jobSearchStatus: {
    type: String,
    enum: ['none', 'actively_looking', 'open_to_offers', 'urgent', 'seeking_internship'],
    default: 'none',
  },
  preferences: {
    language: { type: String, default: 'fr' },
    theme: { type: String, enum: ['light', 'dark', 'system'], default: 'light' },
    emailNotifications: { type: Boolean, default: true },
  },
}, { timestamps: true })

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return
  this.password = await bcrypt.hash(this.password, 12)
})

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password)
}

userSchema.methods.toJSON = function() {
  const obj = this.toObject()
  delete obj.password
  delete obj.refreshToken
  delete obj.emailVerificationCode
  delete obj.emailVerificationExpire
  delete obj.resetPasswordToken
  delete obj.resetPasswordExpire
  delete obj.loginAttempts
  delete obj.lockUntil
  return obj
}

export default mongoose.model('User', userSchema)
