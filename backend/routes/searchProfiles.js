import express from 'express'
import SearchProfile from '../models/SearchProfile.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/search-profiles
router.get('/', protect, async (req, res) => {
  try {
    const profiles = await SearchProfile.find({ userId: req.user._id }).sort({ updatedAt: -1 })
    res.json({ profiles })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/search-profiles/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const profile = await SearchProfile.findOne({ _id: req.params.id, userId: req.user._id })
    if (!profile) return res.status(404).json({ error: 'Profil non trouvé' })
    res.json({ profile })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/search-profiles
router.post('/', protect, async (req, res) => {
  try {
    const profile = await SearchProfile.create({ ...req.body, userId: req.user._id })
    res.status(201).json({ profile, message: 'Profil de recherche créé' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' })
  }
})

// PUT /api/search-profiles/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const profile = await SearchProfile.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    )
    if (!profile) return res.status(404).json({ error: 'Profil non trouvé' })
    res.json({ profile, message: 'Profil mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /api/search-profiles/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await SearchProfile.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ message: 'Profil supprimé' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/search-profiles/:id/activate
router.post('/:id/activate', protect, async (req, res) => {
  try {
    const profile = await SearchProfile.findOne({ _id: req.params.id, userId: req.user._id })
    if (!profile) return res.status(404).json({ error: 'Profil non trouvé' })
    profile.isActive = !profile.isActive
    await profile.save()
    res.json({ profile, message: profile.isActive ? 'Profil activé' : 'Profil désactivé' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
