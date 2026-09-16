import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Send,
  FileEdit,
  Clock,
  CheckCircle2,
  Trash2,
  Eye,
  Inbox,
  Mail,
  AlertTriangle,
  Briefcase,
  Building2,
  UserCheck,
  MapPin,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

import { useApplications, useDeleteApplication } from '@/api/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableHeader, TableBody, TableRow, TableHead, TableCell } from '@/components/ui/table'
import ConfirmDialog from '@/components/ui/confirm-dialog'

const sourceTabs = [
  { key: 'external', label: 'Externes', icon: Briefcase },
  { key: 'internal', label: 'Internes', icon: Building2 },
]

const statusConfig = {
  brouillon: { label: 'Brouillon', color: 'bg-muted text-foreground', dot: 'bg-muted-foreground' },
  envoyee: { label: 'Envoyée', color: 'bg-primary/10 text-primary', dot: 'bg-primary' },
  consulte: { label: 'Consultée', color: 'bg-warning/10 text-warning', dot: 'bg-warning' },
  valide_entretien: { label: 'Entretien validé', color: 'bg-accent/10 text-accent', dot: 'bg-accent' },
  appel_attente: { label: 'Appel en attente', color: 'bg-purple-100 text-purple-700', dot: 'bg-purple-500' },
  entretien_fait: { label: 'Entretien fait', color: 'bg-indigo-100 text-indigo-700', dot: 'bg-indigo-500' },
  accepte_final: { label: 'Acceptée', color: 'bg-emerald-100 text-emerald-700', dot: 'bg-emerald-500' },
  refusee: { label: 'Refusée', color: 'bg-destructive/10 text-destructive', dot: 'bg-destructive' },
}

const filterTabs = [
  { key: 'all', label: 'Toutes' },
  { key: 'brouillon', label: 'Brouillons' },
  { key: 'envoyee', label: 'Envoyées' },
  { key: 'en_cours_group', label: 'En cours' },
  { key: 'accepte_final', label: 'Acceptées' },
  { key: 'refusee', label: 'Refusées' },
]

const filterStatuses = {
  brouillon: ['brouillon'],
  envoyee: ['envoyee'],
  en_cours_group: ['consulte', 'valide_entretien', 'appel_attente', 'entretien_fait'],
  accepte_final: ['accepte_final'],
  refusee: ['refusee'],
}

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
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
            <div className="h-4 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
      </div>
    </div>
  )
}

function RowSkeleton() {
  return (
    <TableRow>
      <TableCell className="py-4">
        <div className="h-5 w-24 animate-pulse rounded-full bg-muted" />
      </TableCell>
      <TableCell>
        <div className="space-y-2">
          <div className="h-4 w-48 animate-pulse rounded bg-muted" />
          <div className="h-3 w-32 animate-pulse rounded bg-muted" />
        </div>
      </TableCell>
      <TableCell>
        <div className="h-3 w-20 animate-pulse rounded bg-muted" />
      </TableCell>
      <TableCell>
        <div className="flex justify-end gap-2">
          <div className="h-8 w-20 animate-pulse rounded-lg bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-lg bg-muted" />
        </div>
      </TableCell>
    </TableRow>
  )
}

function StatCard({ icon: Icon, label, count, iconBg, iconColor, valueColor }) {
  return (
    <motion.div variants={item} whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-center justify-between">
        <div className={`rounded-lg p-2.5 ${iconBg}`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
        <span className={`text-2xl font-bold ${valueColor}`}>{count}</span>
      </div>
      <p className="mt-3 text-sm font-medium text-muted-foreground">{label}</p>
    </motion.div>
  )
}

export default function ApplicationsPage() {
  const [sourceTab, setSourceTab] = useState('all')
  const [activeFilter, setActiveFilter] = useState('all')
  const [deleteConfirm, setDeleteConfirm] = useState(null)
  const [page, setPage] = useState(1)

  const { data, isLoading, error, refetch } = useApplications({ page, limit: 100 })
  const deleteApp = useDeleteApplication()

  const applications = useMemo(() => data?.applications ?? [], [data])

  const filteredBySource = useMemo(() => {
    if (sourceTab === 'all') return applications
    if (sourceTab === 'internal') {
      return applications.filter(a => a.jobOfferId?.source === 'recruiter')
    }
    return applications.filter(a => a.jobOfferId?.source !== 'recruiter')
  }, [applications, sourceTab])

  const filteredApps = useMemo(() => {
    if (activeFilter === 'all') return filteredBySource
    const statuses = filterStatuses[activeFilter]
    if (!statuses) return filteredBySource
    return filteredBySource.filter(a => statuses.includes(a.status))
  }, [filteredBySource, activeFilter])

  const sortedApps = useMemo(() => {
    return [...filteredApps].sort((a, b) => {
      const aTime = a.email?.sentAt || a.appliedAt || a.updatedAt
      const bTime = b.email?.sentAt || b.appliedAt || b.updatedAt
      if (!aTime && !bTime) return 0
      if (!aTime) return 1
      if (!bTime) return -1
      return new Date(bTime) - new Date(aTime)
    })
  }, [filteredApps])

  const stats = useMemo(() => {
    const a = filteredBySource
    return {
      brouillons: a.filter(x => x.status === 'brouillon').length,
      envoyees: a.filter(x => x.status === 'envoyee').length,
      enCours: a.filter(x => ['consulte', 'valide_entretien', 'appel_attente', 'entretien_fait'].includes(x.status)).length,
      acceptees: a.filter(x => x.status === 'accepte_final').length,
    }
  }, [filteredBySource])

  const handleDelete = (id) => {
    deleteApp.mutate(id, {
      onSuccess: () => { setDeleteConfirm(null); toast.success('Candidature supprimée') },
      onError: () => toast.error('Erreur lors de la suppression'),
    })
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/10 py-12">
          <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-destructive">{error?.message || 'Une erreur est survenue.'}</p>
          <Button variant="destructive" onClick={() => refetch()} className="mt-4">Réessayer</Button>
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show"
      className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}
        title="Supprimer cette candidature ?"
        description="Cette action est irréversible. La candidature et son historique seront définitivement supprimés."
        confirmText="Supprimer"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        icon={Trash2}
      />
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Mes Candidatures</h1>
          <p className="mt-1 text-muted-foreground">
            {sourceTab === 'all' ? 'Toutes vos candidatures' :
             sourceTab === 'internal' ? 'Candidatures aux offres internes' :
             'Candidatures aux offres externes'}
          </p>
        </div>
        <Button asChild size="lg">
          <Link to="/jobs">
            <Briefcase className="h-4 w-4" />
            Voir les offres
          </Link>
        </Button>
      </motion.div>

      {/* Source Tabs */}
      <motion.div variants={item} className="flex gap-1 rounded-xl border border-border bg-card p-1.5 shadow-sm">
        <button
          onClick={() => { setSourceTab('all'); setActiveFilter('all'); setPage(1) }}
          className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
            sourceTab === 'all' ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
          }`}
        >
          {sourceTab === 'all' && (
            <motion.div layoutId="appSourceTab" className="absolute inset-0 rounded-lg bg-primary/10"
              transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
          )}
          <span className="relative z-10">Toutes</span>
        </button>
        {sourceTabs.map(tab => {
          const Icon = tab.icon
          const isActive = sourceTab === tab.key
          return (
            <button key={tab.key}
              onClick={() => { setSourceTab(tab.key); setActiveFilter('all'); setPage(1) }}
              className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-3 text-sm font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div layoutId="appSourceTab" className="absolute inset-0 rounded-lg bg-primary/10"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
              )}
              <Icon className="relative z-10 h-4 w-4" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </motion.div>

      {/* Stats */}
      <motion.div variants={item} className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {isLoading ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} />) : (
          <>
            <StatCard icon={FileEdit} label="Brouillons" count={stats.brouillons}
              iconBg="bg-muted" iconColor="text-muted-foreground" valueColor="text-foreground" />
            <StatCard icon={Send} label="Envoyées" count={stats.envoyees}
              iconBg="bg-primary/10" iconColor="text-primary" valueColor="text-primary" />
            <StatCard icon={Clock} label="En cours" count={stats.enCours}
              iconBg="bg-warning/10" iconColor="text-warning" valueColor="text-warning" />
            <StatCard icon={CheckCircle2} label="Acceptées" count={stats.acceptees}
              iconBg="bg-accent/10" iconColor="text-accent" valueColor="text-accent" />
          </>
        )}
      </motion.div>

      {/* Filter Tabs */}
      <motion.div variants={item} className="flex items-center gap-1 overflow-x-auto rounded-xl border border-border bg-card p-1.5 shadow-sm">
        {filterTabs.map(tab => (
          <button key={tab.key}
            onClick={() => { setActiveFilter(tab.key); setPage(1) }}
            className={`relative whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
              activeFilter === tab.key ? 'text-primary' : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {activeFilter === tab.key && (
              <motion.div layoutId="appFilterTab" className="absolute inset-0 rounded-lg bg-primary/10"
                transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }} />
            )}
            <span className="relative z-10">{tab.label}</span>
          </button>
        ))}
      </motion.div>

      {/* Count */}
      <motion.div variants={item}>
        <p className="text-sm font-medium text-muted-foreground">
          <span className="font-bold text-foreground">{isLoading ? '...' : filteredBySource.length}</span>{' '}
          {filteredBySource.length === 1 ? 'candidature' : 'candidatures'}
          {sourceTab !== 'all' && (
            <span className="ml-1 text-muted-foreground">
              ({sourceTab === 'internal' ? 'internes' : 'externes'})
            </span>
          )}
        </p>
      </motion.div>

      {/* List */}
      {isLoading ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statut</TableHead>
                <TableHead>Offre</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Array.from({ length: 5 }).map((_, i) => <RowSkeleton key={i} />)}
            </TableBody>
          </Table>
        </div>
      ) : sortedApps.length > 0 ? (
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Statut</TableHead>
                <TableHead>Offre</TableHead>
                <TableHead>Dernière activité</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <AnimatePresence>
                {sortedApps.map(app => {
                  const status = statusConfig[app.status] || statusConfig.brouillon
                  const isInternal = app.jobOfferId?.source === 'recruiter'
                  return (
                    <motion.tr key={app.id} layout
                      initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, scale: 0.98, transition: { duration: 0.2 } }}
                      className="group"
                    >
                      <TableCell>
                        <Badge variant="secondary" className={`h-auto gap-1.5 rounded-full px-3 py-1 font-semibold ${status.color}`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </Badge>
                        {isInternal ? (
                          <Badge variant="secondary" className="mt-1.5 gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                            <Building2 className="h-3 w-3" />
                            Recruteur
                          </Badge>
                        ) : app.jobOfferId?.source && (
                          <Badge variant="secondary" className="mt-1.5 gap-1 rounded-full bg-muted px-2 py-0.5 text-[10px] font-medium text-muted-foreground">
                            <Briefcase className="h-3 w-3" />
                            Externe
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="whitespace-normal">
                        <h3 className="text-base font-bold text-foreground">
                          {app.jobOfferId?.title || 'Offre inconnue'}
                        </h3>
                        <p className="mt-0.5 text-sm font-medium text-muted-foreground">
                          {app.jobOfferId?.company || ''}
                        </p>

                        {app.jobOfferId?.location && (
                          <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                            <MapPin className="h-3 w-3" />
                            {app.jobOfferId.location}
                          </p>
                        )}

                        {app.email?.subject && (
                          <div className="mt-2.5 flex max-w-md items-center gap-2 rounded-lg bg-muted px-3 py-2">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                            <p className="truncate text-sm text-muted-foreground">{app.email.subject}</p>
                          </div>
                        )}

                        {app.statusHistory && app.statusHistory.length > 1 && (
                          <details className="mt-2">
                            <summary className="cursor-pointer text-xs font-medium text-primary hover:text-primary/90">
                              Historique ({app.statusHistory.length})
                            </summary>
                            <div className="mt-1.5 space-y-1">
                              {app.statusHistory.map((entry, i) => {
                                const s = statusConfig[entry.status] || statusConfig.brouillon
                                return (
                                  <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                                    <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
                                    <span className="font-medium">{s.label}</span>
                                    <span>— {formatDistanceToNow(new Date(entry.changedAt), { addSuffix: true, locale: fr })}</span>
                                  </div>
                                )
                              })}
                            </div>
                          </details>
                        )}

                        {app.notes && (
                          <p className="mt-2.5 line-clamp-1 text-sm text-muted-foreground italic">{app.notes}</p>
                        )}
                      </TableCell>
                      <TableCell>
                        {app.email?.sentAt && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(app.email.sentAt), { addSuffix: true, locale: fr })}
                          </span>
                        )}
                        {app.appliedAt && !app.email?.sentAt && (
                          <span className="flex items-center gap-1 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            {formatDistanceToNow(new Date(app.appliedAt), { addSuffix: true, locale: fr })}
                          </span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-2">
                          {!isInternal && app.status === 'brouillon' ? (
                            <Button asChild size="sm">
                              <Link to={`/applications/compose/${app.jobOfferId?.id || app.jobOfferId?._id}`}>
                                <Send className="h-4 w-4" />
                                <span className="hidden sm:inline">Reprendre</span>
                              </Link>
                            </Button>
                          ) : isInternal && app.status !== 'brouillon' ? (
                            <span className="inline-flex items-center gap-1.5 rounded-lg border border-primary/20 bg-primary/10 px-3 py-2 text-sm font-semibold text-primary">
                              <UserCheck className="h-4 w-4" />
                              <span className="hidden sm:inline">Suivi</span>
                            </span>
                          ) : (
                            !isInternal && (
                              <Button asChild variant="outline" size="sm">
                                <Link to={`/applications/compose/${app.jobOfferId?.id || app.jobOfferId?._id}`}>
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden sm:inline">Voir</span>
                                </Link>
                              </Button>
                            )
                          )}

                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => setDeleteConfirm(deleteConfirm === app.id ? null : app.id)}
                            aria-label="Supprimer"
                            className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </motion.tr>
                  )
                })}
              </AnimatePresence>
            </TableBody>
          </Table>
        </div>
      ) : (
        <motion.div variants={item} className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/40 py-20">
          <div className="rounded-full bg-muted p-5">
            <Inbox className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">
            {sourceTab === 'internal' ? 'Aucune candidature interne' : 'Aucune candidature'}
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {sourceTab === 'internal'
              ? 'Postulez aux offres internes pour les voir apparaître ici'
              : activeFilter === 'all'
                ? "Vous n'avez pas encore de candidatures. Commencez par postuler !"
                : "Aucune candidature ne correspond à ce filtre."}
          </p>
          {activeFilter === 'all' && (
            <Button asChild className="mt-6">
              <Link to="/jobs">
                Explorer les offres
              </Link>
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}