
import mongoose from 'mongoose'

const recruiterProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyName: { type: String, required: true },
  companyDescription: { type: String, default: '' },
  companyWebsite: { type: String, default: '' },
  companyLogo: { type: String, default: '' },
  companySize: { type: String, enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'], default: '11-50' },
  industry: { type: String, required: true },
  companyLocation: { type: String, default: '' },
  linkedinUrl: { type: String, default: '' },
  position: { type: String, default: '' },
  hiringDomains: [String],
  jobPostingsCount: { type: Number, default: 0 },
  totalApplications: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('RecruiterProfile', recruiterProfileSchema)
