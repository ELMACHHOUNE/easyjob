import { useState, useMemo } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { toast } from 'sonner'
import {
  Search,
  RefreshCw,
  Loader2,
  AlertTriangle,
  Inbox,
  LayoutGrid,
  List,
  SlidersHorizontal,
  X,
  Briefcase,
  Building2,
  SearchX,
} from 'lucide-react'

import {
  useJobs,
  useToggleSaveJob,
  useRunScraping,
  useApplications,
  useRecruiterJobBoard,
  useApplyToRecruiterJob,
} from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
} from '@/components/ui/sheet'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'
import JobOfferCard from '@/components/jobOffers/JobOfferCard'

const contractTypes = ['Tous', 'CDI', 'CDD', 'Stage', 'Freelance']
const locations = ['Toutes', 'Casablanca', 'Rabat', 'Marrakech', 'Tanger', 'Fès']
const externalSources = [
  { value: 'Toutes', label: 'Toutes' },
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'indeed', label: 'Indeed' },
  { value: 'welcometothejungle', label: 'Welcome to the Jungle' },
  { value: 'rekrute', label: 'Rekrute' },
  { value: 'manpower', label: 'Manpower' },
]
const sortOptions = [
  { value: 'Pertinence', label: 'Pertinence' },
  { value: 'Date', label: 'Date' },
  { value: 'Salaire', label: 'Salaire' },
]

const sourceLabels = {
  linkedin: 'LinkedIn',
  indeed: 'Indeed',
  welcometothejungle: 'Welcome to the Jungle',
  rekrute: 'Rekrute',
  manpower: 'Manpower',
  recruiter: 'Recruteur',
}

const dateOptions = [
  { value: 'all', label: 'Toutes les dates' },
  { value: 'week', label: 'Cette semaine' },
  { value: 'month', label: 'Ce mois' },
  { value: 'year', label: 'Cette année' },
]

function FilterChip({ label, onRemove }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.15 }}
    >
      <Badge variant="secondary" className="gap-1.5 pr-1.5 text-xs font-medium">
        {label}
        <button
          onClick={onRemove}
          className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-foreground/10"
          aria-label={`Retirer le filtre ${label}`}
        >
          <X className="size-3" />
        </button>
      </Badge>
    </motion.div>
  )
}

function JobCardSkeleton({ view }) {
  if (view === 'list') {
    return (
      <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-4">
        <Skeleton className="size-11 rounded-lg" />
        <div className="flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-4 w-14 rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-28" />
          </div>
        </div>
        <Skeleton className="size-[34px] rounded-full" />
        <Skeleton className="h-3 w-20" />
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="space-y-1.5">
            <Skeleton className="h-4 w-36" />
            <Skeleton className="h-3 w-24" />
          </div>
        </div>
        <Skeleton className="size-10 rounded-full" />
      </div>
      <div className="mb-3 flex gap-1.5">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-5 w-14 rounded-full" />
        <Skeleton className="h-5 w-12 rounded-full" />
      </div>
      <div className="flex gap-4">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="mt-4 border-t border-border pt-3">
        <Skeleton className="h-3 w-28" />
      </div>
    </div>
  )
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}

export default function JobOffersPage() {
  const [activeTab, setActiveTab] = useState('external')
  const [view, setView] = useState('grid')

  const [search, setSearch] = useState('')
  const [contractType, setContractType] = useState('Tous')
  const [location, setLocation] = useState('Toutes')
  const [source, setSource] = useState('Toutes')
  const [sort, setSort] = useState('Pertinence')
  const [page, setPage] = useState(1)

  const [sheetOpen, setSheetOpen] = useState(false)
  const [salaryRange, setSalaryRange] = useState([0, 50000])
  const [remoteOnly, setRemoteOnly] = useState(false)
  const [datePosted, setDatePosted] = useState('all')

  const apiFilters = useMemo(() => {
    const filters = { page, limit: 20 }
    if (search.trim()) filters.search = search.trim()
    if (contractType !== 'Tous') filters.contractType = contractType
    if (location !== 'Toutes') filters.location = location
    if (activeTab === 'external') {
      if (source !== 'Toutes') filters.source = source
      if (sort === 'Date') filters.sort = 'date'
      else if (sort === 'Salaire') filters.sort = 'salary'
      else filters.sort = 'relevance'
    }
    if (activeTab === 'internal') {
      filters.matched = 'true'
      filters.limit = 50
    }
    return filters
  }, [search, contractType, location, source, sort, page, activeTab])

  const externalQuery = useJobs(activeTab === 'external' ? apiFilters : undefined, { enabled: activeTab === 'external' })
  const boardQuery = useRecruiterJobBoard(activeTab === 'internal' ? apiFilters : undefined, { enabled: activeTab === 'internal' })
  const { data, isLoading, error, refetch } = activeTab === 'external' ? externalQuery : boardQuery

const toggleSave = useToggleSaveJob()
  const runScraping = useRunScraping()
  const applyToRecruiter = useApplyToRecruiterJob()
  const { data: appsData } = useApplications({})

  const offers = data?.jobs ?? []
  const total = data?.total ?? 0
  const pages = data?.pages ?? 1

  const appliedJobIds = useMemo(() => {
    const ids = new Set()
    if (appsData?.applications) {
      appsData.applications.forEach(a => {
        if (a.jobOfferId?._id) ids.add(a.jobOfferId._id)
        else if (a.jobOfferId) ids.add(a.jobOfferId)
      })
    }
    return ids
  }, [appsData])

  const activeChips = useMemo(() => {
    const chips = []
    if (search.trim()) chips.push({ key: 'search', label: `« ${search.trim()} »`, clear: () => setSearch('') })
    if (source !== 'Toutes') chips.push({ key: 'source', label: sourceLabels[source], clear: () => setSource('Toutes') })
    if (contractType !== 'Tous') chips.push({ key: 'contract', label: contractType, clear: () => setContractType('Tous') })
    if (location !== 'Toutes') chips.push({ key: 'location', label: location, clear: () => setLocation('Toutes') })
    if (remoteOnly) chips.push({ key: 'remote', label: 'Remote', clear: () => setRemoteOnly(false) })
    if (salaryRange[0] > 0 || salaryRange[1] < 50000) chips.push({ key: 'salary', label: `Salaire ${salaryRange[0].toLocaleString()} – ${salaryRange[1].toLocaleString()}`, clear: () => setSalaryRange([0, 50000]) })
    if (datePosted !== 'all') chips.push({ key: 'date', label: dateOptions.find(d => d.value === datePosted)?.label, clear: () => setDatePosted('all') })
    return chips
  }, [search, source, contractType, location, remoteOnly, salaryRange, datePosted])

  const handleSave = (id) => toggleSave.mutate(id)
  const handleScraping = () => runScraping.mutate(undefined, { onSuccess: () => refetch() })
  const handleApplyInternal = (jobId) => {
    applyToRecruiter.mutate({ jobId }, {
      onSuccess: () => toast.success('Candidature envoyée !'),
      onError: (err) => toast.error(err?.message || 'Erreur'),
    })
  }

  const clearAllFilters = () => {
    setSearch('')
    setContractType('Tous')
    setLocation('Toutes')
    setSource('Toutes')
    setSalaryRange([0, 50000])
    setRemoteOnly(false)
    setDatePosted('all')
    setPage(1)
  }

  const handleTabChange = (key) => {
    setActiveTab(key)
    setPage(1)
    clearAllFilters()
  }

  const paginationItems = useMemo(() => {
    if (pages <= 7) return Array.from({ length: pages }, (_, i) => i + 1)
    const items = []
    items.push(1)
    if (page > 3) items.push('...')
    for (let i = Math.max(2, page - 1); i <= Math.min(pages - 1, page + 1); i++) {
      items.push(i)
    }
    if (page < pages - 2) items.push('...')
    items.push(pages)
    return items
  }, [page, pages])

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <div className="flex size-14 items-center justify-center rounded-full bg-destructive/10">
          <AlertTriangle className="size-7 text-destructive" />
        </div>
        <div>
          <h3 className="text-base font-semibold">Une erreur est survenue</h3>
          <p className="mt-1 text-sm text-muted-foreground">{error?.message || 'Impossible de charger les offres.'}</p>
        </div>
        <Button variant="outline" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">Offres d'emploi</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {activeTab === 'external'
              ? 'Offres importées depuis les plateformes externes'
              : 'Offres internes publiées par les recruteurs'}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/applications">
              <Inbox className="mr-2 size-4" />
              Mes candidatures
            </Link>
          </Button>
          {activeTab === 'external' && (
            <Button size="sm" onClick={handleScraping} disabled={runScraping.isPending}>
              {runScraping.isPending ? (
                <Loader2 className="mr-2 size-4 animate-spin" />
              ) : (
                <RefreshCw className="mr-2 size-4" />
              )}
              {runScraping.isPending ? 'Scrapping...' : 'Lancer le scrapping'}
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-border bg-muted/40 p-1">
        {[
          { key: 'external', label: 'Offres externes', icon: Briefcase },
          { key: 'internal', label: 'Offres internes', icon: Building2 },
        ].map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.key
          return (
            <button
              key={tab.key}
              onClick={() => handleTabChange(tab.key)}
              className={`relative flex flex-1 items-center justify-center gap-2 whitespace-nowrap rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="jobTab"
                  className="absolute inset-0 rounded-lg bg-background shadow-sm"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <Icon className="relative z-10 size-4" />
              <span className="relative z-10">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Sticky filter bar */}
      <div className="sticky top-16 z-20 space-y-3 rounded-xl border border-border bg-background/80 p-3 backdrop-blur-sm">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1) }}
              placeholder="Rechercher par titre, entreprise, mot-clé..."
              className="h-10 pl-9"
            />
          </div>
          <Button variant="outline" size="sm" className="gap-2" onClick={() => setSheetOpen(true)}>
            <SlidersHorizontal className="size-4" />
            <span className="hidden sm:inline">Filtres avancés</span>
          </Button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <Select value={contractType} onValueChange={(v) => { setContractType(v); setPage(1) }}>
            <SelectTrigger className="h-8 w-auto text-xs">
              <SelectValue placeholder="Contrat" />
            </SelectTrigger>
            <SelectContent>
              {contractTypes.map((t) => (
                <SelectItem key={t} value={t}>{t === 'Tous' ? 'Tous les contrats' : t}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={location} onValueChange={(v) => { setLocation(v); setPage(1) }}>
            <SelectTrigger className="h-8 w-auto text-xs">
              <SelectValue placeholder="Lieu" />
            </SelectTrigger>
            <SelectContent>
              {locations.map((l) => (
                <SelectItem key={l} value={l}>{l === 'Toutes' ? 'Tous les lieux' : l}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          {activeTab === 'external' && (
            <>
              <Select value={source} onValueChange={(v) => { setSource(v); setPage(1) }}>
                <SelectTrigger className="h-8 w-auto text-xs">
                  <SelectValue placeholder="Source" />
                </SelectTrigger>
                <SelectContent>
                  {externalSources.map((s) => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={sort} onValueChange={setSort}>
                <SelectTrigger className="h-8 w-auto text-xs">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((s) => (
                    <SelectItem key={s.value} value={s.value}>Trier : {s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
        </div>

        <AnimatePresence mode="popLayout">
          {activeChips.length > 0 && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex flex-wrap items-center gap-1.5 overflow-hidden"
            >
              <AnimatePresence mode="popLayout">
                {activeChips.map((chip) => (
                  <FilterChip key={chip.key} label={chip.label} onRemove={chip.clear} />
                ))}
              </AnimatePresence>
              <button
                onClick={clearAllFilters}
                className="text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Tout effacer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Results bar */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">{isLoading ? '...' : total}</span>{' '}
          {total === 1 ? 'offre trouvée' : 'offres trouvées'}
        </p>
        <div className="flex items-center gap-1 rounded-lg border border-border bg-muted/40 p-0.5">
          <button
            onClick={() => setView('grid')}
            className={`flex size-7 items-center justify-center rounded-md transition-colors ${view === 'grid' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Vue grille"
          >
            <LayoutGrid className="size-3.5" />
          </button>
          <button
            onClick={() => setView('list')}
            className={`flex size-7 items-center justify-center rounded-md transition-colors ${view === 'list' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            aria-label="Vue liste"
          >
            <List className="size-3.5" />
          </button>
        </div>
      </div>

      {/* Job grid/list */}
      {isLoading ? (
        <div className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}>
          {Array.from({ length: 6 }).map((_, i) => <JobCardSkeleton key={i} view={view} />)}
        </div>
      ) : offers.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className={view === 'grid' ? 'grid gap-4 sm:grid-cols-2 lg:grid-cols-3' : 'space-y-2'}
        >
          {offers.map((job) => (
            <JobOfferCard
              key={job.id}
              job={job}
              view={view}
              onSave={handleSave}
              onApply={activeTab === 'internal' ? handleApplyInternal : undefined}
              appliedIds={appliedJobIds}
              isApplying={applyToRecruiter.isPending}
            />
          ))}
        </motion.div>
      ) : (
        !error && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-20"
          >
            <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted/60">
              <SearchX className="size-8 text-muted-foreground/50" />
            </div>
            <h3 className="text-base font-semibold">Aucune offre trouvée</h3>
            <p className="mt-1.5 max-w-sm text-center text-sm text-muted-foreground">
              {activeTab === 'external'
                ? 'Essayez de modifier vos filtres ou lancez un scraping pour découvrir de nouvelles offres.'
                : 'Les offres sont classées selon votre profil. Complétez votre profil pour en voir davantage.'}
            </p>
            {activeTab === 'external' && (
              <Button variant="outline" size="sm" className="mt-5" onClick={handleScraping} disabled={runScraping.isPending}>
                {runScraping.isPending ? <Loader2 className="mr-2 size-4 animate-spin" /> : <RefreshCw className="mr-2 size-4" />}
                Lancer le scraping
              </Button>
            )}
          </motion.div>
        )
      )}

      {/* Pagination */}
      {pages > 1 && (
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                text="Précédent"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
            {paginationItems.map((item, i) =>
              item === '...' ? (
                <PaginationItem key={`ellipsis-${i}`}>
                  <span className="px-2 text-muted-foreground">...</span>
                </PaginationItem>
              ) : (
                <PaginationItem key={item}>
                  <PaginationLink
                    isActive={page === item}
                    onClick={() => setPage(item)}
                    className="cursor-pointer"
                  >
                    {item}
                  </PaginationLink>
                </PaginationItem>
              )
            )}
            <PaginationItem>
              <PaginationNext
                text="Suivant"
                onClick={() => setPage((p) => Math.min(pages, p + 1))}
                className={page === pages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* Advanced filters sheet */}
      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent className="sm:max-w-md">
          <SheetHeader>
            <SheetTitle>Filtres avancés</SheetTitle>
            <SheetDescription>Affinez votre recherche avec des filtres supplémentaires.</SheetDescription>
          </SheetHeader>

          <div className="space-y-6 py-6">
            <div className="space-y-3">
              <Label className="text-sm font-medium">Fourchette de salaire (MAD/mois)</Label>
              <Slider
                value={salaryRange}
                onValueChange={setSalaryRange}
                min={0}
                max={50000}
                step={1000}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{salaryRange[0].toLocaleString('fr-MA')}</span>
                <span>{salaryRange[1].toLocaleString('fr-MA')}</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium">Remote uniquement</Label>
                <p className="text-xs text-muted-foreground">Afficher uniquement les offres en télétravail</p>
              </div>
              <Switch checked={remoteOnly} onCheckedChange={setRemoteOnly} />
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-medium">Date de publication</Label>
              <div className="grid grid-cols-2 gap-2">
                {dateOptions.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setDatePosted(opt.value)}
                    className={`rounded-lg border px-3 py-2 text-xs font-medium transition-colors ${
                      datePosted === opt.value
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-border text-muted-foreground hover:bg-muted/60'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <SheetFooter>
            <Button variant="outline" onClick={clearAllFilters}>Réinitialiser</Button>
            <Button onClick={() => { setPage(1); setSheetOpen(false) }}>Appliquer</Button>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  )
}
