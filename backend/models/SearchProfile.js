import mongoose from 'mongoose'

const searchProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  sectors: [String],
  keywords: [String],
  excludeKeywords: [String],
  locations: [String],
  contractTypes: [String],
  salaryMin: Number,
  salaryMax: Number,
  sourcesConfig: {
    linkedin: { enabled: { type: Boolean, default: true }, customKeywords: [String] },
    indeed: { enabled: { type: Boolean, default: true }, customKeywords: [String] },
    welcometothejungle: { enabled: { type: Boolean, default: true }, customKeywords: [String] },
    rekrute: { enabled: { type: Boolean, default: true }, customKeywords: [String] },
    manpower: { enabled: { type: Boolean, default: true }, customKeywords: [String] },
  },
  isActive: { type: Boolean, default: true },
  frequency: { type: String, enum: ['quotidien', 'hebdomadaire', 'manuel'], default: 'manuel' },
}, { timestamps: true })

export default mongoose.model('SearchProfile', searchProfileSchema)
