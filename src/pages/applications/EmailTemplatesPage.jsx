import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  FileText,
  Plus,
  Edit3,
  Trash2,
  Mail,
  Tag,
  Copy,
  CopyPlus,
  Variable,
  Hash,
  User,
  Building2,
  Briefcase,
  BookOpen,
  Calendar,
  Loader2,
  Sparkles,
} from 'lucide-react'
import { toast } from 'sonner'
import {
  useEmailTemplates,
  useCreateEmailTemplate,
  useUpdateEmailTemplate,
  useDeleteEmailTemplate,
} from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
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
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import ConfirmDialog from '@/components/ui/confirm-dialog'
import { cn } from '@/lib/utils'

const availableVariables = [
  { variable: '{{userName}}', description: 'Votre nom complet', icon: User },
  { variable: '{{jobTitle}}', description: 'Titre du poste', icon: Briefcase },
  { variable: '{{company}}', description: "Nom de l'entreprise", icon: Building2 },
  { variable: '{{recruiterName}}', description: 'Nom du recruteur', icon: User },
  { variable: '{{experienceYears}}', description: "Années d'expérience", icon: Hash },
  { variable: '{{studyField}}', description: "Domaine d'études", icon: BookOpen },
  { variable: '{{applicationDate}}', description: 'Date de candidature', icon: Calendar },
]

const categoryColors = {
  Candidature: 'bg-primary/10 text-primary',
  Relance: 'bg-accent/10 text-accent',
  Remerciement: 'bg-[#8B5CF6]/10 text-[#8B5CF6]',
  Suivi: 'bg-warning/10 text-warning',
  Personnalisé: 'bg-muted text-foreground',
}

const categories = Object.keys(categoryColors)

const normalizeCategory = (category) => {
  const map = {
    candidature: 'Candidature',
    relance: 'Relance',
    remerciement: 'Remerciement',
    suivi: 'Suivi',
    'personnalisé': 'Personnalisé',
    'personnalise': 'Personnalisé',
  }
  return map[category] || category || 'Candidature'
}

const categoryClass = (category) =>
  categoryColors[normalizeCategory(category)] || categoryColors.Personnalisé

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

const defaultTemplate = {
  name: '',
  subject: '',
  body: '',
  category: 'Candidature',
}

export default function EmailTemplatesPage() {
  const { data, isLoading, isError } = useEmailTemplates()
  const createMutation = useCreateEmailTemplate()
  const updateMutation = useUpdateEmailTemplate()
  const deleteMutation = useDeleteEmailTemplate()

  const [isModalOpen, setIsModalOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState(null)
  const [form, setForm] = useState(defaultTemplate)
  const [deleteConfirm, setDeleteConfirm] = useState(null)

  const templateList = data?.templates ?? []

  const openCreateFromScratch = () => {
    setEditingTemplate(null)
    setForm(defaultTemplate)
    setIsModalOpen(true)
  }

  const openCreateFromTemplate = (template) => {
    setEditingTemplate(null)
    setForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: normalizeCategory(template.category),
    })
    setIsModalOpen(true)
  }

  const openEdit = (template) => {
    setEditingTemplate(template)
    setForm({
      name: template.name,
      subject: template.subject,
      body: template.body,
      category: normalizeCategory(template.category),
    })
    setIsModalOpen(true)
  }

  const handleSave = () => {
    if (!form.name.trim() || !form.subject.trim() || !form.body.trim()) {
      toast.error('Veuillez remplir tous les champs')
      return
    }

    const payload = {
      name: form.name.trim(),
      subject: form.subject.trim(),
      body: form.body.trim(),
      category: form.category,
    }

    if (editingTemplate) {
      updateMutation.mutate(
        {
          id: editingTemplate._id || editingTemplate.id,
          ...payload,
        },
        {
          onSuccess: () => {
            toast.success('Template mis à jour')
            setIsModalOpen(false)
            setForm(defaultTemplate)
            setEditingTemplate(null)
          },
          onError: () => toast.error('Erreur lors de la sauvegarde'),
        }
      )
    } else {
      createMutation.mutate(
        payload,
        {
          onSuccess: () => {
            toast.success('Template créé')
            setIsModalOpen(false)
            setForm(defaultTemplate)
          },
          onError: () => toast.error('Erreur lors de la création'),
        }
      )
    }
  }

  const handleDelete = (id) => {
    deleteMutation.mutate(id, {
      onSuccess: () => {
        setDeleteConfirm(null)
        toast.success('Template supprimé')
      },
      onError: () => {
        toast.error('Erreur lors de la suppression')
      },
    })
  }

  const handleCopyVariable = (variable) => {
    navigator.clipboard.writeText(variable)
    toast.success(`"${variable}" copié`)
  }

  const isDefaultTemplate = (template) => template.isDefault === true || !template.userId

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8"
    >
      {/* Header */}
      <motion.div variants={item} className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">
            Templates d'emails
          </h1>
          <p className="mt-1 text-muted-foreground">
            Gérez vos modèles d'email pour vos candidatures
          </p>
        </div>
        <Button onClick={openCreateFromScratch}>
          <Plus className="h-4 w-4" />
          Créer un template
        </Button>
      </motion.div>

      {/* Content Grid: Templates + Variables Sidebar */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Templates Column */}
        <div className="min-w-0 space-y-4 lg:col-span-2">
          <motion.div variants={item}>
            <p className="text-sm font-medium text-muted-foreground">
              <span className="font-bold text-foreground">
                {templateList.length}
              </span>{' '}
              {templateList.length === 1 ? 'template' : 'templates'}
            </p>
          </motion.div>

          {isLoading && (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={i}
                  className="flex h-full flex-col rounded-xl border border-border bg-card p-5 shadow-sm"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Skeleton className="h-5 w-40" />
                        <Skeleton className="h-5 w-20 rounded-full" />
                      </div>
                      <Skeleton className="mt-1.5 h-4 w-3/4" />
                    </div>
                  </div>
                  <div className="mt-auto">
                    <div className="flex items-center gap-2 border-t border-border pt-4">
                      <Skeleton className="h-8 w-24" />
                      <Skeleton className="h-8 w-8" />
                      <Skeleton className="ml-auto h-8 w-8" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {isError && (
            <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-6 text-center">
              <p className="text-sm font-medium text-destructive">
                Erreur lors du chargement des templates
              </p>
            </div>
          )}

          {!isLoading && !isError && (
            <motion.div
              variants={container}
              initial="hidden"
              animate="show"
              className="grid grid-cols-1 gap-4 sm:grid-cols-2"
            >
              <AnimatePresence mode="popLayout">
                {templateList.map((template) => (
                  <motion.div
                    key={template._id || template.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95, transition: { duration: 0.2 } }}
                    whileHover={{ y: -4, transition: { duration: 0.2 } }}
                    className={cn(
                      'group flex h-full flex-col rounded-xl border bg-card p-5 shadow-sm transition-shadow hover:shadow-[var(--shadow-md)]',
                      isDefaultTemplate(template)
                        ? 'border-dashed border-primary/30 bg-primary/[0.03]'
                        : 'border-border'
                    )}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="text-base font-bold text-foreground">
                            {template.name}
                          </h3>
                        </div>
                        <div className="mt-1.5 flex flex-wrap items-center gap-2">
                          <Badge
                            variant="secondary"
                            className={cn(
                              'h-auto rounded-full px-2.5 py-0.5 text-xs font-semibold',
                              categoryClass(template.category)
                            )}
                          >
                            {normalizeCategory(template.category)}
                          </Badge>
                          {isDefaultTemplate(template) && (
                            <Badge variant="outline" className="h-auto gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium text-primary">
                              <Sparkles className="size-3" />
                              Par défaut
                            </Badge>
                          )}
                        </div>
                        <p className="mt-1.5 line-clamp-1 text-sm text-muted-foreground">
                          <span className="font-medium text-muted-foreground">Objet :</span>{' '}
                          {template.subject}
                        </p>

                        <div className="mt-3 max-h-0 overflow-hidden opacity-0 transition-all duration-300 group-hover:max-h-40 group-hover:opacity-100">
                          <div className="rounded-lg bg-muted/60 px-3 py-2">
                            <p className="line-clamp-5 whitespace-pre-line text-xs leading-relaxed text-muted-foreground">
                              {template.body}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-auto flex items-center gap-2 border-t border-border pt-4">
                      {isDefaultTemplate(template) ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => openCreateFromTemplate(template)}
                        >
                          <CopyPlus className="h-3 w-3" />
                          Utiliser le modèle
                        </Button>
                      ) : (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEdit(template)}
                          >
                            <Edit3 className="h-3 w-3" />
                            Modifier
                          </Button>
                          <div className="relative ml-auto">
                            <Button
                              variant="ghost"
                              size="icon-sm"
                              onClick={() => setDeleteConfirm(deleteConfirm === (template._id || template.id) ? null : (template._id || template.id))}
                              aria-label="Supprimer"
                              className="text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </>
                      )}
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>

              {!isLoading && templateList.length === 0 && (
                <div className="col-span-full rounded-xl border border-dashed border-border bg-muted p-12 text-center">
                  <FileText className="mx-auto h-10 w-10 text-muted-foreground" />
                  <p className="mt-3 text-sm font-medium text-foreground">
                    Aucun template pour le moment
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    Créez votre premier template pour gagner du temps
                  </p>
                  <Button onClick={openCreateFromScratch} className="mt-5">
                    <Plus className="h-4 w-4" />
                    Créer mon premier template
                  </Button>
                </div>
              )}
            </motion.div>
          )}
        </div>

        {/* Variables Reference Sidebar */}
        <motion.div variants={item} className="lg:col-span-1">
          <div className="sticky top-8 rounded-xl border border-border bg-card p-6 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-bold text-foreground">
              <Variable className="h-5 w-5 text-accent" />
              Variables disponibles
            </h2>
            <p className="mb-5 text-xs text-muted-foreground">
              Cliquez pour copier une variable
            </p>

            <div className="space-y-3">
              {availableVariables.map((v) => {
                const Icon = v.icon
                return (
                  <button
                    key={v.variable}
                    onClick={() => handleCopyVariable(v.variable)}
                    className="group flex w-full items-center gap-3 rounded-lg border border-border p-3 text-left transition-colors hover:border-primary/30 hover:bg-primary/10"
                  >
                    <div className="shrink-0 rounded-lg bg-muted p-1.5 transition-colors group-hover:bg-primary/10">
                      <Icon className="h-3.5 w-3.5 text-muted-foreground transition-colors group-hover:text-primary" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <code className="text-xs font-semibold text-primary">
                        {v.variable}
                      </code>
                      <p className="text-xs text-muted-foreground">
                        {v.description}
                      </p>
                    </div>
                    <Copy className="h-3.5 w-3.5 shrink-0 text-border opacity-0 transition-opacity group-hover:opacity-100" />
                  </button>
                )
              })}
            </div>

            <div className="mt-5 rounded-lg bg-muted p-4">
              <h3 className="text-xs font-semibold text-foreground">
                Astuce
              </h3>
              <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
                Les variables sont automatiquement remplacées par les informations du poste et du profil lors de l'envoi.
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Template Editor Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Modifier le template' : form.name ? 'Créer à partir d\'un modèle' : 'Créer un template'}
            </DialogTitle>
          </DialogHeader>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto">
            {/* Template Name */}
            <div>
              <Label className="mb-1.5">
                Nom du template
              </Label>
              <div className="relative">
                <Tag className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-muted pl-10"
                  placeholder="Mon template personnalisé"
                />
              </div>
            </div>

            {/* Category */}
            <div>
              <Label className="mb-1.5">
                Catégorie
              </Label>
              <Select
                value={form.category}
                onValueChange={(category) => setForm((prev) => ({ ...prev, category }))}
              >
                <SelectTrigger className="w-full bg-muted">
                  <SelectValue placeholder="Choisir une catégorie" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Subject */}
            <div>
              <Label className="mb-1.5">
                Objet de l'email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  type="text"
                  value={form.subject}
                  onChange={(e) => setForm((prev) => ({ ...prev, subject: e.target.value }))}
                  className="bg-muted pl-10"
                  placeholder="Candidature au poste de {{jobTitle}} chez {{company}}"
                />
              </div>
            </div>

            {/* Body */}
            <div>
              <Label className="mb-1.5">
                Corps du template
              </Label>
              <Textarea
                value={form.body}
                onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
                rows={12}
                className="bg-muted"
                placeholder="Rédigez votre template ici... Utilisez {{variable}} pour les valeurs dynamiques."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsModalOpen(false)}>
              Annuler
            </Button>
            <Button
              onClick={handleSave}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {createMutation.isPending || updateMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : editingTemplate ? (
                'Enregistrer les modifications'
              ) : (
                'Créer le template'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={!!deleteConfirm}
        onOpenChange={(open) => { if (!open) setDeleteConfirm(null) }}
        title="Supprimer ce template ?"
        description="Cette action est irréversible. Le template sera définitivement supprimé."
        confirmText="Supprimer"
        onConfirm={() => deleteConfirm && handleDelete(deleteConfirm)}
        icon={Trash2}
      />
    </motion.div>
  )
}