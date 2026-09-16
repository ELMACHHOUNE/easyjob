import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  Clock,
  CheckCircle2,
  Inbox,
  Building2,
  AlertTriangle,
  MapPin,
  Briefcase,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { useApplications } from '@/api/hooks'

const statusConfig = {
  brouillon: { label: 'Brouillon', color: 'bg-surface-100 text-surface-600 dark:bg-surface-700 dark:text-surface-400', dot: 'bg-surface-400' },
  envoyee: { label: 'Envoyée', color: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400', dot: 'bg-blue-500' },
  consulte: { label: 'Consultée', color: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-500/15 dark:text-yellow-400', dot: 'bg-yellow-500' },
  valide_entretien: { label: 'Entretien validé', color: 'bg-green-100 text-green-700 dark:bg-green-500/15 dark:text-green-400', dot: 'bg-green-500' },
  appel_attente: { label: 'Appel en attente', color: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400', dot: 'bg-purple-500' },
  entretien_fait: { label: 'Entretien fait', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-500/15 dark:text-indigo-400', dot: 'bg-indigo-500' },
  accepte_final: { label: 'Acceptée', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-400', dot: 'bg-emerald-500' },
  refusee: { label: 'Refusée', color: 'bg-red-100 text-red-700 dark:bg-red-500/15 dark:text-red-400', dot: 'bg-red-500' },
}

const tabs = [
  { key: 'all', label: 'Toutes' },
  { key: 'envoyee', label: 'Envoyées' },
  { key: 'en_cours', label: 'En cours' },
  { key: 'accepte_final', label: 'Acceptées' },
  { key: 'refusee', label: 'Refusées' },
]

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

function Skeleton() {
  return (
    <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-700 dark:bg-surface-800">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-surface-200 dark:bg-surface-700" />
            <div className="h-4 w-24 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
          </div>
          <div className="h-6 w-48 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
          <div className="h-4 w-32 animate-pulse rounded bg-surface-200 dark:bg-surface-700" />
        </div>
      </div>
    </div>
  )
}

export default function InternalApplicationsPage() {
  const [activeTab, setActiveTab] = useState('all')

  const { data, isLoading, error, refetch } = useApplications({ limit: 100 })
  const applications = useMemo(() => data?.applications ?? [], [data])

  const internalApps = useMemo(() => {
    return applications.filter(a => a.jobOfferId?.source === 'recruiter')
  }, [applications])

  const filteredApps = useMemo(() => {
    if (activeTab === 'all') return internalApps
    if (activeTab === 'en_cours') {
      return internalApps.filter(a => ['consulte', 'valide_entretien', 'appel_attente', 'entretien_fait'].includes(a.status))
    }
    return internalApps.filter(a => a.status === activeTab)
  }, [internalApps, activeTab])

  const sortedApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
  }, [filteredApps])

  const stats = useMemo(() => {
    return {
      total: internalApps.length,
      envoyees: internalApps.filter(a => a.status === 'envoyee').length,
      enCours: internalApps.filter(a => ['consulte', 'valide_entretien', 'appel_attente', 'entretien_fait'].includes(a.status)).length,
      acceptees: internalApps.filter(a => a.status === 'accepte_final').length,
    }
  }, [internalApps])

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-danger-300 bg-danger-50 py-12 dark:border-danger-500/30 dark:bg-danger-500/5">
          <AlertTriangle className="mb-3 h-10 w-10 text-danger-400" />
          <h3 className="text-lg font-semibold text-danger-700 dark:text-danger-400">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-danger-500">{error?.message || 'Une erreur est survenue.'}</p>
          <button onClick={() => refetch()} className="mt-4 rounded-xl bg-danger-500 px-4 py-2 text-sm font-semibold text-white hover:bg-danger-600">
            Réessayer
          </button>
        </div>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold text-surface-900 dark:text-surface-50">
              Candidatures internes
            </h1>
            <span className="rounded-full bg-secondary-100 px-3 py-1 text-xs font-semibold text-secondary-700 dark:bg-secondary-500/15 dark:text-secondary-400">
              Recruteurs
            </span>
          </div>
          <p className="mt-1 text-surface-500 dark:text-surface-400">
            Suivez l'état de vos candidatures auprès des recruteurs EasyJob
          </p>
        </div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-600 dark:bg-primary-600 dark:hover:bg-primary-500"
        >
          <Briefcase className="h-4 w-4" />
          Voir les offres
        </Link>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? (
          Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />)
        ) : (
          <>
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-700 dark:bg-surface-800">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-surface-100 p-2.5 dark:bg-surface-700">
                  <Building2 className="h-4 w-4 text-surface-500 dark:text-surface-400" />
                </div>
                <span className="text-2xl font-bold text-surface-700 dark:text-surface-300">{stats.total}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-surface-500 dark:text-surface-400">Total</p>
            </div>
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-700 dark:bg-surface-800">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-blue-50 p-2.5 dark:bg-blue-500/10">
                  <Send className="h-4 w-4 text-blue-500" />
                </div>
                <span className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.envoyees}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-surface-500 dark:text-surface-400">Envoyées</p>
            </div>
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-700 dark:bg-surface-800">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-yellow-50 p-2.5 dark:bg-yellow-500/10">
                  <Clock className="h-4 w-4 text-yellow-500" />
                </div>
                <span className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">{stats.enCours}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-surface-500 dark:text-surface-400">En cours</p>
            </div>
            <div className="rounded-2xl border border-surface-200 bg-white p-5 shadow-sm dark:border-surface-700 dark:bg-surface-800">
              <div className="flex items-center justify-between">
                <div className="rounded-xl bg-emerald-50 p-2.5 dark:bg-emerald-500/10">
                  <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                </div>
                <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">{stats.acceptees}</span>
              </div>
              <p className="mt-3 text-sm font-medium text-surface-500 dark:text-surface-400">Acceptées</p>
            </div>
          </>
        )}
      </motion.div>

      {/* Tabs */}
      <motion.div variants={item} className="flex items-center gap-1 overflow-x-auto rounded-2xl border border-surface-200 bg-white p-1.5 shadow-sm dark:border-surface-700 dark:bg-surface-800">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`relative whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-medium transition-colors ${
              activeTab === tab.key
                ? 'text-primary-600 dark:text-primary-400'
                : 'text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200'
            }`}
          >
            {activeTab === tab.key && (
              <motion.div
                layoutId="internalAppTab"
                className="absolute inset-0 rounded-xl bg-primary-50 dark:bg-primary-500/10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
              />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Count */}
      <motion.div variants={item}>
        <p className="text-sm font-medium text-surface-500 dark:text-surface-400">
          <span className="font-bold text-surface-900 dark:text-surface-100">{internalApps.length}</span>
          {' '}candidature{internalApps.length !== 1 ? 's' : ''} interne{internalApps.length !== 1 ? 's' : ''}
        </p>
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} />)}
        </div>
      ) : sortedApps.length > 0 ? (
        <motion.div variants={container} initial="hidden" animate="show" className="space-y-3">
          <AnimatePresence mode="popLayout">
            {sortedApps.map((app) => {
              const status = statusConfig[app.status] || statusConfig.envoyee
              const job = app.jobOfferId || {}
              return (
                <motion.div
                  key={app.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  whileHover={{ scale: 1.01, transition: { duration: 0.15 } }}
                  className="group rounded-2xl border border-surface-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md dark:border-surface-700 dark:bg-surface-800"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2.5">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${status.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-full bg-secondary-100 px-2 py-0.5 text-[10px] font-semibold text-secondary-700 dark:bg-secondary-500/15 dark:text-secondary-400">
                          Recruteur
                        </span>
                        {job.contractType && (
                          <span className="text-xs text-surface-400 dark:text-surface-500">{job.contractType}</span>
                        )}
                      </div>
                      <h3 className="mt-2.5 text-lg font-bold text-surface-900 group-hover:text-primary-600 dark:text-surface-50 dark:group-hover:text-primary-400">
                        {job.title || 'Offre inconnue'}
                      </h3>
                      <p className="mt-0.5 text-sm font-medium text-surface-500 dark:text-surface-400">
                        {job.company || ''}
                      </p>
                      <div className="mt-2 flex flex-wrap items-center gap-3 text-xs text-surface-400 dark:text-surface-500">
                        {job.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {job.location}
                          </span>
                        )}
                        {app.appliedAt && (
                          <span className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            Postulé {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true, locale: fr })}
                          </span>
                        )}
                      </div>
                      {app.statusHistory && app.statusHistory.length > 1 && (
                        <details className="mt-3">
                          <summary className="cursor-pointer text-xs font-medium text-primary-500 hover:text-primary-600">
                            Voir l'historique
                          </summary>
                          <div className="mt-2 space-y-1.5">
                            {app.statusHistory.map((entry, i) => {
                              const s = statusConfig[entry.status] || statusConfig.envoyee
                              return (
                                <div key={i} className="flex items-center gap-2 text-xs text-surface-500 dark:text-surface-400">
                                  <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                  <span className="font-medium">{s.label}</span>
                                  <span>— {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true, locale: fr })}</span>
                                </div>
                              )
                            })}
                          </div>
                        </details>
                      )}
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div variants={item} className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-surface-300 bg-surface-50 py-20 dark:border-surface-600 dark:bg-surface-800/50">
          <div className="rounded-full bg-surface-100 p-5 dark:bg-surface-700">
            <Inbox className="h-10 w-10 text-surface-400 dark:text-surface-500" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-surface-700 dark:text-surface-300">
            {activeTab === 'all' ? 'Aucune candidature interne' : 'Aucune candidature dans cette catégorie'}
          </h3>
          <p className="mt-1 text-sm text-surface-500 dark:text-surface-400">
            {activeTab === 'all'
              ? 'Postulez aux offres publiées par les recruteurs pour les voir apparaître ici'
              : 'Essayez un autre filtre'}
          </p>
          {activeTab === 'all' && (
            <Link
              to="/jobs"
              className="mt-6 inline-flex items-center gap-2 rounded-xl bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-primary-600"
            >
              <Briefcase className="h-4 w-4" />
              Voir les offres recruteurs
            </Link>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
