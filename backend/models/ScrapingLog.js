import mongoose from 'mongoose'

const scrapingLogSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['running', 'success', 'partial', 'failed'], default: 'running' },
  sources: [{
    source: String,
    status: String,
    offersFound: { type: Number, default: 0 },
    newOffers: { type: Number, default: 0 },
    duplicatesSkipped: { type: Number, default: 0 },
    errorMessages: [String],
    duration: Number,
  }],
  totalOffersFound: { type: Number, default: 0 },
  totalNewOffers: { type: Number, default: 0 },
  startedAt: { type: Date, default: Date.now },
  completedAt: Date,
}, { timestamps: true, suppressReservedKeysWarning: true })

export default mongoose.model('ScrapingLog', scrapingLogSchema)
