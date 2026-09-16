import Reveal from "./Reveal"

const platforms = [
  "LinkedIn",
  "Indeed",
  "Welcome to the Jungle",
  "Rekrute",
  "Manpower",
  "Glassdoor",
  "Emploi.ma",
  "Maroc Diplomatique",
]

export default function SourcesMarquee() {
  return (
    <section id="sources" className="scroll-mt-20 border-y border-border bg-muted/40 py-12 sm:py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <p className="text-center text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Nous agrégeons les offres de
          </p>
        </Reveal>
      </div>

      <div className="group relative mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_12%,black_88%,transparent)]">
        <div className="flex w-max animate-marquee gap-4 group-hover:[animation-play-state:paused]">
          {[0, 1].map((copy) => (
            <div
              key={copy}
              aria-hidden={copy === 1}
              className="flex shrink-0 items-center gap-4 pr-4"
            >
              {platforms.map((name) => (
                <span
                  key={`${copy}-${name}`}
                  className="inline-flex items-center gap-2 rounded-lg border border-border bg-card px-5 py-2.5 text-sm font-semibold text-foreground/60 opacity-60 transition-all hover:border-primary/30 hover:opacity-100"
                >
                  {name}
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}