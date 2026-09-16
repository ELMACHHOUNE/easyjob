import { useState, useMemo, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Send,
  Save,
  Sparkles,
  Paperclip,
  Eye,
  EyeOff,
  Mail,
  User,
  FileText,
  Link as LinkIcon,
  StickyNote,
  Building2,
  Loader2,
} from 'lucide-react'
import { toast } from 'sonner'

import {
  useJob,
  useEmailTemplates,
  useCreateApplication,
  useSendApplication,
} from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const schema = z.object({
  recipient: z.string().email('Email invalide'),
  subject: z.string().min(5, 'L\'objet doit contenir au moins 5 caractères'),
  body: z.string().min(20, 'Le corps de l\'email doit contenir au moins 20 caractères'),
  attachCv: z.boolean(),
  portfolioUrl: z.string().url('URL invalide').optional().or(z.literal('')),
  coverLetter: z.string().optional(),
  notes: z.string().optional(),
})

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

function replaceVariables(text, vars) {
  let result = text
  for (const [key, value] of Object.entries(vars)) {
    result = result.replaceAll(`{{${key}}}`, value || `[${key}]`)
  }
  return result
}

function SkeletonBlock({ className }) {
  return (
    <div className={`animate-pulse rounded-xl bg-muted ${className}`} />
  )
}

function ComposeSkeleton() {
  return (
    <div className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
      <SkeletonBlock className="h-9 w-16" />
      <div className="space-y-2">
        <SkeletonBlock className="h-9 w-80" />
        <SkeletonBlock className="h-5 w-64" />
      </div>
      <div className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/10 p-5">
        <SkeletonBlock className="h-12 w-12 rounded-xl shrink-0" />
        <div className="space-y-2 flex-1">
          <SkeletonBlock className="h-6 w-56" />
          <SkeletonBlock className="h-4 w-72" />
        </div>
      </div>
      <div className="rounded-xl border border-border bg-card p-6 shadow-sm space-y-4">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-11 w-full" />
        <SkeletonBlock className="h-11 w-full" />
        <SkeletonBlock className="h-11 w-full" />
        <SkeletonBlock className="h-64 w-full" />
      </div>
    </div>
  )
}

export default function ComposeEmailPage() {
  const { jobOfferId } = useParams()
  const navigate = useNavigate()

  const { data: jobData, isLoading: jobLoading, isError: jobError } = useJob(jobOfferId)
  const job = jobData?.job
  const { data: templatesData, isLoading: templatesLoading } = useEmailTemplates()
  const createApplication = useCreateApplication()
  const sendApplication = useSendApplication()

  const [selectedTemplate, setSelectedTemplate] = useState(null)
  const [showPreview, setShowPreview] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatingField, setGeneratingField] = useState(null)

  const templates = useMemo(() => {
    const list = Array.isArray(templatesData)
      ? templatesData
      : templatesData?.templates
    if (!list) return {}
    return list.reduce((acc, t) => {
      acc[t.key || t.id || t.name] = {
        label: t.label || t.name,
        subject: t.subject || '',
        body: t.body || t.content || '',
      }
      return acc
    }, {})
  }, [templatesData])

  const templateOptions = useMemo(
    () =>
      Object.entries(templates).map(([key, t]) => ({
        value: key,
        label: t.label,
      })),
    [templates]
  )

  const userVars = useMemo(() => ({
    userName: job?.user?.name || job?.userName || '',
    jobTitle: job?.title || '',
    company: job?.company || '',
    recruiterName: job?.recruiterName || 'Responsable du recrutement',
    experienceYears: String(job?.user?.experienceYears || '3'),
    studyField: job?.user?.studyField || 'Informatique',
  }), [job])

  const firstTemplateKey = Object.keys(templates)[0]

  const { register, handleSubmit, watch, setValue, reset, formState: { errors } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      recipient: '',
      subject: '',
      body: '',
      attachCv: true,
      portfolioUrl: '',
      coverLetter: '',
      notes: '',
    },
  })

  useEffect(() => {
    if (job && firstTemplateKey && templates[firstTemplateKey]) {
      const tpl = templates[firstTemplateKey]
      reset({
        recipient: `recrutement@${(job.company || 'entreprise').toLowerCase().replace(/\s+/g, '')}.ma`,
        subject: replaceVariables(tpl.subject, { ...userVars, jobTitle: job.title, company: job.company }),
        body: replaceVariables(tpl.body, { ...userVars, jobTitle: job.title, company: job.company }),
        attachCv: true,
        portfolioUrl: '',
        coverLetter: '',
        notes: '',
      })
      setSelectedTemplate(firstTemplateKey)
    }
  }, [job, templates, firstTemplateKey, userVars, reset])

  const watchedBody = watch('body')
  const watchedSubject = watch('subject')
  const watchedRecipient = watch('recipient')
  const watchedAttachCv = watch('attachCv')

  const handleTemplateChange = (templateKey) => {
    setSelectedTemplate(templateKey)
    const template = templates[templateKey]
    if (template) {
      setValue('subject', replaceVariables(template.subject, userVars))
      setValue('body', replaceVariables(template.body, userVars))
    }
  }

  const handleGenerateAI = async () => {
    setIsGenerating(true)
    setGeneratingField('body')
    await new Promise((r) => setTimeout(r, 2000))
    const aiText = `Madame, Monsieur,

Ayant pris connaissance avec un grand intérêt de votre offre pour le poste de ${job?.title || '...'} chez ${job?.company || '...'}, je souhaite vous soumettre ma candidature.

Fort de solides compétences techniques et d'une expérience significative dans ce domaine, je suis convaincu de pouvoir apporter une réelle valeur ajoutée à votre équipe. Ma rigueur, ma capacité d'adaptation et mon esprit d'innovation sont des atouts que je souhaite mettre au service de vos projets ambitieux.

Au cours de mes précédentes expériences, j'ai eu l'occasion de développer une expertise approfondie qui correspond parfaitement aux exigences de ce poste. Ma curiosité technique et mon engagement envers l'excellence me permettent de rester à la pointe des technologies émergentes.

Je serais ravi de pouvoir échanger avec vous lors d'un entretien afin de vous présenter plus en détail mon parcours et ma motivation. Je reste à votre entière disposition pour tout complément d'information.

Dans l'attente de votre retour, je vous prie d'agréer, Madame, Monsieur, l'expression de mes salutations distinguées.

${userVars.userName || ''}`

    setValue('body', aiText)
    setIsGenerating(false)
    setGeneratingField(null)
    toast.success('Email généré avec succès')
  }

  const onSubmit = async (data) => {
    try {
      const appData = {
        jobOfferId: jobOfferId,
        coverLetter: data.coverLetter || '',
        portfolioUrl: data.portfolioUrl || '',
        notes: data.notes || '',
      }
      const createdApp = await createApplication.mutateAsync(appData)
      const appId = createdApp.application?.id || createdApp.application?._id

      const emailData = {
        to: data.recipient,
        subject: data.subject,
        body: data.body,
        attachCv: data.attachCv,
      }
      await sendApplication.mutateAsync({ id: appId, emailData })

      toast.success('Candidature envoyée avec succès !')
      navigate('/applications')
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'envoi de la candidature")
    }
  }

  const onSaveDraft = async () => {
    try {
      const formValues = watch()
      const appData = {
        jobOfferId: jobOfferId,
        status: 'draft',
        coverLetter: formValues.coverLetter || '',
        portfolioUrl: formValues.portfolioUrl || '',
        notes: formValues.notes || '',
        email: {
          to: formValues.recipient,
          subject: formValues.subject,
          body: formValues.body,
          attachCv: formValues.attachCv,
        },
      }
      await createApplication.mutateAsync(appData)
      toast.success('Brouillon enregistré')
      navigate('/applications')
    } catch (err) {
      toast.error(err?.response?.data?.message || "Erreur lors de l'enregistrement du brouillon")
    }
  }

  if (jobLoading || templatesLoading) {
    return <ComposeSkeleton />
  }

  if (jobError || !job) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col items-center"
        >
          <Mail className="mb-4 h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold text-foreground">
            Offre non trouvée
          </h1>
          <p className="mt-2 text-muted-foreground">
            {jobError?.response?.data?.message || "L'offre d'emploi associée n'existe pas ou a été supprimée."}
          </p>
          <Button
            onClick={() => navigate('/jobs')}
            className="mt-6"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour aux offres
          </Button>
        </motion.div>
      </div>
    )
  }

  const isMutating = createApplication.isPending || sendApplication.isPending

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-4xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Back Button */}
      <motion.div variants={item}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate(-1)}
          className="text-muted-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Retour
        </Button>
      </motion.div>

      {/* Header */}
      <motion.div variants={item}>
        <h1 className="text-3xl font-bold text-foreground">
          Rédiger votre candidature
        </h1>
        <p className="mt-1 text-muted-foreground">
          Personnalisez et envoyez votre candidature par email
        </p>
      </motion.div>

      {/* Job Info Card */}
      <motion.div
        variants={item}
        className="flex items-center gap-4 rounded-xl border border-primary/20 bg-primary/10 p-5 shadow-sm"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-primary text-white">
          <Building2 className="h-6 w-6" />
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-bold text-foreground">
            {job.title}
          </h3>
          <p className="text-sm font-medium text-muted-foreground">
            {job.company} &middot; {job.location} &middot; {job.contractType}
          </p>
        </div>
      </motion.div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Email Fields */}
        <motion.div
          variants={item}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
            <Mail className="h-5 w-5 text-primary" />
            Composition de l'email
          </h2>

          <div className="space-y-4">
            {/* Recipient */}
            <div>
              <Label className="mb-1.5">
                Destinataire
              </Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="email"
                  className="bg-muted pl-10"
                  placeholder="recrutement@entreprise.ma"
                  {...register('recipient')}
                />
              </div>
              {errors.recipient && (
                <p className="mt-1 text-xs text-destructive">{errors.recipient.message}</p>
              )}
            </div>

            {/* Subject */}
            <div>
              <Label className="mb-1.5">
                Objet
              </Label>
              <div className="relative">
                <FileText className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  className="bg-muted pl-10"
                  {...register('subject')}
                />
              </div>
              {errors.subject && (
                <p className="mt-1 text-xs text-destructive">{errors.subject.message}</p>
              )}
            </div>

            {/* Template Selector */}
            {templateOptions.length > 0 && (
              <div>
                <Label className="mb-1.5">
                  Template
                </Label>
                <div className="relative">
                  <FileText className="pointer-events-none absolute left-3 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Select value={selectedTemplate || ''} onValueChange={handleTemplateChange}>
                    <SelectTrigger className="w-full bg-muted pl-10">
                      <SelectValue placeholder="Choisir un template" />
                    </SelectTrigger>
                    <SelectContent>
                      {templateOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Email Body */}
            <div>
              <div className="mb-1.5 flex items-center justify-between">
                <Label className="text-sm font-medium">
                  Corps de l'email
                </Label>
                <motion.button
                  type="button"
                  onClick={handleGenerateAI}
                  disabled={isGenerating}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-purple-500 to-primary px-3 py-1.5 text-xs font-semibold text-white shadow-sm transition-opacity hover:opacity-90 disabled:opacity-50"
                >
                  {isGenerating && generatingField === 'body' ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Sparkles className="h-3.5 w-3.5" />
                  )}
                  {isGenerating ? 'Génération...' : 'Générer avec AI'}
                </motion.button>
              </div>
              <Textarea
                rows={16}
                className="bg-muted"
                {...register('body')}
              />
              {errors.body && (
                <p className="mt-1 text-xs text-destructive">{errors.body.message}</p>
              )}
            </div>
          </div>
        </motion.div>

        {/* Options */}
        <motion.div
          variants={item}
          className="rounded-xl border border-border bg-card p-6 shadow-sm"
        >
          <h2 className="mb-5 flex items-center gap-2 text-lg font-bold text-foreground">
            <Paperclip className="h-5 w-5 text-accent" />
            Options
          </h2>

          <div className="space-y-5">
            {/* Attach CV */}
            <label className="flex cursor-pointer items-center justify-between gap-4 rounded-lg border border-border p-4 transition-colors hover:bg-muted">
              <div className="flex items-center gap-3">
                <div className={`rounded-lg p-2 ${watchedAttachCv ? 'bg-accent/10' : 'bg-muted'}`}>
                  <Paperclip className={`h-4 w-4 ${watchedAttachCv ? 'text-accent' : 'text-muted-foreground'}`} />
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">
                    Joindre le CV
                  </p>
                  <p className="text-xs text-muted-foreground">
                    Inclure votre CV actuel en pièce jointe
                  </p>
                </div>
              </div>
              <div className="relative">
                <input
                  type="checkbox"
                  {...register('attachCv')}
                  className="peer sr-only"
                />
                <div className="h-6 w-11 rounded-full bg-border transition-colors peer-checked:bg-accent" />
                <div className="absolute left-0.5 top-0.5 h-5 w-5 rounded-full bg-background shadow-sm transition-transform peer-checked:translate-x-5" />
              </div>
            </label>

            {/* Portfolio URL */}
            <div>
              <Label className="mb-1.5 gap-2">
                <LinkIcon className="h-4 w-4 text-muted-foreground" />
                URL Portfolio (optionnel)
              </Label>
              <Input
                type="url"
                className="bg-muted"
                placeholder="https://mon-portfolio.com"
                {...register('portfolioUrl')}
              />
              {errors.portfolioUrl && (
                <p className="mt-1 text-xs text-destructive">{errors.portfolioUrl.message}</p>
              )}
            </div>

            {/* Cover Letter */}
            <div>
              <Label className="mb-1.5 gap-2">
                <FileText className="h-4 w-4 text-muted-foreground" />
                Lettre de motivation (optionnel)
              </Label>
              <Textarea
                rows={4}
                className="bg-muted"
                placeholder="Ajoutez une lettre de motivation personnalisée..."
                {...register('coverLetter')}
              />
            </div>

            {/* Notes */}
            <div>
              <Label className="mb-1.5 gap-2">
                <StickyNote className="h-4 w-4 text-muted-foreground" />
                Notes internes (optionnel)
              </Label>
              <Textarea
                rows={3}
                className="bg-muted"
                placeholder="Notes personnelles (non incluses dans l'email)..."
                {...register('notes')}
              />
            </div>
          </div>
        </motion.div>

        {/* Preview Section */}
        <motion.div variants={item}>
          <Button
            type="button"
            variant="outline"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Masquer l\'aperçu' : 'Voir l\'aperçu'}
          </Button>

          {showPreview && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="mt-4 overflow-hidden rounded-xl border border-border bg-card shadow-sm"
            >
              <div className="border-b border-border bg-muted px-6 py-4">
                <h3 className="text-sm font-semibold text-foreground">
                  Aperçu de l'email
                </h3>
              </div>
              <div className="p-6">
                <div className="space-y-3 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 font-medium text-muted-foreground">À :</span>
                    <span className="text-foreground">{watchedRecipient}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-20 shrink-0 font-medium text-muted-foreground">Objet :</span>
                    <span className="font-semibold text-foreground">{watchedSubject}</span>
                  </div>
                  {watchedAttachCv && (
                    <div className="flex items-center gap-2">
                      <span className="w-20 shrink-0 font-medium text-muted-foreground">PJ :</span>
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                        <Paperclip className="h-3 w-3" />
                        CV.pdf
                      </span>
                    </div>
                  )}
                </div>
                <div className="mt-5 border-t border-border pt-5">
                  <div className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
                    {watchedBody}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </motion.div>

        {/* Actions */}
        <motion.div
          variants={item}
          className="flex flex-col items-center gap-3 border-t border-border pt-6 sm:flex-row sm:justify-end"
        >
          <motion.button
            type="button"
            onClick={onSaveDraft}
            disabled={isMutating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-border bg-card px-6 py-3 text-sm font-semibold text-foreground shadow-sm transition-colors hover:bg-muted sm:w-auto disabled:opacity-50"
          >
            {createApplication.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            {createApplication.isPending ? 'Enregistrement...' : 'Enregistrer brouillon'}
          </motion.button>

          <motion.button
            type="submit"
            disabled={isMutating}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary/90 sm:w-auto disabled:opacity-50"
          >
            {isMutating ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            {isMutating ? 'Envoi en cours...' : 'Envoyer la candidature'}
          </motion.button>
        </motion.div>
      </form>
    </motion.div>
  )
}