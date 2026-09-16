import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Plus, Briefcase, MapPin, Clock, Users, Eye, EyeOff, Trash2, Loader2
} from 'lucide-react'
import { useRecruiterJobs, useDeleteRecruiterJob, useToggleRecruiterJob } from '@/api/hooks'
import { toast } from 'sonner'
import ConfirmDialog from '@/components/ui/confirm-dialog'

const container = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.05 } } }
const item = { hidden: { opacity: 0, y: 12 }, show: { opacity: 1, y: 0 } }

const contractColors = {
  CDI: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CDD: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  Stage: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  Freelance: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  'Temps partiel': 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
}

export default function RecruiterJobsPage() {
  const [filter, setFilter] = useState('all')
  const [deleteId, setDeleteId] = useState(null)
  const { data, isLoading } = useRecruiterJobs({ status: filter === 'all' ? undefined : filter })
  const deleteJob = useDeleteRecruiterJob()
  const toggleJob = useToggleRecruiterJob()

  const jobs = data?.jobs || []

  const handleDelete = async (id) => {
    await deleteJob.mutateAsync(id)
    toast.success('Offre supprimée')
    setDeleteId(null)
  }

  const handleToggle = async (id) => {
    await toggleJob.mutateAsync(id)
    toast.success('Statut mis à jour')
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="space-y-6">
      <motion.div variants={item} className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-surface-800 dark:text-white">Mes offres</h1>
        <Link
          to="/recruiter-space/jobs/new"
          className="flex items-center gap-2 px-4 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition"
        >
          <Plus className="w-5 h-5" />
          Nouvelle offre
        </Link>
      </motion.div>

      {/* Filters */}
      <motion.div variants={item} className="flex gap-2">
        {['all', 'active', 'inactive'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition ${
              filter === f
                ? 'bg-primary-500 text-white'
                : 'bg-surface-100 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:bg-surface-200'
            }`}
          >
            {f === 'all' ? 'Toutes' : f === 'active' ? 'Actives' : 'Inactives'}
          </button>
        ))}
      </motion.div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <motion.div variants={item} className="text-center py-12 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800">
          <Briefcase className="w-12 h-12 text-surface-300 mx-auto mb-3" />
          <p className="text-surface-500">Aucune offre publiée</p>
          <Link to="/recruiter-space/jobs/new" className="mt-3 inline-flex items-center gap-2 text-primary-500 font-medium hover:text-primary-600">
            <Plus className="w-4 h-4" /> Créer votre première offre
          </Link>
        </motion.div>
      ) : (
        <motion.div variants={item} className="space-y-3">
          {jobs.map((job) => (
            <div key={job._id} className="rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-5 shadow-sm hover:shadow-md transition">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="font-semibold text-surface-800 dark:text-white">{job.title}</h3>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${contractColors[job.contractType] || ''}`}>
                      {job.contractType}
                    </span>
                    {!job.isActive && (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                        Inactive
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 text-sm text-surface-500">
                    <span className="flex items-center gap-1"><MapPin className="w-4 h-4" />{job.location}</span>
                    <span className="flex items-center gap-1"><Users className="w-4 h-4" />{job.applicationsCount || 0} candidatures</span>
                    <span className="flex items-center gap-1"><Clock className="w-4 h-4" />{new Date(job.createdAt).toLocaleDateString('fr-FR')}</span>
                  </div>
                  {job.description && (
                    <p className="text-sm text-surface-500 mt-2 line-clamp-2">{job.description.slice(0, 200)}...</p>
                  )}
                </div>
                <div className="flex items-center gap-2 ml-4">
                  <Link
                    to={`/recruiter-space/jobs/${job._id}`}
                    className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-primary-500 transition"
                    title="Voir"
                  >
                    <Eye className="w-5 h-5" />
                  </Link>
                  <button
                    onClick={() => handleToggle(job._id)}
                    className="p-2 rounded-lg hover:bg-surface-100 dark:hover:bg-surface-700 text-surface-500 hover:text-amber-500 transition"
                    title={job.isActive ? 'Désactiver' : 'Activer'}
                  >
                    {job.isActive ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                  <button
                    onClick={() => setDeleteId(job._id)}
                    className="p-2 rounded-lg hover:bg-danger-50 dark:hover:bg-danger-500/10 text-surface-500 hover:text-danger-500 transition"
                    title="Supprimer"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </motion.div>
      )}

      <ConfirmDialog
        open={!!deleteId}
        onOpenChange={(open) => { if (!open) setDeleteId(null) }}
        title="Supprimer cette offre ?"
        description="Cette action est irréversible. L'offre et ses candidatures associées seront définitivement supprimées."
        confirmText="Supprimer"
        onConfirm={() => deleteId && handleDelete(deleteId)}
        icon={Trash2}
      />
    </motion.div>
  )
}
