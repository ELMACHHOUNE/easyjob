import { useCallback, useEffect, useState } from "react"
import useEmblaCarousel from "embla-carousel-react"
import { Quote } from "lucide-react"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import Reveal from "./Reveal"

const testimonials = [
  {
    quote:
      "J'ai trouvé en deux semaines un poste de développeur que je cherchais depuis trois mois. Les scores de pertinence m'ont fait gagner un temps fou.",
    name: "Sara Alaoui",
    role: "Développeuse Frontend",
    company: "ATLAS Cloud",
  },
  {
    quote:
      "Le scraping automatique est bluffant. Toutes les offres de mon secteur arrivent au même endroit, avant même leur publication sur la plupart des sites.",
    name: "Younes Benali",
    role: "Product Manager",
    company: "Yassir",
  },
  {
    quote:
      "La candidature 1-clic m'a permis d'envoyer plus de 60 candidatures personnalisées sans effort. Le taux de réponse a littéralement doublé.",
    name: "Fatima Zahra Idrissi",
    role: "Consultante Marketing",
    company: "Publicis Maroc",
  },
  {
    quote:
      "Utilisé pour notre propre recrutement en équipe : les profils sont mieux ciblés et l'explorateur de recruteurs est devenu notre outil quotidien.",
    name: "Mehdi Chraibi",
    role: "Head of Talent",
    company: "Umnia Bank",
  },
  {
    quote:
      "Enfin un outil qui parle français et qui comprend le marché marocain. Le suivi des candidatures en temps réel change véritablement la donne.",
    name: "Houda Tazi",
    role: "Ingénieure Data",
    company: "Manpower Maroc",
  },
]

export default function TestimonialsSection() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true })
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [paused, setPaused] = useState(false)

  const onSelect = useCallback(() => {
    if (!emblaApi) return
    setSelectedIndex(emblaApi.selectedScrollSnap())
  }, [emblaApi])

  useEffect(() => {
    if (!emblaApi) return undefined
    onSelect()
    emblaApi.on("select", onSelect)
    return () => emblaApi.off("select", onSelect)
  }, [emblaApi, onSelect])

  useEffect(() => {
    if (!emblaApi || paused) return undefined
    const id = setInterval(() => emblaApi.scrollNext(), 5000)
    return () => clearInterval(id)
  }, [emblaApi, paused])

  return (
    <section
      id="testimonials"
      className="scroll-mt-20 border-y border-border bg-muted/40 py-20 sm:py-28"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Témoignages
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
              Ils ont décroché le poste
            </h2>
          </Reveal>
          <Reveal delay={0.14}>
            <p className="mt-4 text-base text-muted-foreground">
              Des milliers de candidats et d'équipes RH nous font confiance au
              quotidien.
            </p>
          </Reveal>
        </div>

        <Reveal delay={0.1}>
          <div
            className="relative mx-auto mt-12 max-w-3xl"
            onMouseEnter={() => setPaused(true)}
            onMouseLeave={() => setPaused(false)}
          >
            <div className="overflow-hidden" ref={emblaRef}>
              <div className="flex touch-pan-y">
                {testimonials.map((t) => (
                  <div
                    key={t.name}
                    className="min-w-0 flex-[0_0_100%] px-1 pt-8"
                  >
                    <figure className="relative rounded-2xl border border-border bg-card p-8 shadow-sm sm:p-10">
                      <Quote className="absolute right-8 top-8 size-8 text-primary/15" />
                      <blockquote className="text-balance text-lg leading-relaxed text-foreground sm:text-xl">
                        « {t.quote} »
                      </blockquote>
                      <figcaption className="mt-8 flex items-center gap-3">
                        <Avatar className="size-11">
                          <AvatarFallback className="bg-primary/10 font-semibold text-primary">
                            {t.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-semibold">{t.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {t.role} · {t.company}
                          </p>
                        </div>
                      </figcaption>
                    </figure>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-8 flex items-center justify-center gap-2">
              {testimonials.map((t, i) => (
                <button
                  key={t.name}
                  type="button"
                  aria-label={`Témoignage ${i + 1}`}
                  onClick={() => emblaApi?.scrollTo(i)}
                  className={cn(
                    "h-2 rounded-full transition-all duration-300",
                    i === selectedIndex
                      ? "w-6 bg-primary"
                      : "w-2 bg-border hover:bg-muted-foreground/40"
                  )}
                />
              ))}
            </div>
          </div>
        </Reveal>
      </div>
    </section>
  )
}