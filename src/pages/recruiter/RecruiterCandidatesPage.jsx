import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Users, MapPin, Briefcase, Search, Loader2,
  FileText, Download, Eye, X, ChevronRight, Star, Mail, Building2,
  BriefcaseBusiness, GraduationCap as GradCap, Award, Send,
  Crown, TrendingUp, Target, Zap, Sparkles, BarChart3, MessageSquareQuote,
} from 'lucide-react'
import { useRecruiterCandidates, useRecruiterSendEmail } from '@/api/hooks'
import api from '@/api/axios'
import { toast } from 'sonner'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const statusLabels = {
  actively_looking: 'En recherche active',
  open_to_offers: 'Ouvert aux offres',
  urgent: 'Recherche urgente',
  seeking_internship: 'Recherche stage',
}

const contractLabels = {
  cdi: 'CDI',
  cdd: 'CDD',
  stage: 'Stage',
  alternance: 'Alternance',
  freelance: 'Freelance',
  temoinage: 'Temoinage',
  full_time: 'Temps plein',
  part_time: 'Temps partiel',
  internship: 'Stage',
}

const statusColors = {
  actively_looking: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  open_to_offers: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  urgent: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  seeking_internship: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
}

const rankLabels = ['1er', '2ème', '3ème']

function ScoreBar({ label, value, color, icon: Icon }) {
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <span className="text-xs font-medium text-surface-600 dark:text-surface-400 flex items-center gap-1">
          <Icon className="w-3 h-3" />
          {label}
        </span>
        <span className="text-xs font-bold text-surface-700 dark:text-surface-300">{value}/100</span>
      </div>
      <div className="h-2 rounded-full bg-surface-200 dark:bg-surface-700 overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className={`h-full rounded-full ${color}`}
        />
      </div>
    </div>
  )
}

function TopCandidateCard({ candidate, rank, onOpenDetail }) {
  const user = candidate.userId
  if (!user) return null
  const scores = candidate.scores || {}

  return (
    <motion.div
      variants={item}
      onClick={() => onOpenDetail(candidate)}
      className="relative rounded-2xl border-2 border-amber-300 dark:border-amber-600 bg-gradient-to-br from-amber-50 via-white to-orange-50 dark:from-amber-900/20 dark:via-surface-800 dark:to-orange-900/10 p-5 shadow-md hover:shadow-lg hover:shadow-amber-200/50 dark:hover:shadow-amber-900/30 transition-all cursor-pointer group overflow-hidden"
    >
      <div className="absolute top-3 right-3">
        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold shadow-md">
          <Crown className="w-3 h-3" />
          {rankLabels[rank - 1] || `${rank}ème`}
        </span>
      </div>

      <div className="flex items-start gap-4">
        <div className="relative">
          <div className="w-14 h-14 bg-gradient-to-br from-amber-200 to-orange-200 dark:from-amber-800/40 dark:to-orange-800/40 rounded-full flex items-center justify-center flex-shrink-0 ring-2 ring-amber-400 dark:ring-amber-500 ring-offset-2 ring-offset-white dark:ring-offset-surface-800">
            <span className="text-lg font-bold text-amber-700 dark:text-amber-300">
              {user.firstName?.[0]}{user.lastName?.[0]}
            </span>
          </div>
          {scores.totalScore && (
            <div className="absolute -bottom-1 -right-1 w-7 h-7 bg-gradient-to-br from-amber-400 to-orange-500 rounded-full flex items-center justify-center border-2 border-white dark:border-surface-800 shadow-sm">
              <span className="text-[9px] font-black text-white">{scores.totalScore}</span>
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-bold text-surface-800 dark:text-white group-hover:text-amber-600 dark:group-hover:text-amber-400 transition-colors flex items-center gap-2">
            {user.firstName} {user.lastName}
            <Star className="w-4 h-4 text-amber-400 fill-amber-400 flex-shrink-0" />
          </h3>
          <p className="text-sm text-surface-500 truncate">{user.email}</p>
          {user.jobSearchStatus && user.jobSearchStatus !== 'none' && (
            <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[user.jobSearchStatus] || ''}`}>
              {statusLabels[user.jobSearchStatus] || user.jobSearchStatus}
            </span>
          )}
        </div>
        <ChevronRight className="w-5 h-5 text-amber-400 group-hover:text-amber-600 transition-colors flex-shrink-0 mt-1" />
      </div>

      <div className="mt-3 space-y-1.5">
        {candidate.title && (
          <div className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-200">
            <BriefcaseBusiness className="w-4 h-4 text-amber-500" /> {candidate.title}
          </div>
        )}
        {candidate.location?.city && (
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <MapPin className="w-4 h-4" /> {candidate.location.city}, {candidate.location.country || 'Maroc'}
          </div>
        )}
        {candidate.domains?.length > 0 && (
          <div className="flex items-center gap-2 text-sm text-surface-500">
            <Briefcase className="w-4 h-4" /> {candidate.domains.join(', ')}
          </div>
        )}
      </div>

      {candidate.skills?.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {candidate.skills.slice(0, 6).map((skill, i) => (
            <span key={i} className="px-2 py-0.5 text-xs bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded-full font-medium border border-amber-200 dark:border-amber-700/50">
              {skill}
            </span>
          ))}
          {candidate.skills.length > 6 && (
            <span className="px-2 py-0.5 text-xs text-surface-400">+{candidate.skills.length - 6}</span>
          )}
        </div>
      )}

      {scores.cvScore !== undefined && (
        <div className="mt-4 space-y-2 bg-white/60 dark:bg-surface-800/60 rounded-xl p-3 border border-amber-100 dark:border-amber-800/30">
          <ScoreBar label="Qualité CV" value={scores.cvScore} icon={FileText} color="bg-gradient-to-r from-amber-400 to-orange-400" />
          <ScoreBar label="Profil" value={scores.profileScore} icon={Target} color="bg-gradient-to-r from-amber-400 to-yellow-400" />
          <ScoreBar label="Compétences" value={scores.skillsScore} icon={Zap} color="bg-gradient-to-r from-orange-400 to-amber-400" />
        </div>
      )}

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        {candidate.cv ? (
          <span className="inline-flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-300 bg-amber-100 dark:bg-amber-900/30 px-2 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            CV disponible
            {scores.cvScore > 0 && (
              <span className="ml-1 text-[10px] font-bold">({scores.cvScore}/100)</span>
            )}
          </span>
        ) : (
          <span className="inline-flex items-center gap-1 text-xs text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full">
            <FileText className="w-3 h-3" />
            Pas de CV
          </span>
        )}
      </div>
    </motion.div>
  )
}

export default function RecruiterCandidatesPage() {
  const [filters, setFilters] = useState({})
  const [domainFilter, setDomainFilter] = useState('')
  const [searchFilter, setSearchFilter] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState(null)
  const [cvPreview, setCvPreview] = useState(null)
  const [loadingPreview, setLoadingPreview] = useState(false)
  const [emailModal, setEmailModal] = useState(null)
  const [emailSubject, setEmailSubject] = useState('')
  const [emailMessage, setEmailMessage] = useState('')
  const [sendingEmail, setSendingEmail] = useState(false)
  const sendEmailMutation = useRecruiterSendEmail()
  const { data, isLoading } = useRecruiterCandidates(filters)

  const topCandidates = data?.topCandidates || []
  const candidates = data?.candidates || []

  const applyFilters = () => {
    const newFilters = {}
    if (domainFilter) newFilters.domain = domainFilter
    if (searchFilter) newFilters.search = searchFilter
    setFilters(newFilters)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') applyFilters()
  }

  const handlePreviewCV = async (userId, e) => {
    e.stopPropagation()
    setLoadingPreview(true)
    try {
      const { data } = await api.get(`/recruiter-space/candidates/${userId}/cv/preview`)
      setCvPreview(data)
    } catch {
      toast.error('CV non disponible')
    } finally {
      setLoadingPreview(false)
    }
  }

  const handleDownloadCV = async (userId, e) => {
    e.stopPropagation()
    try {
      const response = await api.get(`/recruiter-space/candidates/${userId}/cv/download`, { responseType: 'blob' })
      const blob = new Blob([response.data], { type: 'application/pdf' })
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `cv_candidat.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
      toast.success('CV téléchargé !')
    } catch {
      toast.error('Erreur lors du téléchargement')
    }
  }

  const openDetail = (candidate) => {
    setSelectedCandidate(candidate)
  }

  const handleSendEmail = async () => {
    if (!emailSubject.trim() || !emailMessage.trim()) {
      toast.error('Veuillez remplir le sujet et le message')
      return
    }
    setSendingEmail(true)
    try {
      await sendEmailMutation.mutateAsync({
        userId: emailModal._id,
        subject: emailSubject,
        message: emailMessage,
      })
      toast.success('Email envoyé avec succès !')
      setEmailModal(null)
      setEmailSubject('')
      setEmailMessage('')
    } catch (err) {
      toast.error(err?.response?.data?.error || 'Erreur lors de l\'envoi')
    } finally {
      setSendingEmail(false)
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
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-surface-800 dark:text-white">Candidats</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Trouvez les meilleurs talents pour vos offres</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex flex-wrap gap-3 items-end">
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Rechercher</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400" />
            <input
              type="text"
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Nom, email..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
            />
          </div>
        </div>
        <div className="flex-1 min-w-[200px]">
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1">Domaine</label>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="w-full px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-800 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm"
          >
            <option value="">Tous les domaines</option>
            <option value="Informatique">Informatique</option>
            <option value="Industrie">Industrie</option>
            <option value="Génie Civil">Génie Civil</option>
            <option value="Finance">Finance</option>
            <option value="Marketing">Marketing</option>
            <option value="Santé">Santé</option>
            <option value="Éducation">Éducation</option>
            <option value="BTP">BTP</option>
          </select>
        </div>
        <button
          onClick={applyFilters}
          className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white font-medium rounded-xl transition flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          Filtrer
        </button>
      </motion.div>

      <motion.div variants={item} className="text-sm text-surface-500">
        {data?.total || candidates.length} candidat{(data?.total || candidates.length) !== 1 ? 's' : ''} trouvé{(data?.total || candidates.length) !== 1 ? 's' : ''}
      </motion.div>

      {/* Top Candidats Suggérés */}
      {topCandidates.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-gradient-to-br from-amber-400 to-orange-400 rounded-lg">
              <Sparkles className="w-4 h-4 text-white" />
            </div>
            <h2 className="text-lg font-bold text-surface-800 dark:text-white">Top Candidats Suggérés</h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 rounded-full">
              {topCandidates.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topCandidates.map((c, i) => (
              <TopCandidateCard key={c._id || i} candidate={c} rank={i + 1} onOpenDetail={openDetail} />
            ))}
          </div>
        </motion.div>
      )}

      {/* Autres Candidats */}
      {candidates.length > 0 && (
        <motion.div variants={item}>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <Users className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            </div>
            <h2 className="text-lg font-bold text-surface-800 dark:text-white">Autres Candidats</h2>
            <span className="px-2 py-0.5 text-xs font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full">
              {candidates.length}
            </span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {candidates.map((c) => {
              const user = c.userId
              if (!user) return null
              const scores = c.scores || {}
              return (
                <div
                  key={c._id}
                  onClick={() => openDetail(c)}
                  className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 shadow-sm hover:shadow-md hover:border-emerald-300 dark:hover:border-emerald-600 transition-all cursor-pointer group"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-lg font-bold text-emerald-600">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-surface-800 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors">
                        {user.firstName} {user.lastName}
                      </h3>
                      <p className="text-sm text-surface-500 truncate">{user.email}</p>
                      {user.jobSearchStatus && user.jobSearchStatus !== 'none' && (
                        <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[user.jobSearchStatus] || ''}`}>
                          {statusLabels[user.jobSearchStatus] || user.jobSearchStatus}
                        </span>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-surface-300 group-hover:text-emerald-500 transition-colors flex-shrink-0 mt-1" />
                  </div>

                  <div className="mt-4 space-y-2">
                    {c.title && (
                      <div className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-200">
                        <BriefcaseBusiness className="w-4 h-4 text-emerald-500" /> {c.title}
                      </div>
                    )}
                    {c.location?.city && (
                      <div className="flex items-center gap-2 text-sm text-surface-500">
                        <MapPin className="w-4 h-4" /> {c.location.city}, {c.location.country || 'Maroc'}
                      </div>
                    )}
                    {c.domains?.length > 0 && (
                      <div className="flex items-center gap-2 text-sm text-surface-500">
                        <Briefcase className="w-4 h-4" /> {c.domains.join(', ')}
                      </div>
                    )}
                  </div>

                  {c.skills?.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-1.5">
                      {c.skills.slice(0, 6).map((skill, i) => (
                        <span key={i} className="px-2 py-0.5 text-xs bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">
                          {skill}
                        </span>
                      ))}
                      {c.skills.length > 6 && (
                        <span className="px-2 py-0.5 text-xs text-surface-400">+{c.skills.length - 6}</span>
                      )}
                    </div>
                  )}

                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    {c.cv ? (
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-full">
                        <FileText className="w-3 h-3" />
                        CV disponible
                        {scores.cvScore > 0 && (
                          <span className="ml-1 text-[10px] font-bold">({scores.cvScore}/100)</span>
                        )}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-xs text-surface-400 bg-surface-100 dark:bg-surface-700 px-2 py-1 rounded-full">
                        <FileText className="w-3 h-3" />
                        Pas de CV
                      </span>
                    )}
                    {c.cv && (
                      <div className="flex items-center gap-1 ml-auto">
                        <button
                          onClick={(e) => handlePreviewCV(user._id, e)}
                          disabled={loadingPreview}
                          className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          title="Visualiser le CV"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => handleDownloadCV(user._id, e)}
                          className="p-1.5 rounded-lg text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 transition-colors"
                          title="Télécharger le CV"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </motion.div>
      )}

      {/* Empty state */}
      {candidates.length === 0 && topCandidates.length === 0 && (
        <motion.div variants={item} className="text-center py-12 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
          <Users className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">Aucun candidat trouvé avec ces critères</p>
        </motion.div>
      )}

      {/* CV Preview Modal */}
      <AnimatePresence>
        {cvPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setCvPreview(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-3xl max-h-[90vh] bg-white dark:bg-surface-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-5 py-3 border-b border-surface-200 dark:border-surface-700">
                <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-emerald-500" />
                  {cvPreview.originalName || 'CV du candidat'}
                </h3>
                <button onClick={() => setCvPreview(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-5">
                {cvPreview.fileData ? (
                  <iframe
                    src={cvPreview.fileData.startsWith('data:') ? cvPreview.fileData : `data:application/pdf;base64,${cvPreview.fileData}`}
                    className="w-full h-[70vh] rounded-lg border border-surface-200 dark:border-surface-600"
                    title="CV Preview"
                  />
                ) : (
                  <p className="text-surface-500 text-center py-8">CV non disponible en prévisualisation</p>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Candidate Detail Modal */}
      <AnimatePresence>
        {selectedCandidate && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setSelectedCandidate(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl max-h-[90vh] bg-white dark:bg-surface-800 rounded-2xl shadow-xl overflow-hidden flex flex-col"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                <h3 className="font-semibold text-surface-900 dark:text-white">Profil du candidat</h3>
                <button onClick={() => setSelectedCandidate(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>
              <div className="flex-1 overflow-auto p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start gap-4">
                  <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                    <span className="text-xl font-bold text-emerald-600">
                      {selectedCandidate.userId?.firstName?.[0]}{selectedCandidate.userId?.lastName?.[0]}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h4 className="text-xl font-bold text-surface-900 dark:text-white">
                      {selectedCandidate.userId?.firstName} {selectedCandidate.userId?.lastName}
                    </h4>
                    <p className="text-surface-500">{selectedCandidate.userId?.email}</p>
                    {selectedCandidate.userId?.jobSearchStatus && (
                      <span className={`inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium ${statusColors[selectedCandidate.userId.jobSearchStatus] || ''}`}>
                        {statusLabels[selectedCandidate.userId.jobSearchStatus] || selectedCandidate.userId.jobSearchStatus}
                      </span>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-2 flex-shrink-0">
                    <button
                      onClick={() => {
                        setEmailModal(selectedCandidate.userId)
                        setEmailSubject('')
                        setEmailMessage('')
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
                    >
                      <Mail className="w-4 h-4" /> Contacter
                    </button>
                    {selectedCandidate.cv && (
                      <>
                        <button
                          onClick={() => {
                            const userId = selectedCandidate.userId?._id
                            if (userId) {
                              api.get(`/recruiter-space/candidates/${userId}/cv/preview`).then(({ data }) => setCvPreview(data))
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl hover:bg-emerald-100 dark:hover:bg-emerald-900/30 transition-colors"
                        >
                          <Eye className="w-4 h-4" /> Voir CV
                        </button>
                        <button
                          onClick={() => {
                            const userId = selectedCandidate.userId?._id
                            if (userId) {
                              api.get(`/recruiter-space/candidates/${userId}/cv/download`, { responseType: 'blob' }).then((response) => {
                                const blob = new Blob([response.data], { type: 'application/pdf' })
                                const url = window.URL.createObjectURL(blob)
                                const link = document.createElement('a')
                                link.href = url
                                link.download = 'cv_candidat.pdf'
                                document.body.appendChild(link)
                                link.click()
                                document.body.removeChild(link)
                                window.URL.revokeObjectURL(url)
                                toast.success('CV téléchargé !')
                              })
                            }
                          }}
                          className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors"
                        >
                          <Download className="w-4 h-4" /> Télécharger
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Évaluation du Candidat */}
                {selectedCandidate.scores && (
                  <div className="rounded-2xl border border-amber-200 dark:border-amber-700/40 bg-gradient-to-br from-amber-50 to-orange-50 dark:from-amber-900/15 dark:to-orange-900/10 overflow-hidden">
                    <div className="px-5 py-3 bg-amber-100/60 dark:bg-amber-900/20 border-b border-amber-200 dark:border-amber-800/40 flex items-center gap-2">
                      <BarChart3 className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                      <h5 className="text-sm font-bold text-amber-700 dark:text-amber-300 uppercase tracking-wide">Évaluation du Candidat</h5>
                      {selectedCandidate.scores.totalScore && (
                        <span className="ml-auto inline-flex items-center gap-1 text-sm font-black text-amber-700 dark:text-amber-300 bg-amber-200 dark:bg-amber-800/40 px-2.5 py-0.5 rounded-full">
                          <TrendingUp className="w-3.5 h-3.5" />
                          {selectedCandidate.scores.totalScore}/100
                        </span>
                      )}
                    </div>
                    <div className="p-5 space-y-3">
                      <ScoreBar
                        label="Qualité CV"
                        value={selectedCandidate.scores.cvScore || 0}
                        icon={FileText}
                        color="bg-gradient-to-r from-amber-400 to-orange-400"
                      />
                      <ScoreBar
                        label="Complétude Profil"
                        value={selectedCandidate.scores.profileScore || 0}
                        icon={Target}
                        color="bg-gradient-to-r from-amber-400 to-yellow-400"
                      />
                      <ScoreBar
                        label="Diversité Compétences"
                        value={selectedCandidate.scores.skillsScore || 0}
                        icon={Zap}
                        color="bg-gradient-to-r from-orange-400 to-amber-400"
                      />
                    </div>
                  </div>
                )}

                {/* Presentation / Candidate Summary */}
                {selectedCandidate.cv?.candidateSummary && (
                  <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <MessageSquareQuote className="w-4 h-4 text-emerald-500" />
                      <h5 className="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wide">Présentation</h5>
                    </div>
                    <div className="relative pl-4 border-l-3 border-emerald-400 dark:border-emerald-500">
                      <p className="text-sm text-surface-700 dark:text-surface-300 leading-relaxed italic">
                        {selectedCandidate.cv.candidateSummary}
                      </p>
                    </div>
                  </div>
                )}

                {/* Info */}
                {selectedCandidate.title && (
                  <div className="flex items-center gap-2 text-sm font-medium text-surface-700 dark:text-surface-200">
                    <BriefcaseBusiness className="w-4 h-4 text-emerald-500" /> {selectedCandidate.title}
                  </div>
                )}
                {selectedCandidate.location?.city && (
                  <div className="flex items-center gap-2 text-sm text-surface-600 dark:text-surface-300">
                    <MapPin className="w-4 h-4" /> {selectedCandidate.location.city}, {selectedCandidate.location.country || 'Maroc'}
                    {selectedCandidate.location.isRemoteOpen && (
                      <span className="px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400 rounded-full font-medium">Remote</span>
                    )}
                  </div>
                )}

                {/* Mots-clés Techniques */}
                {selectedCandidate.cv?.keywords?.length > 0 && (
                  <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900/50 p-5">
                    <div className="flex items-center gap-2 mb-3">
                      <Zap className="w-4 h-4 text-emerald-500" />
                      <h5 className="text-sm font-bold text-surface-700 dark:text-surface-300 uppercase tracking-wide">Mots-clés Techniques</h5>
                      <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-900/30 rounded-full">
                        {selectedCandidate.cv.keywords.length}
                      </span>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.cv.keywords.map((kw, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-full border border-emerald-200 dark:border-emerald-800">
                          {kw}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Contrats souhaités */}
                {selectedCandidate.jobTypes?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                      <FileText className="w-4 h-4 text-blue-500" /> Types de contrat
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.jobTypes.map((jt, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full">{contractLabels[jt] || jt}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Languages */}
                {selectedCandidate.languages?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-purple-500" /> Langues
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.languages.map((l, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-medium bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full">{l.language} — {l.level}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Domains */}
                {selectedCandidate.domains?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                      <BriefcaseBusiness className="w-4 h-4 text-emerald-500" /> Domaines
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.domains.map((d, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-full">{d}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Skills */}
                {selectedCandidate.skills?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                      <Award className="w-4 h-4 text-emerald-500" /> Compétences
                    </h5>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedCandidate.skills.map((s, i) => (
                        <span key={i} className="px-2.5 py-1 text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-700 dark:text-surface-300 rounded-full">{s}</span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Experience */}
                {selectedCandidate.experience?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                      <Building2 className="w-4 h-4 text-emerald-500" /> Expériences
                    </h5>
                    <div className="space-y-3">
                      {selectedCandidate.experience.map((exp, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600">
                          <p className="font-medium text-surface-900 dark:text-white text-sm">{exp.position}</p>
                          <p className="text-xs text-surface-500">{exp.company} {exp.startDate ? `· ${new Date(exp.startDate).getFullYear()} - ${exp.endDate ? new Date(exp.endDate).getFullYear() : 'Présent'}` : ''}</p>
                          {exp.description && <p className="text-xs text-surface-500 mt-1">{exp.description}</p>}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Education */}
                {selectedCandidate.education?.length > 0 && (
                  <div>
                    <h5 className="text-sm font-semibold text-surface-700 dark:text-surface-300 mb-2 flex items-center gap-2">
                      <GradCap className="w-4 h-4 text-emerald-500" /> Formations
                    </h5>
                    <div className="space-y-2">
                      {selectedCandidate.education.map((edu, i) => (
                        <div key={i} className="p-3 rounded-xl bg-surface-50 dark:bg-surface-700/50 border border-surface-200 dark:border-surface-600">
                          <p className="font-medium text-surface-900 dark:text-white text-sm">{edu.degree}</p>
                          <p className="text-xs text-surface-500">{edu.institution}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Send Email Modal */}
      <AnimatePresence>
        {emailModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
            onClick={() => setEmailModal(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="w-full max-w-lg bg-white dark:bg-surface-800 rounded-2xl shadow-xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-surface-200 dark:border-surface-700">
                <h3 className="font-semibold text-surface-900 dark:text-white flex items-center gap-2">
                  <Mail className="w-5 h-5 text-emerald-500" />
                  Contacter {emailModal.firstName} {emailModal.lastName}
                </h3>
                <button onClick={() => setEmailModal(null)} className="p-1.5 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                  <X className="w-5 h-5 text-surface-500" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Sujet</label>
                  <input
                    type="text"
                    value={emailSubject}
                    onChange={(e) => setEmailSubject(e.target.value)}
                    placeholder="Ex: Opportunité de poste..."
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-surface-700 dark:text-surface-300">Message</label>
                  <textarea
                    value={emailMessage}
                    onChange={(e) => setEmailMessage(e.target.value)}
                    placeholder="Décrivez votre proposition..."
                    rows={6}
                    className="w-full px-4 py-2.5 rounded-xl border border-surface-300 dark:border-surface-600 bg-surface-50 dark:bg-surface-900 text-surface-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/40 focus:border-emerald-500 transition-all text-sm resize-none"
                  />
                </div>
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEmailModal(null)}
                    className="px-4 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 bg-surface-100 dark:bg-surface-700 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSendEmail}
                    disabled={sendingEmail}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-500 rounded-xl hover:bg-emerald-600 transition-colors disabled:opacity-50"
                  >
                    {sendingEmail ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                    {sendingEmail ? 'Envoi...' : 'Envoyer'}
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
