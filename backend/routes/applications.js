import express from 'express'
import Application from '../models/Application.js'
import JobOffer from '../models/JobOffer.js'
import User from '../models/User.js'
import CV from '../models/CV.js'
import { protect } from '../middlewares/auth.js'
import { sendEmail, escapeHtml, brandLayout } from '../utils/sendEmail.js'
import {
  notifyApplicationStatusChange,
  notifyNewApplicationToRecruiter
} from '../services/NotificationService.js'

const router = express.Router()

// GET /api/applications
router.get('/', protect, async (req, res) => {
  try {
    const { status, page = 1, limit = 50 } = req.query
    const query = { userId: req.user._id }
    if (status && status !== 'all') query.status = status

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [applications, total] = await Promise.all([
      Application.find(query).populate('jobOfferId', 'title company location contractType source sourceUrl').sort({ updatedAt: -1 }).skip(skip).limit(parseInt(limit)),
      Application.countDocuments(query),
    ])
    res.json({ applications, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// GET /api/applications/:id
router.get('/:id', protect, async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id }).populate('jobOfferId')
    if (!app) return res.status(404).json({ error: 'Candidature non trouvée' })
    res.json({ application: app })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/applications - Create or mark as applied
router.post('/', protect, async (req, res) => {
  try {
    const { jobOfferId } = req.body
    const existing = await Application.findOne({ userId: req.user._id, jobOfferId })
    if (existing) {
      return res.status(400).json({ error: 'Vous avez déjà postulé à cette offre' })
    }

    const application = await Application.create({
      userId: req.user._id,
      jobOfferId,
      status: 'envoyee',
      appliedAt: new Date(),
      statusHistory: [{ status: 'envoyee', changedAt: new Date(), changedBy: 'candidat', note: 'Candidature envoyée' }],
    })

    const jobOffer = await JobOffer.findById(jobOfferId)
    if (jobOffer) {
      notifyNewApplicationToRecruiter(application, jobOffer)
    }

    res.status(201).json({ application, message: 'Candidature enregistrée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' })
  }
})

// POST /api/applications/mark-applied - Quick mark as applied
router.post('/mark-applied', protect, async (req, res) => {
  try {
    const { jobOfferId } = req.body
    if (!jobOfferId) return res.status(400).json({ error: 'jobOfferId requis' })

    const existing = await Application.findOne({ userId: req.user._id, jobOfferId })
    if (existing) {
      existing.status = 'envoyee'
      existing.appliedAt = new Date()
      await existing.save()
      return res.json({ application: existing, message: 'Déjà enregistré comme postulé' })
    }

    const application = await Application.create({
      userId: req.user._id,
      jobOfferId,
      status: 'envoyee',
      appliedAt: new Date(),
      statusHistory: [{ status: 'envoyee', changedAt: new Date(), changedBy: 'candidat', note: 'Candidature envoyée' }],
    })

    const jobOffer = await JobOffer.findById(jobOfferId)
    if (jobOffer) {
      notifyNewApplicationToRecruiter(application, jobOffer)
    }

    res.status(201).json({ application, message: 'Candidature enregistrée avec succès' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/applications/:id/send
router.post('/:id/send', protect, async (req, res) => {
  try {
    const app = await Application.findOne({ _id: req.params.id, userId: req.user._id })
    if (!app) return res.status(404).json({ error: 'Candidature non trouvée' })

    const emailData = req.body.email || {}
    const { to, subject, body, attachCv } = emailData
    if (!to || !subject || !body) {
      return res.status(400).json({ error: 'Destinataire, objet et contenu de l\'email requis' })
    }

    const [jobOffer, user] = await Promise.all([
      JobOffer.findById(app.jobOfferId),
      User.findById(req.user._id),
    ])

    const recipientName = jobOffer?.recruiterName || 'Recruteur'
    const company = jobOffer?.company || ''
    const candidateName = `${user?.firstName || ''} ${user?.lastName || ''}`.trim()

    const attachments = []
    if (attachCv) {
      const cv = await CV.findOne({ userId: req.user._id, isActive: true })
      if (cv && cv.fileData) {
        const rawBase64 = cv.fileData.startsWith('data:') ? cv.fileData.split(',')[1] : cv.fileData
        attachments.push({
          filename: cv.originalName || 'CV.pdf',
          content: Buffer.from(rawBase64, 'base64'),
          contentType: cv.mimeType || 'application/pdf',
        })
      }
    }

    const safeRecipient = escapeHtml(recipientName) + (company ? ` (${escapeHtml(company)})` : '')
    const content = `
      <p style="margin:0 0 8px 0; font-size:14px; color:#334155; line-height:1.6;">Bonjour <strong>${safeRecipient}</strong>,</p>
      <p style="margin:0 0 20px 0; font-size:14px; color:#334155; line-height:1.6;">Vous avez reçu une nouvelle candidature via EasyJob :</p>
      <div style="background:#eff6ff; border-left:4px solid #2563eb; border-radius:12px; padding:18px 20px; margin:0 0 6px 0; white-space:pre-wrap; color:#334155; font-size:14px; line-height:1.7;">${escapeHtml(body)}</div>
      <p style="margin:14px 0 0 0; font-size:13px; color:#94a3b8; line-height:1.6;">Candidature envoyée par <strong>${escapeHtml(candidateName)}</strong></p>
    `
    const html = brandLayout({
      title: 'Nouvelle candidature reçue',
      content,
      footerText: 'Candidature envoyée via EasyJob — Votre carrière au Maroc',
    })
    const emailResult = await sendEmail({ to, subject, html, attachments })

    if (!emailResult.success) {
      return res.status(500).json({ error: 'Erreur lors de l\'envoi de l\'email', details: emailResult.error })
    }

    app.status = 'envoyee'
    app.appliedAt = new Date()
    app.email = {
      to,
      subject,
      body,
      attachCv: !!attachCv,
      messageId: emailResult.messageId,
      sentAt: new Date(),
    }
    if (!app.statusHistory) app.statusHistory = []
    app.statusHistory.push({ status: 'envoyee', changedAt: new Date(), changedBy: 'candidat', note: 'Candidature envoyée' })
    await app.save()

    if (jobOffer) {
      notifyNewApplicationToRecruiter(app, jobOffer)
    }

    res.json({ application: app, message: 'Candidature envoyée avec succès !', messageId: emailResult.messageId })
  } catch (error) {
    console.error('Erreur envoi candidature:', error)
    res.status(500).json({ error: 'Erreur lors de l\'envoi' })
  }
})

// PUT /api/applications/:id
router.put('/:id', protect, async (req, res) => {
  try {
    const updates = req.body
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      { $set: updates },
      { new: true }
    )
    if (!app) return res.status(404).json({ error: 'Candidature non trouvée' })
    res.json({ application: app, message: 'Candidature mise à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// PUT /api/applications/:id/status
router.put('/:id/status', protect, async (req, res) => {
  try {
    const { status } = req.body
    const allowedStatuses = ['brouillon', 'envoyee', 'consulte', 'valide_entretien', 'appel_attente', 'entretien_fait', 'accepte_final', 'refusee']
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ error: 'Statut invalide' })
    }
    const app = await Application.findById(req.params.id)
    if (!app || app.userId.toString() !== req.user._id.toString()) {
      return res.status(404).json({ error: 'Candidature non trouvée' })
    }
    const oldStatus = app.status
    app.status = status
    if (!app.statusHistory) app.statusHistory = []
    app.statusHistory.push({ status, changedAt: new Date(), changedBy: 'candidat', note: `Statut mis à jour: ${status}` })
    await app.save()

    notifyApplicationStatusChange(app, oldStatus, status, 'candidat')

    res.json({ application: app, message: 'Statut mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /api/applications/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    await Application.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    res.json({ message: 'Candidature supprimée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
