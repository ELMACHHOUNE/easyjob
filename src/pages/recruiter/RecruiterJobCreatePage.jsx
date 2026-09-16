import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { motion } from 'framer-motion'
import { ArrowLeft, Loader2, Plus, X } from 'lucide-react'
import { useCreateRecruiterJob } from '@/api/hooks'
import { toast } from 'sonner'

const schema = z.object({
  title: z.string().min(3, 'Titre requis'),
  location: z.string().min(2, 'Localisation requise'),
  contractType: z.enum(['CDI', 'CDD', 'Stage', 'Freelance', 'Temps partiel']),
  description: z.string().min(20, 'Description trop courte (min 20 caractères)'),
  domain: z.string().min(2, 'Domaine requis'),
  isRemote: z.boolean().optional(),
  salary: z.object({
    min: z.number().optional(),
    max: z.number().optional(),
  }).optional(),
  requirements: z.array(z.string()).optional(),
  responsibilities: z.array(z.string()).optional(),
  applicationDeadline: z.string().optional(),
})

const DOMAINS = [
  'Informatique', 'Industrie', 'Génie Civil', 'Finance', 'Marketing',
  'Santé', 'Éducation', 'BTP', 'Télécommunications', 'Énergie',
  'Agriculture', 'Ressources Humaines', 'Logistique', 'Commerce', 'Autre',
]

export default function RecruiterJobCreatePage() {
  const navigate = useNavigate()
  const createJob = useCreateRecruiterJob()
  const [requirements, setRequirements] = useState([])
  const [responsibilities, setResponsibilities] = useState([])
  const [reqInput, setReqInput] = useState('')
  const [respInput, setRespInput] = useState('')

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      contractType: 'CDI',
      domain: '',
      isRemote: false,
    },
  })

  const onSubmit = async (data) => {
    const salary = {}
    if (Number.isFinite(data.salary?.min)) salary.min = data.salary.min
    if (Number.isFinite(data.salary?.max)) salary.max = data.salary.max

    const payload = {
      ...data,
      requirements,
      responsibilities,
      salary: Object.keys(salary).length > 0 ? salary : undefined,
      applicationDeadline: data.applicationDeadline?.trim() ? data.applicationDeadline : undefined,
    }
    try {
      await createJob.mutateAsync(payload)
      toast.success('Offre créée avec succès !')
      navigate('/recruiter-space/jobs')
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la création')
    }
  }

  const addRequirement = () => {
    if (reqInput.trim()) {
      setRequirements([...requirements, reqInput.trim()])
      setReqInput('')
    }
  }

  const addResponsibility = () => {
    if (respInput.trim()) {
      setResponsibilities([...responsibilities, respInput.trim()])
      setRespInput('')
    }
  }

  const inputClass = "w-full px-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 text-surface-800 dark:text-white focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition"

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-surface-500 hover:text-surface-700 dark:hover:text-white transition">
        <ArrowLeft className="w-5 h-5" />
        Retour
      </button>

      <h1 className="text-2xl font-bold text-surface-800 dark:text-white">Nouvelle offre d'emploi</h1>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-5 rounded-2xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-800 p-6 shadow-sm">
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Titre du poste *</label>
          <input type="text" {...register('title')} className={inputClass} placeholder="Développeur Full Stack React/Node.js" />
          {errors.title && <p className="text-danger-500 text-sm mt-1">{errors.title.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Localisation *</label>
            <input type="text" {...register('location')} className={inputClass} placeholder="Casablanca" />
            {errors.location && <p className="text-danger-500 text-sm mt-1">{errors.location.message}</p>}
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Type de contrat *</label>
            <select {...register('contractType')} className={inputClass}>
              <option value="CDI">CDI</option>
              <option value="CDD">CDD</option>
              <option value="Stage">Stage</option>
              <option value="Freelance">Freelance</option>
              <option value="Temps partiel">Temps partiel</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Domaine *</label>
            <select {...register('domain')} className={inputClass}>
              <option value="">Choisir un domaine</option>
              {DOMAINS.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
            {errors.domain && <p className="text-danger-500 text-sm mt-1">{errors.domain.message}</p>}
          </div>
          <div className="flex items-end">
            <label className="flex items-center gap-3 cursor-pointer pb-3">
              <input type="checkbox" {...register('isRemote')} className="w-5 h-5 rounded border-surface-300 text-primary-500 focus:ring-primary-500" />
              <span className="text-sm font-medium text-surface-700 dark:text-surface-300">Télétravail possible</span>
            </label>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Description du poste *</label>
          <textarea {...register('description')} rows={6} className={inputClass} placeholder="Décrivez le poste, les missions, l'environnement de travail..." />
          {errors.description && <p className="text-danger-500 text-sm mt-1">{errors.description.message}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Salaire min (MAD)</label>
            <input type="number" {...register('salary.min', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })} className={inputClass} placeholder="5000" />
          </div>
          <div>
            <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Salaire max (MAD)</label>
            <input type="number" {...register('salary.max', { setValueAs: (v) => (v === '' ? undefined : Number(v)) })} className={inputClass} placeholder="15000" />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Date limite de candidature</label>
          <input type="date" {...register('applicationDeadline')} className={inputClass} />
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Prérequis</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={reqInput}
              onChange={(e) => setReqInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequirement())}
              className={inputClass}
              placeholder="Ajouter un prérequis..."
            />
            <button type="button" onClick={addRequirement} className="px-4 py-2 bg-surface-100 dark:bg-surface-700 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {requirements.map((r, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 rounded-full text-sm">
                {r}
                <button type="button" onClick={() => setRequirements(requirements.filter((_, j) => j !== i))}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Responsibilities */}
        <div>
          <label className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5">Responsabilités</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={respInput}
              onChange={(e) => setRespInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addResponsibility())}
              className={inputClass}
              placeholder="Ajouter une responsabilité..."
            />
            <button type="button" onClick={addResponsibility} className="px-4 py-2 bg-surface-100 dark:bg-surface-700 rounded-xl hover:bg-surface-200 dark:hover:bg-surface-600 transition">
              <Plus className="w-5 h-5" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {responsibilities.map((r, i) => (
              <span key={i} className="flex items-center gap-1 px-3 py-1 bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full text-sm">
                {r}
                <button type="button" onClick={() => setResponsibilities(responsibilities.filter((_, j) => j !== i))}>
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex-1 py-3 border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-400 font-semibold rounded-xl hover:bg-surface-50 dark:hover:bg-surface-700 transition"
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : null}
            Publier l'offre
          </button>
        </div>
      </form>
    </motion.div>
  )
}
