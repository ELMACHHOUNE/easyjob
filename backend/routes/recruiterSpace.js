import express from 'express'
import mongoose from 'mongoose'
import JobOffer from '../models/JobOffer.js'
import Application from '../models/Application.js'
import UserProfile from '../models/UserProfile.js'
import User from '../models/User.js'
import RecruiterProfile from '../models/RecruiterProfile.js'
import CV from '../models/CV.js'
import { protect, authorize } from '../middlewares/auth.js'
import { escapeHtml } from '../utils/sendEmail.js'
import { calculateCandidateMatch } from '../services/jobScraper.js'
import { buildCandidateInfo } from '../services/candidateInfo.js'
import {
  notifyNewJobOffer,
  notifyApplicationStatusChange,
  notifyNewApplicationToRecruiter,
  notifySuggestedCandidates,
  notifyEmailFromCompany,
} from '../services/NotificationService.js'

const router = express.Router()

function generateCandidateSummary(text, parsedData, userProfile) {
  const parts = []
  const firstName = userProfile?.userId?.firstName || 'Le candidat'

  const experiences = (parsedData.experience || []).filter(e => e.title && e.title.length > 3)
  const stages = experiences.filter(e => e.isStage)
  const nonStages = experiences.filter(e => !e.isStage)
  const educations = (parsedData.education || []).filter(e => e.degree && e.degree.length > 3)
  const firstEdu = educations[0] || null
  const skills = (parsedData.skills || []).filter(s => s.length > 1 && s.length < 50)
  const languages = (parsedData.languages || []).filter(l => l.length > 1 && l.length < 40)

  let profileType = 'unknown'
  if (stages.length > 0 && nonStages.length === 0) profileType = 'student_intern'
  else if (nonStages.length > 0 && nonStages.length <= 2) profileType = 'junior'
  else if (nonStages.length > 2) profileType = 'experienced'
  else if (educations.length > 0 && experiences.length === 0) profileType = 'student_noexp'

  function cleanDegree(deg) { return deg ? deg.replace(/\d{4}\s*[-–]\s*\d{4}/g, '').split(/\s*[-–|]/)[0].trim().substring(0, 120) : '' }
  function cleanCompany(c) { return c ? c.replace(/\|.*$/g, '').replace(/\d{4}/g, '').replace(/Casablanca.*$/i, '').trim().substring(0, 60) : '' }
  function stageLine(s) {
    const title = s.title.replace(/[-–—|]/g, '').trim().substring(0, 80)
    const company = cleanCompany(s.company)
    const projMatch = (s.description || '').match(/(?:Projet|Plateforme|Application|Site)\s*:\s*([^.]+)/i)
    const project = projMatch ? projMatch[1].trim().substring(0, 60) : ''
    let line = title; if (company) line += ` chez ${company}`; if (project) line += ` (${project})`
    return line
  }

  if (profileType === 'student_intern') {
    if (firstEdu) {
      const deg = cleanDegree(firstEdu.degree); const inst = firstEdu.institution.trim().substring(0, 80)
      if (deg.length > 3) { let t = `Diplome d'ingenieur en ${deg}`; if (inst.length > 2) t += `, ${inst}`; parts.push(t) }
    } else { parts.push(`${firstName} est un profil junior`) }
    if (stages.length === 1) parts.push(`Il/elle a effectue un stage en tant que ${stageLine(stages[0])}`)
    else if (stages.length > 1) parts.push(`Il/elle a realize ${stages.length} stages, notamment ${stages.map(stageLine).join(', ')}`)
  } else if (profileType === 'junior') {
    if (firstEdu) {
      const cleanDegree = firstEdu.degree.replace(/\d{4}\s*[-–]\s*\d{4}/g, '').split(/\s*[-–|]/)[0].trim().substring(0, 120)
      const cleanInst = firstEdu.institution.replace(/\d{4}\s*[-–]\s*\d{4}/g, '').trim().substring(0, 80)
      if (cleanDegree.length > 3) {
        let t = cleanDegree
        if (cleanInst.length > 2) t += `, ${cleanInst}`
        parts.push(`${firstName} est titulaire d'un diplome en ${t}`)
      }
    } else {
      parts.push(`${firstName} est un(e) professionnel(le) junior`)
    }
    const nd = nonStages.map(s => ({
      title: s.title.replace(/[-–—|]/g, '').trim().substring(0, 80),
      company: (s.company || '').replace(/\|.*$/g, '').replace(/\d{4}/g, '').trim().substring(0, 60)
    })).filter(s => s.title.length > 3)
    if (nd.length > 0) parts.push(`Il/elle a occupe le(s) poste(s) : ${nd.map(d => `${d.title}${d.company ? ` chez ${d.company}` : ''}`).join(', ')}`)
    if (stages.length > 0) parts.push(`Par ailleurs, il/elle a realize ${stages.length} stage(s) en amont de son experience professionnelle`)
  } else if (profileType === 'experienced') {
    if (firstEdu) {
      const cleanDegree = firstEdu.degree.replace(/\d{4}\s*[-–]\s*\d{4}/g, '').split(/\s*[-–|]/)[0].trim().substring(0, 120)
      if (cleanDegree.length > 3) parts.push(`${firstName} est titulaire d'un diplome en ${cleanDegree}`)
    }
    const nd = nonStages.map(s => ({
      title: s.title.replace(/[-–—|]/g, '').trim().substring(0, 80),
      company: (s.company || '').replace(/\|.*$/g, '').replace(/\d{4}/g, '').trim().substring(0, 60)
    })).filter(s => s.title.length > 3)
    parts.push(`Il/elle dispose de ${nd.length} experiences professionnelles`)
    if (nd.length > 0) parts.push(`dont ${nd.slice(0, 3).map(d => `${d.title}${d.company ? ` chez ${d.company}` : ''}`).join(', ')}`)
  } else if (profileType === 'student_noexp') {
    if (firstEdu) {
      const cleanDegree = firstEdu.degree.replace(/\d{4}\s*[-–]\s*\d{4}/g, '').split(/\s*[-–|]/)[0].trim().substring(0, 120)
      const cleanInst = firstEdu.institution.replace(/\d{4}\s*[-–]\s*\d{4}/g, '').trim().substring(0, 80)
      if (cleanDegree.length > 3) {
        let t = cleanDegree
        if (cleanInst.length > 2) t += `, ${cleanInst}`
        parts.push(`${firstName} est actuellement etudiant(e) en ${t}`)
      }
    }
    parts.push(`Aucune experience professionnelle n'est mentionnee dans son CV`)
  } else {
    if (educations.length > 0 && firstEdu) {
      const cleanDegree = firstEdu.degree.replace(/\d{4}\s*[-–]\s*\d{4}/g, '').split(/\s*[-–|]/)[0].trim().substring(0, 120)
      if (cleanDegree.length > 3) parts.push(`${firstName} est titulaire d'un diplome en ${cleanDegree}`)
    }
    if (experiences.length > 0) parts.push(`Il/elle dispose de ${experiences.length} experiences`)
    else parts.push(`${firstName} presente un profil a analyser`)
  }

  if (skills.length > 0) {
    const frameworks = skills.filter(s => /react|angular|vue|spring|django|laravel|next|node|thymeleaf|flutter/i.test(s))
    const langs = skills.filter(s => /java|python|php|javascript|c\+|c#|typescript|ruby|go|rust/i.test(s))
    const tools = skills.filter(s => /git|docker|linux|jira|agile|scrum|uml|ci\/cd|intellij|vs code|ollama|llm/i.test(s))
    const db = skills.filter(s => /mysql|postgres|oracle|mongo|redis|sql server|sqlite/i.test(s))
    const categories = []
    if (langs.length > 0) categories.push(`Langages (${langs.slice(0, 5).join(', ')})`)
    if (frameworks.length > 0) categories.push(`Frameworks (${frameworks.slice(0, 4).join(', ')})`)
    if (db.length > 0) categories.push(`Bases de donnees (${db.slice(0, 3).join(', ')})`)
    if (tools.length > 0) categories.push(`Outils (${tools.slice(0, 4).join(', ')})`)
    if (categories.length > 0) parts.push(`Ses competences techniques : ${categories.join('; ')}`)
    else parts.push(`Ses competences techniques incluent ${skills.slice(0, 6).join(', ')}`)
  }

  if (languages.length > 0) parts.push(`Il/elle parle ${languages.slice(0, 5).join(', ')}`)

  return parts.length > 0 ? parts.join('. ').replace(/\.\./g, '.') + '.' : 'Resume non disponible.'
}

function extractKeywords(text, parsedData) {
  const keywords = new Set()
  for (const skill of parsedData.skills) keywords.add(skill)
  const softSkills = [
    'Leadership', 'Communication', 'Travail en equipe', 'Gestion de projet',
    'Problem solving', 'Creativite', 'Adaptabilite', 'Autonomie',
    'Rigueur', 'Organisation', 'Prise de decision', 'Negociation',
    'Management', 'Mentorat', 'Formations', 'Presentation',
  ]
  const textLower = text.toLowerCase()
  for (const ss of softSkills) {
    if (textLower.includes(ss.toLowerCase())) keywords.add(ss)
  }
  const techPatterns = [
    'CI/CD', 'REST API', 'Microservices', 'Agile', 'Scrum',
    'Kanban', 'Test Driven', 'TDD', 'DevOps', 'Clean Code',
    'Design Patterns', 'MVC', 'OOP', 'SOLID',
  ]
  for (const tp of techPatterns) {
    if (textLower.includes(tp.toLowerCase())) keywords.add(tp)
  }
  return [...keywords].slice(0, 20)
}

// ─── RECRUITER PROFILE ─────────────────────────────────────────
router.get('/profile', protect, authorize('recruiter'), async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user._id })
    if (!profile) return res.status(404).json({ error: 'Profil recruteur non trouvé' })
    res.json({ profile })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.put('/profile', protect, authorize('recruiter'), async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOneAndUpdate(
      { userId: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!profile) return res.status(404).json({ error: 'Profil non trouvé' })
    res.json({ profile, message: 'Profil mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── RECRUITER DASHBOARD ──────────────────────────────────────
router.get('/dashboard', protect, authorize('recruiter'), async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user._id })

    const [postedJobs, totalApplications, recentApplications] = await Promise.all([
      JobOffer.find({ postedBy: req.user._id, source: 'recruiter' }).sort({ createdAt: -1 }),
      Application.countDocuments({ jobOfferId: { $in: await JobOffer.find({ postedBy: req.user._id }).distinct('_id') } }),
      Application.find({ jobOfferId: { $in: await JobOffer.find({ postedBy: req.user._id }).distinct('_id') } })
        .populate('userId', 'firstName lastName email avatar jobSearchStatus')
        .populate('jobOfferId', 'title company location')
        .sort({ createdAt: -1 })
        .limit(20),
    ])

    const statusBreakdown = await Application.aggregate([
      { $match: { jobOfferId: { $in: await JobOffer.find({ postedBy: req.user._id }).distinct('_id') } } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ])

    const stats = {
      totalJobs: postedJobs.length,
      activeJobs: postedJobs.filter(j => j.isActive).length,
      totalApplications,
      applicationsByStatus: statusBreakdown.reduce((acc, s) => { acc[s._id] = s.count; return acc }, {}),
    }

    res.json({ profile, stats, recentApplications, postedJobs })
  } catch (error) {
    console.error('Recruiter dashboard error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── JOB POSTINGS (CRUD) ──────────────────────────────────────
router.get('/jobs', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status, page = 1, limit = 20 } = req.query
    const query = { postedBy: req.user._id, source: 'recruiter' }
    if (status === 'active') query.isActive = true
    else if (status === 'inactive') query.isActive = false

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [jobs, total] = await Promise.all([
      JobOffer.find(query).sort({ createdAt: -1 }).skip(skip).limit(parseInt(limit)),
      JobOffer.countDocuments(query),
    ])

    // Add application counts
    const jobsWithCounts = await Promise.all(jobs.map(async (job) => {
      const appCount = await Application.countDocuments({ jobOfferId: job._id })
      return { ...job.toObject(), applicationsCount: appCount }
    }))

    res.json({ jobs: jobsWithCounts, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/jobs/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await JobOffer.findOne({ _id: req.params.id, postedBy: req.user._id })
    if (!job) return res.status(404).json({ error: 'Offre non trouvée' })

    const applications = await Application.find({ jobOfferId: job._id })
      .populate('userId', 'firstName lastName email avatar jobSearchStatus')
      .sort({ createdAt: -1 })

    const profiles = await UserProfile.find({ userId: { $in: applications.map(a => a.userId?._id).filter(Boolean) } })
    const profileMap = new Map(profiles.map(p => [p.userId.toString(), p]))

    const applicationsWithMatch = applications.map(app => {
      let matchScore = app.candidateInfo?.matchScore || 0
      if (!matchScore && app.userId) {
        const profile = profileMap.get(app.userId._id.toString())
        if (profile) matchScore = calculateCandidateMatch(profile, job.toObject())
      }
      return { ...app.toObject(), matchScore }
    })

    res.json({ job, applications: applicationsWithMatch })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/jobs', protect, authorize('recruiter'), async (req, res) => {
  try {
    const profile = await RecruiterProfile.findOne({ userId: req.user._id })
    const company = profile?.companyName || req.body.company || 'Entreprise'

    const body = { ...req.body }
    if (!body.applicationDeadline) delete body.applicationDeadline
    if (body.salary && typeof body.salary === 'object') {
      if (!Number.isFinite(body.salary.min)) delete body.salary.min
      if (!Number.isFinite(body.salary.max)) delete body.salary.max
      if (Object.keys(body.salary).length === 0) delete body.salary
    }

    const titleWords = (req.body.title || '').split(/\s+/).filter(w => w.length > 2)
    const keywords = [...new Set([
      ...titleWords,
      ...(body.requirements || []),
      ...(body.responsibilities || []),
    ])].slice(0, 20)

    const job = await JobOffer.create({
      ...body,
      postedBy: req.user._id,
      company,
      source: 'recruiter',
      postedAt: new Date(),
      isActive: true,
      keywords,
    })

    // Fire-and-forget non-critical side effects so they can never block the
    // creation response (notifications, counters, candidate suggestions).
    Promise.resolve().then(async () => {
      try {
        if (profile) {
          profile.jobPostingsCount = await JobOffer.countDocuments({ postedBy: req.user._id, source: 'recruiter' })
          await profile.save()
        }
        await notifyNewJobOffer(job)
        const matchingCount = await UserProfile.countDocuments({
          $or: [
            { domains: { $regex: job.sector || '', $options: 'i' } },
            { skills: { $in: (job.requirements || []).map(r => new RegExp(r, 'i')) } },
          ]
        })
        if (matchingCount > 0) await notifySuggestedCandidates(req.user._id, job, matchingCount)
      } catch (sideErr) {
        console.error('Post-create side effects error:', sideErr)
      }
    })

    res.status(201).json({ job, message: 'Offre créée avec succès' })
  } catch (error) {
    console.error('Create recruiter job error:', error)
    res.status(500).json({ error: `Erreur lors de la création : ${error.message || 'erreur inconnue'}` })
  }
})

router.put('/jobs/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await JobOffer.findOneAndUpdate(
      { _id: req.params.id, postedBy: req.user._id },
      req.body,
      { new: true, runValidators: true }
    )
    if (!job) return res.status(404).json({ error: 'Offre non trouvée' })
    res.json({ job, message: 'Offre mise à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.delete('/jobs/:id', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await JobOffer.findOneAndDelete({ _id: req.params.id, postedBy: req.user._id })
    if (!job) return res.status(404).json({ error: 'Offre non trouvée' })

    const profile = await RecruiterProfile.findOne({ userId: req.user._id })
    if (profile) {
      profile.jobPostingsCount = await JobOffer.countDocuments({ postedBy: req.user._id, source: 'recruiter' })
      await profile.save()
    }

    res.json({ message: 'Offre supprimée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.put('/jobs/:id/toggle', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await JobOffer.findOne({ _id: req.params.id, postedBy: req.user._id })
    if (!job) return res.status(404).json({ error: 'Offre non trouvée' })

    job.isActive = !job.isActive
    await job.save()
    res.json({ job, message: job.isActive ? 'Offre activée' : 'Offre désactivée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── SCORING: 3 dimensions for candidate ranking ───────────────
function computeCandidateScores(profile, cv) {
  // 1. CV Quality Score (0-100): based on CV analysis + content richness
  let cvScore = 0
  if (cv) {
    cvScore = cv.analysis?.score || 0
    // Bonus for having extracted text (real CV parsed)
    if (cv.extractedText && cv.extractedText.length > 200) cvScore = Math.min(100, cvScore + 5)
  }

  // 2. Profile Completeness Score (0-100): how well the profile is filled
  let profileScore = 0
  if (profile.title) profileScore += 10
  if (profile.presentation) profileScore += 15
  if (profile.skills?.length > 0) profileScore += Math.min(20, profile.skills.length * 3)
  if (profile.domains?.length > 0) profileScore += Math.min(10, profile.domains.length * 3)
  if (profile.education?.length > 0) profileScore += 15
  if (profile.experience?.length > 0) profileScore += Math.min(15, profile.experience.length * 5)
  if (profile.languages?.length > 0) profileScore += Math.min(10, profile.languages.length * 3)
  if (profile.location?.city) profileScore += 5
  if (profile.searchKeywords?.length > 0) profileScore += Math.min(5, profile.searchKeywords.length * 2)
  profileScore = Math.min(100, profileScore)

  // 3. Skills Diversity Score (0-100): breadth and depth of technical skills
  let skillsScore = 0
  const allSkills = [...new Set([
    ...(profile.skills || []),
    ...(cv?.parsedData?.skills || []),
    ...(profile.searchKeywords || []),
  ])]
  if (allSkills.length > 0) skillsScore += Math.min(40, allSkills.length * 4)
  if (profile.experience?.length > 0) {
    const expSkills = profile.experience.flatMap(e => e.skills || [])
    skillsScore += Math.min(20, expSkills.length * 5)
  }
  if (cv?.keywords?.length > 0) skillsScore += Math.min(20, cv.keywords.length * 2)
  if (profile.domains?.length > 0) skillsScore += Math.min(20, profile.domains.length * 7)
  skillsScore = Math.min(100, skillsScore)

  const totalScore = Math.round((cvScore * 0.4 + profileScore * 0.35 + skillsScore * 0.25))

  return { cvScore, profileScore, skillsScore, totalScore }
}

function mergeCandidateKeywords(profile, cv) {
  const keywordsSet = new Set()
  // Profile skills (candidate-chosen)
  for (const skill of (profile.skills || [])) keywordsSet.add(skill)
  // Search keywords (candidate-chosen)
  for (const kw of (profile.searchKeywords || [])) keywordsSet.add(kw)
  // CV parsed skills (extracted from CV)
  for (const skill of (cv?.parsedData?.skills || [])) keywordsSet.add(skill)
  // CV extracted keywords (tech patterns + soft skills)
  for (const kw of (cv?.keywords || [])) keywordsSet.add(kw)
  // Domain expertise
  for (const domain of (profile.domains || [])) keywordsSet.add(domain)
  return [...keywordsSet]
}

// ─── CANDIDATE BROWSING ───────────────────────────────────────
router.get('/candidates', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { domain, skills, location, status, page = 1, limit = 50, search } = req.query

    // Find candidate user IDs first (exclude recruiters and admins)
    const candidateUserIds = await User.find({ role: 'candidat', isActive: true }).distinct('_id')

    const profileQuery = { userId: { $in: candidateUserIds } }
    if (domain) profileQuery.domains = { $in: domain.split(',') }
    if (skills) profileQuery.skills = { $in: skills.split(',') }
    if (location) profileQuery['location.city'] = { $regex: location, $options: 'i' }

    // Optionally filter by job search status
    if (status && status !== 'all') {
      const statusUsers = await User.find({
        role: 'candidat',
        isActive: true,
        jobSearchStatus: { $in: status.split(',') }
      }).distinct('_id')
      profileQuery.userId = { $in: candidateUserIds.filter(id => statusUsers.some(su => su.toString() === id.toString())) }
    }

    // Fetch ALL matching profiles for scoring (not paginated yet)
    const allProfiles = await UserProfile.find(profileQuery)
      .populate('userId', 'firstName lastName email avatar jobSearchStatus lastLogin')

    // Filter to only valid users
    const validProfiles = allProfiles.filter(p => p.userId)

    // Search filter by name/email
    let filteredProfiles = validProfiles
    if (search) {
      const s = search.toLowerCase()
      filteredProfiles = validProfiles.filter(p => {
        const u = p.userId
        return `${u.firstName} ${u.lastName}`.toLowerCase().includes(s) ||
          u.email.toLowerCase().includes(s)
      })
    }

    // Attach CV info for each candidate
    const userIds = filteredProfiles.map(p => p.userId?._id).filter(Boolean)
    let cvMap = {}
    if (userIds.length > 0) {
      const cvs = await CV.find({ userId: { $in: userIds }, isActive: true })
        .select('userId originalName fileSize analysis candidateSummary keywords parsedData.skills extractedText')
      for (const cv of cvs) {
        if (!cv.candidateSummary || cv.extractedText) {
          cv.candidateSummary = generateCandidateSummary(cv.extractedText, cv.parsedData || {}, {})
          cv.keywords = extractKeywords(cv.extractedText, cv.parsedData || {})
          await cv.save()
        }
        cvMap[cv.userId.toString()] = cv
      }
    }

    // Score and enrich each candidate
    const candidatesWithScores = filteredProfiles.map(p => {
      const cv = cvMap[p.userId?._id?.toString()] || null
      const scores = computeCandidateScores(p, cv)
      const mergedKeywords = mergeCandidateKeywords(p, cv)

      // Use candidate's own `presentation` as the summary (first impression for recruiter)
      const recruiterSummary = p.presentation || cv?.candidateSummary || ''

      return {
        ...p.toObject(),
        cv: cv ? {
          ...cv.toObject(),
          keywords: mergedKeywords,
          candidateSummary: recruiterSummary,
        } : null,
        scores,
      }
    })

    // Sort by total score descending
    candidatesWithScores.sort((a, b) => b.scores.totalScore - a.scores.totalScore)

    // Separate top 3 from the rest
    const topCandidates = candidatesWithScores.slice(0, 3)
    const regularCandidates = candidatesWithScores.slice(3)

    // Paginate the regular candidates
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedRegular = regularCandidates.slice(skip, skip + parseInt(limit))

    res.json({
      topCandidates,
      candidates: paginatedRegular,
      total: candidatesWithScores.length,
      topCount: topCandidates.length,
      page: parseInt(page),
      pages: Math.ceil(regularCandidates.length / parseInt(limit)),
    })
  } catch (error) {
    console.error('Candidates browse error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── CANDIDATE DETAIL ─────────────────────────────────────────
router.get('/candidates/:userId', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { userId } = req.params
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'ID invalide' })
    }

    const profile = await UserProfile.findOne({ userId })
      .populate('userId', 'firstName lastName email avatar jobSearchStatus lastLogin')

    if (!profile || !profile.userId) {
      return res.status(404).json({ error: 'Candidat non trouvé' })
    }

    const cv = await CV.findOne({ userId, isActive: true })
      .select('originalName fileSize analysis parsedData extractedText version createdAt')

    res.json({ candidate: profile, cv })
  } catch (error) {
    console.error('Candidate detail error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── CANDIDATE CV DOWNLOAD ─────────────────────────────────────
router.get('/candidates/:userId/cv/download', protect, authorize('recruiter'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'ID invalide' })
    }
    const cv = await CV.findOne({ userId: req.params.userId, isActive: true })
    if (!cv || !cv.fileData) {
      return res.status(404).json({ error: 'CV non trouvé' })
    }

    const rawBase64 = cv.fileData.startsWith('data:')
      ? cv.fileData.split(',')[1]
      : cv.fileData
    const buffer = Buffer.from(rawBase64, 'base64')

    res.setHeader('Content-Type', 'application/pdf')
    res.setHeader('Content-Disposition', `attachment; filename="${cv.originalName || 'cv.pdf'}"`)
    res.send(buffer)
  } catch (error) {
    console.error('CV download error:', error)
    res.status(500).json({ error: 'Erreur lors du téléchargement' })
  }
})

// ─── CANDIDATE CV PREVIEW (base64 inline) ─────────────────────
router.get('/candidates/:userId/cv/preview', protect, authorize('recruiter'), async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.userId)) {
      return res.status(400).json({ error: 'ID invalide' })
    }
    const cv = await CV.findOne({ userId: req.params.userId, isActive: true })
      .select('fileData fileSize mimeType originalName')
    if (!cv) {
      return res.status(404).json({ error: 'CV non trouvé' })
    }

    res.json({
      fileData: cv.fileData,
      fileSize: cv.fileSize,
      mimeType: cv.mimeType,
      originalName: cv.originalName,
    })
  } catch (error) {
    console.error('CV preview error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── CANDIDATE MATCHING FOR A JOB ────────────────────────────
router.get('/jobs/:id/matching-candidates', protect, authorize('recruiter'), async (req, res) => {
  try {
    const job = await JobOffer.findOne({ _id: req.params.id, postedBy: req.user._id })
    if (!job) return res.status(404).json({ error: 'Offre non trouvée' })

    const { minScore = 30, page = 1, limit = 20 } = req.query

    // Find candidates with relevant profiles
    const profileQuery = {}
    if (job.domain) profileQuery.domains = { $in: [job.domain] }
    if (job.sector) profileQuery.$or = [{ domains: job.sector }, { skills: { $regex: job.sector, $options: 'i' } }]

    const profiles = await UserProfile.find(profileQuery)
      .populate('userId', 'firstName lastName email avatar jobSearchStatus lastLogin')

    const scoredCandidates = profiles
      .filter(p => p.userId && p.userId.isActive !== false)
      .map(profile => {
        const matchScore = calculateCandidateMatch(profile, job.toObject())
        return { profile, matchScore, userId: profile.userId }
      })
      .filter(c => c.matchScore >= parseInt(minScore))
      .sort((a, b) => b.matchScore - a.matchScore)

    const total = scoredCandidates.length
    const skip = (parseInt(page) - 1) * parseInt(limit)
    const paginatedCandidates = scoredCandidates.slice(skip, skip + parseInt(limit))

    res.json({
      candidates: paginatedCandidates,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    console.error('Matching candidates error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── APPLICATION MANAGEMENT (RECRUITER SIDE) ──────────────────
router.get('/applications', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status, jobId, page = 1, limit = 50 } = req.query

    const jobIds = await JobOffer.find({ postedBy: req.user._id }).distinct('_id')
    const query = { jobOfferId: { $in: jobIds } }
    if (status && status !== 'all') query.status = status
    if (jobId) query.jobOfferId = jobId

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [applications, total] = await Promise.all([
      Application.find(query)
        .populate('userId', 'firstName lastName email avatar jobSearchStatus')
        .populate('jobOfferId', 'title company location contractType')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Application.countDocuments(query),
    ])

    res.json({ applications, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.put('/applications/:id/status', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { status } = req.body
    const allowedStatuses = ['envoyee', 'consulte', 'valide_entretien', 'appel_attente', 'entretien_fait', 'accepte_final', 'refusee']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' })
    }

    const jobIds = await JobOffer.find({ postedBy: req.user._id }).distinct('_id')
    const app = await Application.findOne({ _id: req.params.id, jobOfferId: { $in: jobIds } })
    if (!app) return res.status(404).json({ error: 'Candidature non trouvée' })

    const oldStatus = app.status
    app.status = status
    if (!app.statusHistory) app.statusHistory = []
    app.statusHistory.push({ status, changedAt: new Date(), changedBy: 'recruteur', note: `Statut mis à jour par le recruteur: ${status}` })
    await app.save()

    notifyApplicationStatusChange(app, oldStatus, status, 'recruteur')

    res.json({ application: app, message: 'Statut mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── PUBLIC JOB BOARD (for candidates to browse) ──────────────
router.get('/public/jobs', async (req, res) => {
  try {
    const { domain, contractType, location, search, page = 1, limit = 20 } = req.query
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

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [jobs, total] = await Promise.all([
      JobOffer.find(query)
        .populate('postedBy', 'firstName lastName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      JobOffer.countDocuments(query),
    ])

    res.json({ jobs, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// ─── APPLY TO RECRUITER JOB (candidate side) ──────────────────
router.post('/public/jobs/:id/apply', protect, async (req, res) => {
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

// ─── RECRUITER SENDS EMAIL TO CANDIDATE ────────────────────────
router.post('/candidates/:userId/email', protect, authorize('recruiter'), async (req, res) => {
  try {
    const { subject, message } = req.body
    if (!subject || !message) {
      return res.status(400).json({ error: 'Sujet et message requis' })
    }

    const targetUser = await User.findById(req.params.userId).select('firstName lastName email')
    if (!targetUser) {
      return res.status(404).json({ error: 'Candidat non trouvé' })
    }

    const profile = await RecruiterProfile.findOne({ userId: req.user._id })

    const { sendEmail, brandLayout } = await import('../utils/sendEmail.js')

    const candidateName = `${targetUser.firstName || ''} ${targetUser.lastName || ''}`.trim() || 'Candidat'
    const recruiterName = escapeHtml(`${req.user.firstName} ${req.user.lastName}`)
    const companyName = profile?.companyName ? escapeHtml(profile.companyName) : ''
    const position = profile?.position ? escapeHtml(profile.position) : 'Recruteur'
    const safeSubject = escapeHtml(subject)
    const safeMessage = escapeHtml(message)

    const content = `
      <p style="margin:0 0 8px 0; font-size:14px; color:#334155; line-height:1.6;">Bonjour <strong>${escapeHtml(candidateName)}</strong>,</p>
      <p style="margin:0 0 20px 0; font-size:14px; color:#334155; line-height:1.6;">${recruiterName}${companyName ? ` (${companyName})` : ''} vous a envoyé un message via EasyJob :</p>
      <div style="background:#ecfdf5; border-left:4px solid #10b981; border-radius:12px; padding:18px 20px; margin:0 0 6px 0; white-space:pre-wrap; color:#334155; font-size:14px; line-height:1.7;">${safeMessage}</div>
      <p style="margin:14px 0 0 0; font-size:12px; color:#94a3b8; line-height:1.6;">${position}${companyName ? ` chez ${companyName}` : ''}</p>
      <p style="margin:4px 0 0 0; font-size:12px; color:#94a3b8; line-height:1.6;">Ce message a été envoyé via EasyJob. Veuillez ne pas répondre directement à cet email.</p>
    `

    const html = brandLayout({
      accent: '#10b981',
      title: 'Message d\'un recruteur',
      content,
    })

    const result = await sendEmail({
      to: targetUser.email,
      subject: `[EasyJob] ${safeSubject}`,
      html,
    })

    if (result.success) {
      notifyEmailFromCompany(req.params.userId, profile?.companyName || `${req.user.firstName} ${req.user.lastName}`, subject)
      res.json({ message: 'Email envoyé avec succès', messageId: result.messageId })
    } else {
      res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email' })
    }
  } catch (error) {
    console.error('Recruiter email error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
