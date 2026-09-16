import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '@/context/AuthContext'
import {
  Briefcase, Users, FileText, Plus, Clock,
  CheckCircle, Loader2
} from 'lucide-react'
import { useRecruiterDashboard } from '@/api/hooks'
import NotificationDropdown from '@/components/NotificationDropdown'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const statusColors = {
  envoyee: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ouverte: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
  en_cours: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  acceptee: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  refusee: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
}

const statusLabels = {
  envoyee: 'Envoyée', ouverte: 'Ouverte', en_cours: 'En cours',
  acceptee: 'Acceptée', refusee: 'Refusée',
}

export default function RecruiterDashboardPage() {
  const { user } = useAuth()
  const { data, isLoading } = useRecruiterDashboard()

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  const stats = data?.stats || { totalJobs: 0, activeJobs: 0, totalApplications: 0, applicationsByStatus: {} }
  const recentApps = data?.recentApplications || []

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-surface-800 dark:text-white">
            Espace Recruteur
          </h1>
          <p className="text-surface-500 dark:text-surface-400 mt-1">
            Bienvenue {user?.firstName} - {data?.profile?.companyName || 'Votre entreprise'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <NotificationDropdown />
          <Link
            to="/recruiter-space/jobs/new"
            className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition"
          >
            <Plus className="w-5 h-5" />
            Nouvelle offre
          </Link>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Offres publiées', value: stats.totalJobs, icon: Briefcase, color: 'text-primary-500' },
          { label: 'Offres actives', value: stats.activeJobs, icon: CheckCircle, color: 'text-green-500' },
          { label: 'Candidatures', value: stats.totalApplications, icon: FileText, color: 'text-purple-500' },
          { label: 'En cours', value: stats.applicationsByStatus?.en_cours || 0, icon: Clock, color: 'text-amber-500' },
        ].map((s, i) => (
          <div key={i} className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-surface-500">{s.label}</span>
              <s.icon className={`w-5 h-5 ${s.color}`} />
            </div>
            <p className="text-2xl font-bold text-surface-800 dark:text-white">{s.value}</p>
          </div>
        ))}
      </motion.div>

      {/* Quick Actions */}
      <motion.div variants={item} className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link to="/recruiter-space/jobs" className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 shadow-sm hover:shadow-md transition group">
          <Briefcase className="w-8 h-8 text-primary-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-surface-800 dark:text-white">Mes offres</h3>
          <p className="text-sm text-surface-500 mt-1">Gérer vos offres d'emploi</p>
        </Link>
        <Link to="/recruiter-space/candidates" className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 shadow-sm hover:shadow-md transition group">
          <Users className="w-8 h-8 text-green-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-surface-800 dark:text-white">Candidats</h3>
          <p className="text-sm text-surface-500 mt-1">Trouver des talents</p>
        </Link>
        <Link to="/recruiter-space/applications" className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 shadow-sm hover:shadow-md transition group">
          <FileText className="w-8 h-8 text-purple-500 mb-3 group-hover:scale-110 transition-transform" />
          <h3 className="font-semibold text-surface-800 dark:text-white">Candidatures</h3>
          <p className="text-sm text-surface-500 mt-1">Consulter les candidatures</p>
        </Link>
      </motion.div>

      {/* Recent Applications */}
      <motion.div variants={item} className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-surface-800 dark:text-white mb-4">Candidatures récentes</h2>
        {recentApps.length === 0 ? (
          <p className="text-surface-500 text-center py-8">Aucune candidature pour le moment</p>
        ) : (
          <div className="space-y-3">
            {recentApps.slice(0, 10).map((app) => (
              <div key={app._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700/50 transition">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                    <span className="text-sm font-semibold text-primary-600">
                      {app.userId?.firstName?.[0]}{app.userId?.lastName?.[0]}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-surface-800 dark:text-white text-sm">
                      {app.userId?.firstName} {app.userId?.lastName}
                    </p>
                    <p className="text-xs text-surface-500">
                      {app.jobOfferId?.title} - {app.jobOfferId?.company}
                    </p>
                  </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[app.status] || 'bg-gray-100 text-gray-600'}`}>
                  {statusLabels[app.status] || app.status}
                </span>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </motion.div>
  )
}
