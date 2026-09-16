import mongoose from 'mongoose'

const jobOfferSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  source: { type: String, enum: ['linkedin', 'indeed', 'welcometothejungle', 'rekrute', 'manpower', 'manual', 'recruiter', 'autre'] },
  sourceId: String,
  sourceUrl: String,
  title: { type: String, required: true },
  company: { type: String, required: true },
  companyLogo: String,
  companyUrl: String,
  location: { type: String, required: true },
  isRemote: { type: Boolean, default: false },
  contractType: { type: String, enum: ['CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel'], required: true },
  description: { type: String, default: '' },
  requirements: [String],
  responsibilities: [String],
  salary: {
    min: Number,
    max: Number,
    currency: { type: String, default: 'MAD' },
    period: { type: String, default: 'monthly' },
  },
  postedAt: Date,
  expiresAt: Date,
  scrapedAt: Date,
  sector: { type: String, default: '' },
  domain: { type: String, default: '' },
  keywords: [String],
  relevanceScore: { type: Number, default: 0, min: 0, max: 100 },
  isSaved: { type: Boolean, default: false },
  isActive: { type: Boolean, default: true },
  viewsCount: { type: Number, default: 0 },
  applicationsCount: { type: Number, default: 0 },
  maxApplications: { type: Number, default: 100 },
  applicationDeadline: Date,
}, { timestamps: true })

jobOfferSchema.index(
  { userId: 1, source: 1, sourceId: 1 },
  { unique: true, partialFilterExpression: { sourceId: { $type: 'string' } } }
)
jobOfferSchema.index({ userId: 1, isActive: 1 })
jobOfferSchema.index({ postedBy: 1, isActive: 1 })
jobOfferSchema.index({ title: 'text', company: 'text', description: 'text' })
jobOfferSchema.index({ domain: 1, sector: 1, isActive: 1 })

export default mongoose.model('JobOffer', jobOfferSchema)
