import express from 'express'
import JobOffer from '../models/JobOffer.js'
import { protect } from '../middlewares/auth.js'

const router = express.Router()

const sampleJobs = [
  {
    title: 'Développeur Full Stack React/Node.js',
    company: 'TechPro Maroc',
    location: 'Casablanca',
    isRemote: true,
    contractType: 'CDI',
    description: 'Nous recherchons un développeur Full Stack expérimenté pour rejoindre notre équipe technique. Vous travaillerez sur des applications web modernes avec React et Node.js.',
    requirements: ['React', 'Node.js', 'MongoDB', 'TypeScript', 'Git'],
    responsibilities: ['Développer des fonctionnalités frontend et backend', 'Participer aux code reviews', 'Contribuer à l\'architecture technique'],
    salary: { min: 15000, max: 25000, currency: 'MAD', period: 'month' },
    sector: 'Technologies',
    domain: 'informatique',
    keywords: ['react', 'node', 'fullstack', 'javascript'],
  },
  {
    title: 'Data Scientist Senior',
    company: 'DataMind Solutions',
    location: 'Rabat',
    isRemote: false,
    contractType: 'CDI',
    description: 'Rejoignez notre équipe Data Science pour développer des modèles prédictifs et des solutions d\'IA innovantes pour nos clients.',
    requirements: ['Python', 'Machine Learning', 'TensorFlow', 'SQL', 'Statistics'],
    responsibilities: ['Concevoir et déployer des modèles ML', 'Analyser des datasets complexes', 'Présenter les résultats aux parties prenantes'],
    salary: { min: 20000, max: 35000, currency: 'MAD', period: 'month' },
    sector: 'Technologies',
    domain: 'informatique',
    keywords: ['data science', 'machine learning', 'python', 'ai'],
  },
  {
    title: 'Chef de Projet Marketing Digital',
    company: 'DigiBoost Agency',
    location: 'Marrakech',
    isRemote: true,
    contractType: 'CDI',
    description: 'Gérez des campagnes marketing digitales pour nos clients internationaux. Vous serez responsable de la stratégie et de l\'exécution.',
    requirements: ['Marketing Digital', 'SEO', 'Google Ads', 'Analytics', 'Gestion de projet'],
    responsibilities: ['Planifier des campagnes marketing', 'Optimiser le ROI des campagnes', 'Coordonner avec les équipes créatives'],
    salary: { min: 12000, max: 20000, currency: 'MAD', period: 'month' },
    sector: 'Marketing',
    domain: 'marketing',
    keywords: ['marketing', 'digital', 'seo', 'publicité'],
  },
  {
    title: 'Ingénieur DevOps',
    company: 'CloudSphere Technologies',
    location: 'Tanger',
    isRemote: true,
    contractType: 'CDI',
    description: 'Maintenez et améliorez notre infrastructure cloud. Vous assurerez la disponibilité et la scalabilité de nos services.',
    requirements: ['Docker', 'Kubernetes', 'AWS', 'CI/CD', 'Linux', 'Terraform'],
    responsibilities: ['Gérer l\'infrastructure cloud', 'Automatiser les déploiements', 'Monitorer la performance des systèmes'],
    salary: { min: 18000, max: 30000, currency: 'MAD', period: 'month' },
    sector: 'Technologies',
    domain: 'informatique',
    keywords: ['devops', 'cloud', 'aws', 'kubernetes'],
  },
  {
    title: 'Comptable Senior',
    company: 'Fiduciaire Atlas',
    location: 'Casablanca',
    isRemote: false,
    contractType: 'CDI',
    description: 'Nous recherchons un comptable expérimenté pour gérer la comptabilité de nos clients entreprises.',
    requirements: ['Comptabilité', 'ERP', 'Excel', 'Droit fiscal', 'Analyse financière'],
    responsibilities: ['Tenue de comptabilité', 'Préparation des bilans', 'Déclarations fiscales'],
    salary: { min: 10000, max: 18000, currency: 'MAD', period: 'month' },
    sector: 'Finance',
    domain: 'finance',
    keywords: ['comptabilité', 'finance', 'fiscal', 'erp'],
  },
  {
    title: 'Community Manager',
    company: 'SocialConnect Maroc',
    location: 'Rabat',
    isRemote: true,
    contractType: 'Stage',
    description: 'Gérez la présence en ligne de nos clients sur les réseaux sociaux. Créez du contenu engageant et analysez les performances.',
    requirements: ['Réseaux sociaux', 'Création de contenu', 'Canva', 'Photoshop', 'Rédaction web'],
    responsibilities: ['Animer les communautés', 'Créer du contenu visuel', 'Analyser les KPIs'],
    salary: { min: 3000, max: 5000, currency: 'MAD', period: 'month' },
    sector: 'Marketing',
    domain: 'marketing',
    keywords: ['community management', 'social media', 'contenu'],
  },
  {
    title: 'Ingénieur Génie Civil',
    company: 'BatiConseil Maroc',
    location: 'Fès',
    isRemote: false,
    contractType: 'CDI',
    description: 'Rejoignez notre bureau d\'études pour concevoir et superviser des projets de construction résidentielle et commerciale.',
    requirements: ['AutoCAD', 'RDM', 'Béton armé', 'Gestion de chantier', 'Métre'],
    responsibilities: ['Conception de plans', 'Suivi de chantier', 'Études techniques'],
    salary: { min: 12000, max: 20000, currency: 'MAD', period: 'month' },
    sector: 'Construction',
    domain: 'genie_civil',
    keywords: ['genie civil', 'construction', 'autocad', 'bureau d\'études'],
  },
  {
    title: 'Assistant RH',
    company: 'HR Plus Services',
    location: 'Casablanca',
    isRemote: false,
    contractType: 'CDI',
    description: 'Supportez l\'équipe RH dans la gestion administrative, le recrutement et la paie. Poste idéal pour débuter en RH.',
    requirements: ['Ressources Humaines', 'Recrutement', 'Paie', 'Excel', 'Droit du travail'],
    responsibilities: ['Gestion administrative du personnel', 'Support au recrutement', 'Préparation de la paie'],
    salary: { min: 8000, max: 12000, currency: 'MAD', period: 'month' },
    sector: 'Ressources Humaines',
    domain: 'rh',
    keywords: ['rh', 'ressources humaines', 'recrutement', 'administration'],
  },
]

router.post('/recruiter-jobs', protect, async (req, res) => {
  try {
    let count = 0
    for (const jobData of sampleJobs) {
      const existing = await JobOffer.findOne({ title: jobData.title, company: jobData.company, source: 'recruiter' })
      if (existing) continue

      await JobOffer.create({
        ...jobData,
        source: 'recruiter',
        sourceId: `seed-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        postedBy: req.user._id,
        isActive: true,
      })
      count++
    }

    res.json({ message: `${count} offres recruteur créées`, count })
  } catch (error) {
    console.error('Seed error:', error)
    res.status(500).json({ error: 'Erreur lors du seed' })
  }
})

export default router
