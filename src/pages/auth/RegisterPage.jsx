import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { User, Mail, Phone, Lock, Eye, EyeOff, Loader2, Briefcase, Building2, ChevronDown } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import AuthLayout from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import { cn } from '@/lib/utils'

const baseSchema = z.object({
  firstName: z.string().min(2, 'Minimum 2 caractères'),
  lastName: z.string().min(2, 'Minimum 2 caractères'),
  email: z.string().email('Email invalide'),
  phone: z.string().min(10, 'Numéro invalide').optional().or(z.literal('')),
  password: z.string().min(8, 'Minimum 8 caractères'),
  confirmPassword: z.string(),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Vous devez accepter les conditions',
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Les mots de passe ne correspondent pas',
  path: ['confirmPassword'],
})

const recruiterSchema = baseSchema.extend({
  companyName: z.string().min(2, 'Nom de la société requis'),
  industry: z.string().min(2, 'Secteur d\'activité requis'),
  companySize: z.string().optional(),
  companyLocation: z.string().optional(),
  position: z.string().optional(),
  linkedinUrl: z.string().url('URL invalide').optional().or(z.literal('')),
})

const strengthLabels = ['', 'Faible', 'Moyen', 'Bon', 'Excellent']
const strengthColors = ['', 'text-destructive', 'text-warning', 'text-primary', 'text-accent']

function getPasswordStrength(pw) {
  if (!pw) return { value: 0, label: '' }
  let score = 0
  if (pw.length >= 8) score += 1
  if (pw.length >= 12) score += 1
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score += 1
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score += 1
  const value = Math.max(1, Math.min(4, Math.ceil(score / 2)))
  return { value, label: strengthLabels[value] }
}

const selectClass =
  "h-11 w-full appearance-none rounded-md border border-input bg-transparent px-3 pr-9 text-sm text-foreground transition-colors placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20"

function SelectField({ label, icon: Icon, children, error, ...selectProps }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <select {...selectProps} className={cn(selectClass, Icon && 'pl-10')}>
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}

const inputWithIcon = "h-11 pl-10"

export default function RegisterPage() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [selectedRole, setSelectedRole] = useState('candidat')
  const { register: registerUser } = useAuth()
  const navigate = useNavigate()

  const currentSchema = selectedRole === 'recruiter' ? recruiterSchema : baseSchema

  const { register, handleSubmit, watch, setValue, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(currentSchema),
    defaultValues: {
      acceptTerms: false,
      companySize: '11-50',
    },
  })

  const password = watch('password') || ''
  const acceptTerms = watch('acceptTerms')
  const strength = getPasswordStrength(password)

  const onSubmit = async (data) => {
    const { confirmPassword: _confirmPassword, acceptTerms: _terms, ...payload } = data
    payload.role = selectedRole
    const result = await registerUser(payload)
    if (result.success) {
      toast.success('Compte créé ! Vérifiez votre email.')
      navigate('/verify-email', { state: { previewUrl: result.previewUrl, email: data.email } })
    } else {
      toast.error(result.error)
    }
  }

  const roleOptions = [
    { value: 'candidat', label: 'Candidat', icon: User },
    { value: 'recruiter', label: 'Recruteur', icon: Building2 },
  ]

  return (
    <AuthLayout>
      <h1 className="text-3xl font-semibold tracking-tight">Créer un compte</h1>
      <p className="mt-2 text-muted-foreground">
        Rejoignez JobConnect AI et trouvez votre prochaine opportunité.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-3">
        {roleOptions.map(({ value, label, icon: Icon }) => (
          <button
            key={value}
            type="button"
            onClick={() => setSelectedRole(value)}
            className={cn(
              "flex h-12 items-center justify-center gap-2 rounded-md border text-sm font-medium transition-colors",
              selectedRole === value
                ? "border-primary bg-primary/5 text-primary shadow-[inset_0_0_0_1px_var(--primary)]"
                : "border-border text-muted-foreground hover:bg-muted/60"
            )}
          >
            <Icon className="size-4" />
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-6 space-y-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-2">
            <Label htmlFor="firstName">Prénom</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="firstName"
                type="text"
                placeholder="Jean"
                className={inputWithIcon}
                aria-invalid={!!errors.firstName}
                {...register('firstName')}
              />
            </div>
            {errors.firstName && <p className="text-sm text-destructive">{errors.firstName.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="lastName">Nom</Label>
            <div className="relative">
              <User className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="lastName"
                type="text"
                placeholder="Dupont"
                className={inputWithIcon}
                aria-invalid={!!errors.lastName}
                {...register('lastName')}
              />
            </div>
            {errors.lastName && <p className="text-sm text-destructive">{errors.lastName.message}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <div className="relative">
            <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              placeholder="votre@email.com"
              className={inputWithIcon}
              aria-invalid={!!errors.email}
              {...register('email')}
            />
          </div>
          {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone">Téléphone</Label>
          <div className="relative">
            <Phone className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              placeholder="+212 6XX XX XX XX"
              className={inputWithIcon}
              aria-invalid={!!errors.phone}
              {...register('phone')}
            />
          </div>
          {errors.phone && <p className="text-sm text-destructive">{errors.phone.message}</p>}
        </div>

        {selectedRole === 'recruiter' && (
          <>
            <div className="border-t border-border pt-5">
              <p className="flex items-center gap-2 text-sm font-semibold">
                <Building2 className="size-4 text-primary" />
                Informations de l'entreprise
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyName">Nom de la société *</Label>
              <div className="relative">
                <Building2 className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="companyName"
                  type="text"
                  placeholder="Mon Entreprise"
                  className={inputWithIcon}
                  aria-invalid={!!errors.companyName}
                  {...register('companyName')}
                />
              </div>
              {errors.companyName && <p className="text-sm text-destructive">{errors.companyName.message}</p>}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <SelectField
                label="Secteur d'activité *"
                icon={Briefcase}
                error={errors.industry?.message}
                {...register('industry')}
              >
                <option value="">Choisir...</option>
                <option value="Informatique">Informatique</option>
                <option value="Industrie">Industrie</option>
                <option value="Génie Civil">Génie Civil</option>
                <option value="Finance">Finance</option>
                <option value="Marketing">Marketing</option>
                <option value="Santé">Santé</option>
                <option value="Éducation">Éducation</option>
                <option value="BTP">BTP</option>
                <option value="Télécommunications">Télécommunications</option>
                <option value="Énergie">Énergie</option>
                <option value="Agriculture">Agriculture</option>
                <option value="Autre">Autre</option>
              </SelectField>

              <SelectField label="Taille" {...register('companySize')}>
                <option value="1-10">1-10</option>
                <option value="11-50">11-50</option>
                <option value="51-200">51-200</option>
                <option value="201-500">201-500</option>
                <option value="501-1000">501-1000</option>
                <option value="1000+">1000+</option>
              </SelectField>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label htmlFor="companyLocation">Localisation</Label>
                <Input
                  id="companyLocation"
                  type="text"
                  placeholder="Casablanca"
                  className="h-11"
                  {...register('companyLocation')}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="position">Votre poste</Label>
                <Input
                  id="position"
                  type="text"
                  placeholder="DRH"
                  className="h-11"
                  {...register('position')}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="linkedinUrl">LinkedIn (optionnel)</Label>
              <Input
                id="linkedinUrl"
                type="url"
                placeholder="https://linkedin.com/in/..."
                className="h-11"
                aria-invalid={!!errors.linkedinUrl}
                {...register('linkedinUrl')}
              />
              {errors.linkedinUrl && <p className="text-sm text-destructive">{errors.linkedinUrl.message}</p>}
            </div>
          </>
        )}

        <div className="space-y-2">
          <Label htmlFor="password">Mot de passe</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-11 pl-10 pr-10"
              aria-invalid={!!errors.password}
              {...register('password')}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {password && (
            <div className="space-y-1.5">
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((bar) => (
                  <div
                    key={bar}
                    className={cn(
                      "h-1 flex-1 rounded-full transition-colors",
                      bar <= strength.value
                        ? strength.value === 1
                          ? "bg-destructive"
                          : strength.value === 2
                            ? "bg-warning"
                            : strength.value === 3
                              ? "bg-primary"
                              : "bg-accent"
                        : "bg-border"
                    )}
                  />
                ))}
              </div>
              <p className={cn("text-xs", strengthColors[strength.value] || 'text-muted-foreground')}>
                Sécurité : {strength.label}
              </p>
            </div>
          )}
          {errors.password && <p className="text-sm text-destructive">{errors.password.message}</p>}
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type={showConfirmPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="h-11 pl-10 pr-10"
              aria-invalid={!!errors.confirmPassword}
              {...register('confirmPassword')}
            />
            <button
              type="button"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-md p-1 text-muted-foreground transition-colors hover:text-foreground"
              aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
            >
              {showConfirmPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
            </button>
          </div>
          {errors.confirmPassword && <p className="text-sm text-destructive">{errors.confirmPassword.message}</p>}
        </div>

        <div className="space-y-2">
          <label className="flex items-start gap-2.5 text-sm text-muted-foreground">
            <Checkbox
              checked={acceptTerms}
              onCheckedChange={(v) => setValue('acceptTerms', v === true, { shouldValidate: true })}
              className="mt-0.5"
            />
            <span>
              J'accepte les{' '}
              <Link to="/terms" className="font-medium text-primary hover:text-primary/80">
                conditions d'utilisation
              </Link>
            </span>
          </label>
          {errors.acceptTerms && <p className="text-sm text-destructive">{errors.acceptTerms.message}</p>}
        </div>

        <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : selectedRole === 'recruiter' ? (
            'Créer un compte recruteur'
          ) : (
            'Créer mon compte'
          )}
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted-foreground">
        Déjà un compte ?{' '}
        <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
          Se connecter
        </Link>
      </p>
    </AuthLayout>
  )
}