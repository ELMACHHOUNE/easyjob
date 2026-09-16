import express from 'express'
import mongoose from 'mongoose'
import User from '../models/User.js'
import UserProfile from '../models/UserProfile.js'
import { protect } from '../middlewares/auth.js'
import { upload } from '../utils/fileUpload.js'

const router = express.Router()

// GET /api/profile
router.get('/', protect, async (req, res) => {
  try {
    let profile = await UserProfile.findOne({ userId: req.user._id })
    if (!profile) {
      profile = await UserProfile.create({ userId: req.user._id })
    }
    let hasCV = false
    try {
      const CV = mongoose.models.CV
      if (CV) {
        const cv = await CV.findOne({ userId: req.user._id, isActive: true })
        hasCV = !!cv
      }
    } catch (_) {}
    res.json({ profile, user: req.user, hasCV })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' })
  }
})

// PUT /api/profile
router.put('/', protect, async (req, res) => {
  try {
    const updates = req.body

    const userUpdates = {}
    if (updates.firstName) userUpdates.firstName = updates.firstName
    if (updates.lastName) userUpdates.lastName = updates.lastName
    if (updates.phone !== undefined) userUpdates.phone = updates.phone
    if (updates.preferences) userUpdates.preferences = updates.preferences
    if (updates.onboardingCompleted !== undefined) userUpdates.onboardingCompleted = updates.onboardingCompleted

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user._id, userUpdates)
    }

    const profileData = { ...updates }
    delete profileData.firstName
    delete profileData.lastName
    delete profileData.phone
    delete profileData.preferences
    delete profileData.email
    delete profileData.onboardingCompleted

    if (updates.city !== undefined) {
      profileData.location = { ...(profileData.location || {}), city: updates.city }
      delete profileData.city
    }

    const profile = await UserProfile.findOneAndUpdate(
      { userId: req.user._id },
      { $set: profileData },
      { new: true, upsert: true }
    )

    const user = await User.findById(req.user._id)
    res.json({ profile, user, message: 'Profil mis à jour' })
  } catch (error) {
    console.error('Erreur profile update:', error)
    res.status(500).json({ error: 'Erreur lors de la mise à jour du profil' })
  }
})

// POST /api/profile/onboarding
router.post('/onboarding', protect, async (req, res) => {
  try {
    const { domains, searchKeywords, jobTypes, preferredLocations, title } = req.body

    const parsedDomains = domains ? (typeof domains === 'string' ? JSON.parse(domains) : domains) : []
    const parsedKeywords = searchKeywords ? (typeof searchKeywords === 'string' ? JSON.parse(searchKeywords) : searchKeywords) : []
    const parsedJobTypes = jobTypes ? (typeof jobTypes === 'string' ? JSON.parse(jobTypes) : jobTypes) : []
    const parsedLocations = preferredLocations ? (typeof preferredLocations === 'string' ? JSON.parse(preferredLocations) : preferredLocations) : []

    let profile = await UserProfile.findOne({ userId: req.user._id })
    if (!profile) {
      profile = await UserProfile.create({ userId: req.user._id })
    }

    profile.domains = parsedDomains
    profile.searchKeywords = parsedKeywords
    profile.jobTypes = parsedJobTypes
    profile.preferredLocations = parsedLocations
    if (title) profile.title = title
    await profile.save()

    await User.findByIdAndUpdate(req.user._id, { onboardingCompleted: true })

    res.json({ message: 'Profil complété avec succès', profile })
  } catch (error) {
    console.error('Erreur onboarding:', error)
    res.status(500).json({ error: 'Erreur lors de la configuration du profil' })
  }
})

// GET /api/profile/onboarding-status
router.get('/onboarding-status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
    const profile = await UserProfile.findOne({ userId: req.user._id })
    res.json({
      onboardingCompleted: user.onboardingCompleted || false,
      hasProfile: !!profile,
      hasDomains: profile?.domains?.length > 0,
      hasKeywords: profile?.searchKeywords?.length > 0,
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/profile/avatar
router.post('/avatar', protect, upload.single('avatar'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'Aucun fichier fourni' })

    const base64 = `data:${req.file.mimetype};base64,${req.file.buffer.toString('base64')}`
    await User.findByIdAndUpdate(req.user._id, { avatar: base64 })

    res.json({ avatar: base64, message: 'Avatar mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'upload' })
  }
})

export default router
