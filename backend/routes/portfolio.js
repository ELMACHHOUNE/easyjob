import express from 'express'
import mongoose from 'mongoose'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

const portfolioSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  url: { type: String, default: '' },
  description: { type: String, default: '' },
  projects: [{
    name: String,
    description: String,
    url: String,
    imageUrl: String,
    technologies: [String],
  }],
}, { timestamps: true })

const Portfolio = mongoose.models.Portfolio || mongoose.model('Portfolio', portfolioSchema)

// GET /api/profile/portfolio
router.get('/', protect, async (req, res) => {
  try {
    let portfolio = await Portfolio.findOne({ userId: req.user._id })
    if (!portfolio) {
      portfolio = await Portfolio.create({ userId: req.user._id })
    }
    res.json({ portfolio })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PUT /api/profile/portfolio
router.put('/', protect, async (req, res) => {
  try {
    const portfolio = await Portfolio.findOneAndUpdate(
      { userId: req.user._id },
      { $set: req.body },
      { new: true, upsert: true }
    )
    res.json({ portfolio, message: 'Portfolio mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
