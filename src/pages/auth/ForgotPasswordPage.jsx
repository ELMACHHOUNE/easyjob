import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Mail, ArrowLeft, Loader2, CheckCircle2, KeyRound } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import api from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

const schema = z.object({
  email: z.string().email('Email invalide'),
})

export default function ForgotPasswordPage() {
  const [emailSent, setEmailSent] = useState(false)
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    resolver: zodResolver(schema)
  })

  const onSubmit = async (data) => {
    try {
      await api.post('/auth/forgot-password', data)
      setEmailSent(true)
      toast.success('Lien envoyé avec succès !')
    } catch (err) {
      toast.error(err.message || 'Une erreur est survenue')
    }
  }

  return (
    <AuthLayout mode="centered">
      <div className="mb-6 text-center">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
          <KeyRound className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Mot de passe oublié</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      {emailSent ? (
        <div className="space-y-4 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle2 className="size-7 text-accent" />
          </div>
          <p className="text-sm text-muted-foreground">
            Un email avec les instructions de réinitialisation a été envoyé. Vérifiez votre boîte de réception.
          </p>
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-semibold text-primary hover:text-primary/80"
          >
            <ArrowLeft className="size-4" />
            Retour à la connexion
          </Link>
        </div>
      ) : (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="votre@email.com"
                className="h-11 pl-10"
                aria-invalid={!!errors.email}
                {...register('email')}
              />
            </div>
            {errors.email && <p className="text-sm text-destructive">{errors.email.message}</p>}
          </div>

          <Button type="submit" disabled={isSubmitting} className="h-11 w-full">
            {isSubmitting ? <Loader2 className="size-4 animate-spin" /> : 'Envoyer le lien'}
          </Button>
        </form>
      )}

      {!emailSent && (
        <p className="mt-6 text-center text-sm">
          <Link to="/login" className="inline-flex items-center gap-1.5 font-semibold text-primary hover:text-primary/80">
            <ArrowLeft className="size-4" />
            Retour à la connexion
          </Link>
        </p>
      )}
    </AuthLayout>
  )
}