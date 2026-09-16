import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  ArrowLeft,
  MapPin,
  ExternalLink,
  Building2,
  Users,
  Tag,
  Plus,
  X,
  MessageSquare,
  Pencil,
  Clock,
  Send,
  Phone,
  Mail,
  Loader2,
} from 'lucide-react'

import { useRecruiter, useUpdateRecruiter } from '@/api/hooks'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'

const connectionColors = {
  '1st': 'bg-accent/10 text-accent',
  '2nd': 'bg-warning/10 text-warning',
  '3rd+': 'bg-muted text-muted-foreground',
}

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

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } },
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: 'easeOut' } },
}

export default function RecruiterDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { data, isLoading } = useRecruiter(id)
  const recruiter = data?.recruiter
  const updateMutation = useUpdateRecruiter()

  const [notes, setNotes] = useState(recruiter?.notes || '')
  const [isEditingNotes, setIsEditingNotes] = useState(false)
  const [tags, setTags] = useState(recruiter?.tags || [])
  const [newTag, setNewTag] = useState('')

  useEffect(() => {
    if (recruiter) {
      setNotes(recruiter.notes || '')
      setTags(recruiter.tags || [])
    }
  }, [recruiter])

  if (isLoading) {
    return (
      <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <Skeleton className="h-9 w-64" />
          <Skeleton className="h-9 w-40" />
        </div>
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-col items-center gap-4 text-center sm:flex-row sm:items-center sm:text-left">
            <Skeleton className="size-20 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-56" />
              <Skeleton className="h-4 w-40" />
              <Skeleton className="h-4 w-32" />
            </div>
            <Skeleton className="h-10 w-36" />
          </div>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Skeleton className="h-10 w-32" />
            <Skeleton className="h-40 rounded-xl" />
          </div>
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
    )
  }

  if (!recruiter) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col items-center">
          <Users className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">Recruteur non trouvé</h1>
          <p className="mt-2 text-muted-foreground">Ce recruteur n'existe pas ou a été supprimé.</p>
          <Button onClick={() => navigate('/recruiters')} className="mt-6">
            <ArrowLeft className="h-4 w-4" /> Retour aux recruteurs
          </Button>
        </motion.div>
      </div>
    )
  }

  const initials = `${recruiter.firstName[0]}${recruiter.lastName[0]}`
  const avatarColor = getAvatarColor(`${recruiter.firstName}${recruiter.lastName}`)

  const handleAddTag = () => {
    const trimmed = newTag.trim()
    if (trimmed && !tags.includes(trimmed)) {
      const newTags = [...tags, trimmed]
      setTags(newTags)
      setNewTag('')
      updateMutation.mutate(
        { id: recruiter._id || recruiter.id, tags: newTags },
        {
          onError: () => toast.error('Erreur lors de la sauvegarde du tag'),
        }
      )
    }
  }

  const handleRemoveTag = (tagToRemove) => {
    const newTags = tags.filter((t) => t !== tagToRemove)
    setTags(newTags)
    updateMutation.mutate(
      { id: recruiter._id || recruiter.id, tags: newTags },
      {
        onError: () => toast.error('Erreur lors de la suppression du tag'),
      }
    )
  }

  return (
    <motion.div variants={container} initial="hidden" animate="show" className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <motion.div variants={item}>
        <Button variant="ghost" onClick={() => navigate('/recruiters')}>
          <ArrowLeft className="h-4 w-4" /> Retour aux recruteurs
        </Button>
      </motion.div>

      <motion.div variants={item} className="rounded-xl border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center">
          <div className={`flex h-24 w-24 shrink-0 items-center justify-center rounded-full text-3xl font-bold text-white ${avatarColor}`}>
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-foreground">{recruiter.firstName} {recruiter.lastName}</h1>
            <p className="mt-1 text-lg font-medium text-muted-foreground">{recruiter.title}</p>
            <p className="text-muted-foreground">{recruiter.company}</p>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
            <div className="rounded-lg bg-muted p-2"><MapPin className="h-4 w-4 text-muted-foreground" /></div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Localisation</p>
              <p className="text-sm font-medium text-foreground">{recruiter.location || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
            <div className="rounded-lg bg-muted p-2"><Building2 className="h-4 w-4 text-muted-foreground" /></div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Secteur</p>
              <p className="text-sm font-medium text-foreground">{recruiter.sector || 'Non renseigné'}</p>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
            <div className="rounded-lg bg-muted p-2"><Users className="h-4 w-4 text-muted-foreground" /></div>
            <div>
              <p className="text-xs font-medium text-muted-foreground">Connexion</p>
              <Badge variant="secondary" className={`rounded-full ${connectionColors[recruiter.connectionDegree] || connectionColors['3rd+']}`}>
                {recruiter.connectionDegree || '3rd+'}
              </Badge>
            </div>
          </div>
          {recruiter.linkedinUrl && (
            <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
              <div className="rounded-lg bg-muted p-2"><ExternalLink className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">LinkedIn</p>
                <a href={recruiter.linkedinUrl} target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-primary hover:text-primary/80 hover:underline">
                  Voir profil
                </a>
              </div>
            </div>
          )}
          {recruiter.email && (
            <div className="flex items-center gap-3 rounded-xl bg-muted p-4">
              <div className="rounded-lg bg-muted p-2"><Mail className="h-4 w-4 text-muted-foreground" /></div>
              <div>
                <p className="text-xs font-medium text-muted-foreground">Email</p>
                <a href={`mailto:${recruiter.email}`} className="text-sm font-medium text-primary hover:text-primary/80 hover:underline">
                  {recruiter.email}
                </a>
              </div>
            </div>
          )}
        </div>
      </motion.div>

      <motion.div variants={item} className="flex flex-wrap gap-3">
        {recruiter.linkedinUrl && (
          <a href={recruiter.linkedinUrl} target="_blank" rel="noopener noreferrer">
            <Button className="bg-[#0A66C2] hover:bg-[#004182]">
              <MessageSquare className="h-4 w-4" /> Message LinkedIn
            </Button>
          </a>
        )}
        {recruiter.email && (
          <a href={`mailto:${recruiter.email}`}>
            <Button variant="outline">
              <Mail className="h-4 w-4" /> Envoyer un email
            </Button>
          </a>
        )}
        {recruiter.phone && (
          <a href={`tel:${recruiter.phone}`}>
            <Button variant="outline">
              <Phone className="h-4 w-4" /> Appeler
            </Button>
          </a>
        )}
      </motion.div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="flex items-center gap-2 text-xl font-bold text-foreground">
                <Pencil className="h-5 w-5 text-primary" /> Notes personnelles
              </h2>
              {!isEditingNotes && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingNotes(true)}>
                  Modifier
                </Button>
              )}
            </div>
            {isEditingNotes ? (
              <div className="space-y-3">
                <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Ajoutez vos notes sur ce recruteur..." className="rounded-xl border-border bg-muted p-4 text-sm leading-relaxed text-foreground placeholder:text-muted-foreground" />
                <div className="flex gap-2">
                  <Button
                    onClick={() => {
                      updateMutation.mutate(
                        { id: recruiter._id || recruiter.id, notes },
                        {
                          onSuccess: () => {
                            setIsEditingNotes(false)
                            toast.success('Notes sauvegardées')
                          },
                          onError: () => toast.error('Erreur lors de la sauvegarde'),
                        }
                      )
                    }}
                    disabled={updateMutation.isPending}
                  >
                    {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Sauvegarder
                  </Button>
                  <Button variant="outline" onClick={() => { setIsEditingNotes(false); setNotes(recruiter?.notes || '') }}>
                    Annuler
                  </Button>
                </div>
              </div>
            ) : (
              <p className="leading-relaxed text-muted-foreground">{notes || 'Aucune note pour ce recruteur.'}</p>
            )}
          </motion.div>

          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-6 flex items-center gap-2 text-xl font-bold text-foreground">
              <Clock className="h-5 w-5 text-primary" /> Historique des interactions
            </h2>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Clock className="mb-3 h-10 w-10 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Aucune interaction enregistrée pour le moment.</p>
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 flex items-center gap-2 text-lg font-bold text-foreground">
              <Tag className="h-5 w-5 text-accent" /> Tags
            </h3>
            <div className="flex flex-wrap gap-2">
              <AnimatePresence>
                {tags.map((tag) => (
                  <motion.span key={tag} initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.8, opacity: 0 }} className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary">
                    {tag}
                    <button onClick={() => handleRemoveTag(tag)} className="ml-0.5 rounded-full p-0.5 transition-colors hover:bg-primary/20">
                      <X className="h-3 w-3" />
                    </button>
                  </motion.span>
                ))}
              </AnimatePresence>
            </div>
            <div className="mt-3 flex gap-2">
              <Input type="text" value={newTag} onChange={(e) => setNewTag(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') handleAddTag() }} placeholder="Nouveau tag..." className="rounded-xl border-border bg-muted text-sm" />
              <Button variant="success" onClick={handleAddTag} className="px-3">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </motion.div>

          <motion.div variants={item} className="rounded-xl border border-border bg-card p-6 shadow-sm">
            <h3 className="mb-4 text-lg font-bold text-foreground">Contact rapide</h3>
            <div className="space-y-3">
              {recruiter.linkedinUrl && (
                <a href={recruiter.linkedinUrl} target="_blank" rel="noopener noreferrer">
                  <Button className="w-full bg-[#0A66C2] hover:bg-[#004182]">
                    <Send className="h-4 w-4" /> Message LinkedIn
                  </Button>
                </a>
              )}
              {recruiter.email && (
                <a href={`mailto:${recruiter.email}`}>
                  <Button variant="outline" className="w-full">
                    <Mail className="h-4 w-4" /> Envoyer un email
                  </Button>
                </a>
              )}
              {recruiter.phone && (
                <a href={`tel:${recruiter.phone}`}>
                  <Button variant="outline" className="w-full">
                    <Phone className="h-4 w-4" /> Appeler
                  </Button>
                </a>
              )}
            </div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
