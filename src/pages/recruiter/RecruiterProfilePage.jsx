import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  Building2,
  Save,
  Loader2,
  Globe,
  Users,
  Briefcase,
  Link as LinkIcon,
} from 'lucide-react'
import { toast } from 'sonner'
import { useRecruiterProfile, useUpdateRecruiterProfile, useRecruiterDashboard } from '@/api/hooks'

const INDUSTRIES = [
  'Technologie / IT', 'Finance / Banque', 'Santé', 'Éducation',
  'Industrie / Manufacturing', 'Commerce / Distribution', 'BTP / Construction',
  'Transport / Logistique', 'Énergie', 'Télécommunications',
  'Agroalimentaire', 'Automobile', 'Aéronautique', 'Pharmacie',
  'Média / Communication', 'Hôtellerie / Tourisme', 'Immobilier',
]

const COMPANY_SIZES = ['1-10', '11-50', '51-200', '201-500', '501-1000', '1000+']

const DOMAINS = [
  'Technologie / IT', 'Finance / Banque', 'Marketing / Communication',
  'Ressources Humaines', 'Ingénierie', 'Santé', 'Éducation',
  'Commerce / Vente', 'Design / Créatif', 'Logistique / Transport',
  'Juridique', 'Agriculture', 'BTP / Construction', 'Tourisme / Hôtellerie',
  'Média / Audiovisuel', 'Environnement', 'Recherche / Science',
]

const LOCATIONS = [
  'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès',
  'Meknès', 'Agadir', 'Oujda', 'Kénitra', 'Remote',
]

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function RecruiterProfilePage() {
  const { data: profileData, isLoading } = useRecruiterProfile()
  const { data: dashData } = useRecruiterDashboard()
  const updateProfile = useUpdateRecruiterProfile()
  const [saving, setSaving] = useState(false)

  const profile = profileData?.profile
  const stats = dashData?.stats

  const [form, setForm] = useState({
    companyName: '',
    industry: '',
    companySize: '11-50',
    companyLocation: '',
    companyWebsite: '',
    companyDescription: '',
    position: '',
    linkedinUrl: '',
    hiringDomains: [],
  })

  useEffect(() => {
    if (profile) {
      setForm({
        companyName: profile.companyName || '',
        industry: profile.industry || '',
        companySize: profile.companySize || '11-50',
        companyLocation: profile.companyLocation || '',
        companyWebsite: profile.companyWebsite || '',
        companyDescription: profile.companyDescription || '',
        position: profile.position || '',
        linkedinUrl: profile.linkedinUrl || '',
        hiringDomains: profile.hiringDomains || [],
      })
    }
  }, [profile])

  const update = (key, value) => setForm(prev => ({ ...prev, [key]: value }))

  const toggleHiringDomain = (d) => {
    setForm(prev => ({
      ...prev,
      hiringDomains: prev.hiringDomains.includes(d)
        ? prev.hiringDomains.filter(x => x !== d)
        : [...prev.hiringDomains, d],
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      await updateProfile.mutateAsync(form)
      toast.success('Profil entreprise mis à jour !')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors de la mise à jour')
    } finally {
      setSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-emerald-500" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 pb-24">
      <div className="max-w-3xl mx-auto px-4 py-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <h1 className="text-3xl font-bold text-surface-900 dark:text-white">Mon Espace Entreprise</h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">Gérez les informations de votre entreprise</p>
        </motion.div>

        {/* Stats Cards */}
        {stats && (
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
            {[
              { label: 'Offres publiées', value: stats.totalJobs, color: 'emerald' },
              { label: 'Offres actives', value: stats.activeJobs, color: 'blue' },
              { label: 'Candidatures', value: stats.totalApplications, color: 'purple' },
              { label: 'En attente', value: stats.applicationsByStatus?.envoyee || 0, color: 'amber' },
            ].map((stat) => (
              <div key={stat.label} className="bg-white dark:bg-surface-800 rounded-2xl p-4 shadow-sm border border-surface-200 dark:border-surface-700">
                <p className="text-xs font-medium text-surface-500 dark:text-surface-400">{stat.label}</p>
                <p className="text-2xl font-bold text-surface-900 dark:text-white mt-1">{stat.value}</p>
              </div>
            ))}
          </motion.div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Company Info */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                <Building2 className="w-5 h-5 text-emerald-500" />
              </div>
              <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Informations entreprise</h2>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Nom de l'entreprise *</label>
                  <input
                    type="text"
                    value={form.companyName}
                    onChange={(e) => update('companyName', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Secteur d'activité *</label>
                  <select
                    value={form.industry}
                    onChange={(e) => update('industry', e.target.value)}
                    required
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm appearance-none"
                  >
                    <option value="">Sélectionner...</option>
                    {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Taille</label>
                  <select
                    value={form.companySize}
                    onChange={(e) => update('companySize', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm appearance-none"
                  >
                    {COMPANY_SIZES.map(s => <option key={s} value={s}>{s} employés</option>)}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Localisation</label>
                  <select
                    value={form.companyLocation}
                    onChange={(e) => update('companyLocation', e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm appearance-none"
                  >
                    <option value="">Sélectionner...</option>
                    {LOCATIONS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Site web</label>
                  <div className="relative">
                    <Globe className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="url"
                      value={form.companyWebsite}
                      onChange={(e) => update('companyWebsite', e.target.value)}
                      placeholder="https://www.example.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">LinkedIn</label>
                  <div className="relative">
                    <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                    <input
                      type="url"
                      value={form.linkedinUrl}
                      onChange={(e) => update('linkedinUrl', e.target.value)}
                      placeholder="https://linkedin.com/company/..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Votre poste</label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
                  <input
                    type="text"
                    value={form.position}
                    onChange={(e) => update('position', e.target.value)}
                    placeholder="Directeur RH, CTO, Manager..."
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Description de l'entreprise</label>
                <textarea
                  value={form.companyDescription}
                  onChange={(e) => update('companyDescription', e.target.value)}
                  placeholder="Présentez votre entreprise, sa mission, sa culture..."
                  rows={4}
                  className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm resize-none"
                />
              </div>
            </div>
          </motion.div>

          {/* Hiring Domains */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="bg-white dark:bg-surface-800 rounded-2xl p-6 shadow-sm border border-surface-200 dark:border-surface-700">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 flex items-center justify-center">
                <Users className="w-5 h-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-surface-900 dark:text-white">Domaines de recrutement</h2>
                <p className="text-xs text-surface-500 dark:text-surface-400">Les secteurs dans lesquels vous recrutez</p>
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {DOMAINS.map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => toggleHiringDomain(d)}
                  className={`px-4 py-2.5 rounded-xl text-sm font-medium transition-all border ${
                    form.hiringDomains.includes(d)
                      ? 'bg-emerald-500 text-white border-emerald-500 shadow-sm'
                      : 'bg-white dark:bg-surface-700 text-surface-700 dark:text-surface-300 border-surface-200 dark:border-surface-600 hover:border-emerald-300'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
            <p className="text-xs text-surface-400 mt-3">{form.hiringDomains.length} domaine(s) sélectionné(s)</p>
          </motion.div>

          {/* Save */}
          <motion.div variants={sectionVariants} initial="hidden" animate="visible" className="flex justify-end">
            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </button>
          </motion.div>
        </form>
      </div>
    </div>
  )
}
