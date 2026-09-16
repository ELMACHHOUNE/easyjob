import { motion, useInView, useReducedMotion } from "framer-motion"
import { useRef } from "react"
import {
  CheckCircle2,
  MousePointerClick,
  ScanSearch,
  Sparkles,
  TrendingUp,
  Users,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarGroup } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Reveal from "./Reveal"

const skills = [
  { name: "React / Next.js", pct: 92, color: "bg-primary" },
  { name: "Node.js / Express", pct: 84, color: "bg-accent" },
  { name: "PostgreSQL", pct: 71, color: "bg-warning" },
]

const scatterBars = [48, 62, 55, 70, 84, 66, 92, 76, 58, 88, 72, 96]

function Card({ className, children }) {
  return (
    <div
      className={cn(
        "group/card flex flex-col rounded-xl border border-border bg-card p-6 transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-md dark:hover:border-primary/40",
        className
      )}
    >
      {children}
    </div>
  )
}

function CardIcon({ className, children }) {
  return (
    <div
      className={cn(
        "mb-5 flex size-11 items-center justify-center rounded-xl bg-primary/10 text-primary",
        className
      )}
    >
      {children}
    </div>
  )
}

function AnimatedBars() {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-60px" })
  const reduce = useReducedMotion()

  return (
    <div ref={ref} className="mt-6 flex flex-1 items-end gap-1.5">
      {scatterBars.map((h, i) => (
        <motion.div
          key={i}
          className="flex-1 rounded-t-sm bg-primary/10"
          initial={false}
          animate={{ height: inView ? `${reduce ? 60 : h}%` : "14%" }}
          transition={{ duration: 0.6, delay: reduce ? 0 : i * 0.04 }}
        >
          <div className="h-full w-full rounded-t-sm bg-primary/60" />
        </motion.div>
      ))}
    </div>
  )
}

export default function FeaturesBento() {
  return (
    <section id="features" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Fonctionnalités
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Votre carrière, pilotée à l'IA
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-4 text-base text-muted-foreground">
              Un écosystème complet pour trouver, évaluer et décrocher les
              meilleures offres — sans lever le petit doigt.
            </p>
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-12">
          <Reveal className="md:col-span-7 md:row-span-2" delay={0.05}>
            <Card className="h-full overflow-hidden">
              <CardIcon>
                <ScanSearch className="size-5" />
              </CardIcon>
              <h3 className="text-xl font-semibold tracking-tight">
                Scraping multi-sources
              </h3>
              <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
                Nos robots explorent les principales plateformes d'emploi,
                jour et nuit, et centralisent chaque nouvelle offre dans votre
                tableau de bord.
              </p>

              <div className="mt-6 hidden flex-1 items-center gap-3 sm:flex">
                {[
                  { src: "LinkedIn", n: "34 210" },
                  { src: "Indeed", n: "8 045" },
                  { src: "Welcome to the Jungle", n: "4 118" },
                ].map((s, i) => (
                  <motion.div
                    key={s.src}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + i * 0.15, duration: 0.4 }}
                    className="flex-1 rounded-lg border border-border bg-background p-3"
                  >
                    <p className="text-xs font-semibold">{s.src}</p>
                    <p className="mt-1 text-lg font-bold text-primary">
                      {s.n}
                    </p>
                    <p className="text-[11px] text-muted-foreground">
                      offres scrapées
                    </p>
                  </motion.div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 text-xs text-muted-foreground">
                <span className="relative flex size-2">
                  <span className="absolute inline-flex size-full animate-ping rounded-full bg-accent opacity-70" />
                  <span className="relative inline-flex size-2 rounded-full bg-accent" />
                </span>
                Synchronisation en cours · mise à jour il y a 2 minutes
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-5" delay={0.12}>
            <Card className="h-full">
              <CardIcon className="bg-accent/10 text-accent">
                <MousePointerClick className="size-5" />
              </CardIcon>
              <h3 className="text-xl font-semibold tracking-tight">
                Candidature 1-clic
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Un email personnalisé est généré pour chaque offre, avec votre
                CV et votre portfolio en pièce jointe.
              </p>
              <div className="mt-5 space-y-2 text-sm">
                {[
                  "Email de motivation personnalisé",
                  "CV + portfolio joints",
                  "Relance automatique à J+5",
                ].map((f) => (
                  <div key={f} className="flex items-center gap-2">
                    <CheckCircle2 className="size-4 shrink-0 text-accent" />
                    <span className="text-muted-foreground">{f}</span>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-5" delay={0.2}>
            <Card className="h-full">
              <CardIcon className="bg-warning/10 text-warning">
                <Sparkles className="size-5" />
              </CardIcon>
              <h3 className="text-xl font-semibold tracking-tight">
                Score de pertinence AI
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Chaque offre est analysée selon vos compétences, votre
                expérience et vos préférences.
              </p>
              <div className="mt-5 space-y-3">
                {skills.map((s) => (
                  <div key={s.name}>
                    <div className="mb-1.5 flex items-center justify-between text-xs">
                      <span className="font-medium">{s.name}</span>
                      <span className="text-muted-foreground">{s.pct}%</span>
                    </div>
                    <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className={cn("h-full rounded-full", s.color)}
                        initial={{ width: 0 }}
                        whileInView={{ width: `${s.pct}%` }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.7, ease: "easeOut" }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-5" delay={0.1}>
            <Card className="h-full">
              <CardIcon className="bg-primary/10 text-primary">
                <Users className="size-5" />
              </CardIcon>
              <h3 className="text-xl font-semibold tracking-tight">
                Explorateur de recruteurs
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Identifiez les bons interlocuteurs RH, leur réseau et les
                entreprises qui recrutent près de chez vous.
              </p>
              <div className="mt-6 flex items-center gap-4">
                <AvatarGroup>
                  {["SA", "KM", "YL", "RB"].map((ini) => (
                    <Avatar key={ini}>
                      <AvatarFallback className="bg-primary/10 text-[11px] font-semibold text-primary">
                        {ini}
                      </AvatarFallback>
                    </Avatar>
                  ))}
                </AvatarGroup>
                <span className="text-xs text-muted-foreground">
                  +2 400 recruteurs connectés cette semaine
                </span>
              </div>
            </Card>
          </Reveal>

          <Reveal className="md:col-span-7" delay={0.18}>
            <Card className="h-full">
              <CardIcon className="bg-accent/10 text-accent">
                <TrendingUp className="size-5" />
              </CardIcon>
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <h3 className="text-xl font-semibold tracking-tight">
                    Suivi en temps réel
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    De la candidature à l'embauche : chaque étape est suivie,
                    mesurée et optimisée.
                  </p>
                </div>
                <span className="rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold text-accent">
                  +12% vs semaine dernière
                </span>
              </div>
              <AnimatedBars />
            </Card>
          </Reveal>
        </div>
      </div>
    </section>
  )
}