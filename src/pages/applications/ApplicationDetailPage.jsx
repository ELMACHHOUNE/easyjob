import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  FileEdit,
  Send,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  Mail,
  StickyNote,
  Bell,
  RefreshCw,
  PenLine,
  User,
  Building2,
  Calendar,
  AlertTriangle,
} from 'lucide-react'
import { format, formatDistanceToNow } from 'date-fns'
import { fr } from 'date-fns/locale'

import { useApplication, useUpdateApplicationNotes } from '@/api/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'

const statusConfig = {
  brouillon: {
    label: 'Brouillon',
    color: 'bg-muted text-foreground',
    dot: 'bg-muted-foreground',
    icon: FileEdit,
  },
  envoyee: {
    label: 'Envoyée',
    color: 'bg-primary/10 text-primary',
    dot: 'bg-primary',
    icon: Send,
  },
  ouverte: {
    label: 'Ouverte',
    color: 'bg-accent/10 text-accent',
    dot: 'bg-accent',
    icon: Eye,
  },
  en_cours: {
    label: 'En cours',
    color: 'bg-warning/10 text-warning',
    dot: 'bg-warning',
    icon: Clock,
  },
  acceptee: {
    label: 'Acceptée',
    color: 'bg-emerald-100 text-emerald-700',
    dot: 'bg-emerald-500',
    icon: CheckCircle2,
  },
  refusee: {
    label: 'Refusée',
    color: 'bg-destructive/10 text-destructive',
    dot: 'bg-destructive',
    icon: XCircle,
  },
}

const timelineSteps = [
  { key: 'brouillon', label: 'Brouillon', icon: FileEdit },
  { key: 'envoyee', label: 'Envoyée', icon: Send },
  { key: 'ouverte', label: 'Ouverte', icon: Eye },
  { key: 'en_cours', label: 'En cours', icon: Clock },
  { key: 'acceptee', label: 'Acceptée', icon: CheckCircle2 },
]

const statusOrder = ['brouillon', 'envoyee', 'ouverte', 'en_cours', 'acceptee', 'refusee']

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

function TimelineStep({ step, index, isCompleted, isCurrent, isFailed }) {
  const Icon = step.icon

  return (
    <div className="flex gap-4">
      <div className="flex flex-col items-center">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
          className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${
            isCompleted
              ? 'border-accent bg-accent text-white'
              : isCurrent
              ? 'border-primary bg-primary text-white'
              : isFailed
              ? 'border-destructive bg-destructive text-white'
              : 'border-border bg-card text-muted-foreground'
          }`}
        >
          {isCompleted ? (
            <CheckCircle2 className="h-5 w-5" />
          ) : isFailed ? (
            <XCircle className="h-5 w-5" />
          ) : isCurrent ? (
            <Clock className="h-5 w-5" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
          {isCurrent && (
            <motion.div
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="absolute inset-0 rounded-full border-2 border-primary"
            />
          )}
        </motion.div>
        {index < timelineSteps.length - 1 && (
          <div
            className={`w-0.5 flex-1 ${
              isCompleted
                ? 'bg-accent'
                : 'bg-border'
            }`}
          />
        )}
      </div>

      <div className="pb-8 pt-2">
        <p
          className={`text-sm font-semibold ${
            isCompleted
              ? 'text-accent'
              : isCurrent
              ? 'text-primary'
              : 'text-muted-foreground'
          }`}
        >
          {step.label}
        </p>
        {step.date && (
          <p className="mt-0.5 text-xs text-muted-foreground">
            {format(new Date(step.date), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
          </p>
        )}
        {step.description && (
          <p className="mt-1 text-xs text-muted-foreground">
            {step.description}
          </p>
        )}
      </div>
    </div>
  )
}

function DetailSkeleton() {
  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <div className="h-8 w-48 animate-pulse rounded bg-muted" />
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="space-y-4">
          <div className="h-8 w-64 animate-pulse rounded bg-muted" />
          <div className="flex gap-4">
            <div className="h-5 w-32 animate-pulse rounded bg-muted" />
            <div className="h-5 w-24 animate-pulse rounded bg-muted" />
          </div>
          <div className="flex gap-3 border-t border-border pt-4">
            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
            <div className="h-10 w-24 animate-pulse rounded-lg bg-muted" />
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="h-80 animate-pulse rounded-xl border border-border bg-card p-6" />
        </div>
        <div className="space-y-6">
          <div className="h-48 animate-pulse rounded-xl border border-border bg-card p-6" />
          <div className="h-40 animate-pulse rounded-xl border border-border bg-card p-6" />
        </div>
      </div>
    </div>
  )
}

export default function ApplicationDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [notes, setNotes] = useState('')
  const [isEditingNotes, setIsEditingNotes] = useState(false)

  const { data, isLoading, error } = useApplication(id)
  const application = data?.application
  const updateNotesMutation = useUpdateApplicationNotes()

  if (isLoading) {
    return <DetailSkeleton />
  }

  if (error || !application) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          {error ? (
            <AlertTriangle className="mb-4 h-16 w-16 text-destructive" />
          ) : (
            <FileEdit className="mb-4 h-16 w-16 text-muted-foreground" />
          )}
          <h1 className="text-2xl font-bold text-foreground">
            {error ? 'Erreur de chargement' : 'Candidature non trouvée'}
          </h1>
          <p className="mt-2 text-muted-foreground">
            {error ? error.message : "Cette candidature n'existe pas ou a été supprimée."}
          </p>
          <Button
            onClick={() => navigate('/applications')}
            className="mt-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux candidatures
          </Button>
        </motion.div>
      </div>
    )
  }

  const status = statusConfig[application.status] || statusConfig.brouillon
  const StatusIcon = status.icon

  const timeline = application.timeline || []

  const email = application.email || null

  const handleFollow = () => {
    toast.success('Candidature suivie', { icon: '👁️' })
  }

  const handleRelance = () => {
    toast.success('Email de relance préparé', { icon: '📧' })
  }

  const handleEdit = () => {
    const jobId = application.jobOfferId?.id || application.jobOfferId?._id || application.jobOfferId
    navigate(`/applications/compose/${jobId}`)
  }

  const handleSaveNotes = () => {
    const notesToSave = notes || application.notes || ''
    updateNotesMutation.mutate(
      { id: application._id || application.id, notes: notesToSave },
      {
        onSuccess: () => {
          setIsEditingNotes(false)
          toast.success('Notes sauvegardées')
        },
        onError: () => toast.error('Erreur lors de la sauvegarde'),
      }
    )
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
          variant="ghost"
          size="sm"
          onClick={() => navigate('/applications')}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour aux candidatures
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div
        variants={item}
        className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl font-bold text-foreground sm:text-3xl">
              {application.jobOfferId?.title || 'Offre inconnue'}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-3 text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Building2 className="h-4 w-4" />
                <span className="font-medium">{application.jobOfferId?.company || ''}</span>
              </span>
              {application.email?.sentAt && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="h-4 w-4" />
                  {formatDistanceToNow(new Date(application.email.sentAt), {
                    addSuffix: true,
                    locale: fr,
                  })}
                </span>
              )}
            </div>
          </div>
          <Badge
            variant="secondary"
            className={`h-auto shrink-0 gap-2 rounded-full px-4 py-2 text-sm font-semibold ${status.color}`}
          >
            <StatusIcon className="h-4 w-4" />
            {status.label}
          </Badge>
        </div>

        {/* Actions */}
        <div className="mt-6 flex flex-wrap gap-3 border-t border-border pt-6">
          <Button onClick={handleFollow}>
            <Bell className="h-4 w-4" />
            Suivre
          </Button>
          <Button variant="outline" onClick={handleRelance}>
            <RefreshCw className="h-4 w-4" />
            Relancer
          </Button>
          <Button variant="outline" onClick={handleEdit}>
            <PenLine className="h-4 w-4" />
            Modifier
          </Button>
        </div>
      </motion.div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Left Column - Timeline */}
        <div className="space-y-6 lg:col-span-2">
          {/* Timeline */}
          <motion.div
            variants={item}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h2 className="mb-6 text-lg font-bold text-foreground">
              Parcours de la candidature
            </h2>
            <div className="ml-1">
              {timelineSteps.map((step, index) => {
                const timelineEntry = timeline.find((t) => t.status === step.key)
                const isCompleted = timeline.some(
                  (t) => statusOrder.indexOf(t.status) >= statusOrder.indexOf(step.key)
                ) && step.key !== 'refusee'
                const isCurrent = step.key === application.status
                const isFailed = application.status === 'refusee' && index === timelineSteps.length - 1

                return (
                  <TimelineStep
                    key={step.key}
                    step={{
                      ...step,
                      date: timelineEntry?.date,
                      description: timelineEntry?.description,
                    }}
                    index={index}
                    isCompleted={isCompleted && !isCurrent}
                    isCurrent={isCurrent}
                    isFailed={isFailed}
                  />
                )
              })}
            </div>
          </motion.div>

          {/* Email Details */}
          {email && email.subject && (
            <motion.div
              variants={item}
              className="rounded-xl border border-border bg-card p-6 shadow-sm"
            >
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
                <Mail className="h-5 w-5 text-primary" />
                Détails de l'email
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Objet
                  </label>
                  <p className="rounded-lg bg-muted px-4 py-3 text-sm font-medium text-foreground">
                    {email.subject}
                  </p>
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    Contenu
                  </label>
                  <div className="rounded-lg border border-border bg-muted px-4 py-3">
                    <p className="whitespace-pre-line text-sm leading-relaxed text-muted-foreground">
                      {email.body}
                    </p>
                  </div>
                </div>
                {email.sentAt && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5" />
                    Envoyé le{' '}
                    {format(new Date(email.sentAt), "dd MMMM yyyy 'à' HH:mm", {
                      locale: fr,
                    })}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Candidate Info */}
          <motion.div
            variants={item}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <h3 className="mb-4 text-lg font-bold text-foreground">
              Informations
            </h3>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Candidat
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {application.candidateName || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <Building2 className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Entreprise
                  </p>
                  <p className="text-sm font-medium text-foreground">
                    {application.jobOfferId?.company || '—'}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="rounded-lg bg-muted p-2">
                  <StatusIcon className="h-4 w-4 text-muted-foreground" />
                </div>
                <div>
                  <p className="text-xs font-medium text-muted-foreground">
                    Statut actuel
                  </p>
                  <p className={`text-sm font-semibold ${status.color.split(' ').pop()}`}>
                    {status.label}
                  </p>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Notes */}
          <motion.div
            variants={item}
            className="rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className="flex items-center gap-2 text-lg font-bold text-foreground">
                <StickyNote className="h-5 w-5 text-accent" />
                Notes
              </h3>
              {!isEditingNotes && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsEditingNotes(true)}
                  className="h-auto px-2 py-1 text-xs font-medium text-primary"
                >
                  Modifier
                </Button>
              )}
            </div>

            {isEditingNotes ? (
              <div className="space-y-3">
                <Textarea
                  value={notes || application.notes || ''}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="bg-muted"
                  placeholder="Ajouter des notes..."
                />
                <div className="flex items-center gap-2">
                  <Button size="sm" onClick={handleSaveNotes}>
                    Sauvegarder
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditingNotes(false)
                      setNotes('')
                    }}
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-sm leading-relaxed text-muted-foreground">
                {application.notes || (
                  <span className="italic text-muted-foreground">
                    Aucune note pour cette candidature.
                  </span>
                )}
              </p>
            )}
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}