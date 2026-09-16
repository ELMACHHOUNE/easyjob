import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  Users,
  UserPlus,
  MapPin,
  ArrowRight,
} from 'lucide-react'

import { useRecruiters } from '@/api/hooks'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const avatarColors = [
  'bg-primary', 'bg-accent', 'bg-accent', 'bg-purple-500',
  'bg-pink-500', 'bg-cyan-500', 'bg-rose-500', 'bg-indigo-500',
]

function getAvatarColor(name) {
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

const connectionColors = {
  '1st': 'bg-accent/10 text-accent',
  '2nd': 'bg-warning/10 text-warning',
  '3rd+': 'bg-muted text-muted-foreground',
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function NetworkPage() {
  const navigate = useNavigate()
  const { data, isLoading } = useRecruiters()
  const recruiters = data?.recruiters ?? []

  const totalConnections = recruiters.length
  const firstDegree = recruiters.filter((r) => r.connectionDegree === '1st').length
  const suggestedRecruiters = recruiters.filter((r) => r.connectionDegree !== '1st').slice(0, 4)

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div>
          <Skeleton className="h-9 w-48" />
          <Skeleton className="mt-2 h-4 w-72 max-w-full" />
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-xl border border-border bg-card p-6 shadow-sm">
              <Skeleton className="size-11 rounded-lg" />
              <Skeleton className="mt-4 h-8 w-16" />
              <Skeleton className="mt-2 h-4 w-24" />
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="flex items-start gap-4 rounded-xl border border-border bg-card p-5 shadow-sm">
              <Skeleton className="size-12 shrink-0 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-40" />
                <Skeleton className="mt-2 h-3 w-56 max-w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-foreground">Mon Réseau</h1>
        <p className="mt-1 text-muted-foreground">Gérez vos connexions et suivez vos interactions</p>
      </motion.div>

      <motion.div variants={item} className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <motion.div variants={item} whileHover={{ y: -4 }} className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-primary/10 p-3"><Users className="h-5 w-5 text-primary" /></div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-foreground">{totalConnections}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Connexions totales</p>
          </div>
        </motion.div>

        <motion.div variants={item} whileHover={{ y: -4 }} className="rounded-xl border border-border bg-card p-6 shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]">
          <div className="flex items-center justify-between">
            <div className="rounded-lg bg-accent/10 p-3"><UserPlus className="h-5 w-5 text-accent" /></div>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-bold text-foreground">{firstDegree}</p>
            <p className="mt-1 text-sm font-medium text-muted-foreground">Connexions directes</p>
          </div>
        </motion.div>
      </motion.div>

      {suggestedRecruiters.length > 0 && (
        <motion.div variants={item}>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-xl font-bold text-foreground">Connexions suggérées</h2>
            <button onClick={() => navigate('/recruiters')} className="inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:text-primary/80">
              Voir tous <ArrowRight className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {suggestedRecruiters.map((recruiter) => {
              const initials = `${recruiter.firstName[0]}${recruiter.lastName[0]}`
              const avatarColor = getAvatarColor(`${recruiter.firstName}${recruiter.lastName}`)
              return (
                <motion.div key={recruiter._id} variants={item} whileHover={{ y: -4 }} className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]">
                  <div className="flex flex-col items-center text-center">
                    <button onClick={() => navigate(`/recruiters/${recruiter._id}`)} className={`flex h-16 w-16 items-center justify-center rounded-full text-xl font-bold text-white ${avatarColor}`}>
                      {initials}
                    </button>
                    <button onClick={() => navigate(`/recruiters/${recruiter._id}`)} className="mt-3 text-center">
                      <h3 className="text-sm font-bold text-foreground hover:text-primary">
                        {recruiter.firstName} {recruiter.lastName}
                      </h3>
                    </button>
                    <p className="mt-0.5 text-xs text-muted-foreground">{recruiter.title}</p>
                    <p className="text-xs text-muted-foreground">{recruiter.company}</p>
                    <span className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3" /> {recruiter.location}
                    </span>
                    <Badge variant="secondary" className={`mt-2 rounded-full ${connectionColors[recruiter.connectionDegree] || connectionColors['3rd+']}`}>
                      {recruiter.connectionDegree}
                    </Badge>
                  </div>
                </motion.div>
              )
            })}
          </div>
        </motion.div>
      )}

      {recruiters.length === 0 && (
        <motion.div variants={item} className="rounded-xl border border-border bg-card p-12 text-center shadow-sm">
          <Users className="mx-auto mb-4 h-12 w-12 text-muted-foreground" />
          <h3 className="text-lg font-semibold text-foreground">Aucun recruteur</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Lancez le scraper de recruteurs pour trouver des contacts.
          </p>
        </motion.div>
      )}
    </motion.div>
  )
}
