import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Compass, Search } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Logo from '@/components/Logo'

export default function NotFoundPage() {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden bg-background p-6 text-center">
      <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_70%_60%_at_50%_45%,black,transparent)]" />
      <div className="relative">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="mb-8 flex justify-center"
        >
          <Link to="/" aria-label="Accueil">
            <Logo />
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
        >
          <p className="text-sm font-medium uppercase tracking-widest text-primary">Erreur 404</p>
          <h1 className="mt-2 font-display text-6xl font-bold tracking-tight sm:text-7xl">Page introuvable</h1>
          <p className="mx-auto mt-4 max-w-md text-muted-foreground">
            Cette page n'existe pas ou a été déplacée. Retournez à l'accueil ou explorez les offres d'emploi.
          </p>

          <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
            <Search className="size-3.5" />
            <span>On dirait que vous vous êtes égaré dans le labyrinthe du recrutement.</span>
          </div>

          <div className="mt-8 flex flex-col justify-center gap-3 sm:flex-row">
            <Button size="lg" asChild>
              <Link to="/dashboard">
                <Compass className="size-4" />
                Aller au tableau de bord
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link to="/jobs">Voir les offres</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}