import mongoose from 'mongoose'

const companyEmailSchema = new mongoose.Schema({
  companyName: { type: String, required: true, trim: true },
  email: { type: String, required: true, lowercase: true, trim: true },
  website: { type: String, default: '' },
  sector: { type: String, required: true },
  domain: { type: String, required: true },
  companyType: {
    type: String,
    enum: ['multinationale', 'publique', 'privee', 'startup', 'pme', 'cabinet', 'ong'],
    default: 'privee',
  },
  companySize: {
    type: String,
    enum: ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+'],
    default: '51-200',
  },
  city: { type: String, default: 'Casablanca' },
  country: { type: String, default: 'Maroc' },
  phone: { type: String, default: '' },
  description: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true })

companyEmailSchema.index({ companyName: 'text', email: 'text', sector: 'text', domain: 'text' })
companyEmailSchema.index({ sector: 1, domain: 1, companyType: 1, city: 1 })
companyEmailSchema.index({ email: 1 }, { unique: true })

export default mongoose.model('CompanyEmail', companyEmailSchema)
