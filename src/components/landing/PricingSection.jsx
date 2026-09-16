import { useState } from "react"
import { motion } from "framer-motion"
import { Check } from "lucide-react"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import Reveal from "./Reveal"

const plans = [
  {
    name: "Découverte",
    tagline: "Pour explorer l'outil",
    monthly: 0,
    annual: 0,
    cta: "Créer mon compte",
    featured: false,
    features: [
      "Scraping de 500 offres / mois",
      "Score de pertinence AI",
      "1 profil de recherche",
      "Suivi des candidatures",
    ],
  },
  {
    name: "Pro",
    tagline: "Pour accélérer vos candidatures",
    monthly: 199,
    annual: 159,
    cta: "Démarrer l'essai 14 jours",
    featured: true,
    features: [
      "Scraping illimité de toutes les sources",
      "Candidature 1-clic personnalisée",
      "Profils de recherche illimités",
      "Relances automatiques",
      "Explorateur de recruteurs",
      "Analyses avancées",
    ],
  },
  {
    name: "Équipe",
    tagline: "Pour les cabinets et les RH",
    monthly: 499,
    annual: 399,
    cta: "Contacter l'équipe",
    featured: false,
    features: [
      "Tout le plan Pro",
      "Jusqu'à 10 membres",
      "Rôles et permissions",
      "Espace recruteur dédié",
      "Support prioritaire",
    ],
  },
]

export default function PricingSection() {
  const [billing, setBilling] = useState("monthly")

  return (
    <section id="pricing" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Tarifs
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Un prix simple, sans surprise
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-4 text-base text-muted-foreground">
              Commencez gratuitement et passez au plan supérieur quand vous en
              avez besoin.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div className="mt-8 flex items-center justify-center">
            <div
              role="tablist"
              aria-label="Période de facturation"
              className="relative flex items-center gap-1 rounded-full border border-border bg-muted p-1"
            >
              {[
                { key: "monthly", label: "Mensuel" },
                { key: "annual", label: "Annuel", hint: "-20%" },
              ].map((opt) => (
                <button
                  key={opt.key}
                  role="tab"
                  aria-selected={billing === opt.key}
                  onClick={() => setBilling(opt.key)}
                  className={cn(
                    "relative flex h-9 items-center gap-1.5 rounded-full px-4 text-sm font-medium transition-colors",
                    billing === opt.key
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {billing === opt.key && (
                    <motion.span
                      layoutId="billing-pill"
                      className="absolute inset-0 rounded-full bg-card shadow-sm"
                    />
                  )}
                  <span className="relative">{opt.label}</span>
                  {opt.hint && (
                    <span
                      className={cn(
                        "relative rounded-full bg-accent/10 px-1.5 py-0.5 text-[10px] font-semibold",
                        billing === opt.key ? "text-accent" : "text-muted-foreground"
                      )}
                    >
                      {opt.hint}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 lg:grid-cols-3">
          {plans.map((plan, i) => (
            <Reveal key={plan.name} delay={0.08 * i}>
              <div
                className={cn(
                  "relative flex h-full flex-col rounded-2xl border bg-card p-7",
                  plan.featured
                    ? "border-primary shadow-lg shadow-primary/10 dark:shadow-primary/5 lg:-my-3 lg:py-10"
                    : "border-border"
                )}
              >
                {plan.featured && (
                  <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full px-3 py-1">
                    Populaire
                  </Badge>
                )}

                <h3 className="text-lg font-semibold tracking-tight">
                  {plan.name}
                </h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {plan.tagline}
                </p>

                <p className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">
                    {billing === "monthly" ? plan.monthly : plan.annual}
                  </span>
                  <span className="text-sm text-muted-foreground">
                    DH
                    {billing === "annual" && plan.annual > 0
                      ? " /mois, facturé annuellement"
                      : plan.monthly === 0
                        ? " · gratuit"
                        : " /mois"}
                  </span>
                </p>

                <ul className="mt-7 flex-1 space-y-3">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2.5 text-sm">
                      <Check className="mt-0.5 size-4 shrink-0 text-accent" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                <Button
                  asChild
                  variant={plan.featured ? "default" : "outline"}
                  size="lg"
                  className="mt-8 h-10 w-full"
                >
                  <Link to="/register">{plan.cta}</Link>
                </Button>
              </div>
            </Reveal>
          ))}
        </div>

        <Reveal delay={0.2}>
          <p className="mt-10 text-center text-sm text-muted-foreground">
            Sans engagement · Résiliable à tout moment · Paiement sécurisé
          </p>
        </Reveal>
      </div>
    </section>
  )
}