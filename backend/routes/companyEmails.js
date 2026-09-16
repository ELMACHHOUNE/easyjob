import express from 'express'
import CompanyEmail from '../models/CompanyEmail.js'
import { protect } from '../middlewares/auth.js'
import { notifyNewCompany } from '../services/NotificationService.js'

const router = express.Router()

router.get('/', protect, async (req, res) => {
  try {
    const { search, sector, domain, companyType, companySize, city, page = 1, limit = 30 } = req.query
    const query = { isActive: true }

    if (search) {
      query.$or = [
        { companyName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { sector: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
        { city: { $regex: search, $options: 'i' } },
      ]
    }
    if (sector) query.sector = { $regex: `^${sector}$`, $options: 'i' }
    if (domain) query.domain = { $regex: `^${domain}$`, $options: 'i' }
    if (companyType) query.companyType = companyType
    if (companySize) query.companySize = companySize
    if (city) query.city = { $regex: `^${city}$`, $options: 'i' }

    const skip = (parseInt(page) - 1) * parseInt(limit)
    const [companies, total] = await Promise.all([
      CompanyEmail.find(query).sort({ companyName: 1 }).skip(skip).limit(parseInt(limit)),
      CompanyEmail.countDocuments(query),
    ])

    res.json({
      companies,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
    })
  } catch (error) {
    console.error('Company emails error:', error)
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/filters', protect, async (req, res) => {
  try {
    const [sectors, domains, types, sizes, cities] = await Promise.all([
      CompanyEmail.distinct('sector', { isActive: true }),
      CompanyEmail.distinct('domain', { isActive: true }),
      CompanyEmail.distinct('companyType', { isActive: true }),
      CompanyEmail.distinct('companySize', { isActive: true }),
      CompanyEmail.distinct('city', { isActive: true }),
    ])
    res.json({
      sectors: sectors.filter(Boolean).sort(),
      domains: domains.filter(Boolean).sort(),
      types: types.filter(Boolean).sort(),
      sizes: sizes.filter(Boolean).sort(),
      cities: cities.filter(Boolean).sort(),
    })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.get('/:id', protect, async (req, res) => {
  try {
    const company = await CompanyEmail.findById(req.params.id)
    if (!company) return res.status(404).json({ error: 'Entreprise non trouvée' })
    res.json({ company })
  } catch (error) {
    res.status(500).json({ error: 'Erreur serveur' })
  }
})

router.post('/', protect, async (req, res) => {
  try {
    const existing = await CompanyEmail.findOne({ email: req.body.email })
    if (existing) return res.status(400).json({ error: 'Cet email existe déjà' })
    const company = await CompanyEmail.create(req.body)

    notifyNewCompany(company)

    res.status(201).json({ company, message: 'Entreprise ajoutée' })
  } catch (error) {
    res.status(500).json({ error: "Erreur lors de l'ajout" })
  }
})

router.put('/:id', protect, async (req, res) => {
  try {
    const company = await CompanyEmail.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true })
    if (!company) return res.status(404).json({ error: 'Entreprise non trouvée' })
    res.json({ company, message: 'Entreprise mise à jour' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la mise à jour' })
  }
})

router.delete('/:id', protect, async (req, res) => {
  try {
    const company = await CompanyEmail.findByIdAndDelete(req.params.id)
    if (!company) return res.status(404).json({ error: 'Entreprise non trouvée' })
    res.json({ message: 'Entreprise supprimée' })
  } catch (error) {
    res.status(500).json({ error: 'Erreur lors de la suppression' })
  }
})

export default router
