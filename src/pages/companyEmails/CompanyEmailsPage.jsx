import { useState, useMemo, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Search,
  Mail,
  Globe,
  Phone,
  MapPin,
  Building2,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  Filter,
  X,
  Building,
  Users,
  Briefcase,
  GraduationCap,
  Factory,
  Landmark,
  Rocket,
  Shield,
  MailCheck,
  Copy,
  Check,
} from 'lucide-react'

import { useCompanyEmails, useCompanyEmailFilters } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'

const companyTypeLabels = {
  multinationale: 'Multinationale',
  publique: 'Entreprise publique',
  privee: 'Entreprise privée',
  startup: 'Startup',
  pme: 'PME',
  cabinet: 'Cabinet',
  ong: 'ONG',
}

const companyTypeIcons = {
  multinationale: Globe,
  publique: Landmark,
  privee: Building2,
  startup: Rocket,
  pme: Building,
  cabinet: Briefcase,
  ong: Shield,
}

const companyTypeColors = {
  multinationale: 'bg-primary/10 text-primary',
  publique: 'bg-accent/10 text-accent',
  privee: 'bg-muted text-muted-foreground',
  startup: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  pme: 'bg-warning/10 text-warning',
  cabinet: 'bg-destructive/10 text-destructive',
  ong: 'bg-[#0EA5E9]/10 text-[#0EA5E9]',
}

const sizeLabels = {
  '1-10': '1-10',
  '11-50': '11-50',
  '51-200': '51-200',
  '201-500': '201-500',
  '501-1000': '501-1000',
  '1000+': '1000+',
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.05 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: 'easeOut' } },
}

function FilterDropdown({ value, options, onChange, label, icon: Icon, labelMap }) {
  return (
    <div className="space-y-1.5">
      <label className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground">
        {Icon && <Icon className="size-3" />}
        {label}
      </label>
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger className="w-full">
          <SelectValue placeholder="Tous" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Tous</SelectItem>
          {options.map((opt) => (
            <SelectItem key={opt} value={opt}>
              {labelMap ? (labelMap[opt] || opt) : opt}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

function getWebsiteUrl(url) {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://')) return url
  return `https://${url}`
}

function getWebsiteDomain(url) {
  if (!url) return ''
  const full = getWebsiteUrl(url)
  try {
    return new URL(full).hostname
  } catch {
    return url.replace(/^https?:\/\//, '').split('/')[0]
  }
}

function CopyEmailButton({ email }) {
  const [copied, setCopied] = useState(false)
  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(email)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      const ta = document.createElement('textarea')
      ta.value = email
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }, [email])
  return (
    <Button
      variant={copied ? 'success' : 'outline'}
      size="sm"
      className="h-7 px-2.5 text-xs"
      onClick={handleCopy}
      aria-label="Copier l'email"
    >
      {copied ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}
      {copied ? 'Copié !' : 'Copier'}
    </Button>
  )
}

function CompanyCard({ company, index }) {
  const TypeIcon = companyTypeIcons[company.companyType] || Building2
  const typeColor = companyTypeColors[company.companyType] || companyTypeColors.privee
  const typeLabel = companyTypeLabels[company.companyType] || company.companyType
  const websiteUrl = getWebsiteUrl(company.website)
  const websiteDomain = getWebsiteDomain(company.website)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10, transition: { duration: 0.2 } }}
      transition={{ duration: 0.4, delay: index * 0.03, ease: 'easeOut' }}
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]"
    >
      <div className="flex items-start gap-4">
        <div className="flex size-14 shrink-0 items-center justify-center rounded-xl bg-primary/10">
          <TypeIcon className="size-6 text-primary" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-base font-bold text-foreground group-hover:text-primary">
            {company.companyName}
          </h3>
          <div className="mt-1 flex flex-wrap items-center gap-2">
            <Badge variant="secondary" className={`rounded-full ${typeColor}`}>
              <TypeIcon className="mr-1 size-3" />
              {typeLabel}
            </Badge>
            <span className="text-xs text-muted-foreground">
              {sizeLabels[company.companySize] || company.companySize} employés
            </span>
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-2.5">
        <div className="flex items-center gap-2 rounded-lg bg-primary/5 px-3 py-2">
          <MailCheck className="size-4 shrink-0 text-primary" />
          <a
            href={`mailto:${company.email}?subject=Candidature spontanée - EasyJob`}
            className="flex-1 truncate text-sm font-semibold text-primary hover:underline"
          >
            {company.email}
          </a>
          <CopyEmailButton email={company.email} />
        </div>

        {company.phone && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Phone className="size-4 shrink-0" />
            <a href={`tel:${company.phone}`} className="hover:text-primary hover:underline">
              {company.phone}
            </a>
          </div>
        )}

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Building2 className="size-4 shrink-0" />
          <span>{company.sector}</span>
        </div>

        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <MapPin className="size-4 shrink-0" />
          <span>{company.city}, {company.country}</span>
        </div>

        {websiteDomain && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Globe className="size-4 shrink-0" />
            <a
              href={websiteUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-primary hover:underline"
            >
              {websiteDomain}
              <ExternalLink className="size-3" />
            </a>
          </div>
        )}
      </div>

      {company.description && (
        <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
          {company.description}
        </p>
      )}

      <div className="mt-4 flex gap-2 border-t border-border pt-4">
        <a
          href={`mailto:${company.email}?subject=Candidature spontanée - EasyJob`}
          className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <Mail className="size-4" />
          Envoyer un email
        </a>
        {company.website && (
          <a
            href={websiteUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-1.5 rounded-lg border border-border bg-card px-4 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted"
          >
            <ExternalLink className="size-4" />
          </a>
        )}
      </div>
    </motion.div>
  )
}

function CompanyCardSkeleton() {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm">
      <div className="flex items-start gap-4">
        <Skeleton className="size-14 shrink-0 rounded-xl" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-4 w-28" />
        </div>
      </div>
      <div className="mt-4 space-y-2.5">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-4 w-36" />
      </div>
    </div>
  )
}

export default function CompanyEmailsPage() {
  const [search, setSearch] = useState('')
  const [sector, setSector] = useState('')
  const [domain, setDomain] = useState('')
  const [companyType, setCompanyType] = useState('')
  const [companySize, setCompanySize] = useState('')
  const [city, setCity] = useState('')
  const [page, setPage] = useState(1)
  const [showFilters, setShowFilters] = useState(true)

  const apiFilters = useMemo(() => {
    const filters = { page, limit: 30 }
    if (search.trim()) filters.search = search.trim()
    if (sector) filters.sector = sector
    if (domain) filters.domain = domain
    if (companyType) filters.companyType = companyType
    if (companySize) filters.companySize = companySize
    if (city) filters.city = city
    return filters
  }, [search, sector, domain, companyType, companySize, city, page])

  const { data, isLoading } = useCompanyEmails(apiFilters)
  const { data: filtersData } = useCompanyEmailFilters()
  const companies = data?.companies ?? []
  const total = data?.total ?? 0

  const hasActiveFilters = sector || domain || companyType || companySize || city

  const clearFilters = () => {
    setSector('')
    setDomain('')
    setCompanyType('')
    setCompanySize('')
    setCity('')
    setPage(1)
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-6 overflow-x-clip"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Annuaire d'entreprises
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Trouvez les emails des entreprises et recruteurs au Maroc
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={showFilters ? 'default' : 'outline'}
            size="sm"
            className="gap-2"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="size-4" />
            Filtres
          </Button>
        </div>
      </motion.div>

      {/* Search Bar */}
      <motion.div variants={item}>
        <div className="relative">
          <Search className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="text"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
            placeholder="Rechercher par nom d'entreprise, email, secteur..."
            className="h-12 rounded-xl pl-12"
          />
        </div>
      </motion.div>

      {/* Filters */}
      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-5">
              <FilterDropdown
                value={sector}
                options={filtersData?.sectors || []}
                onChange={(v) => { setSector(v); setPage(1) }}
                label="Secteur"
                icon={Briefcase}
              />
              <FilterDropdown
                value={domain}
                options={filtersData?.domains || []}
                onChange={(v) => { setDomain(v); setPage(1) }}
                label="Domaine"
                icon={GraduationCap}
              />
              <FilterDropdown
                value={companyType}
                options={filtersData?.types || []}
                onChange={(v) => { setCompanyType(v); setPage(1) }}
                label="Type"
                icon={Factory}
                labelMap={companyTypeLabels}
              />
              <FilterDropdown
                value={companySize}
                options={filtersData?.sizes || []}
                onChange={(v) => { setCompanySize(v); setPage(1) }}
                label="Taille"
                icon={Users}
                labelMap={sizeLabels}
              />
              <FilterDropdown
                value={city}
                options={filtersData?.cities || []}
                onChange={(v) => { setCity(v); setPage(1) }}
                label="Ville"
                icon={MapPin}
              />
            </div>
            {hasActiveFilters && (
              <div className="mt-3 flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                  onClick={clearFilters}
                >
                  <X className="size-3" />
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results Count */}
      <motion.div variants={item}>
        <p className="text-sm text-muted-foreground">
          <span className="font-semibold text-foreground">
            {isLoading ? '...' : total}
          </span>{' '}
          {total === 1 ? 'entreprise trouvée' : 'entreprises trouvées'}
        </p>
      </motion.div>

      {/* Companies Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 9 }).map((_, i) => (
            <CompanyCardSkeleton key={i} />
          ))}
        </div>
      ) : companies.length > 0 ? (
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3"
        >
          <AnimatePresence mode="popLayout">
            {companies.map((company, index) => (
              <CompanyCard key={company._id} company={company} index={index} />
            ))}
          </AnimatePresence>
        </motion.div>
      ) : (
        <motion.div
          variants={item}
          className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-background py-16"
        >
          <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted/60">
            <Building2 className="size-7 text-muted-foreground/50" />
          </div>
          <h3 className="text-base font-semibold">Aucune entreprise trouvée</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Essayez de modifier vos filtres ou votre recherche
          </p>
          {hasActiveFilters && (
            <Button
              variant="outline"
              size="sm"
              className="mt-4 gap-1.5"
              onClick={clearFilters}
            >
              <X className="size-3.5" />
              Réinitialiser les filtres
            </Button>
          )}
        </motion.div>
      )}

      {/* Pagination */}
      {data && data.pages > 1 && (
        <motion.div variants={item} className="flex flex-col items-center gap-3">
          <p className="text-xs text-muted-foreground">
            Page {page} sur {data.pages} — {total} entreprises
          </p>
          <div className="flex items-center gap-1.5">
            <Button
              variant="outline"
              size="sm"
              className="gap-1 px-3"
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
            >
              <ChevronLeft className="size-4" />
              Préc.
            </Button>
            {Array.from({ length: Math.min(data.pages, 7) }, (_, i) => {
              let pageNum
              if (data.pages <= 7) {
                pageNum = i + 1
              } else if (page <= 4) {
                pageNum = i + 1
              } else if (page >= data.pages - 3) {
                pageNum = data.pages - 6 + i
              } else {
                pageNum = page - 3 + i
              }
              return (
                <Button
                  key={pageNum}
                  variant={pageNum === page ? 'default' : 'outline'}
                  size="icon"
                  className="size-10"
                  onClick={() => setPage(pageNum)}
                >
                  {pageNum}
                </Button>
              )
            })}
            <Button
              variant="outline"
              size="sm"
              className="gap-1 px-3"
              onClick={() => setPage(Math.min(data.pages, page + 1))}
              disabled={page === data.pages}
            >
              Suiv.
              <ChevronRight className="size-4" />
            </Button>
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}