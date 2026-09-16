import { useRef } from "react"
import { Link } from "react-router-dom"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { ArrowRight, Play } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import HeroMockup from "./HeroMockup"

const titleWords = [
  "Trouvez",
  "votre",
  "prochain",
  "emploi.",
  "Automatiquement.",
]

const noiseSvg = `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='140' height='140'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`

export default function HeroSection() {
  const sectionRef = useRef(null)
  const reduce = useReducedMotion()

  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start start", "end start"],
  })
  const mockY = useTransform(scrollYProgress, [0, 1], [0, reduce ? 0 : 90])

  return (
    <section
      id="top"
      ref={sectionRef}
      className="relative overflow-hidden pb-20 pt-32 sm:pb-28 sm:pt-40 lg:pb-36"
    >
      {/* Fond : grille subtile (tokens) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 h-full w-full [background-image:linear-gradient(to_right,var(--border)_1px,transparent_1px),linear-gradient(to_bottom,var(--border)_1px,transparent_1px)] [background-size:40px_40px]"
        aria-hidden="true"
      />
      {/* Radial gradient bleu discret (token primary) */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_70%_60%_at_50%_0%,black,transparent)] [background:radial-gradient(ellipse_80%_60%_at_50%_-10%,color-mix(in_srgb,var(--primary)_12%,transparent),transparent_70%)]"
        aria-hidden="true"
      />
      {/* Noise texturé */}
      <div
        className="pointer-events-none absolute inset-0 -z-10 opacity-[0.04]"
        style={{ backgroundImage: noiseSvg }}
        aria-hidden="true"
      />

      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="flex justify-center"
        >
          <Badge
            variant="outline"
            className="gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm text-primary h-auto"
          >
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
              <span className="relative inline-flex size-2 rounded-full bg-accent" />
            </span>
            Nouveau · Scraping multi-plateformes
          </Badge>
        </motion.div>

        <h1 className="mx-auto mt-7 max-w-4xl font-display text-4xl font-bold tracking-tight text-foreground sm:text-6xl lg:text-7xl">
          {titleWords.map((word, i) => (
            <motion.span
              key={`${word}-${i}`}
              className="mr-[0.25em] inline-block"
              initial={{ opacity: 0, y: reduce ? 0 : 26, filter: "blur(6px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{
                duration: 0.55,
                delay: 0.15 + i * 0.09,
                ease: [0.22, 1, 0.36, 1],
              }}
            >
              {word === "emploi." || word === "Automatiquement." ? (
                <span className="text-primary">{word}</span>
              ) : (
                word
              )}
            </motion.span>
          ))}
        </h1>

        <motion.p
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.7 }}
          className="mx-auto mt-6 max-w-2xl text-balance text-base leading-relaxed text-muted-foreground sm:text-lg"
        >
          Scrapez les meilleures plateformes d'emploi, faites noter chaque offre
          par l'IA et postulez en un clic — le tout depuis un seul tableau de
          bord.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.85 }}
          className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
        >
          <Button
            asChild
            size="lg"
            className="group h-11 w-full gap-2 px-7 text-[0.95rem] sm:w-auto"
          >
            <Link to="/register">
              Démarrer maintenant
              <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            size="lg"
            className="h-11 w-full gap-2 px-7 text-[0.95rem] sm:w-auto"
          >
            <a href="#how-it-works">
              <Play className="fill-current" />
              Voir la démo
            </a>
          </Button>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: reduce ? 0 : 72 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 1, ease: [0.22, 1, 0.36, 1] }}
          className="relative mx-auto mt-16 max-w-4xl sm:mt-20"
        >
          <div className="absolute -inset-x-8 -top-8 bottom-0 -z-10 rounded-[2rem] bg-primary/5 blur-2xl" />
          <motion.div style={{ y: mockY }} className="[perspective:1600px]">
            <div className="origin-top [transform:rotateX(5deg)]">
              <div className="animate-float">
                <HeroMockup />
              </div>
            </div>
          </motion.div>

          <div className="pointer-events-none absolute right-4 top-4 hidden rounded-lg border border-border bg-background/90 px-3 py-2 text-left shadow-sm backdrop-blur-sm md:block">
            <p className="text-xs font-semibold">Match réussi 🎯</p>
            <p className="text-[10px] text-muted-foreground">
              Développeur Frontend · 94% de pertinence
            </p>
          </div>
        </motion.div>
      </div>
    </section>
  )
}