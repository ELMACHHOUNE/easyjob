import mongoose from 'mongoose'

const applicationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  jobOfferId: { type: mongoose.Schema.Types.ObjectId, ref: 'JobOffer', required: true },
  status: {
    type: String,
    enum: [
      'brouillon', 'envoyee', 'consulte', 'valide_entretien',
      'appel_attente', 'entretien_fait', 'accepte_final', 'refusee'
    ],
    default: 'brouillon'
  },
  email: {
    to: String,
    subject: String,
    body: String,
    attachCv: { type: Boolean, default: false },
    messageId: String,
    sentAt: Date,
    openedAt: Date,
  },
  coverLetter: String,
  notes: String,
  followUpDate: Date,
  followUpCount: { type: Number, default: 0 },
  statusHistory: [{
    status: String,
    changedAt: { type: Date, default: Date.now },
    changedBy: { type: String, enum: ['candidat', 'recruteur', 'systeme'], default: 'systeme' },
    note: String,
  }],
  candidateInfo: {
    firstName: { type: String, default: '' },
    lastName: { type: String, default: '' },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    city: { type: String, default: '' },
    title: { type: String, default: '' },
    linkedin: { type: String, default: '' },
    github: { type: String, default: '' },
    portfolio: { type: String, default: '' },
    summary: { type: String, default: '' },
    skills: [String],
    domains: [String],
    experience: [{
      position: String,
      company: String,
      startDate: Date,
      endDate: Date,
      isCurrent: { type: Boolean, default: false },
      description: String,
    }],
    education: [{
      degree: String,
      institution: String,
      field: String,
      endDate: Date,
    }],
    languages: [{ language: String, level: String }],
    cvSummary: { type: String, default: '' },
    cvFileName: { type: String, default: '' },
    cvFileData: { type: String, default: '' },
    cvMimeType: { type: String, default: '' },
    keywords: [String],
    matchScore: { type: Number, default: 0 },
  },
}, { timestamps: true })

applicationSchema.index({ userId: 1, jobOfferId: 1 }, { unique: true })
applicationSchema.index({ jobOfferId: 1, status: 1 })

export default mongoose.model('Application', applicationSchema)
