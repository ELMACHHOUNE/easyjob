import { useState } from 'react'
import { motion } from 'framer-motion'
import {
  FileText, Loader2, CheckCircle, XCircle, Clock, Eye, ChevronDown,
  Download, Mail, Phone, MapPin, Briefcase, GraduationCap, Languages, User,
} from 'lucide-react'
import { useRecruiterApplications, useUpdateRecruiterApplicationStatus } from '@/api/hooks'
import { toast } from 'sonner'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const statusConfig = {
  envoyee: { label: 'Envoyée', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: FileText },
  consulte: { label: 'Consultée', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400', icon: Eye },
  valide_entretien: { label: 'Validée entretien', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400', icon: CheckCircle },
  appel_attente: { label: 'En attente d\'appel', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400', icon: Clock },
  entretien_fait: { label: 'Entretien fait', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400', icon: CheckCircle },
  accepte_final: { label: 'Accepté', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400', icon: CheckCircle },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: XCircle },
}

function cvDataUrl(candidateInfo) {
  if (!candidateInfo?.cvFileData) return null
  if (candidateInfo.cvFileData.startsWith('data:')) return candidateInfo.cvFileData
  return `data:${candidateInfo.cvMimeType || 'application/pdf'};base64,${candidateInfo.cvFileData}`
}

function MatchBadge({ score }) {
  const s = score ?? 0
  const color = s >= 70 ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400'
    : s >= 40 ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'
    : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
  return (
    <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-bold ${color}`}>
      Match {s}%
    </span>
  )
}

function CandidateSnapshot({ info }) {
  if (!info) return null

  const formatDate = (d) => d ? new Date(d).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' }) : ''

  return (
    <div className="mt-3 rounded-xl border border-surface-100 dark:border-surface-700 bg-surface-50/60 dark:bg-surface-800/60 p-4 space-y-4">
      {/* Contact */}
      <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-surface-600 dark:text-surface-400">
        {info.email && (
          <span className="flex items-center gap-1.5"><Mail className="h-3.5 w-3.5" />{info.email}</span>
        )}
        {info.phone && (
          <span className="flex items-center gap-1.5"><Phone className="h-3.5 w-3.5" />{info.phone}</span>
        )}
        {info.city && (
          <span className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" />{info.city}</span>
        )}
        {info.title && (
          <span className="flex items-center gap-1.5"><Briefcase className="h-3.5 w-3.5" />{info.title}</span>
        )}
        {info.linkedin && (
          <a href={info.linkedin} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">LinkedIn</a>
        )}
        {info.portfolio && (
          <a href={info.portfolio} target="_blank" rel="noopener noreferrer" className="text-primary-500 hover:underline">Portfolio</a>
        )}
      </div>

      {/* Domains */}
      {info.domains?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1.5">Domaines</p>
          <div className="flex flex-wrap gap-1.5">
            {info.domains.map((d, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs">{d}</span>
            ))}
          </div>
        </div>
      )}

      {/* Skills */}
      {info.skills?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1.5">Compétences</p>
          <div className="flex flex-wrap gap-1.5">
            {info.skills.slice(0, 12).map((s, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs">{s}</span>
            ))}
            {info.skills.length > 12 && (
              <span className="px-2 py-0.5 text-xs text-surface-400">+{info.skills.length - 12}</span>
            )}
          </div>
        </div>
      )}

      {/* Experience */}
      {info.experience?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Briefcase className="h-3.5 w-3.5" /> Expérience
          </p>
          <div className="space-y-1.5">
            {info.experience.slice(0, 4).map((e, i) => (
              <p key={i} className="text-xs text-surface-600 dark:text-surface-300">
                <span className="font-medium">{e.position || 'Poste'}</span>
                {e.company && <span className="text-surface-400"> chez {e.company}</span>}
                {(e.startDate || e.endDate) && (
                  <span className="text-surface-400"> · {formatDate(e.startDate)}{e.endDate ? ` - ${formatDate(e.endDate)}` : e.isCurrent ? ' - aujourd\'hui' : ''}</span>
                )}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Education */}
      {info.education?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <GraduationCap className="h-3.5 w-3.5" /> Formation
          </p>
          <div className="space-y-1.5">
            {info.education.slice(0, 3).map((ed, i) => (
              <p key={i} className="text-xs text-surface-600 dark:text-surface-300">
                <span className="font-medium">{ed.degree || 'Diplôme'}</span>
                {ed.institution && <span className="text-surface-400"> · {ed.institution}</span>}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* Languages */}
      {info.languages?.length > 0 && (
        <div>
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <Languages className="h-3.5 w-3.5" /> Langues
          </p>
          <div className="flex flex-wrap gap-1.5">
            {info.languages.map((l, i) => (
              <span key={i} className="px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs">
                {l.language}{l.level ? ` (${l.level})` : ''}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CV Summary */}
      {info.cvSummary && (
        <div>
          <p className="text-xs font-semibold text-surface-500 dark:text-surface-400 uppercase tracking-wide mb-1.5 flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" /> Résumé du candidat
          </p>
          <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">{info.cvSummary}</p>
        </div>
      )}

      {/* CV download */}
      {info.cvFileName && (
        <a
          href={cvDataUrl(info)}
          download={info.cvFileName}
          className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 hover:bg-primary-600 px-3 py-1.5 text-xs font-semibold text-white transition"
        >
          <Download className="h-3.5 w-3.5" /> Télécharger CV ({info.cvFileName})
        </a>
      )}
    </div>
  )
}

export default function RecruiterApplicationsPage() {
  const [statusFilter, setStatusFilter] = useState('')
  const [jobFilter] = useState('')
  const [openAppId, setOpenAppId] = useState(null)
  const updateStatus = useUpdateRecruiterApplicationStatus()
  const { data: appsData, isLoading: appsLoading } = useRecruiterApplications({
    status: statusFilter || undefined,
    jobId: jobFilter || undefined,
  })

  const applications = appsData?.applications || []

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await updateStatus.mutateAsync({ id: appId, status: newStatus })
      toast.success('Statut mis à jour')
    } catch (err) {
      toast.error('Erreur lors de la mise à jour')
    }
  }

  if (appsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item}>
        <h1 className="text-2xl font-bold text-surface-800 dark:text-white">Candidatures reçues</h1>
        <p className="text-surface-500 dark:text-surface-400 mt-1">Gérez les candidatures pour vos offres</p>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex gap-3 flex-wrap">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2.5 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-800 dark:text-white text-sm focus:ring-2 focus:ring-primary-500 outline-none"
        >
          <option value="">Tous les statuts</option>
          {Object.entries(statusConfig).map(([key, val]) => (
            <option key={key} value={key}>{val.label}</option>
          ))}
        </select>
      </motion.div>

      {/* Applications List */}
      {applications.length === 0 ? (
        <motion.div variants={item} className="text-center py-12 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
          <FileText className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">Aucune candidature reçue</p>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-3">
          {applications.map((app) => {
            const candidate = app.userId
            const job = app.jobOfferId
            const info = app.candidateInfo || {}
            const statusInfo = statusConfig[app.status] || { label: app.status, color: 'bg-gray-100 text-gray-600', icon: FileText }
            const isOpen = openAppId === app._id

            return (
              <div key={app._id} className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 shadow-sm hover:shadow-md transition">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3 flex-1">
                    <div className="w-11 h-11 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center flex-shrink-0">
                      <span className="text-sm font-bold text-primary-600">
                        {(info.firstName || candidate?.firstName || '?')[0]}{(info.lastName || candidate?.lastName || '')[0]}
                      </span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-semibold text-surface-800 dark:text-white text-sm">
                          {info.firstName || candidate?.firstName} {info.lastName || candidate?.lastName}
                        </h3>
                        {info.matchScore > 0 && <MatchBadge score={info.matchScore} />}
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>
                          {statusInfo.label}
                        </span>
                      </div>
                      <p className="text-sm text-surface-500 mt-0.5">{info.email || candidate?.email}</p>
                      {job && (
                        <p className="text-xs text-surface-400 mt-1">
                          Postulé pour : <span className="font-medium text-surface-600 dark:text-surface-300">{job.title}</span> - {job.company}
                        </p>
                      )}
                      {app.coverLetter && (
                        <p className="text-sm text-surface-500 mt-2 line-clamp-2 italic">"{app.coverLetter.slice(0, 150)}..."</p>
                      )}
                      <p className="text-xs text-surface-400 mt-2">
                        Postulé le {new Date(app.createdAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  {/* Status Actions */}
                  <div className="flex-shrink-0 flex flex-col items-end gap-2">
                    <div className="relative group">
                      <button className="flex items-center gap-1 px-3 py-2 text-sm border border-surface-200 dark:border-surface-700 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition">
                        Actions <ChevronDown className="w-4 h-4" />
                      </button>
                      <div className="absolute right-0 top-full mt-1 w-52 bg-white dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
                        {Object.entries(statusConfig).map(([key, val]) => (
                          <button
                            key={key}
                            onClick={() => handleStatusChange(app._id, key)}
                            className={`w-full text-left px-4 py-2 text-sm hover:bg-surface-50 dark:hover:bg-surface-700 transition ${
                              app.status === key ? 'font-semibold text-primary-500' : 'text-surface-600 dark:text-surface-400'
                            }`}
                          >
                            {val.label}
                          </button>
                        ))}
                      </div>
                    </div>
                    <button
                      onClick={() => setOpenAppId(isOpen ? null : app._id)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-surface-200 dark:border-surface-700 px-3 py-2 text-sm font-medium text-surface-600 dark:text-surface-400 hover:text-primary-500 transition"
                    >
                      <Eye className="h-4 w-4" />
                      {isOpen ? 'Masquer le profil' : 'Voir le profil'}
                    </button>
                  </div>
                </div>

                {isOpen && <CandidateSnapshot info={info} />}
              </div>
            )
          })}
        </motion.div>
      )}
    </motion.div>
  )
}
