import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Reveal from "./Reveal"

const faqs = [
  {
    q: "Le scraping est-il légal et conforme ?",
    a: "Nous scrappons uniquement les offres d'emploi publiques, dans le respect des conditions d'utilisation de chaque plateforme. Les données collectées sont exclusivement des offres et des informations publiques de contact.",
  },
  {
    q: "La candidature 1-clic est-elle vraiment automatique ?",
    a: "Oui. Grâce à un email personnalisé généré par l'IA et à vos pièces jointes, une candidature pertinente est envoyée en un clic. Vous gardez toujours la main : chaque envoi est confirmé et traçable.",
  },
  {
    q: "Quelles plateformes sont couvertes ?",
    a: "LinkedIn, Indeed, Welcome to the Jungle, Rekrute, Manpower et de nombreuses autres sources marocaines et internationales. De nouvelles plateformes sont ajoutées régulièrement.",
  },
  {
    q: "Mes données sont-elles protégées ?",
    a: "Absolument. Vos identifiants sont chiffrés, vos données ne sont jamais revendues à des tiers et vous pouvez exporter ou supprimer l'intégralité de votre profil à tout moment.",
  },
  {
    q: "Puis-je suivre l'avancement de mes candidatures ?",
    a: "Oui, chaque candidature est suivie en temps réel : ouverture de l'email, relances, réponses, entretiens… Tout est centralisé dans votre tableau de bord.",
  },
  {
    q: "Y a-t-il un engagement de durée ?",
    a: "Aucun. Le plan Découverte est gratuit pour toujours et les plans payants sont résiliables à tout moment, sans frais.",
  },
  {
    q: "Comment fonctionne l'essai gratuit du plan Pro ?",
    a: "Vous bénéficiez de 14 jours d'essai complet, sans carte bancaire. À la fin de l'essai, vous choisissez librement de continuer ou non.",
  },
]

export default function FaqSection() {
  return (
    <section id="faq" className="scroll-mt-20 py-20 sm:py-28">
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <Reveal>
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              FAQ
            </span>
          </Reveal>
          <Reveal delay={0.08}>
            <h2 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
              Questions fréquentes
            </h2>
          </Reveal>
        </div>

        <Reveal delay={0.12}>
          <Accordion type="single" collapsible className="mt-10">
            {faqs.map((item) => (
              <AccordionItem key={item.q} value={item.q} className="py-1">
                <AccordionTrigger className="py-4 text-base">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-[0.95rem] leading-relaxed text-muted-foreground">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </Reveal>
      </div>
    </section>
  )
}