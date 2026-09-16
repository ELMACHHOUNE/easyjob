import mongoose from 'mongoose'

const userProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  title: { type: String, default: '' },
  summary: { type: String, default: '' },
  presentation: { type: String, default: '', maxlength: 500 },
  education: [{
    institution: String,
    degree: String,
    field: String,
    startDate: Date,
    endDate: Date,
    description: String,
  }],
  experience: [{
    company: String,
    position: String,
    startDate: Date,
    endDate: Date,
    isCurrent: { type: Boolean, default: false },
    description: String,
    skills: [String],
  }],
  skills: [String],
  languages: [{
    language: String,
    level: { type: String, enum: ['Débutant', 'Intermédiaire', 'Avancé', 'Natif'] },
  }],
  certifications: [{
    name: String,
    issuer: String,
    date: Date,
    url: String,
  }],
  socialLinks: {
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  location: {
    city: { type: String, default: '' },
    country: { type: String, default: 'Maroc' },
    isRemoteOpen: { type: Boolean, default: false },
  },
  expectedSalary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'MAD' },
  },
  jobTypes: [String],
  domains: [String],
  searchKeywords: [String],
  preferredLocations: [String],
}, { timestamps: true })

export default mongoose.model('UserProfile', userProfileSchema)
