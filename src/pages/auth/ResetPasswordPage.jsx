import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { Lock, Eye, EyeOff, CheckCircle, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'
import AuthLayout from '@/layouts/AuthLayout'
import api from '@/api/axios'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

export default function ResetPasswordPage() {
  const { token } = useParams()
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 6) return toast.error('Le mot de passe doit contenir au moins 6 caractères')
    if (password !== confirmPassword) return toast.error('Les mots de passe ne correspondent pas')
    setLoading(true)
    try {
      await api.post(`/auth/reset-password/${token}`, { password })
      setSuccess(true)
      toast.success('Mot de passe réinitialisé !')
    } catch (err) {
      toast.error(err.message || 'Erreur lors de la réinitialisation')
    } finally {
      setLoading(false)
    }
  }

  return (
    <AuthLayout mode="centered">
      {success ? (
        <div className="space-y-4 py-2 text-center">
          <div className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/10">
            <CheckCircle className="size-7 text-accent" />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight">Mot de passe réinitialisé</h1>
          <p className="text-sm text-muted-foreground">
            Votre mot de passe a été modifié avec succès.
          </p>
          <Link to="/login">
            <Button className="h-11 w-full">Se connecter</Button>
          </Link>
        </div>
      ) : (
        <>
          <div className="mb-6 text-center">
            <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-primary/10">
              <ShieldCheck className="size-6 text-primary" />
            </div>
            <h1 className="text-2xl font-semibold tracking-tight">Nouveau mot de passe</h1>
            <p className="mt-1.5 text-sm text-muted-foreground">Choisissez un mot de passe sécurisé</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Nouveau mot de passe</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-11 pl-10 pr-10"
                  placeholder="••••••••"
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
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmer le mot de passe</Label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="h-11 pl-10"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <Button type="submit" disabled={loading} className="h-11 w-full">
              {loading ? <Loader2 className="size-4 animate-spin" /> : 'Réinitialiser le mot de passe'}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            <Link to="/login" className="font-semibold text-primary hover:text-primary/80">
              Retour à la connexion
            </Link>
          </p>
        </>
      )}
    </AuthLayout>
  )
}