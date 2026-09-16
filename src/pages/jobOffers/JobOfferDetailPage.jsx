import { useParams, useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  ArrowLeft,
  MapPin,
  Bookmark,
  ExternalLink,
  Briefcase,
  Building2,
  Clock,
  CheckCircle2,
  ListTodo,
  Calendar,
  Tag,
  CircleDollarSign,
  Wifi,
  Building,
  AlertTriangle,
  Share2,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

import { useJob, useToggleSaveJob } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const sourceLabels = {
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  welcometothejungle: 'WTTJ',
  rekrute: 'Rekrute',
  manpower: 'Manpower',
  recruiter: 'Interne',
  autre: 'Autre',
}

const sourceColors = {
  linkedin: 'bg-[#0A66C2]/10 text-[#0A66C2] dark:bg-[#0A66C2]/15 dark:text-[#4DA3E0]',
  indeed: 'bg-[#2164F3]/10 text-[#2164F3] dark:bg-[#2164F3]/15 dark:text-[#6B9BF7]',
  welcometothejungle: 'bg-[#FF6B35]/10 text-[#FF6B35] dark:bg-[#FF6B35]/15 dark:text-[#FF9A6C]',
  rekrute: 'bg-[#E65100]/10 text-[#E65100] dark:bg-[#E65100]/15 dark:text-[#F4845F]',
  manpower: 'bg-[#D32F2F]/10 text-[#D32F2F] dark:bg-[#D32F2F]/15 dark:text-[#EF6C6C]',
  recruiter: 'bg-accent/10 text-accent',
  autre: 'bg-muted text-muted-foreground',
}

function RelevanceCircleLarge({ score }) {
  const size = 96
  const stroke = 6
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ((score || 0) / 100) * circumference
  const gradId = `rel-detail-${score}`

  return (
    <div
      className="relative flex shrink-0 flex-col items-center justify-center rounded-full bg-primary/[0.06] ring-1 ring-primary/20"
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
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={`url(#${gradId})`}
          strokeWidth={stroke}
          strokeDasharray={circumference}
          strokeLinecap="round"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ filter: 'drop-shadow(0 0 4px hsl(var(--primary)/0.3))' }}
        />
      </svg>
      <span className="text-2xl font-bold leading-none tabular-nums text-foreground">
        {score ?? 0}
      </span>
      <span className="mt-1 text-[10px] font-semibold leading-none text-primary/80">
        /100
      </span>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <Skeleton className="h-8 w-40" />
      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1 space-y-4">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-8 w-72 max-w-full" />
            <div className="flex gap-4">
              <Skeleton className="h-5 w-32" />
              <Skeleton className="h-5 w-24" />
            </div>
            <div className="flex gap-2">
              <Skeleton className="h-8 w-24" />
              <Skeleton className="h-8 w-32" />
            </div>
          </div>
          <Skeleton className="size-24 shrink-0 rounded-full" />
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <Skeleton className="h-64 rounded-2xl border border-border" />
          <Skeleton className="h-48 rounded-2xl border border-border" />
        </div>
        <div className="space-y-6">
          <Skeleton className="h-48 rounded-2xl border border-border" />
          <Skeleton className="h-56 rounded-2xl border border-border" />
        </div>
      </div>
    </div>
  )
}

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function JobOfferDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading, error } = useJob(id)
  const toggleSave = useToggleSaveJob()

  const job = data?.job

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (error || !job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <AlertTriangle className="mb-4 size-16 text-destructive/60" />
          <h1 className="text-2xl font-bold text-foreground">
            {error ? 'Erreur de chargement' : 'Offre non trouvée'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {error ? error.message : "Cette offre n'existe pas ou a été supprimée."}
          </p>
          <Button onClick={() => navigate('/jobs')} className="mt-6">
            <ArrowLeft className="size-4" />
            Retour aux offres
          </Button>
        </motion.div>
      </div>
    )
  }

  const jobId = job._id || job.id

  const handleShare = async () => {
    try {
      await navigator.clipboard.writeText(`${window.location.origin}/jobs/${jobId}`)
      toast.success('Lien copié dans le presse-papier')
    } catch {
      toast.error("Impossible de copier le lien")
    }
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="text-muted-foreground"
        >
          <Link to="/jobs">
            <ArrowLeft className="size-4" />
            Retour aux offres
          </Link>
        </Button>
      </motion.div>

      {/* Header Section */}
      <motion.div
        variants={item}
        className="rounded-2xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-col gap-6 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 flex-1">
            <span
              className={`inline-block rounded-full px-3 py-1 text-xs font-semibold ${sourceColors[job.source] || 'bg-muted text-muted-foreground'}`}
            >
              {sourceLabels[job.source] || job.source}
            </span>

            <h1 className="mt-3 text-2xl font-bold text-foreground sm:text-3xl">
              {job.title}
            </h1>

            <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
              {job.company && (
                <span className="flex items-center gap-1.5">
                  <Building2 className="size-4" />
                  <span className="font-medium text-foreground">{job.company}</span>
                </span>
              )}
              {job.location && (
                <span className="flex items-center gap-1.5">
                  <MapPin className="size-4" />
                  {job.location}
                  {job.isRemote && (
                    <Badge variant="outline" className="text-xs text-primary">
                      Remote
                    </Badge>
                  )}
                </span>
              )}
              {job.postedAt && (
                <span className="flex items-center gap-1.5">
                  <Clock className="size-4" />
                  {formatDistanceToNow(new Date(job.postedAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              )}
            </div>
          </div>

          <div className="flex shrink-0 items-center self-start sm:self-center">
            <RelevanceCircleLarge score={job.relevanceScore} />
          </div>
        </div>

        {/* Info Pills */}
        <div className="mt-6 flex flex-wrap gap-2">
          {job.contractType && (
            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
              <Briefcase className="size-3.5" />
              {job.contractType}
            </Badge>
          )}
          {job.salary?.min != null && job.salary?.max != null && (
            <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
              <CircleDollarSign className="size-3.5" />
              {job.salary.min.toLocaleString('fr-MA')} - {job.salary.max.toLocaleString('fr-MA')} MAD/mois
            </Badge>
          )}
          <Badge variant="secondary" className="px-3 py-1.5 text-sm font-medium">
            {job.isRemote ? (
              <>
                <Wifi className="size-3.5" />
                Télétravail
              </>
            ) : (
              <>
                <Building className="size-3.5" />
                Sur site
              </>
            )}
          </Badge>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - 2/3 */}
        <div className="space-y-6 lg:col-span-2">
          {/* Description */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="mb-4 text-xl font-bold text-foreground">
              Description
            </h2>
            <p className="whitespace-pre-line leading-relaxed text-muted-foreground">
              {job.description || 'Aucune description disponible.'}
            </p>
          </motion.div>

          {/* Requirements */}
          {job.requirements && job.requirements.length > 0 && (
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                <CheckCircle2 className="size-5 text-accent" />
                Exigences
              </h2>
              <ul className="space-y-3">
                {job.requirements.map((req, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" />
                    {req}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}

          {/* Responsibilities */}
          {job.responsibilities && job.responsibilities.length > 0 && (
            <motion.div
              variants={item}
              className="rounded-2xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="mb-4 flex items-center gap-2 text-xl font-bold text-foreground">
                <ListTodo className="size-5 text-accent" />
                Responsabilités
              </h2>
              <ul className="space-y-3">
                {job.responsibilities.map((resp, i) => (
                  <li key={i} className="flex items-start gap-3 text-muted-foreground">
                    <span className="mt-2 size-1.5 shrink-0 rounded-full bg-accent" />
                    {resp}
                  </li>
                ))}
              </ul>
            </motion.div>
          )}
        </div>

        {/* Right Column - 1/3 */}
        <div className="space-y-6">
          {/* Actions Card */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Actions
            </h3>
            <div className="space-y-3">
              {job.sourceUrl && (
                <a
                  href={job.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-primary/90"
                >
                  <ExternalLink className="size-4" />
                  Postuler sur {sourceLabels[job.source] || 'la source'}
                </a>
              )}
              <Button
                variant="outline"
                className="w-full"
                onClick={() => toggleSave.mutate(jobId)}
              >
                <Bookmark className={`size-4 ${job.isSaved ? 'fill-primary text-primary' : ''}`} />
                {job.isSaved ? 'Sauvegardé' : 'Sauvegarder'}
              </Button>
              <Button variant="ghost" className="w-full" onClick={handleShare}>
                <Share2 className="size-4" />
                Partager
              </Button>
            </div>
          </motion.div>

          {/* Informations Card */}
          <motion.div
            variants={item}
            className="rounded-2xl border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Informations
            </h3>
            <div className="space-y-4">
              {job.sector && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Building2 className="size-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-muted-foreground">
                      Secteur
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {job.sector}
                    </p>
                  </div>
                </div>
              )}

              {job.postedAt && (
                <div className="flex items-center gap-3">
                  <div className="rounded-lg bg-muted p-2">
                    <Calendar className="size-4 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-muted-foreground">
                      Publiée
                    </p>
                    <p className="text-sm font-medium text-foreground">
                      {formatDistanceToNow(new Date(job.postedAt), {
                        addSuffix: true,
                        locale: fr,
                      })}
                    </p>
                  </div>
                </div>
              )}

              {job.keywords && job.keywords.length > 0 && (
                <div>
                  <p className="mb-2 text-xs font-medium text-muted-foreground">
                    Mots-clés
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {job.keywords.map((kw) => (
                      <span
                        key={kw}
                        className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-medium text-primary"
                      >
                        <Tag className="size-3" />
                        {kw}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}