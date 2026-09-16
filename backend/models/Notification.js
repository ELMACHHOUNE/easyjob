import mongoose from 'mongoose'

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  type: {
    type: String,
    enum: [
      'nouvelle_offre', 'candidature', 'candidature_statut',
      'email', 'scrapping', 'rappel', 'nouvelle_entreprise',
      'candidat_suggere', 'nouvelle_candidature', 'entretien',
      'acceptation'
    ],
    required: true
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  data: mongoose.Schema.Types.Mixed,
  isRead: { type: Boolean, default: false },
  actionUrl: String,
}, { timestamps: true })

notificationSchema.index({ userId: 1, createdAt: -1 })
notificationSchema.index({ userId: 1, isRead: 1 })

export default mongoose.model('Notification', notificationSchema)
