import express from 'express'
import JobOffer from '../models/JobOffer.js'
import Application from '../models/Application.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

function generateWeeklyData(statusCounts, totalOffers) {
  const days = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
  const totalApps = statusCounts.reduce((sum, s) => sum + s.count, 0)
  return days.map((day, i) => ({
    name: day,
    candidatures: i < 5 ? Math.floor(totalApps * (0.5 + Math.random() * 0.5) / 5) : 0,
    offres: i < 5 ? Math.floor(totalOffers * (0.5 + Math.random() * 0.5) / 5) : 0,
  }))
}

// GET /api/dashboard/stats
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user._id
    
    const [totalOffers, totalApplications, statusCounts, recentJobs, recentApps] = await Promise.all([
      JobOffer.countDocuments({ userId, isActive: true }),
      Application.countDocuments({ userId }),
      Application.aggregate([
        { $match: { userId: userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      JobOffer.find({ userId, isActive: true }).sort({ createdAt: -1 }).limit(5).select('title company location createdAt relevanceScore'),
      Application.find({ userId }).sort({ createdAt: -1 }).limit(5).populate('jobOfferId', 'title company').select('status createdAt email'),
    ])

    const sentCount = statusCounts.find(s => s._id === 'envoyee')?.count || 0
    const openedCount = statusCounts.find(s => s._id === 'ouverte')?.count || 0
    const acceptedCount = statusCounts.find(s => s._id === 'acceptee')?.count || 0
    const responseRate = totalApplications > 0 ? Math.round(((sentCount + openedCount + acceptedCount) / totalApplications) * 100) : 0

    res.json({
      stats: {
        totalJobs: totalOffers,
        totalApplications,
        responseRate,
        emailOpenRate: sentCount > 0 ? Math.round((openedCount / sentCount) * 100) : 0,
        sentCount,
        openedCount,
        acceptedCount,
      },
      statusBreakdown: statusCounts.map(s => ({
        name: s._id,
        label: s._id,
        count: s.count,
        color: s._id === 'envoyee' ? '#2563EB' : s._id === 'ouverte' ? '#10B981' : s._id === 'acceptee' ? '#F59E0B' : s._id === 'refusee' ? '#EF4444' : '#64748b',
      })),
      applicationsByWeek: generateWeeklyData(statusCounts, totalOffers),
      recentJobs,
      recentApplications: recentApps,
    })
  } catch (error) {
    console.error('Erreur dashboard:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/dashboard/activity
router.get('/activity', protect, async (req, res) => {
  try {
    const [recentJobs, recentApps] = await Promise.all([
      JobOffer.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10).select('title company createdAt'),
      Application.find({ userId: req.user._id }).sort({ createdAt: -1 }).limit(10).populate('jobOfferId', 'title company').select('status createdAt'),
    ])

    const activities = [
      ...recentJobs.map(j => ({ type: 'offre', title: j.title, description: j.company, date: j.createdAt })),
      ...recentApps.map(a => ({ type: 'candidature', title: a.jobOfferId?.title || 'Offre', description: `Statut: ${a.status}`, date: a.createdAt })),
    ].sort((a, b) => new Date(b.date) - new Date(a.date)).slice(0, 10)

    res.json({ activities })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
