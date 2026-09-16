import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Sparkles, TrendingUp } from "lucide-react"
import { Link } from "react-router-dom"
import Logo from "@/components/Logo"

const quotes = [
  {
    text: "J'ai trouvé en deux semaines un poste que je cherchais depuis trois mois.",
    name: "Sara Alaoui",
    role: "Développeuse Frontend · ATLAS Cloud",
  },
  {
    text: "Le scraping automatique est bluffant. Tout arrive au même endroit.",
    name: "Younes Benali",
    role: "Product Manager · Yassir",
  },
  {
    text: "La candidature 1-clic a doublé mon taux de réponse.",
    name: "Fatima Z. Idrissi",
    role: "Consultante Marketing · Publicis Maroc",
  },
  {
    text: "Enfin un outil qui comprend le marché marocain.",
    name: "Houda Tazi",
    role: "Ingénieure Data · Manpower Maroc",
  },
]

function RotatingQuote() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % quotes.length), 4500)
    return () => clearInterval(id)
  }, [])

  const quote = quotes[index]

  return (
    <div className="relative h-40 sm:h-36">
      <AnimatePresence mode="wait">
        <motion.blockquote
          key={index}
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -14 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="text-balance text-lg font-medium leading-relaxed"
        >
          « {quote.text} »
          <footer className="mt-4 flex items-center gap-1 text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">{quote.name}</span>
            <span aria-hidden>·</span>
            <span>{quote.role}</span>
          </footer>
        </motion.blockquote>
      </AnimatePresence>
    </div>
  )
}

export default function AuthLayout({ children, mode = "split" }) {
  if (mode === "centered") {
    return (
      <div className="relative flex min-h-svh flex-col items-center justify-center overflow-hidden p-4">
        <div className="pointer-events-none absolute inset-0 -z-10 h-full w-full [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:64px_64px] [mask-image:radial-gradient(ellipse_80%_70%_at_50%_30%,black,transparent)]" />
        <Link to="/" aria-label="Accueil" className="mb-8">
          <Logo />
        </Link>
        <div className="w-full max-w-md rounded-2xl border border-border bg-card p-8 shadow-sm">
          {children}
        </div>
      </div>
    )
  }

  return (
    <div className="grid min-h-svh bg-background lg:grid-cols-[55%_45%]">
      {/* Colonne gauche — formulaire */}
      <div className="flex flex-col px-6 pb-8 pt-6 sm:px-12 lg:px-14">
        <Link to="/" aria-label="Accueil" className="w-fit">
          <Logo />
        </Link>
        <div className="flex flex-1 items-center py-10">
          <div className="mx-auto w-full max-w-md">{children}</div>
        </div>
      </div>

      {/* Colonne droite — visuel */}
      <div className="relative hidden overflow-hidden border-l border-border bg-muted/40 lg:flex lg:flex-col lg:justify-between lg:p-12">
        <div className="pointer-events-none absolute inset-0 [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(ellipse_90%_70%_at_50%_20%,black,transparent)]" />
        <div className="pointer-events-none absolute -left-24 top-10 size-72 rounded-full bg-primary/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-16 right-0 size-64 rounded-full bg-accent/10 blur-3xl" />

        <div className="relative">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3.5 py-1.5 text-sm font-medium">
            <Sparkles className="size-4 text-primary" />
            L'IA qui décroche pour vous
          </span>
        </div>

        <div className="relative max-w-md">
          <RotatingQuote />

          <div className="mt-8 rounded-2xl border border-border bg-card/90 p-5 backdrop-blur-sm">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-sm font-semibold">Candidatures / semaine</p>
              <span className="inline-flex items-center gap-1 text-xs font-semibold text-accent">
                <TrendingUp className="size-3.5" />
                +12%
              </span>
            </div>
            <div className="flex h-20 items-end gap-1.5">
              {[38, 56, 44, 70, 62, 86, 68, 94, 78, 52, 90, 100].map(
                (h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm bg-primary/10"
                    style={{ height: `${h}%` }}
                  >
                    <div
                      className="h-full w-full rounded-t-sm bg-primary/70"
                      style={{ height: `${Math.min(h, 88)}%` }}
                    />
                  </div>
                )
              )}
            </div>
          </div>
        </div>

        <p className="relative text-sm text-muted-foreground">
          © {new Date().getFullYear()} JobConnect AI
        </p>
      </div>
    </div>
  )
}