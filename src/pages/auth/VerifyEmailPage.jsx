import { useState, useRef, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowLeft, Loader2, CheckCircle, RefreshCw } from 'lucide-react'
import { toast } from 'sonner'
import { useAuth } from '@/context/AuthContext'
import AuthLayout from '@/layouts/AuthLayout'
import { Button } from '@/components/ui/button'

export default function VerifyEmailPage() {
  const [code, setCode] = useState(['', '', '', '', '', ''])
  const [loading, setLoading] = useState(false)
  const [resending, setResending] = useState(false)
  const [success, setSuccess] = useState(false)
  const inputRefs = useRef([])
  const { user, verifyEmail, resendVerification } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!user) navigate('/login')
  }, [user, navigate])

  const handleChange = (index, value) => {
    if (!/^\d*$/.test(value)) return
    const newCode = [...code]
    newCode[index] = value.slice(-1)
    setCode(newCode)
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !code[index] && index > 0) {
      inputRefs.current[index - 1]?.focus()
    }
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6)
    const newCode = pasted.split('').concat(Array(6).fill('')).slice(0, 6)
    setCode(newCode)
    inputRefs.current[Math.min(pasted.length, 5)]?.focus()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const fullCode = code.join('')
    if (fullCode.length !== 6) return toast.error('Veuillez entrer le code à 6 chiffres')

    setLoading(true)
    const result = await verifyEmail(user.email, fullCode)
    setLoading(false)

    if (result.success) {
      setSuccess(true)
      toast.success('Email vérifié avec succès !')
      setTimeout(() => navigate('/dashboard'), 2000)
    } else {
      toast.error(result.error)
      setCode(['', '', '', '', '', ''])
      inputRefs.current[0]?.focus()
    }
  }

  const handleResend = async () => {
    setResending(true)
    const result = await resendVerification(user.email)
    setResending(false)
    if (result.success) {
      toast.success('Nouveau code envoyé !')
    } else {
      toast.error(result.error)
    }
  }

  const otpClass =
    "size-11 rounded-md border border-input text-center text-lg font-semibold text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-ring/50"

  if (success) {
    return (
      <AuthLayout mode="centered">
        <div className="space-y-4 py-2 text-center">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 260, damping: 20 }}
            className="mx-auto flex size-14 items-center justify-center rounded-full bg-accent/10"
          >
            <CheckCircle className="size-7 text-accent" />
          </motion.div>
          <h1 className="text-2xl font-semibold tracking-tight">Email vérifié !</h1>
          <p className="text-sm text-muted-foreground">
            Redirection vers le tableau de bord...
          </p>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout mode="centered">
      <div className="mb-6 text-center">
        <Link
          to="/login"
          className="mb-4 inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Retour à la connexion
        </Link>
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-2xl bg-primary/10">
          <Mail className="size-6 text-primary" />
        </div>
        <h1 className="text-2xl font-semibold tracking-tight">Vérifiez votre email</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Un code à 6 chiffres a été envoyé à
          <br />
          <span className="font-medium text-foreground">{user?.email}</span>
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="flex justify-center gap-2">
          {code.map((digit, i) => (
            <input
              key={i}
              ref={el => inputRefs.current[i] = el}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              onPaste={handlePaste}
              className={otpClass}
            />
          ))}
        </div>

        <Button
          type="submit"
          disabled={loading || code.join('').length !== 6}
          className="h-11 w-full"
        >
          {loading ? <Loader2 className="size-4 animate-spin" /> : 'Vérifier'}
        </Button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-sm text-muted-foreground">
          Vous n'avez pas reçu le code ?{' '}
          <button
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1 font-semibold text-primary hover:text-primary/80"
          >
            {resending ? <Loader2 className="size-4 animate-spin" /> : <RefreshCw className="size-4" />}
            Renvoyer
          </button>
        </p>
      </div>
    </AuthLayout>
  )
}