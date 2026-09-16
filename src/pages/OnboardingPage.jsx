import { useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload,
  Briefcase,
  MapPin,
  Search,
  CheckCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  FileText,
  X,
  Building2,
  BriefcaseBusiness,
} from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import { useUploadCV } from '@/api/hooks'
import api from '@/api/axios'

const DOMAINS = [
  'Technologie / IT', 'Finance / Banque', 'Marketing / Communication',
  'Ressources Humaines', 'Ingénierie', 'Santé', 'Éducation',
  'Commerce / Vente', 'Design / Créatif', 'Logistique / Transport',
  'Juridique', 'Agriculture', 'BTP / Construction', 'Tourisme / Hôtellerie',
  'Média / Audiovisuel', 'Environnement', 'Recherche / Science',
]

const JOB_TYPES = ['CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel']

const LOCATIONS = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès',
  'Meknès', 'Agadir', 'Oujda', 'Kénitra', 'Remote',
]

const SUGGESTED_KEYWORDS = {
  'Technologie / IT': ['React', 'Node.js', 'Python', 'Java', 'DevOps', 'Data Science', 'Cybersécurité', 'Full Stack', 'Frontend', 'Backend', 'Mobile', 'Cloud', 'IA', 'Machine Learning'],
  'Finance / Banque': ['Comptabilité', 'Audit', 'Finance', 'Trading', 'Risk Management', 'Excel', 'SAP', 'Contrôle de gestion'],
  'Marketing / Communication': ['SEO', 'SEA', 'Social Media', 'Content Marketing', 'Google Ads', 'Email Marketing', 'Communication', 'Community Management'],
  'Ressources Humaines': ['Recrutement', 'Formation', 'Gestion des talents', 'Paie', 'Droit du travail', 'RH'],
  'Ingénierie': ['Ingénieur', 'CAD', 'AutoCAD', 'Production', 'Qualité', 'Maintenance', 'Lean', 'GPI'],
  'Commerce / Vente': ['Vente B2B', 'Vente B2C', 'Négociation', 'CRM', 'Business Development', 'Key Account'],
  'Design / Créatif': ['UI/UX', 'Figma', 'Photoshop', 'Illustrator', 'Motion Design', 'Web Design', 'Brand Identity'],
}

const INDUSTRIES = [
  'Technologie / IT', 'Finance / Banque', 'Santé', 'Éducation',
  'Industrie / Manufacturing', 'Commerce / Distribution', 'BTP / Construction',
  'Transport / Logistique', 'Énergie', 'Télécommunications',
  'Agroalimentaire', 'Automobile', 'Aéronautique', 'Pharmacie',
  'Média / Communication', 'Hôtellerie / Tourisme', 'Immobilier',
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

export default function OnboardingPage() {
  const navigate = useNavigate()
  const { updateProfile, user } = useAuth()
  const uploadMutation = useUploadCV()
  const [step, setStep] = useState(0)

  const isRecruiter = user?.role === 'recruiter'

  const totalSteps = isRecruiter ? 2 : 4

  const [cvFile, setCvFile] = useState(null)
  const [domains, setDomains] = useState([])
  const [keywords, setKeywords] = useState([])
  const [keywordInput, setKeywordInput] = useState('')
  const [jobTypes, setJobTypes] = useState([])
  const [locations, setLocations] = useState([])
  const [isDragging, setIsDragging] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const [companyName, setCompanyName] = useState('')
  const [industry, setIndustry] = useState('')
  const [companySize, setCompanySize] = useState('11-50')
  const [companyLocation, setCompanyLocation] = useState('')
  const [companyWebsite, setCompanyWebsite] = useState('')
  const [companyDescription, setCompanyDescription] = useState('')
  const [position, setPosition] = useState('')
  const [hiringDomains, setHiringDomains] = useState([])

  const handleFile = useCallback((file) => {
    if (!file || file.type !== 'application/pdf') {
      toast.error('Veuillez sélectionner un fichier PDF.')
      return
    }
    setCvFile(file)
    toast.success('CV sélectionné !')
  }, [])

  const handleDrop = useCallback((e) => {
    e.preventDefault()
    setIsDragging(false)
    handleFile(e.dataTransfer.files[0])
  }, [handleFile])

  const toggleDomain = (d) => setDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])
  const toggleJobType = (t) => setJobTypes(prev => prev.includes(t) ? prev.filter(x => x !== t) : [...prev, t])
  const toggleLocation = (l) => setLocations(prev => prev.includes(l) ? prev.filter(x => x !== l) : [...prev, l])
  const addKeyword = (kw) => { if (kw && !keywords.includes(kw)) { setKeywords(prev => [...prev, kw]); setKeywordInput('') } }
  const removeKeyword = (kw) => setKeywords(prev => prev.filter(x => x !== kw))
  const toggleHiringDomain = (d) => setHiringDomains(prev => prev.includes(d) ? prev.filter(x => x !== d) : [...prev, d])

  const handleSubmit = async () => {
    setSubmitting(true)
    try {
      if (isRecruiter) {
        await api.put('/recruiter-space/profile', {
          companyName,
          industry,
          companySize,
          companyLocation,
          companyWebsite,
          companyDescription,
          position,
          hiringDomains,
        })
        await updateProfile({ onboardingCompleted: true })
        toast.success('Espace recruteur configuré ! Bienvenue 🎉')
        navigate('/recruiter-space/dashboard')
      } else {
        if (cvFile) {
          const formData = new FormData()
          formData.append('cv', cvFile)
          await uploadMutation.mutateAsync(formData)
        }
        await api.post('/profile/onboarding', {
          domains: JSON.stringify(domains),
          searchKeywords: JSON.stringify(keywords),
          jobTypes: JSON.stringify(jobTypes),
          preferredLocations: JSON.stringify(locations),
        })
        await updateProfile({ onboardingCompleted: true })
        toast.success('Profil configuré ! Bienvenue sur EasyJob 🎉')
        navigate('/jobs')
      }
    } catch (err) {
      toast.error(err?.response?.data?.error || err?.message || 'Erreur lors de la configuration')
    } finally {
      setSubmitting(false)
    }
  }

  const canNext = () => {
    if (isRecruiter) {
      if (step === 0) return companyName.trim().length > 0 && industry.length > 0
      if (step === 1) return hiringDomains.length > 0
      return true
    }
    if (step === 0) return true
    if (step === 1) return domains.length > 0
    if (step === 2) return keywords.length > 0
    if (step === 3) return jobTypes.length > 0
    return true
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-secondary-50 dark:from-surface-950 dark:via-surface-900 dark:to-surface-950">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-3">
            {Array.from({ length: totalSteps }).map((_, i) => (
              <div key={i} className="flex items-center">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold transition-all ${
                  i <= step
                    ? isRecruiter
                      ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30'
                      : 'bg-primary-500 text-white shadow-lg shadow-primary-500/30'
                    : 'bg-surface-200 text-surface-500 dark:bg-surface-700 dark:text-surface-400'
                }`}>
                  {i < step ? <CheckCircle className="h-5 w-5" /> : i + 1}
                </div>
                {i < totalSteps - 1 && (
                  <div className={`h-1 w-12 sm:w-20 mx-2 rounded-full transition-all ${
                    i < step ? (isRecruiter ? 'bg-emerald-500' : 'bg-primary-500') : 'bg-surface-200 dark:bg-surface-700'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <p className="text-sm text-center text-surface-500 dark:text-surface-400">
            Étape {step + 1} sur {totalSteps}
          </p>
        </div>

        {/* Steps */}
        <AnimatePresence mode="wait">
          <motion.div
            key={`${isRecruiter}-${step}`}
            initial={{ opacity: 0, x: 50 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -50 }}
            transition={{ duration: 0.3 }}
          >
            {/* ═══════════ RECRUITER STEPS ═══════════ */}
            {isRecruiter && step === 0 && (
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-sm border border-surface-200 dark:border-surface-700">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <Building2 className="w-8 h-8 text-emerald-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                    Bienvenue {user?.firstName} !
                  </h1>
                  <p className="text-surface-500 dark:text-surface-400 mt-2">
                    Configurons votre espace recruteur
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                        Nom de l'entreprise <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={companyName}
                        onChange={(e) => setCompanyName(e.target.value)}
                        placeholder="Ex: TechCorp Maroc"
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">
                        Secteur d'activité <span className="text-red-500">*</span>
                      </label>
                      <select
                        value={industry}
                        onChange={(e) => setIndustry(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      >
                        <option value="">Sélectionner...</option>
                        {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Taille de l'entreprise</label>
                      <select
                        value={companySize}
                        onChange={(e) => setCompanySize(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      >
                        {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employés</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Localisation</label>
                      <select
                        value={companyLocation}
                        onChange={(e) => setCompanyLocation(e.target.value)}
                        className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                      >
                        <option value="">Sélectionner...</option>
                        {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Site web</label>
                    <input
                      type="url"
                      value={companyWebsite}
                      onChange={(e) => setCompanyWebsite(e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Votre poste</label>
                    <input
                      type="text"
                      value={position}
                      onChange={(e) => setPosition(e.target.value)}
                      placeholder="Ex: Responsable RH, Directeur technique..."
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description de l'entreprise</label>
                    <textarea
                      value={companyDescription}
                      onChange={(e) => setCompanyDescription(e.target.value)}
                      placeholder="Décrivez brièvement votre entreprise..."
                      rows={3}
                      className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm resize-none"
                    />
                  </div>
                </div>
              </div>
            )}

            {isRecruiter && step === 1 && (
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-sm border border-surface-200 dark:border-surface-700">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto mb-4">
                    <BriefcaseBusiness className="w-7 h-7 text-emerald-500" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Domaines de recrutement</h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-1">Dans quels domaines recrutez-vous ?</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DOMAINS.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleHiringDomain(d)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        hiringDomains.includes(d)
                          ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                          : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-emerald-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-surface-400 mt-4">{hiringDomains.length} domaine(s) sélectionné(s)</p>
              </div>
            )}

            {/* ═══════════ CANDIDATE STEPS ═══════════ */}
            {!isRecruiter && step === 0 && (
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-sm border border-surface-200 dark:border-surface-700">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-8 h-8 text-primary-500" />
                  </div>
                  <h1 className="text-2xl font-bold text-surface-900 dark:text-white">
                    Bienvenue {user?.firstName} !
                  </h1>
                  <p className="text-surface-500 dark:text-surface-400 mt-2">
                    Configurons votre profil pour trouver les meilleures offres
                  </p>
                </div>

                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => document.getElementById('cv-upload-onboard').click()}
                  className={`border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all ${
                    isDragging
                      ? 'border-primary-500 bg-primary-500/5'
                      : cvFile
                        ? 'border-secondary-300 bg-secondary-50 dark:bg-secondary-500/10'
                        : 'border-surface-300 dark:border-surface-600 hover:border-primary-400'
                  }`}
                >
                  <input id="cv-upload-onboard" type="file" accept=".pdf" onChange={(e) => handleFile(e.target.files[0])} className="hidden" />
                  {cvFile ? (
                    <div className="flex items-center justify-center gap-3">
                      <FileText className="w-8 h-8 text-secondary-500" />
                      <div className="text-left">
                        <p className="font-semibold text-surface-900 dark:text-white">{cvFile.name}</p>
                        <p className="text-sm text-secondary-600 dark:text-secondary-400">CV sélectionné ✓</p>
                      </div>
                    </div>
                  ) : (
                    <>
                      <Upload className="w-10 h-10 text-surface-400 mx-auto mb-3" />
                      <p className="font-semibold text-surface-700 dark:text-surface-300">Glissez votre CV ici</p>
                      <p className="text-sm text-surface-500 mt-1">ou cliquez pour sélectionner (PDF)</p>
                    </>
                  )}
                </div>
                <p className="text-xs text-surface-400 mt-3 text-center">Optionnel — vous pourrez l'ajouter plus tard</p>
              </div>
            )}

            {!isRecruiter && step === 1 && (
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-sm border border-surface-200 dark:border-surface-700">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                    <Briefcase className="w-7 h-7 text-primary-500" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Quels domaines vous intéressent ?</h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-1">Sélectionnez au moins un domaine</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {DOMAINS.map(d => (
                    <button
                      key={d}
                      onClick={() => toggleDomain(d)}
                      className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                        domains.includes(d)
                          ? 'bg-primary-500 text-white border-primary-500 shadow-sm'
                          : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-primary-300'
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-surface-400 mt-4">{domains.length} domaine(s) sélectionné(s)</p>
              </div>
            )}

            {!isRecruiter && step === 2 && (
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-sm border border-surface-200 dark:border-surface-700">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                    <Search className="w-7 h-7 text-primary-500" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Mots-clés de recherche</h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-1">Ajoutez les compétences et technologies recherchées</p>
                </div>

                <div className="flex gap-2 mb-4">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addKeyword(keywordInput.trim()) } }}
                    placeholder="Tapez un mot-clé et appuyez Entrée"
                    className="flex-1 rounded-xl border border-surface-200 dark:border-surface-600 bg-surface-50 dark:bg-surface-700 px-4 py-3 text-sm text-surface-700 dark:text-surface-200 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                  />
                  <button onClick={() => addKeyword(keywordInput.trim())} className="rounded-xl bg-primary-500 px-4 py-3 text-sm font-semibold text-white hover:bg-primary-600 transition-colors">Ajouter</button>
                </div>

                {keywords.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-5">
                    {keywords.map(kw => (
                      <span key={kw} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium bg-primary-500/10 text-primary-600 dark:text-primary-400">
                        {kw}
                        <button onClick={() => removeKeyword(kw)} className="hover:text-red-500"><X className="w-3.5 h-3.5" /></button>
                      </span>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-xs font-medium text-surface-500 mb-2">Suggestions :</p>
                  <div className="flex flex-wrap gap-1.5">
                    {Object.values(SUGGESTED_KEYWORDS).flat().filter(kw => !keywords.includes(kw)).slice(0, 15).map(kw => (
                      <button
                        key={kw}
                        onClick={() => addKeyword(kw)}
                        className="px-3 py-1.5 rounded-lg text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 hover:text-primary-600 transition-colors"
                      >
                        + {kw}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {!isRecruiter && step === 3 && (
              <div className="bg-white dark:bg-surface-800 rounded-2xl p-8 shadow-sm border border-surface-200 dark:border-surface-700">
                <div className="text-center mb-6">
                  <div className="w-14 h-14 rounded-2xl bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center mx-auto mb-4">
                    <MapPin className="w-7 h-7 text-primary-500" />
                  </div>
                  <h2 className="text-xl font-bold text-surface-900 dark:text-white">Type de contrat & Localisation</h2>
                  <p className="text-surface-500 dark:text-surface-400 mt-1">Personnalisez votre recherche</p>
                </div>

                <div className="mb-6">
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Types de contrat</p>
                  <div className="flex flex-wrap gap-2">
                    {JOB_TYPES.map(t => (
                      <button
                        key={t}
                        onClick={() => toggleJobType(t)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          jobTypes.includes(t)
                            ? 'bg-primary-500 text-white border-primary-500'
                            : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-primary-300'
                        }`}
                      >
                        {t}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <p className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-3">Localisations préférées</p>
                  <div className="flex flex-wrap gap-2">
                    {LOCATIONS.map(l => (
                      <button
                        key={l}
                        onClick={() => toggleLocation(l)}
                        className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                          locations.includes(l)
                            ? 'bg-secondary-500 text-white border-secondary-500'
                            : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-secondary-300'
                        }`}
                      >
                        {l === 'Remote' ? '🌍 ' : ''}{l}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>

        {/* Navigation buttons */}
        <div className="flex items-center justify-between mt-6">
          {step > 0 ? (
            <button
              onClick={() => setStep(s => s - 1)}
              className="inline-flex items-center gap-2 rounded-xl border border-surface-200 dark:border-surface-600 px-5 py-3 text-sm font-medium text-surface-700 dark:text-surface-300 hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour
            </button>
          ) : <div />}

          {step < totalSteps - 1 ? (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setStep(s => s + 1)}
              disabled={!canNext()}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecruiter
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-primary-500 hover:bg-primary-600'
              }`}
            >
              Suivant
              <ArrowRight className="h-4 w-4" />
            </motion.button>
          ) : (
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleSubmit}
              disabled={submitting || !canNext()}
              className={`inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                isRecruiter
                  ? 'bg-emerald-500 hover:bg-emerald-600'
                  : 'bg-secondary-500 hover:bg-secondary-600'
              }`}
            >
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
              {submitting ? 'Configuration...' : 'Terminer'}
            </motion.button>
          )}
        </div>

        {/* Skip */}
        {step === 0 && (
          <div className="text-center mt-4">
            <button
              onClick={() => { updateProfile({ onboardingCompleted: true }); navigate(isRecruiter ? '/recruiter-space/dashboard' : '/jobs') }}
              className="text-sm text-surface-500 hover:text-primary-500 transition-colors"
            >
              Passer cette étape →
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
