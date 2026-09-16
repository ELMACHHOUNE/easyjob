import { useRef } from "react"
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion"
import { Search, Send, Sparkles, Trophy } from "lucide-react"
import Reveal from "./Reveal"

const steps = [
  {
    icon: Search,
    title: "Explorez les offres",
    description: "50 000+ offres scrapées chaque mois, toutes sources confondues.",
  },
  {
    icon: Sparkles,
    title: "Obtenez votre score",
    description: "L'IA note chaque offre selon votre profil et vos préférences.",
  },
  {
    icon: Send,
    title: "Postulez automatiquement",
    description: "Candidature personnalisée envoyée en un clic.",
  },
  {
    icon: Trophy,
    title: "Décrochez le poste",
    description: "Suivez chaque étape jusqu'à la signature.",
  },
]

export default function HowItWorks() {
  const lineRef = useRef(null)
  const reduce = useReducedMotion()
  const { scrollYProgress } = useScroll({
    target: lineRef,
    offset: ["start 80%", "end 55%"],
  })
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1])

  return (
    <section
      id="how-it-works"
      className="scroll-mt-20 border-y border-border bg-muted/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Comment ça marche
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Quatre étapes vers votre prochain poste
            </h2>
          </Reveal>
        </div>

        <div ref={lineRef} className="relative mt-16">
          {/* Ligne pointillée + remplissage */}
          <div className="pointer-events-none absolute left-[12.5%] right-[12.5%] top-7 hidden h-px lg:block">
            <div className="h-full w-full border-t-2 border-dashed border-border" />
            {!reduce && (
              <motion.div
                style={{ scaleX }}
                className="absolute inset-0 origin-left border-t-2 border-primary"
              />
            )}
          </div>

          <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((step, i) => (
              <Reveal key={step.title} delay={0.1 * i} className="relative">
                <div className="flex flex-col items-center text-center">
                  <div className="relative mb-6 flex size-14 items-center justify-center">
                    <div className="absolute inset-0 rounded-full bg-primary/10" />
                    <div className="absolute -right-1 -top-1 flex size-6 items-center justify-center rounded-full bg-primary text-[11px] font-bold text-primary-foreground">
                      {i + 1}
                    </div>
                    <step.icon className="size-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold tracking-tight">
                    {step.title}
                  </h3>
                  <p className="mt-2 max-w-xs text-sm leading-relaxed text-muted-foreground">
                    {step.description}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}