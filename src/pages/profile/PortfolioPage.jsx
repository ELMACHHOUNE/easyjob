import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowLeft, Globe, Plus, Trash2, ExternalLink, Folder, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { usePortfolio, useUpdatePortfolio } from '@/api/hooks'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'

export default function PortfolioPage() {
  const { data: portfolioData, isLoading } = usePortfolio()
  const updateMutation = useUpdatePortfolio()

  const portfolio = portfolioData?.portfolio
  const [portfolioUrl, setPortfolioUrl] = useState('')
  const [description, setDescription] = useState('')
  const [projects, setProjects] = useState([])
  const [showAddForm, setShowAddForm] = useState(false)
  const [newProject, setNewProject] = useState({ name: '', description: '', url: '', technologies: '' })

  useEffect(() => {
    if (portfolio) {
      setPortfolioUrl(portfolio.url || '')
      setDescription(portfolio.description || '')
      setProjects(portfolio.projects || [])
    }
  }, [portfolio])

  const handleAddProject = () => {
    if (!newProject.name) return toast.error('Le nom du projet est requis')
    const project = {
      name: newProject.name,
      description: newProject.description,
      url: newProject.url,
      technologies: newProject.technologies.split(',').map(t => t.trim()).filter(Boolean),
    }
    setProjects([...projects, project])
    setNewProject({ name: '', description: '', url: '', technologies: '' })
    setShowAddForm(false)
  }

  const handleRemoveProject = (index) => {
    setProjects(projects.filter((_, i) => i !== index))
  }

  const handleSave = () => {
    updateMutation.mutate(
      { url: portfolioUrl, description, projects },
      {
        onSuccess: () => toast.success('Portfolio sauvegardé !'),
        onError: () => toast.error('Erreur lors de la sauvegarde'),
      }
    )
  }

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto space-y-6 px-4 py-8">
        <div className="flex items-center gap-4">
          <Link to="/profile" className="p-2 rounded-lg hover:bg-muted transition">
            <ArrowLeft className="w-5 h-5 text-muted-foreground" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Mon Portfolio</h1>
            <p className="text-muted-foreground">Chargement...</p>
          </div>
        </div>
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <div key={i} className="h-48 animate-pulse rounded-xl bg-muted" />
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Link to="/profile" className="p-2 rounded-lg hover:bg-muted transition">
          <ArrowLeft className="w-5 h-5 text-muted-foreground" />
        </Link>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Mon Portfolio</h1>
          <p className="text-muted-foreground">Présentez vos projets et réalisations</p>
        </div>
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <h2 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          URL du Portfolio
        </h2>
        <Input
          type="url"
          value={portfolioUrl}
          onChange={(e) => setPortfolioUrl(e.target.value)}
          className="border-border bg-muted"
          placeholder="https://votre-portfolio.dev"
        />
        <Textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-4 border-border bg-muted resize-none"
          placeholder="Décrivez votre portfolio..."
        />
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-card rounded-xl p-6 shadow-sm border border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
            <Folder className="w-5 h-5 text-accent" />
            Projets ({projects.length})
          </h2>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4" /> Ajouter
          </Button>
        </div>

        {showAddForm && (
          <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} className="mb-4 p-4 bg-muted rounded-lg space-y-3">
            <Input value={newProject.name} onChange={e => setNewProject({...newProject, name: e.target.value})} className="bg-card" placeholder="Nom du projet" />
            <Input value={newProject.description} onChange={e => setNewProject({...newProject, description: e.target.value})} className="bg-card" placeholder="Description" />
            <Input value={newProject.url} onChange={e => setNewProject({...newProject, url: e.target.value})} className="bg-card" placeholder="URL du projet" />
            <Input value={newProject.technologies} onChange={e => setNewProject({...newProject, technologies: e.target.value})} className="bg-card" placeholder="Technologies (séparées par virgules)" />
            <div className="flex gap-2">
              <Button onClick={handleAddProject}>Ajouter</Button>
              <Button variant="outline" className="bg-muted text-foreground hover:bg-muted hover:text-foreground" onClick={() => setShowAddForm(false)}>Annuler</Button>
            </div>
          </motion.div>
        )}

        <div className="space-y-3">
          {projects.length === 0 && (
            <p className="text-center text-muted-foreground py-8">
              Aucun projet ajouté pour le moment.
            </p>
          )}
          {projects.map((project, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }} className="p-4 bg-muted rounded-lg flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-foreground">{project.name}</h3>
                <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                <div className="flex flex-wrap gap-1.5 mt-2">
                  {(project.technologies || []).map(tech => (
                    <Badge key={tech} variant="secondary" className="rounded-full bg-primary/10 text-primary">{tech}</Badge>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-2">
                {project.url && (
                  <a href={project.url} target="_blank" rel="noopener noreferrer" className="p-2 rounded-lg hover:bg-muted transition">
                    <ExternalLink className="w-4 h-4 text-muted-foreground" />
                  </a>
                )}
                <Button type="button" variant="ghost" onClick={() => handleRemoveProject(i)} className="text-destructive hover:bg-destructive/20 hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={updateMutation.isPending}
          size="lg"
          className="font-semibold shadow-[var(--shadow-md)]"
        >
          {updateMutation.isPending ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : null}
          Sauvegarder le portfolio
        </Button>
      </div>
    </div>
  )
}