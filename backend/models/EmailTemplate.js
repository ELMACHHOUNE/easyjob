import mongoose from 'mongoose'

const emailTemplateSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  name: { type: String, required: true },
  subject: { type: String, required: true },
  body: { type: String, required: true },
  variables: [String],
  isDefault: { type: Boolean, default: false },
  category: { type: String, enum: ['Candidature','Relance','Remerciement','Suivi','Personnalisé'], default: 'Candidature' },
  usageCount: { type: Number, default: 0 },
}, { timestamps: true })

export default mongoose.model('EmailTemplate', emailTemplateSchema)
