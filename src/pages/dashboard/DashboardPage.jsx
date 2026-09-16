import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Briefcase,
  Send,
  TrendingUp,
  Mail,
  Zap,
  MapPin,
  Clock,
  FileText,
  CheckCircle,
  Bell,
  ArrowRight,
  ArrowUpRight,
  ArrowDownRight,
} from 'lucide-react'
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts'
import { formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

import { useAuth } from '@/context/AuthContext'
import { useDashboardStats, useDashboardActivity } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] } },
}

const activityTypeConfig = {
  job_found: { icon: FileText, color: 'text-primary', bg: 'bg-primary/10' },
  application_sent: { icon: Send, color: 'text-accent', bg: 'bg-accent/10' },
  profile_updated: { icon: CheckCircle, color: 'text-accent', bg: 'bg-accent/10' },
  email_received: { icon: Bell, color: 'text-warning', bg: 'bg-warning/10' },
  interview: { icon: Briefcase, color: 'text-destructive', bg: 'bg-destructive/10' },
  default: { icon: FileText, color: 'text-muted-foreground', bg: 'bg-muted' },
}

function Trend({ value }) {
  if (value == null) return null
  const isPositive = value >= 0
  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold ${
        isPositive ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
      }`}
    >
      {isPositive ? <ArrowUpRight className="size-3" /> : <ArrowDownRight className="size-3" />}
      {Math.abs(value)}%
    </span>
  )
}

function Sparkline({ data, dataKey, className }) {
  if (!data?.length) return null
  return (
    <div className={className}>
      <ResponsiveContainer width="100%" height={36}>
        <AreaChart data={data} margin={{ top: 2, right: 2, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`spark-${dataKey}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
              <stop offset="100%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke="hsl(var(--chart-1))"
            strokeWidth={1.5}
            fill={`url(#spark-${dataKey})`}
            dot={false}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  )
}

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <Skeleton className="mb-4 size-10 rounded-lg" />
      <Skeleton className="mb-2 h-7 w-20" />
      <Skeleton className="h-4 w-28" />
    </div>
  )
}

function SkeletonChart() {
  return (
    <div className="rounded-xl border border-border bg-card p-6">
      <Skeleton className="mb-6 h-5 w-48" />
      <Skeleton className="h-[300px] w-full rounded-lg" />
    </div>
  )
}

function SkeletonList() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl p-3">
          <Skeleton className="size-10 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-40" />
            <Skeleton className="h-3 w-60" />
          </div>
        </div>
      ))}
    </div>
  )
}

export default function DashboardPage() {
  const { user } = useAuth()
  const { data, isLoading, error, refetch } = useDashboardStats()
  const { data: activityData, isLoading: isLoadingActivity } = useDashboardActivity()

  const stats = data?.stats ?? {}
  const recentJobs = data?.recentJobs ?? []
  const applicationsByWeek = data?.applicationsByWeek ?? []
  const activities = activityData?.activities ?? []

  const weeklyTrend = (() => {
    if (applicationsByWeek.length < 2) return null
    const last = applicationsByWeek[applicationsByWeek.length - 1]?.candidatures ?? 0
    const prev = applicationsByWeek[applicationsByWeek.length - 2]?.candidatures ?? 0
    if (prev === 0) return null
    return Math.round(((last - prev) / prev) * 100)
  })()

  const jobWeeklyTrend = (() => {
    if (applicationsByWeek.length < 2) return null
    const last = applicationsByWeek[applicationsByWeek.length - 1]?.offres ?? 0
    const prev = applicationsByWeek[applicationsByWeek.length - 2]?.offres ?? 0
    if (prev === 0) return null
    return Math.round(((last - prev) / prev) * 100)
  })()

  const statCards = [
    {
      title: 'Offres trouvées',
      icon: Briefcase,
      value: stats.totalJobs ?? '—',
      trend: jobWeeklyTrend,
      color: 'bg-primary/10 text-primary',
      sparkData: applicationsByWeek,
      sparkKey: 'offres',
    },
    {
      title: 'Candidatures envoyées',
      icon: Send,
      value: stats.totalApplications ?? '—',
      trend: weeklyTrend,
      color: 'bg-accent/10 text-accent',
      sparkData: applicationsByWeek,
      sparkKey: 'candidatures',
    },
    {
      title: 'Taux de réponse',
      icon: TrendingUp,
      value: stats.responseRate != null ? `${stats.responseRate}%` : '—',
      trend: null,
      color: 'bg-chart-3/10 text-[hsl(var(--chart-3))]',
    },
    {
      title: 'Emails ouverts',
      icon: Mail,
      value: stats.emailOpenRate != null ? `${stats.emailOpenRate}%` : '—',
      trend: null,
      color: 'bg-chart-4/10 text-[hsl(var(--chart-4))]',
    },
  ]

  if (error) {
    return (
      <div className="mx-auto flex min-h-[60vh] flex-col items-center justify-center gap-4 text-center">
        <p className="text-sm text-muted-foreground">Impossible de charger le tableau de bord.</p>
        <Button variant="outline" onClick={() => refetch()}>Réessayer</Button>
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-8 overflow-x-clip"
    >
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Bonjour {user?.firstName} 👋
          </h1>
          <p className="mt-1 text-muted-foreground">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
            {' — '}
            {stats.totalApplications ? `${stats.totalApplications} candidatures envoyées cette semaine` : 'Voici un résumé de votre activité'}
          </p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" size="sm">
            <Link to="/jobs/scraping-config"><Zap className="mr-2 size-4" />Lancer un scrapage</Link>
          </Button>
          <Button asChild size="sm">
            <Link to="/jobs">Nouvelle candidature</Link>
          </Button>
        </div>
      </motion.div>

      <motion.div variants={item} className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {isLoading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : statCards.map((stat) => {
              const Icon = stat.icon
              return (
                <motion.div
                  key={stat.title}
                  variants={item}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="group relative flex min-w-0 flex-col rounded-xl border border-border bg-card p-5 transition-shadow hover:shadow-md"
                >
                  <div className="mb-4 flex items-center justify-between">
                    <div className={`flex size-10 items-center justify-center rounded-lg ${stat.color}`}>
                      <Icon className="size-5" />
                    </div>
                    <Trend value={stat.trend} />
                  </div>
                  <div className="mt-auto">
                    <p className="text-3xl font-bold tracking-tight">{stat.value}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{stat.title}</p>
                  </div>
                  {stat.sparkData && (
                    <Sparkline data={stat.sparkData} dataKey={stat.sparkKey} className="absolute inset-x-5 bottom-5 -z-10 opacity-30 transition-opacity group-hover:opacity-60" />
                  )}
                </motion.div>
              )
            })}
      </motion.div>

      <motion.div variants={item}>
        <div className="min-w-0 overflow-hidden rounded-xl border border-border bg-card p-6">
          <h2 className="mb-6 text-lg font-semibold">Candidatures par semaine</h2>
          {isLoading ? (
            <SkeletonChart />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={applicationsByWeek}>
                <defs>
                  <linearGradient id="gradCandidatures" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 12, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                <Area type="monotone" dataKey="candidatures" stroke="hsl(var(--chart-1))" strokeWidth={2} fill="url(#gradCandidatures)" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div variants={item} className="min-w-0 rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Dernières offres</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/jobs">Tout voir<ArrowRight className="ml-1 size-4" /></Link>
            </Button>
          </div>
          {isLoading ? (
            <SkeletonList />
          ) : recentJobs.length > 0 ? (
            <div className="space-y-2">
              {recentJobs.slice(0, 5).map((job) => (
                <Link
                  key={job._id}
                  to={`/jobs/${job._id}`}
                  className="flex items-center gap-4 rounded-lg p-3 transition-colors hover:bg-muted/60"
                >
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-sm font-bold text-primary">
                    {job.company?.charAt(0) ?? 'E'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">{job.title}</p>
                    <p className="truncate text-xs text-muted-foreground">{job.company} — {job.location}</p>
                  </div>
                  <span className="shrink-0 whitespace-nowrap text-xs text-muted-foreground">
                    {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true, locale: fr })}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune offre récente.</p>
          )}
        </motion.div>

        <motion.div variants={item} className="min-w-0 rounded-xl border border-border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">Activité récente</h2>
          {isLoadingActivity ? (
            <SkeletonList />
          ) : activities.length > 0 ? (
            <div className="relative ml-3 border-l border-border pl-6">
              {activities.map((activity) => {
                const config = activityTypeConfig[activity.type] || activityTypeConfig.default
                const Icon = config.icon
                return (
                  <div key={activity.id} className="relative mb-6 last:mb-0">
                    <span className={`absolute -left-[31px] flex size-6 items-center justify-center rounded-full border border-border bg-card`}>
                      <Icon className={`size-3 ${config.color}`} />
                    </span>
                    <p className="text-sm font-medium">{activity.title}</p>
                    <p className="mt-0.5 text-xs text-muted-foreground line-clamp-1">{activity.description}</p>
                    <p className="mt-1 flex items-center gap-1 text-[11px] text-muted-foreground">
                      <Clock className="size-3" />
                      {formatDistanceToNow(new Date(activity.date), { addSuffix: true, locale: fr })}
                    </p>
                  </div>
                )
              })}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Aucune activité récente.</p>
          )}
        </motion.div>
      </div>

      {recentJobs.length > 3 && (
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Offres recommandées</h2>
            <Button asChild variant="ghost" size="sm">
              <Link to="/jobs">Voir toutes<ArrowRight className="ml-1 size-4" /></Link>
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {recentJobs.slice(0, 8).map((job) => (
              <Link
                key={job._id}
                to={`/jobs/${job._id}`}
                className="min-w-0 rounded-xl border border-border bg-background p-4 transition-colors hover:border-primary/40"
              >
                <div className="mb-3 flex items-center gap-2">
                  <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-xs font-bold text-primary">
                    {job.company?.charAt(0) ?? 'E'}
                  </div>
                  <span className="truncate text-xs text-muted-foreground">{job.company}</span>
                </div>
                <p className="mb-1 line-clamp-2 text-sm font-medium leading-snug">{job.title}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <MapPin className="size-3" />
                  <span className="truncate">{job.location}</span>
                </div>
                {job.contractType && (
                  <span className="mt-2 inline-block rounded-md bg-muted px-2 py-0.5 text-[11px] font-medium text-muted-foreground">
                    {job.contractType}
                  </span>
                )}
              </Link>
            ))}
          </div>
        </motion.div>
      )}
    </motion.div>
  )
}