import express from 'express'
import Recruiter from '../models/Recruiter.js'
import UserProfile from '../models/UserProfile.js'
import { protect } from '../middlewares/auth.js'
import { scrapeRecruiters } from '../services/jobScraper.js'

const router = express.Router()

router.post('/scrape', protect, async (req, res) => {
  try {
    const { keywords, location, count } = req.body || {}

    const profile = await UserProfile.findOne({ userId: req.user._id })
    const searchKeywords = keywords || profile?.domains || profile?.searchKeywords || ['recruteur', 'HR', 'talent']
    const searchLocation = location || profile?.location?.city || 'Maroc'
    const targetCount = Math.min(count || 30, 50)

    const userProfile = {
      skills: profile?.skills || [],
      domains: profile?.domains || [],
      searchKeywords: profile?.searchKeywords || [],
      education: profile?.education || [],
      experience: profile?.experience || [],
      title: profile?.title || '',
    }

    const scrapedRecruiters = await scrapeRecruiters(searchKeywords, searchLocation, targetCount, userProfile)

    const createdRecruiters = []
    let newCount = 0

    for (const recruiterData of scrapedRecruiters) {
      try {
        const existing = await Recruiter.findOne({
          userId: req.user._id,
          firstName: recruiterData.firstName,
          lastName: recruiterData.lastName,
          company: recruiterData.company,
        })

        if (!existing) {
          const recruiter = await Recruiter.create({
            ...recruiterData,
            userId: req.user._id,
          })
          createdRecruiters.push(recruiter)
          newCount++
        }
      } catch (e) {
        // skip duplicates
      }
    }

    res.json({
      message: `${newCount} nouveaux recruteurs trouvés`,
      recruiters: createdRecruiters,
      totalScraped: scrapedRecruiters.length,
      newRecruiters: newCount,
      duplicatesSkipped: scrapedRecruiters.length - newCount,
    })
  } catch (error) {
    console.error('Erreur scraping recruteurs:', error)
    res.status(500).json({ error: 'Erreur lors du scrapping des recruteurs' })
  }
})

router.get('/', protect, async (req, res) => {
  try {
    const { search, sector, location, connectionDegree } = req.query
    const query = { userId: req.user._id, isActive: true }

    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
      ]
    }
    if (sector) query.sector = sector
    if (location) query.location = { $regex: location, $options: 'i' }
    if (connectionDegree) query.connectionDegree = connectionDegree

    const recruiters = await Recruiter.find(query).sort({ updatedAt: -1 })
    res.json({ recruiters, total: recruiters.length })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/:id', protect, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOne({ _id: req.params.id, userId: req.user._id })
    if (!recruiter) return res.status(404).json({ error: 'Recruteur non trouvé' })
    res.json({ recruiter })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const recruiter = await Recruiter.create({ ...req.body, userId: req.user._id })
    res.status(201).json({ recruiter, message: 'Recruteur ajouté' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de l\'ajout' })
  }
})

router.put('/:id', protect, async (req, res) => {
  try {
    const recruiter = await Recruiter.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    )
    if (!recruiter) return res.status(404).json({ error: 'Recruteur non trouvé' })
    res.json({ recruiter, message: 'Recruteur mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    await Recruiter.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ message: 'Recruteur supprimé' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
