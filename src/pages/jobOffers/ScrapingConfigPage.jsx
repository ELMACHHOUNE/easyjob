import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Play,
  Loader2,
  Briefcase,
  Globe,
  TreePine,
  Search,
  Users,
  Clock,
  CheckCircle2,
  XCircle,
  Settings2,
  Zap,
} from 'lucide-react'
import { toast } from 'sonner'

import { useRunScraping, useScrapingLogs } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

const initialPlatforms = [
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Briefcase,
    description: 'Offres d\'emploi professionnelles et réseau social',
    enabled: true,
    keywords: 'React, Node.js, TypeScript',
    color: 'bg-blue-500',
    lightBg: 'bg-blue-50 dark:bg-blue-500/10',
    lightText: 'text-blue-600 dark:text-blue-400',
  },
  {
    id: 'indeed',
    name: 'Indeed',
    icon: Search,
    description: 'La plus grande plateforme de recherche d\'emploi',
    enabled: true,
    keywords: 'Full Stack, Frontend, Backend',
    color: 'bg-green-500',
    lightBg: 'bg-green-50 dark:bg-green-500/10',
    lightText: 'text-green-600 dark:text-green-400',
  },
  {
    id: 'welcometothejungle',
    name: 'Welcome to the Jungle',
    icon: TreePine,
    description: 'Offres qualifiées dans la tech et l\'innovation',
    enabled: true,
    keywords: 'Tech, Startup, Innovation',
    color: 'bg-purple-500',
    lightBg: 'bg-purple-50 dark:bg-purple-500/10',
    lightText: 'text-purple-600 dark:text-purple-400',
  },
  {
    id: 'rekrute',
    name: 'Rekrute',
    icon: Users,
    description: 'Plateforme marocaine de recrutement spécialisé',
    enabled: true,
    keywords: 'CDI, Ingénieur, Chef de projet',
    color: 'bg-orange-500',
    lightBg: 'bg-orange-50 dark:bg-orange-500/10',
    lightText: 'text-orange-600 dark:text-orange-400',
  },
  {
    id: 'manpower',
    name: 'Manpower',
    icon: Globe,
    description: 'Recrutement et solutions de travail temporaire',
    enabled: false,
    keywords: 'Intérim, Contractuel, Cadre',
    color: 'bg-red-500',
    lightBg: 'bg-red-50 dark:bg-red-500/10',
    lightText: 'text-red-600 dark:text-red-400',
  },
]

export default function ScrapingConfigPage() {
  const navigate = useNavigate()
  const [platforms, setPlatforms] = useState(initialPlatforms)
  const [autoEnabled, setAutoEnabled] = useState(true)
  const [frequency, setFrequency] = useState('quotidien')
  const [scrapeTime, setScrapeTime] = useState('22:00')

  const runScraping = useRunScraping()
  const { data: logsData, isLoading: logsLoading } = useScrapingLogs()
  const historyEntries = logsData?.logs ?? []

  const handleScrape = () => {
    const enabledSources = platforms.filter(p => p.enabled).map(p => p.id)
    const allKeywords = platforms.filter(p => p.enabled).flatMap(p => p.keywords.split(',').map(k => k.trim()).filter(Boolean))
    
    runScraping.mutate(
      { keywords: allKeywords.length > 0 ? allKeywords : undefined, sources: enabledSources.length > 0 ? enabledSources : undefined },
      {
        onSuccess: (data) => {
          toast.success(`Scrapping terminé ! ${data?.jobsFound ?? 0} nouvelles offres trouvées`, { duration: 4000 })
        },
        onError: (err) => {
          toast.error(err?.response?.data?.error || err?.message || 'Erreur lors du scrapping')
        },
      }
    )
  }

  const togglePlatform = (id) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, enabled: !p.enabled } : p))
    )
  }

  const updateKeywords = (id, keywords) => {
    setPlatforms((prev) =>
      prev.map((p) => (p.id === id ? { ...p, keywords } : p))
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/jobs')}
          className="gap-2 text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux offres
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Configuration du Scrapping
          </h1>
          <p className="mt-1 text-muted-foreground">
            Collectez jusqu'à 100 offres d'emploi par lancement
          </p>
        </div>
        <Button
          onClick={handleScrape}
          disabled={runScraping.isPending}
          className="gap-2.5 px-6 py-3.5"
        >
          {runScraping.isPending ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <Play className="h-5 w-5" />
          )}
          {runScraping.isPending ? 'Scrapping en cours...' : 'Lancer maintenant'}
        </Button>
      </motion.div>

      {/* Platform Cards */}
      <motion.div variants={item}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Settings2 className="h-5 w-5 text-primary" />
          Sources configurées
        </h2>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {platforms.map((platform) => {
            const Icon = platform.icon
            return (
              <motion.div
                key={platform.id}
                variants={item}
                whileHover={{ y: -2, transition: { duration: 0.2 } }}
                className={`rounded-xl border bg-card p-5 shadow-sm transition-all ${
                  platform.enabled
                    ? 'border-border hover:shadow-[var(--shadow-md)]'
                    : 'border-border opacity-60'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`rounded-lg p-2.5 ${platform.lightBg}`}>
                      <Icon className={`h-5 w-5 ${platform.lightText}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">
                        {platform.name}
                      </h3>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {platform.description}
                      </p>
                    </div>
                  </div>
                  <Switch
                    checked={platform.enabled}
                    onCheckedChange={() => togglePlatform(platform.id)}
                  />
                </div>

                <div className="mt-4 space-y-3">
                  <div>
                    <Label className="mb-1 block text-xs font-medium text-muted-foreground">
                      Mots-clés personnalisés
                    </Label>
                    <Input
                      type="text"
                      value={platform.keywords}
                      onChange={(e) => updateKeywords(platform.id, e.target.value)}
                      placeholder="Ex: React, Node.js..."
                      className="h-auto bg-muted px-3 py-2 text-foreground"
                    />
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    Dernier scrapping :
                    <span className="font-medium text-foreground">
                      Jamais
                    </span>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Scraping History */}
      <motion.div variants={item}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Clock className="h-5 w-5 text-accent" />
          Historique des scrappings
        </h2>
        <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
          {logsLoading ? (
            <div className="space-y-4 p-6">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="h-4 w-40 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-16 animate-pulse rounded bg-muted" />
                  <div className="h-4 w-8 animate-pulse rounded bg-muted" />
                  <div className="h-6 w-20 animate-pulse rounded-full bg-muted" />
                </div>
              ))}
            </div>
          ) : historyEntries.length > 0 ? (
            <>
              {/* Desktop Table */}
              <div className="hidden md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted">
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Date
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Durée
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Offres trouvées
                      </th>
                      <th className="px-6 py-3.5 text-left text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Statut
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {historyEntries.map((entry, index) => {
                      const duration = entry.duration || (entry.startedAt && entry.completedAt
                        ? `${Math.round((new Date(entry.completedAt) - new Date(entry.startedAt)) / 1000)}s`
                        : '—')
                      return (
                      <motion.tr
                        key={entry._id}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: index * 0.05 }}
                        className="transition-colors hover:bg-muted"
                      >
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-medium text-foreground">
                          {new Date(entry.startedAt || entry.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm text-muted-foreground">
                          {duration}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4 text-sm font-semibold text-foreground">
                          {entry.totalOffersFound ?? entry.offersFound ?? 0}
                        </td>
                        <td className="whitespace-nowrap px-6 py-4">
                          {entry.status === 'success' ? (
                            <Badge
                              variant="secondary"
                              className="inline-flex items-center gap-1.5 rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent"
                            >
                              <CheckCircle2 className="h-3 w-3" />
                              Succès
                            </Badge>
                          ) : (
                            <Badge
                              variant="secondary"
                              className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-semibold text-destructive"
                            >
                              <XCircle className="h-3 w-3" />
                              Échec
                            </Badge>
                          )}
                        </td>
                      </motion.tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Mobile Cards */}
              <div className="md:hidden divide-y divide-border">
                {historyEntries.map((entry, index) => {
                  const duration = entry.duration || (entry.startedAt && entry.completedAt
                    ? `${Math.round((new Date(entry.completedAt) - new Date(entry.startedAt)) / 1000)}s`
                    : '—')
                  return (
                  <motion.div
                    key={entry._id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: index * 0.05 }}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {new Date(entry.startedAt || entry.createdAt).toLocaleDateString('fr-FR', {
                            day: 'numeric',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Durée : {duration}
                        </p>
                      </div>
                      {entry.status === 'success' ? (
                        <Badge
                          variant="secondary"
                          className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-0.5 text-xs font-semibold text-accent"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          Succès
                        </Badge>
                      ) : (
                        <Badge
                          variant="secondary"
                          className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2.5 py-0.5 text-xs font-semibold text-destructive"
                        >
                          <XCircle className="h-3 w-3" />
                          Échec
                        </Badge>
                      )}
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      <span className="font-bold text-foreground">
                        {entry.totalOffersFound ?? entry.offersFound ?? 0}
                      </span>{' '}
                      offres trouvées
                    </p>
                  </motion.div>
                  )})}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground" />
              <h3 className="text-lg font-semibold text-foreground">
                Aucun historique
              </h3>
              <p className="mt-1 text-sm text-muted-foreground">
                Lancez un scrapping pour voir l'historique ici.
              </p>
            </div>
          )}
        </div>
      </motion.div>

      {/* Auto-Scraping Settings */}
      <motion.div variants={item}>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
          <Zap className="h-5 w-5 text-accent" />
          Paramètres automatiques
        </h2>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="rounded-lg bg-accent/10 p-3">
                <Zap className="h-5 w-5 text-accent" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">
                  Scrapping automatique
                </h3>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Collecte automatique des nouvelles offres
                </p>
              </div>
            </div>
            <Switch
              checked={autoEnabled}
              onCheckedChange={() => setAutoEnabled(!autoEnabled)}
            />
          </div>

          {autoEnabled && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-6 grid grid-cols-1 gap-4 border-t border-border pt-6 sm:grid-cols-2"
            >
              <div>
                <Label className="mb-2 text-foreground">
                  Fréquence
                </Label>
                <Select value={frequency} onValueChange={setFrequency}>
                  <SelectTrigger className="h-auto w-full bg-muted px-4 py-3 text-muted-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="quotidien">Quotidien</SelectItem>
                    <SelectItem value="hebdomadaire">Hebdomadaire</SelectItem>
                    <SelectItem value="manuel">Manuel</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="mb-2 text-foreground">
                  Heure d'exécution
                </Label>
                <Select value={scrapeTime} onValueChange={setScrapeTime}>
                  <SelectTrigger className="h-auto w-full bg-muted px-4 py-3 text-muted-foreground">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="06:00">06:00</SelectItem>
                    <SelectItem value="08:00">08:00</SelectItem>
                    <SelectItem value="10:00">10:00</SelectItem>
                    <SelectItem value="12:00">12:00</SelectItem>
                    <SelectItem value="14:00">14:00</SelectItem>
                    <SelectItem value="16:00">16:00</SelectItem>
                    <SelectItem value="18:00">18:00</SelectItem>
                    <SelectItem value="20:00">20:00</SelectItem>
                    <SelectItem value="22:00">22:00</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </motion.div>
  )
}