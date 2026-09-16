import express from 'express'
import JobOffer from '../models/JobOffer.js'
import Application from '../models/Application.js'
import UserProfile from '../models/UserProfile.js'
import { protect } from '../middlewares/auth.js'
import { notifyNewJobOffer, notifyNewApplicationToRecruiter } from '../services/NotificationService.js'
import { calculateCandidateMatch } from '../services/jobScraper.js'
import { buildCandidateInfo } from '../services/candidateInfo.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const { search, contractType, location, source, sort, page = 1, limit = 20 } = req.query
    
    const query = { userId: req.user._id, isActive: true }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }
    if (contractType) query.contractType = contractType
    if (location) query.location = { $regex: location, $options: 'i' }
    if (source) query.source = source

    let sortOption = { relevanceScore: -1, postedAt: -1, createdAt: -1 }
    if (sort === 'date') sortOption = { postedAt: -1, createdAt: -1 }
    else if (sort === 'salary') sortOption = { 'salary.max': -1, postedAt: -1, createdAt: -1 }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [jobs, total] = await Promise.all([
      JobOffer.find(query).sort(sortOption).skip(skip).limit(parseInt(limit)),
      JobOffer.countDocuments(query),
    ])

    res.json({ jobs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    console.error('Erreur jobs list:', error)
    res.status(500).json({ error: 'Erreur lors de la récupération des offres' })
  }
})

// GET /api/jobs/recruiter-board - Public board of recruiter-posted jobs
router.get('/recruiter-board', protect, async (req, res) => {
  try {
    const { domain, contractType, location, search, sort, matched, page = 1, limit = 20 } = req.query
    const query = { source: 'recruiter', isActive: true }

    if (domain) query.domain = domain
    if (contractType) query.contractType = contractType
    if (location) query.location = { $regex: location, $options: 'i' }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { company: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ]
    }

    let sortOption = { createdAt: -1 }
    if (sort === 'date') sortOption = { postedAt: -1 }
    else if (sort === 'salary') sortOption = { 'salary.max': -1 }

    // Fetch all matching offers, then score and paginate in memory so that
    // relevance ordering does not hide offers on later pages.
    const jobs = await JobOffer.find(query)
      .populate('postedBy', 'firstName lastName company')
      .sort(sortOption)
      .limit(500)
    const totalUnfiltered = jobs.length

    const appliedJobIds = await Application.find({ userId: req.user._id }).distinct('jobOfferId')

    // Profile matching: offers are shown according to the candidate's profile
    const profile = await UserProfile.findOne({ userId: req.user._id })
    const hasProfile = profile && (
      (profile.skills || []).length > 0 ||
      (profile.domains || []).length > 0 ||
      (profile.experience || []).length > 0 ||
      (profile.title || '').trim() !== ''
    )

    const jobsWithStatus = jobs.map(job => {
      const jobObj = job.toObject()
      let matchScore = 0
      if (profile && hasProfile) {
        matchScore = calculateCandidateMatch(profile, jobObj)
      }
      return {
        ...jobObj,
        matchScore,
        hasApplied: appliedJobIds.some(id => id.toString() === job._id.toString()),
      }
    })

    // Show all active recruiter offers; when the candidate has a profile,
    // order them by relevance instead of hiding low-match offers.
    let visibleJobs = jobsWithStatus
    if (profile && hasProfile && matched !== 'false') {
      visibleJobs.sort((a, b) => (b.matchScore || 0) - (a.matchScore || 0))
    }

    const total = visibleJobs.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedJobs = visibleJobs.slice(skip, skip + parseInt(limit))

    res.json({
      jobs: paginatedJobs,
      total,
      totalUnfiltered,
      profileMatched: !!(profile && hasProfile),
      page: parseInt(page),
      pages: Math.max(1, Math.ceil(total / parseInt(limit))),
    })
  } catch (error) {
    console.error('Recruiter board error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/saved', protect, async (req, res) => {
  try {
    const jobs = await JobOffer.find({ userId: req.user._id, isSaved: true, isActive: true }).sort({ updatedAt: -1 })
    res.json({ jobs })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/recommended', protect, async (req, res) => {
  try {
    const jobs = await JobOffer.find({ 
      userId: req.user._id, 
      isActive: true, 
      relevanceScore: { $gte: 70 } 
    }).sort({ relevanceScore: -1 }).limit(10)
    res.json({ jobs })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/:id', protect, async (req, res) => {
  try {
    const job = await JobOffer.findOne({
      _id: req.params.id,
      $or: [
        { userId: req.user._id },
        { source: 'recruiter' },
      ]
    }).populate('postedBy', 'firstName lastName company email phone')
    if (!job) return res.status(404).json({ error: 'Offre non trouvée' })

    const hasApplied = await Application.exists({ userId: req.user._id, jobOfferId: job._id })

    res.json({ job: { ...job.toObject(), hasApplied: !!hasApplied } })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const job = await JobOffer.create({ ...req.body, userId: req.user._id, source: 'manual' })

    notifyNewJobOffer(job)

    res.status(201).json({ job, message: 'Offre créée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' })
  }
})

router.post('/:id/save', protect, async (req, res) => {
  try {
    const job = await JobOffer.findOne({ _id: req.params.id, userId: req.user._id })
    if (!job) return res.status(404).json({ error: 'Offre non trouvée' })
    
    job.isSaved = !job.isSaved
    await job.save()
    
    res.json({ job, message: job.isSaved ? 'Offre sauvegardée' : 'Offre retirée des favoris' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// Apply to a recruiter job from candidate side
router.post('/:id/apply', protect, async (req, res) => {
  try {
    const job = await JobOffer.findOne({ _id: req.params.id, source: 'recruiter', isActive: true })
    if (!job) return res.status(404).json({ error: 'Offre non trouvée' })

    const existing = await Application.findOne({ userId: req.user._id, jobOfferId: job._id })
    if (existing) {
      return res.status(400).json({ error: 'Vous avez déjà postulé à cette offre' })
    }

    const candidateInfo = await buildCandidateInfo(req.user._id, job)

    const application = await Application.create({
      userId: req.user._id,
      jobOfferId: job._id,
      status: 'envoyee',
      coverLetter: req.body.coverLetter || '',
      appliedAt: new Date(),
      statusHistory: [{ status: 'envoyee', changedAt: new Date(), changedBy: 'candidat', note: 'Candidature envoyée' }],
      candidateInfo,
    })

    job.applicationsCount = (job.applicationsCount || 0) + 1
    await job.save()

    notifyNewApplicationToRecruiter(application, job)

    res.status(201).json({ application, message: 'Candidature envoyée avec succès' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la candidature' })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    await JobOffer.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ message: 'Offre supprimée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
