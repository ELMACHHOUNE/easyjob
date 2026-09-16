import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Bookmark,
  MapPin,
  Briefcase,
  BookmarkX,
  Loader2,
  AlertTriangle,
  ExternalLink,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

import { useSavedJobs, useToggleSaveJob } from '@/api/hooks'

const sourceLabels = {
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  welcometothejungle: 'Welcome to the Jungle',
  rekrute: 'Rekrute',
  manpower: 'Manpower',
}

const sourceColors = {
  linkedin: 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-400',
  indeed: 'bg-accent/10 text-accent',
  welcometothejungle: 'bg-purple-100 text-purple-700 dark:bg-purple-500/15 dark:text-purple-400',
  rekrute: 'bg-warning/10 text-warning',
  manpower: 'bg-destructive/10 text-destructive',
}

function RelevanceCircle({ score }) {
  const size = 44
  const stroke = 3.5
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ((score || 0) / 100) * circumference
  const gradId = `rel-saved-${score}`

  return (
    <div
      className="relative flex flex-col items-center justify-center rounded-full bg-primary/[0.06] ring-1 ring-primary/20"
      style={{ width: size, height: size }}
      title={`Score de pertinence : ${score ?? 0}/100`}
    >
      <svg className="absolute -rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden>
        <defs>
          <linearGradient id={gradId} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="hsl(var(--primary))" />
            <stop offset="100%" stopColor="hsl(var(--accent))" />
          </linearGradient>
        </defs>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke="hsl(var(--primary)/0.12)"
          strokeWidth={stroke}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-700 ease-out"
          style={{ filter: 'drop-shadow(0 0 3px hsl(var(--primary)/0.3))' }}
        />
      </svg>
      <span className="text-sm font-bold leading-none tabular-nums text-foreground">
        {score ?? 0}
      </span>
      <span className="mt-0.5 text-[8px] font-semibold leading-none text-primary/80">
        /100
      </span>
    </div>
  )
}

function JobCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 space-y-3">
          <div className="flex gap-2">
            <div className="h-5 w-16 animate-pulse rounded-full bg-muted" />
            <div className="h-5 w-12 animate-pulse rounded-full bg-muted" />
          </div>
          <div className="h-6 w-48 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
        </div>
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
      </div>
    </div>
  )
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.05 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function SavedJobsPage() {
  const navigate = useNavigate()
  const { data, isLoading, error, refetch } = useSavedJobs()
  const toggleSave = useToggleSaveJob()

  const offers = data?.jobs ?? []

  const handleUnsave = (id) => {
    toggleSave.mutate(id)
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/10 py-12">
          <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-destructive">{error?.message || 'Une erreur est survenue.'}</p>
          <Button onClick={() => refetch()} variant="destructive" className="mt-4">
            Réessayer
          </Button>
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
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-foreground">
          Offres sauvegardées
        </h1>
        <p className="mt-1 text-muted-foreground">
          Retrouvez les offres que vous avez enregistrées
        </p>
      </motion.div>

      {/* Results Count */}
      <motion.div variants={item}>
        <p className="text-sm font-medium text-muted-foreground">
          <span className="font-bold text-foreground">
            {isLoading ? '...' : offers.length}
          </span>{' '}
          {offers.length === 1 ? 'offre sauvegardée' : 'offres sauvegardées'}
        </p>
      </motion.div>

      {/* Job Cards */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <JobCardSkeleton key={i} />
          ))}
        </div>
      ) : offers.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          {offers.map((job, index) => (
            <motion.div
              key={job.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
              whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
              onClick={() => navigate(`/jobs/${job.id}`)}
              className="group cursor-pointer rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <div className="mb-2 flex flex-wrap items-center gap-2">
                    <Badge
                      variant="secondary"
                      className={sourceColors[job.source] || 'bg-muted text-muted-foreground'}
                    >
                      {sourceLabels[job.source] || job.source}
                    </Badge>
                    <Badge variant="secondary">
                      {job.contractType}
                    </Badge>
                  </div>

                  <h3 className="text-lg font-bold text-foreground group-hover:text-primary">
                    {job.title}
                  </h3>

                  <p className="mt-1 text-sm font-medium text-muted-foreground">
                    {job.company}
                  </p>

                  <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <MapPin className="h-3.5 w-3.5" />
                      {job.location}
                      {job.isRemote && (
                        <span className="ml-1 text-xs text-accent">(Remote)</span>
                      )}
                    </span>
                    {job.salary && (
                      <span className="font-medium text-foreground">
                        {job.salary.min?.toLocaleString('fr-MA')} - {job.salary.max?.toLocaleString('fr-MA')} MAD/mois
                      </span>
                    )}
                    {job.postedAt && (
                      <span className="text-xs text-muted-foreground">
                        {formatDistanceToNow(new Date(job.postedAt), {
                          addSuffix: true,
                          locale: fr,
                        })}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex shrink-0 items-center gap-1">
                  <RelevanceCircle score={job.relevanceScore} />
                </div>
              </div>

              <div className="mt-4 flex items-center gap-3 border-t border-border pt-4">
                {job.sourceUrl && (
                  <Button asChild variant="outline" size="sm">
                    <a
                      href={job.sourceUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ExternalLink className="h-4 w-4" />
                      Voir sur {sourceLabels[job.source] || job.source}
                    </a>
                  </Button>
                )}

                <Button
                  variant="destructive"
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleUnsave(job.id)
                  }}
                  disabled={toggleSave.isPending}
                >
                  {toggleSave.isPending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <BookmarkX className="h-4 w-4" />
                  )}
                  Retirer
                </Button>

                <Button asChild size="sm">
                  <Link
                    to={`/applications/compose/${job.id}`}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Briefcase className="h-4 w-4" />
                    Postuler
                  </Link>
                </Button>
              </div>
            </motion.div>
          ))}
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted/50 py-20"
        >
          <div className="rounded-full bg-muted p-5">
            <Bookmark className="h-10 w-10 text-muted-foreground" />
          </div>
          <h3 className="mt-5 text-lg font-semibold text-foreground">
            Aucune offre sauvegardée
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Parcourez les offres et sauvegardez celles qui vous intéressent
          </p>
          <Button asChild className="mt-6">
            <Link to="/jobs">
              Voir les offres
            </Link>
          </Button>
        </motion.div>
      )}
    </motion.div>
  )
}