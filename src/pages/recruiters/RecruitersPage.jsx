import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  MapPin,
  Bookmark,
  Users,
  ExternalLink,
  StickyNote,
  X,
  Plus,
  Loader2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react'
import { toast } from 'sonner'

import { useRecruiters, useScrapeRecruiters } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'

const sectors = ['Tous', 'IT', 'Finance', 'Automobile', 'Agriculture', 'BTP', 'Marketing', 'RH']
const locations = ['Toutes', 'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès']
const connectionDegrees = ['Tous', '1st', '2nd', '3rd+']

const connectionColors = {
  '1st': 'bg-accent/10 text-accent',
  '2nd': 'bg-warning/10 text-warning',
  '3rd+': 'bg-muted text-muted-foreground',
}

const avatarColors = [
  'bg-primary',
  'bg-accent',
  'bg-accent',
  'bg-purple-500',
  'bg-pink-500',
  'bg-cyan-500',
  'bg-rose-500',
  'bg-indigo-500',
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

function FilterDropdown({ value, options, onChange }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {options.map((opt) => (
          <SelectItem key={opt} value={opt}>
            {opt}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}

function RecruiterCard({ recruiter, index, navigate }) {
  const [showNotes, setShowNotes] = useState(false)
  const initials = `${(recruiter.firstName || '')[0] || ''}${(recruiter.lastName || '')[0] || ''}`
  const avatarColor = getAvatarColor(`${recruiter.firstName || ''}${recruiter.lastName || ''}`)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: index * 0.05, ease: 'easeOut' }}
      whileHover={{ scale: 1.02, transition: { duration: 0.2 } }}
      className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start gap-4">
        <button
          onClick={() => navigate(`/recruiters/${recruiter.id}`)}
          className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-full text-lg font-bold text-white ${avatarColor}`}
        >
          {initials}
        </button>

        <div className="min-w-0 flex-1">
          <button
            onClick={() => navigate(`/recruiters/${recruiter.id}`)}
            className="text-left"
          >
            <h3 className="text-lg font-bold text-foreground group-hover:text-primary">
              {recruiter.firstName} {recruiter.lastName}
            </h3>
          </button>
          <p className="mt-0.5 text-sm font-medium text-muted-foreground">
            {recruiter.title}
          </p>
          <p className="text-sm text-muted-foreground">
            {recruiter.company}
          </p>

          <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1.5 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <MapPin className="h-3.5 w-3.5" />
              {recruiter.location}
            </span>
            {recruiter.connectionDegree && (
              <Badge variant="secondary" className={`rounded-full ${connectionColors[recruiter.connectionDegree] || 'bg-muted text-muted-foreground'}`}>
                {recruiter.connectionDegree}
              </Badge>
            )}
          </div>
        </div>
      </div>

      {recruiter.tags && recruiter.tags.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-1.5">
          {recruiter.tags.map((tag) => (
            <Badge key={tag} variant="secondary" className="rounded-full bg-muted text-muted-foreground">
              {tag}
            </Badge>
          ))}
        </div>
      )}

      <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-4">
        {recruiter.linkedinUrl && (
          <a
            href={recruiter.linkedinUrl}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
          >
            <Button variant="outline" size="sm">
              <ExternalLink className="h-3.5 w-3.5" />
              Voir LinkedIn
            </Button>
          </a>
        )}

        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
          }}
        >
          <Bookmark className="h-3.5 w-3.5" />
          Favoris
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={(e) => {
            e.stopPropagation()
            setShowNotes(!showNotes)
          }}
        >
          <StickyNote className="h-3.5 w-3.5" />
          Notes
        </Button>
      </div>

      <AnimatePresence>
        {showNotes && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden"
          >
            <div className="mt-3 rounded-xl bg-muted p-4">
              <p className="text-sm leading-relaxed text-muted-foreground">
                {recruiter.notes || 'Aucune note pour ce recruteur.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function RecruiterCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 shrink-0 animate-pulse rounded-full bg-muted" />
        <div className="flex-1 space-y-2">
          <div className="h-5 w-40 animate-pulse rounded bg-muted" />
          <div className="h-4 w-32 animate-pulse rounded bg-muted" />
          <div className="h-4 w-28 animate-pulse rounded bg-muted" />
          <div className="flex gap-2 mt-2">
            <div className="h-4 w-20 animate-pulse rounded bg-muted" />
            <div className="h-5 w-8 animate-pulse rounded-full bg-muted" />
          </div>
        </div>
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

export default function RecruitersPage() {
  const navigate = useNavigate()
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('Tous')
  const [location, setLocation] = useState('Toutes')
  const [connectionDegree, setConnectionDegree] = useState('Tous')
  const [page, setPage] = useState(1)

  const apiFilters = useMemo(() => {
    const filters = { page, limit: 20 }
    if (search.trim()) filters.search = search.trim()
    if (sector !== 'Tous') filters.sector = sector
    if (location !== 'Toutes') filters.location = location
    if (connectionDegree !== 'Tous') filters.connectionDegree = connectionDegree
    return filters
  }, [search, sector, location, connectionDegree, page])

  const { data, isLoading, error, refetch } = useRecruiters(apiFilters)
  const scrapeRecruitersMutation = useScrapeRecruiters()
  const recruiters = data?.recruiters ?? []
  const total = data?.total ?? recruiters.length

  const handleScrape = () => {
    scrapeRecruitersMutation.mutate(undefined, {
      onSuccess: (data) => {
        toast.success(`${data?.newRecruiters ?? 0} nouveaux recruteurs trouvés !`, { duration: 4000 })
        refetch()
      },
      onError: (err) => {
        toast.error(err?.message || 'Erreur lors du scrapping des recruteurs')
      },
    })
  }

  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-destructive/30 bg-destructive/10 py-12">
          <AlertTriangle className="mb-3 h-10 w-10 text-destructive" />
          <h3 className="text-lg font-semibold text-destructive">Erreur de chargement</h3>
          <p className="mt-1 text-sm text-destructive">{error?.message || 'Une erreur est survenue.'}</p>
          <Button variant="destructive" onClick={() => refetch()} className="mt-4">
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
      <motion.div
        variants={item}
        className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between"
      >
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Explorateur de Recruteurs
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gérez et explorez votre réseau de recruteurs
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button
            variant="success"
            onClick={handleScrape}
            disabled={scrapeRecruitersMutation.isPending}
          >
            {scrapeRecruitersMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4" />
            )}
            {scrapeRecruitersMutation.isPending ? 'Scrapping...' : 'Scraper les recruteurs'}
          </Button>
          <Button>
            <Plus className="h-4 w-4" />
            Ajouter un recruteur
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item}>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Rechercher par nom, entreprise, secteur..."
            className="h-12 rounded-xl border-border bg-card pl-12 pr-4 shadow-sm focus-visible:ring-2 focus-visible:ring-ring/20 focus-visible:shadow-[var(--shadow-md)]"
          />
        </div>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <FilterDropdown
          value={sector}
          options={sectors}
          onChange={(v) => { setSector(v); setPage(1) }}
        />
        <FilterDropdown
          value={location}
          options={locations}
          onChange={(v) => { setLocation(v); setPage(1) }}
        />
        <FilterDropdown
          value={connectionDegree}
          options={connectionDegrees}
          onChange={(v) => { setConnectionDegree(v); setPage(1) }}
        />
      </motion.div>

      <motion.div variants={item}>
        <p className="text-sm font-medium text-muted-foreground">
          <span className="font-bold text-foreground">
            {isLoading ? '...' : total}
          </span>{' '}
          {total === 1 ? 'recruteur trouvé' : 'recruteurs trouvés'}
        </p>
      </motion.div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
          {Array.from({ length: 6 }).map((_, i) => (
            <RecruiterCardSkeleton key={i} />
          ))}
        </div>
      ) : recruiters.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 lg:grid-cols-2"
        >
          <AnimatePresence mode="popLayout">
            {recruiters.map((recruiter, index) => (
              <RecruiterCard
                key={recruiter.id}
                recruiter={recruiter}
                index={index}
                navigate={navigate}
              />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-muted py-16"
        >
          <Users className="mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">
            Aucun recruteur trouvé
          </h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez de modifier vos filtres ou votre recherche
          </p>
          {(search || sector !== 'Tous' || location !== 'Toutes' || connectionDegree !== 'Tous') && (
            <Button
              variant="secondary"
              onClick={() => {
                setSearch('')
                setSector('Tous')
                setLocation('Toutes')
                setConnectionDegree('Tous')
                setPage(1)
              }}
              className="mt-4"
            >
              <X className="h-3.5 w-3.5" />
              Réinitialiser les filtres
            </Button>
          )}
        </motion.div>
      )}
    </motion.div>
  )
}
