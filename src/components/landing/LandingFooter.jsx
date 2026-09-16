import { useState } from "react"
import { Link } from "react-router-dom"
import { Check } from "lucide-react"
import { GitHubLogoIcon, LinkedInLogoIcon, TwitterLogoIcon } from "@radix-ui/react-icons"
import Logo from "@/components/Logo"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

const columns = [
  {
    title: "Produit",
    links: ["Fonctionnalités", "Tarifs", "Sources", "Intégrations", "Changelog"],
    anchors: ["#features", "#pricing", "#sources", "#features", "#how-it-works"],
  },
  {
    title: "Ressources",
    links: ["Documentation", "Guide de démarrage", "Blog", "Centre d'aide", "Statut"],
    anchors: ["#faq", "#how-it-works", "#", "#", "#"],
  },
  {
    title: "Entreprise",
    links: ["À propos", "Carrières", "Contact", "Presse"],
    anchors: ["#", "#", "#", "#"],
  },
  {
    title: "Légal",
    links: ["Confidentialité", "Conditions d'utilisation", "Mentions légales", "Cookies"],
    anchors: ["#", "#", "#", "#"],
  },
]

const socials = [
  { label: "Twitter", icon: TwitterLogoIcon, href: "#" },
  { label: "LinkedIn", icon: LinkedInLogoIcon, href: "#" },
  { label: "GitHub", icon: GitHubLogoIcon, href: "#" },
]

export default function LandingFooter() {
  const [email, setEmail] = useState("")
  const [subscribed, setSubscribed] = useState(false)

  const handleSubscribe = (e) => {
    e.preventDefault()
    if (!email.trim()) return
    setSubscribed(true)
  }

  return (
    <footer className="border-t border-border bg-muted/30">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_2fr]">
          <div>
            <Link to="/" aria-label="Accueil">
              <Logo />
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-muted-foreground">
              La plateforme intelligente qui automatise votre recherche
              d'emploi. Scrap, candidature, suivi — tout est géré.
            </p>

            <form onSubmit={handleSubscribe} className="mt-6 max-w-sm">
              <h4 className="text-sm font-semibold">Newsletter</h4>
              <p className="mt-1 text-xs text-muted-foreground">
                Recevez chaque lundi les meilleures offres de la semaine.
              </p>
              {subscribed ? (
                <div className="mt-3 flex items-center gap-2 rounded-lg border border-accent/30 bg-accent/10 px-3 py-2 text-sm text-accent">
                  <Check className="size-4" />
                  Merci, vous êtes inscrit !
                </div>
              ) : (
                <div className="mt-3 flex gap-2">
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="votre@email.fr"
                    className="h-9 bg-background"
                  />
                  <Button type="submit" size="lg" className="h-9 px-4">
                    S'abonner
                  </Button>
                </div>
              )}
            </form>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
            {columns.map((col) => (
              <div key={col.title}>
                <h4 className="text-xs font-semibold uppercase tracking-widest text-foreground">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-3">
                  {col.links.map((label, i) => (
                    <li key={label}>
                      <a
                        href={col.anchors[i]}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {label}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-border pt-6 sm:flex-row">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} JobConnect AI. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            {socials.map((social) => (
              <a
                key={social.label}
                href={social.href}
                aria-label={social.label}
                className="flex size-8 items-center justify-center rounded-lg border border-border text-muted-foreground transition-colors hover:border-primary/30 hover:text-foreground"
              >
                <social.icon className="size-3.5" />
              </a>
            ))}
          </div>
          <p className="flex items-center gap-1.5 text-sm text-muted-foreground">
            Fait avec
            <span className="text-destructive">❤</span>
            au Maroc
          </p>
        </div>
      </div>
    </footer>
  )
}