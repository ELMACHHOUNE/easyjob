import mongoose from 'mongoose'

const recruiterSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  title: String,
  company: String,
  linkedinUrl: String,
  email: String,
  phone: String,
  location: String,
  sector: String,
  connectionDegree: { type: String, enum: ['1st', '2nd', '3rd+'] },
  profilePicture: String,
  notes: String,
  tags: [String],
  interactionCount: { type: Number, default: 0 },
  lastContactedAt: Date,
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

export default mongoose.model('Recruiter', recruiterSchema)
