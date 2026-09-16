import express from 'express'
import JobOffer from '../models/JobOffer.js'
import ScrapingLog from '../models/ScrapingLog.js'
import UserProfile from '../models/UserProfile.js'
import User from '../models/User.js'
import { protect } from '../middlewares/auth.js'
import { scrapeAllSources } from '../services/jobScraper.js'
import { notifyScrapingComplete } from '../services/NotificationService.js'

const router = express.Router()

router.post('/run', protect, async (req, res) => {
  try {
    const { keywords, location, sources } = req.body || {}

    const [profile, user] = await Promise.all([
      UserProfile.findOne({ userId: req.user._id }),
      User.findById(req.user._id),
    ])

    const searchKeywords = keywords
      || profile?.searchKeywords
      || profile?.domains
      || profile?.skills
      || ['développeur', 'ingénieur', 'chef de projet']
    const searchLocation = location
      || profile?.preferredLocations?.[0]
      || profile?.location?.city
      || 'Maroc'
    const enabledSources = sources || ['linkedin', 'indeed', 'rekrute']

    const userProfile = {
      skills: profile?.skills || [],
      domains: profile?.domains || [],
      searchKeywords: profile?.searchKeywords || [],
      education: profile?.education || [],
      experience: profile?.experience || [],
      title: profile?.title || user?.role || '',
    }

    const log = await ScrapingLog.create({
      userId: req.user._id,
      status: 'running',
      startedAt: new Date(),
      sources: enabledSources.map(s => ({ source: s, status: 'running' })),
    })

    const results = await scrapeAllSources(searchKeywords, searchLocation, enabledSources, userProfile)

    const createdJobs = []
    const sourceStats = []

    for (const [sourceName, result] of Object.entries(results)) {
      if (!enabledSources.includes(sourceName)) continue
      let newOffers = 0
      for (const jobData of result.jobs) {
        try {
          const existing = await JobOffer.findOne({
            userId: req.user._id,
            source: jobData.source,
            title: jobData.title,
            company: jobData.company,
          })
          if (!existing) {
            const job = await JobOffer.create({
              ...jobData,
              userId: req.user._id,
              scrapedAt: new Date(),
              sourceId: jobData.sourceId || `scrape-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
              postedAt: jobData.postedAt || new Date(),
            })
            createdJobs.push(job)
            newOffers++
          }
        } catch (e) {
          // skip duplicates
        }
      }
      sourceStats.push({
        source: sourceName,
        status: result.status,
        offersFound: result.jobs.length,
        newOffers,
        duplicatesSkipped: result.jobs.length - newOffers,
        duration: result.duration,
        errorMessages: result.error ? [result.error] : [],
      })
    }

    log.status = 'success'
    log.sources = sourceStats
    log.totalOffersFound = sourceStats.reduce((sum, s) => sum + s.offersFound, 0)
    log.totalNewOffers = createdJobs.length
    log.completedAt = new Date()
    await log.save()

    notifyScrapingComplete(req.user._id, {
      count: createdJobs.length,
      source: enabledSources.join(', '),
      jobs: createdJobs,
    })

    res.json({
      message: `${createdJobs.length} nouvelles offres trouvées`,
      log,
      jobsFound: createdJobs.length,
      newJobs: createdJobs.length,
    })
  } catch (error) {
    console.error('Erreur scraping:', error)
    res.status(500).json({ error: 'Erreur lors du scrapping' })
  }
})

router.get('/logs', protect, async (req, res) => {
  try {
    const logs = await ScrapingLog.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(20)
    res.json({ logs })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/status', protect, async (req, res) => {
  try {
    const log = await ScrapingLog.findOne({ userId: req.user._id, status: 'running' })
    res.json({ isRunning: !!log, log })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
