import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import { ArrowRight, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import Reveal from "./Reveal"

const dots = [
  { top: "18%", left: "8%", size: 4, delay: 0 },
  { top: "72%", left: "14%", size: 6, delay: 1.4 },
  { top: "22%", right: "10%", size: 5, delay: 0.7 },
  { top: "78%", right: "18%", size: 3, delay: 2.1 },
  { top: "48%", left: "22%", size: 3, delay: 0.4 },
]

export default function CtaFinalSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary via-primary/90 to-accent/80 px-6 py-14 text-center sm:px-12 sm:py-20 lg:px-20">
            {/* Motif de points animés */}
            <div
              className="pointer-events-none absolute inset-0 opacity-[0.15]"
              style={{
                backgroundImage:
                  "radial-gradient(hsl(0 0% 100% / 0.65) 1px, transparent 1px)",
                backgroundSize: "22px 22px",
              }}
            />
            {dots.map((dot, i) => (
              <motion.span
                key={i}
                className="pointer-events-none absolute rounded-full bg-white/40"
                style={{ top: dot.top, left: dot.left, right: dot.right, width: dot.size, height: dot.size }}
                animate={{ y: [0, -10, 0], opacity: [0.3, 0.9, 0.3] }}
                transition={{ duration: 3.2, delay: dot.delay, repeat: Infinity, ease: "easeInOut" }}
              />
            ))}

            <div className="relative mx-auto max-w-2xl">
              <h2 className="text-balance text-3xl font-bold tracking-tight text-primary-foreground sm:text-4xl lg:text-5xl">
                Prêt à automatiser votre recherche d'emploi ?
              </h2>
              <p className="mx-auto mt-5 max-w-xl text-pretty text-base leading-relaxed text-primary-foreground/80 sm:text-lg">
                Rejoignez des milliers de candidats qui décrochent plus vite
                leurs entretiens grâce à JobConnect AI.
              </p>
              <div className="mt-9">
                <Button
                  asChild
                  size="lg"
                  className="group h-12 gap-2 bg-primary-foreground px-8 text-[0.95rem] text-primary hover:bg-primary-foreground/90"
                >
                  <Link to="/register">
                    Démarrer gratuitement
                    <ArrowRight className="transition-transform group-hover:translate-x-0.5" />
                  </Link>
                </Button>
              </div>
              <div className="mt-6 flex items-center justify-center gap-2 text-sm text-primary-foreground/70">
                <CheckCircle2 className="size-4" />
                Sans carte bancaire · Résiliable à tout moment
              </div>
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}