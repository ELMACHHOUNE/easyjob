import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { toast } from 'sonner'
import {
  MapPin,
  Bookmark,
  Share2,
  CheckCircle,
  Clock,
  Wifi,
} from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

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

const contractColors = {
  CDI: 'bg-primary/8 text-primary',
  CDD: 'bg-warning/10 text-warning',
  Stage: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  Freelance: 'bg-accent/10 text-accent',
  'Temps partiel': 'bg-muted text-muted-foreground',
}

function RelevanceCircle({ score, size = 46 }) {
  const stroke = size >= 44 ? 4 : 3
  const radius = (size - stroke) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - ((score || 0) / 100) * circumference
  const gradId = `rel-${score}-${size}`

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
      <span className={`font-bold leading-none tabular-nums text-foreground ${size >= 44 ? 'text-sm' : 'text-[11px]'}`}>
        {score ?? 0}
      </span>
      <span className="mt-0.5 text-[8px] font-semibold leading-none text-primary/80">
        /100
      </span>
    </div>
  )
}

const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: 'easeOut' } },
}

export default function JobOfferCard({ job, view = 'grid', onSave, onApply, appliedIds }) {
  const navigate = useNavigate()
  const [hovered, setHovered] = useState(false)
  const isApplied = appliedIds?.has(job.id)
  const isInternal = job.source === 'recruiter'
  const score = isInternal ? (job.matchScore ?? 0) : (job.relevanceScore ?? 0)

  const handleShare = (e) => {
    e.stopPropagation()
    navigator.clipboard.writeText(`${window.location.origin}/jobs/${job.id}`)
    toast.success('Lien copié dans le presse-papiers')
  }

  const handleSave = (e) => {
    e.stopPropagation()
    onSave?.(job.id)
  }

  const handleApplyClick = (e) => {
    e.stopPropagation()
    if (job.sourceUrl) {
      window.open(job.sourceUrl, '_blank', 'noopener,noreferrer')
    }
    onApply?.(job.id)
  }

  const salaryText = job.salary?.min || job.salary?.max
    ? `${job.salary.min?.toLocaleString('fr-MA')}${job.salary.max ? ` – ${job.salary.max.toLocaleString('fr-MA')}` : ''} MAD/mois`
    : null

  const initials = job.company?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() ?? 'E'

  if (view === 'list') {
    return (
      <motion.div
        variants={item}
        onHoverStart={() => setHovered(true)}
        onHoverEnd={() => setHovered(false)}
        onClick={() => navigate(`/jobs/${job.id}`)}
        className={cn(
          'group flex cursor-pointer items-center gap-4 rounded-xl border border-border bg-card p-4 transition-all duration-200',
          'hover:border-primary/40 hover:shadow-[var(--shadow-md)] hover:translate-y-[-1px]',
        )}
      >
        <div className="flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
          {initials}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
            {job.isRemote && (
              <Badge variant="secondary" className="shrink-0 bg-accent/10 text-accent text-[10px] font-medium">
                <Wifi className="mr-0.5 size-2.5" />Remote
              </Badge>
            )}
          </div>
          <div className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
            <span className="font-medium">{job.company}</span>
            <span className="flex items-center gap-1"><MapPin className="size-3" />{job.location}</span>
            {job.contractType && <span>{job.contractType}</span>}
            {salaryText && <span className="font-semibold text-accent">{salaryText}</span>}
          </div>
        </div>

        <div className="hidden items-center gap-3 sm:flex">
          <RelevanceCircle score={score} size={42} />
          <span className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
            <Clock className="size-3" />
            {formatDistanceToNow(new Date(job.postedAt || job.createdAt), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" size="icon" className="size-8" onClick={handleSave}>
            <Bookmark className={cn('size-4 transition-colors', job.isSaved && 'fill-primary text-primary')} />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={handleShare}>
            <Share2 className="size-4" />
          </Button>
          {hovered && !isApplied && (
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.15 }}>
              <Button size="sm" className="h-8 px-3" onClick={handleApplyClick}>
                Postuler
              </Button>
            </motion.div>
          )}
        </div>
      </motion.div>
    )
  }

  return (
    <motion.div
      variants={item}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={() => navigate(`/jobs/${job.id}`)}
      className={cn(
        'group flex cursor-pointer flex-col rounded-xl border border-border bg-card p-5 transition-all duration-200',
        'hover:border-primary/40 hover:shadow-[var(--shadow-md)] hover:translate-y-[-2px]',
      )}
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
            {initials}
          </div>
          <div className="min-w-0">
            <h3 className="truncate text-sm font-semibold group-hover:text-primary transition-colors">{job.title}</h3>
            <p className="truncate text-xs text-muted-foreground">{job.company}</p>
          </div>
        </div>
        <RelevanceCircle score={score} />
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        <Badge
          variant="secondary"
          className={cn('text-[10px] font-semibold', sourceColors[job.source] || sourceColors.autre)}
        >
          {sourceLabels[job.source] || job.source}
        </Badge>
        {job.contractType && (
          <Badge variant="secondary" className={cn('text-[10px] font-medium', contractColors[job.contractType])}>
            {job.contractType}
          </Badge>
        )}
        {job.isRemote && (
          <Badge variant="secondary" className="bg-accent/10 text-accent text-[10px] font-medium">
            <Wifi className="mr-0.5 size-2.5" />Remote
          </Badge>
        )}
        {isApplied && (
          <Badge variant="secondary" className="bg-accent/10 text-accent text-[10px] font-medium">
            <CheckCircle className="mr-0.5 size-2.5" />Postulé
          </Badge>
        )}
      </div>

      <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-muted-foreground">
        <span className="flex items-center gap-1">
          <MapPin className="size-3 shrink-0" />{job.location}
        </span>
        {salaryText && (
          <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-semibold text-accent">
            {salaryText}
          </span>
        )}
      </div>

      <div className="mt-auto flex items-center justify-between border-t border-border pt-3">
        <span className="flex items-center gap-1 text-xs text-muted-foreground">
          <Clock className="size-3" />
          {formatDistanceToNow(new Date(job.postedAt || job.createdAt), { addSuffix: true, locale: fr })}
        </span>

        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="size-8"
            onClick={handleSave}
            aria-label={job.isSaved ? 'Retirer des favoris' : 'Ajouter aux favoris'}
          >
            <Bookmark className={cn('size-4 transition-colors', job.isSaved && 'fill-primary text-primary')} />
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={handleShare} aria-label="Partager">
            <Share2 className="size-4" />
          </Button>
          {hovered && !isApplied && (
            <motion.div initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.15 }}>
              <Button size="sm" className="h-8 px-3" onClick={handleApplyClick}>
                Postuler
              </Button>
            </motion.div>
          )}
        </div>
      </div>
    </motion.div>
  )
}
