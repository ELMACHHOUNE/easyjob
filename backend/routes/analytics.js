import express from 'express'
import JobOffer from '../models/JobOffer.js'
import Application from '../models/Application.js'
import ScrapingLog from '../models/ScrapingLog.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

// GET /api/analytics/overview
router.get('/overview', protect, async (req, res) => {
  try {
    const userId = req.user._id

    const [totalOffers, offersBySource, totalApps, appsByStatus, recentLogs] = await Promise.all([
      JobOffer.countDocuments({ userId, isActive: true }),
      JobOffer.aggregate([
        { $match: { userId, isActive: true } },
        { $group: { _id: '$source', count: { $sum: 1 } } },
        { $sort: { count: -1 } },
      ]),
      Application.countDocuments({ userId }),
      Application.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      ScrapingLog.find({ userId }).sort({ createdAt: -1 }).limit(5),
    ])

    const offersByWeek = await JobOffer.aggregate([
      { $match: { userId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $week: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    const appsByWeek = await Application.aggregate([
      { $match: { userId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
      { $group: { _id: { $week: '$createdAt' }, count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])

    const sentCount = appsByStatus.find(s => s._id === 'envoyee')?.count || 0
    const openedCount = appsByStatus.find(s => s._id === 'ouverte')?.count || 0
    const acceptedCount = appsByStatus.find(s => s._id === 'acceptee')?.count || 0

    res.json({
      overview: {
        totalOffers,
        totalApplications: totalApps,
        responseRate: totalApps > 0 ? Math.round(((sentCount + openedCount + acceptedCount) / totalApps) * 100) : 0,
        emailOpenRate: sentCount > 0 ? Math.round((openedCount / sentCount) * 100) : 0,
      },
      offersBySource: offersBySource.map(s => ({ name: s._id || 'unknown', value: s.count })),
      appsByStatus: appsByStatus.map(s => ({ name: s._id, value: s.count })),
      offersByWeek,
      appsByWeek,
      recentLogs,
    })
  } catch (error) {
    console.error('Erreur analytics:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/analytics/applications
router.get('/applications', protect, async (req, res) => {
  try {
    const userId = req.user._id
    const [appsByStatus, appsByWeek, avgResponseTime] = await Promise.all([
      Application.aggregate([
        { $match: { userId } },
        { $group: { _id: '$status', count: { $sum: 1 } } },
      ]),
      Application.aggregate([
        { $match: { userId, createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } } },
        { $group: { _id: { $week: '$createdAt' }, count: { $sum: 1 } } },
        { $sort: { _id: 1 } },
      ]),
      Application.aggregate([
        { $match: { userId, status: { $in: ['ouverte', 'en_cours', 'acceptee'] } } },
        { $project: { diff: { $subtract: ['$updatedAt', '$createdAt'] } } },
        { $group: { _id: null, avg: { $avg: '$diff' } } },
      ]),
    ])

    res.json({
      byStatus: appsByStatus.map(s => ({ name: s._id, value: s.count })),
      byWeek: appsByWeek,
      avgResponseTimeMs: avgResponseTime[0]?.avg || 0,
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/analytics/sources
router.get('/sources', protect, async (req, res) => {
  try {
    const sources = await JobOffer.aggregate([
      { $match: { userId: req.user._id, isActive: true } },
      { $group: { _id: '$source', count: { $sum: 1 }, avgScore: { $avg: '$relevanceScore' } } },
      { $sort: { count: -1 } },
    ])
    res.json({ sources: sources.map(s => ({ name: s._id, count: s.count, avgScore: Math.round(s.avgScore || 0) })) })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
