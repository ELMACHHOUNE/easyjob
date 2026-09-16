import express from 'express'
import EmailTemplate from '../models/EmailTemplate.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

const DEFAULT_TEMPLATES = [
  {
    name: 'Candidature Standard',
    subject: 'Candidature au poste de {{jobTitle}} chez {{company}}',
    body: 'Madame, Monsieur,\n\nJe me permets de vous adresser ma candidature pour le poste de {{jobTitle}} au sein de {{company}}.\n\nTitulaire d\'un parcours en {{studyField}} et fort de {{experienceYears}} années d\'expérience, je suis convaincu(e) de pouvoir contribuer activement aux objectifs de votre entreprise.\n\nJe reste à votre disposition pour un entretien à votre convenance.\n\nDans cette attente, je vous prie d\'agréer, Madame, Monsieur, l\'expression de mes salutations distinguées.\n\n{{userName}}\n{{applicationDate}}',
    variables: ['jobTitle', 'company', 'studyField', 'experienceYears', 'userName', 'applicationDate'],
    isDefault: true, category: 'Candidature',
  },
  {
    name: 'Relance après candidature',
    subject: 'Relance — Candidature {{jobTitle}}',
    body: 'Madame, Monsieur,\n\nJe me permets de revenir vers vous concernant ma candidature au poste de {{jobTitle}} envoyée le {{applicationDate}}.\n\nMon profil vous a-t-il été présenté ? Je reste très motivé(e) par cette opportunité au sein de {{company}} et me tiens à votre disposition pour tout complément d\'information ou un entretien.\n\nCordialement,\n{{userName}}',
    variables: ['jobTitle', 'applicationDate', 'company', 'userName'],
    isDefault: true, category: 'Relance',
  },
  {
    name: 'Remerciement après entretien',
    subject: 'Remerciement — Entretien {{jobTitle}}',
    body: 'Bonjour {{recruiterName}},\n\nJe tenais à vous remercier pour le temps que vous m\'avez accordé lors de notre entretien pour le poste de {{jobTitle}}.\n\nNotre échange a renforcé mon intérêt pour rejoindre {{company}}. N\'hésitez pas à me solliciter si vous avez besoin de précisions supplémentaires.\n\nDans l\'attente de votre retour,\nCordialement,\n{{userName}}',
    variables: ['recruiterName', 'jobTitle', 'company', 'userName'],
    isDefault: true, category: 'Remerciement',
  },
]

async function ensureDefaultTemplates() {
  try {
    for (const t of DEFAULT_TEMPLATES) {
      await EmailTemplate.updateOne(
        { isDefault: true, name: t.name },
        { $set: { ...t, isDefault: true } },
        { upsert: true }
      )
    }
  } catch (error) {
    console.error('ensureDefaultTemplates error:', error.message)
  }
}

// GET /api/emails/templates
router.get('/templates', protect, async (req, res) => {
  try {
    await ensureDefaultTemplates()
    const templates = await EmailTemplate.find({
      $or: [{ userId: req.user._id }, { isDefault: true }]
    }).sort({ isDefault: -1, name: 1 })
    res.json({ templates })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/emails/templates
router.post('/templates', protect, async (req, res) => {
  try {
    const template = await EmailTemplate.create({ ...req.body, userId: req.user._id })
    res.status(201).json({ template, message: 'Template créé' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la création' })
  }
})

// PUT /api/emails/templates/:id
router.put('/templates/:id', protect, async (req, res) => {
  try {
    const template = await EmailTemplate.findOneAndUpdate(
      { _id: req.params.id, userId: req.user._id },
      req.body,
      { new: true }
    )
    if (!template) return res.status(404).json({ error: 'Template non trouvé' })
    res.json({ template, message: 'Template mis à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// DELETE /api/emails/templates/:id
router.delete('/templates/:id', protect, async (req, res) => {
  try {
    const template = await EmailTemplate.findOneAndDelete({ _id: req.params.id, userId: req.user._id })
    if (!template) return res.status(404).json({ error: 'Template non trouvé' })
    res.json({ message: 'Template supprimé' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

// POST /api/emails/preview
router.post('/preview', protect, async (req, res) => {
  try {
    const { subject, body, variables } = req.body
    let renderedSubject = subject
    let renderedBody = body
    for (const [key, value] of Object.entries(variables || {})) {
      renderedSubject = renderedSubject.replace(new RegExp(`{{${key}}}`, 'g'), value || '')
      renderedBody = renderedBody.replace(new RegExp(`{{${key}}}`, 'g'), value || '')
    }
    res.json({ subject: renderedSubject, body: renderedBody })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

export default router
