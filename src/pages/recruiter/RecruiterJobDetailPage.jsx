import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft, MapPin, Users, Briefcase, Loader2,
  Trash2, Eye, EyeOff, Calendar, DollarSign, Download, ChevronDown,
} from 'lucide-react'
import { useRecruiterJob, useDeleteRecruiterJob, useToggleRecruiterJob, useUpdateRecruiterApplicationStatus } from '@/api/hooks'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ui/confirm-dialog'

const statusConfig = {
  envoyee: { label: 'Envoyée', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  consulte: { label: 'Consultée', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400' },
  valide_entretien: { label: 'Validée entretien', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  appel_attente: { label: 'En attente d\'appel', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  entretien_fait: { label: 'Entretien fait', color: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400' },
  accepte_final: { label: 'Accepté', color: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
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
    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-bold ${color}`}>Match {s}%</span>
  )
}

export default function RecruiterJobDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [openAppId, setOpenAppId] = useState(null)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const { data, isLoading } = useRecruiterJob(id)
  const deleteJob = useDeleteRecruiterJob()
  const toggleJob = useToggleRecruiterJob()
  const updateAppStatus = useUpdateRecruiterApplicationStatus()

  if (isLoading) {
    return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-primary-500" /></div>
  }

  const job = data?.job
  const applications = data?.applications || []

  if (!job) return <p className="text-center text-surface-500 py-12">Offre non trouvée</p>

  const handleDelete = async () => {
    await deleteJob.mutateAsync(id)
    toast.success('Offre supprimée')
    setDeleteOpen(false)
    navigate('/recruiter-space/jobs')
  }

  const handleStatusChange = async (appId, status) => {
    await updateAppStatus.mutateAsync({ id: appId, status })
    toast.success('Statut mis à jour')
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-white transition">
        <ArrowLeft className="w-5 h-5" /> Retour
      </button>

      {/* Job Info */}
      <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-xl font-bold text-surface-800 dark:text-white">{job.title}</h1>
            <div className="flex items-center gap-4 mt-2 text-sm text-surface-500 flex-wrap">
              <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-4 h-4" /> {job.contractType}</span>
              <span className="flex items-center gap-1"><Users className="w-4 h-4" /> {applications.length} candidatures</span>
              <span className="flex items-center gap-1"><Calendar className="w-4 h-4" /> {new Date(job.createdAt).toLocaleDateString('fr-FR')}</span>
              {job.salary?.min > 0 && (
                <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary.min.toLocaleString()} - {job.salary.max?.toLocaleString()} MAD</span>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={() => toggleJob.mutateAsync(id)} className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 transition" title={job.isActive ? 'Désactiver' : 'Activer'}>
              {job.isActive ? <EyeOff className="w-5 h-5 text-surface-500" /> : <Eye className="w-5 h-5 text-green-500" />}
            </button>
            <button onClick={() => setDeleteOpen(true)} className="p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 transition" title="Supprimer">
              <Trash2 className="w-5 h-5 text-danger-500" />
            </button>
          </div>
        </div>
        {job.description && (
          <p className="mt-4 text-surface-600 dark:text-surface-400 text-sm whitespace-pre-line">{job.description}</p>
        )}
        {job.requirements?.length > 0 && (
          <div className="mt-4">
            <h3 className="font-semibold text-surface-700 dark:text-surface-300 text-sm mb-2">Prérequis</h3>
            <div className="flex flex-wrap gap-2">
              {job.requirements.map((r, i) => (
                <span key={i} className="px-3 py-1 bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 rounded-full text-xs">{r}</span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Matching Candidates */}
      <div className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-800 dark:text-white mb-4">Candidatures ({applications.length})</h2>
        {applications.length === 0 ? (
          <p className="text-surface-500 text-center py-8">Aucune candidature pour le moment</p>
        ) : (
          <div className="space-y-3">
            {applications.map((app) => {
              const candidate = app.userId
              const info = app.candidateInfo || {}
              const isOpen = openAppId === app._id
              const statusInfo = statusConfig[app.status] || { label: app.status, color: 'bg-gray-100 text-gray-600' }
              return (
                <div key={app._id} className="p-4 rounded-xl border border-surface-100 dark:border-surface-700 hover:bg-surface-50 dark:hover:bg-surface-700/50 transition">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 flex-1">
                      <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                        <span className="text-sm font-bold text-primary-600">{(info.firstName || candidate?.firstName || '?')[0]}{(info.lastName || candidate?.lastName || '')[0]}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-medium text-surface-800 dark:text-white text-sm">{info.firstName || candidate?.firstName} {info.lastName || candidate?.lastName}</p>
                          {app.matchScore > 0 && <MatchBadge score={app.matchScore} />}
                          <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusInfo.color}`}>{statusInfo.label}</span>
                        </div>
                        <p className="text-xs text-surface-500">{info.email || candidate?.email}{info.phone ? ` · ${info.phone}` : ''}</p>
                        {info.skills?.length > 0 && (
                          <p className="text-xs text-surface-400 mt-1 line-clamp-1">
                            {info.skills.slice(0, 8).join(' · ')}{info.skills.length > 8 ? ' …' : ''}
                          </p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => setOpenAppId(isOpen ? null : app._id)}
                        className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 hover:text-primary-500 transition"
                      >
                        {isOpen ? 'Masquer' : 'Profil'} <ChevronDown className={`w-3 h-3 transition ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {info.cvFileName && cvDataUrl(info) && (
                        <a
                          href={cvDataUrl(info)}
                          download={info.cvFileName}
                          className="inline-flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg bg-primary-500 text-white hover:bg-primary-600 transition"
                        >
                          <Download className="w-3 h-3" /> CV
                        </a>
                      )}
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className="text-xs px-2 py-1.5 rounded-lg border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800"
                      >
                        {Object.entries(statusConfig).map(([k, v]) => (
                          <option key={k} value={k}>{v.label}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {isOpen && (
                    <div className="mt-3 grid gap-3 sm:grid-cols-2">
                      {info.summary && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Présentation</p>
                          <p className="text-xs text-surface-600 dark:text-surface-300">{info.summary}</p>
                        </div>
                      )}
                      {info.domains?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Domaines</p>
                          <div className="flex flex-wrap gap-1.5">{info.domains.map((d, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 text-xs">{d}</span>)}</div>
                        </div>
                      )}
                      {info.skills?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Compétences</p>
                          <div className="flex flex-wrap gap-1.5">{info.skills.slice(0, 15).map((s, i) => <span key={i} className="px-2 py-0.5 rounded-full bg-surface-100 dark:bg-surface-700 text-surface-600 dark:text-surface-300 text-xs">{s}</span>)}</div>
                        </div>
                      )}
                      {info.experience?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Expérience</p>
                          {info.experience.slice(0, 3).map((e, i) => (
                            <p key={i} className="text-xs text-surface-600 dark:text-surface-300">
                              <span className="font-medium">{e.position || 'Poste'}</span>
                              {e.company && <span className="text-surface-400"> chez {e.company}</span>}
                            </p>
                          ))}
                        </div>
                      )}
                      {info.education?.length > 0 && (
                        <div>
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Formation</p>
                          {info.education.slice(0, 3).map((ed, i) => (
                            <p key={i} className="text-xs text-surface-600 dark:text-surface-300">
                              <span className="font-medium">{ed.degree || 'Diplôme'}</span>
                              {ed.institution && <span className="text-surface-400"> · {ed.institution}</span>}
                            </p>
                          ))}
                        </div>
                      )}
                      {info.cvSummary && (
                        <div className="sm:col-span-2">
                          <p className="text-xs font-semibold text-surface-500 uppercase tracking-wide mb-1">Résumé du candidat</p>
                          <p className="text-xs text-surface-600 dark:text-surface-300 leading-relaxed">{info.cvSummary}</p>
                        </div>
                      )}
                      <div className="sm:col-span-2 flex items-center justify-between">
                        <Link to="/recruiter-space/applications" className="text-xs font-medium text-primary-500 hover:underline">
                          Voir toutes les candidatures →
                        </Link>
                        {info.linkedin && <a href={info.linkedin} target="_blank" rel="noopener noreferrer" className="text-xs font-medium text-primary-500 hover:underline">LinkedIn</a>}
                      </div>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Supprimer cette offre ?"
        description="Cette action est irréversible. L'offre et ses candidatures associées seront définitivement supprimées."
        confirmText="Supprimer"
        onConfirm={handleDelete}
        icon={Trash2}
      />
    </motion.div>
  )
}
