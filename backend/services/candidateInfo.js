import mongoose from 'mongoose'
import User from '../models/User.js'
import UserProfile from '../models/UserProfile.js'
import { calculateCandidateMatch } from './jobScraper.js'

export async function buildCandidateInfo(userId, jobOffer) {
  const [user, profile] = await Promise.all([
    User.findById(userId),
    UserProfile.findOne({ userId }),
  ])

  const CV = mongoose.models.CV
  const cv = CV ? await CV.findOne({ userId, isActive: true }) : null

  const cvSkills = cv?.parsedData?.skills || []
  const profileSkills = profile?.skills || []
  const allSkills = [...new Set([...profileSkills, ...cvSkills])]

  const jobData = jobOffer && typeof jobOffer.toObject === 'function' ? jobOffer.toObject() : jobOffer
  const matchScore = profile && jobData
    ? calculateCandidateMatch(profile, jobData)
    : 0

  return {
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || cv?.parsedData?.phone || '',
    city: profile?.location?.city || cv?.parsedData?.location || '',
    title: profile?.title || '',
    linkedin: profile?.socialLinks?.linkedin || '',
    github: profile?.socialLinks?.github || '',
    portfolio: profile?.socialLinks?.portfolio || '',
    summary: profile?.presentation || profile?.summary || '',
    skills: allSkills.slice(0, 30),
    domains: profile?.domains || [],
    experience: (profile?.experience || []).map(e => ({
      position: e.position || '',
      company: e.company || '',
      startDate: e.startDate,
      endDate: e.endDate,
      isCurrent: !!e.isCurrent,
      description: e.description || '',
    })),
    education: (profile?.education || []).map(e => ({
      degree: e.degree || '',
      institution: e.institution || '',
      field: e.field || '',
      endDate: e.endDate,
    })),
    languages: (profile?.languages || []).map(l => ({
      language: l.language || '',
      level: l.level || '',
    })),
    cvSummary: cv?.candidateSummary || '',
    cvFileName: cv?.originalName || '',
    cvFileData: cv?.fileData || '',
    cvMimeType: cv?.mimeType || '',
    keywords: [...new Set([
      ...(cv?.keywords || []),
      ...(profile?.searchKeywords || []),
      ...(cv?.parsedData?.languages || []),
    ])].slice(0, 20),
    matchScore,
  }
}
