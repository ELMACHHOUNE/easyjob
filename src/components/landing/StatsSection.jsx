import { useEffect, useRef, useState } from "react"
import { useInView, useReducedMotion } from "framer-motion"
import Reveal from "./Reveal"

const stats = [
  { value: 50000, suffix: "+", label: "offres scrapées / mois" },
  { value: 12000, suffix: "+", label: "candidatures envoyées" },
  { value: 78, suffix: "%", label: "taux d'ouverture" },
  { value: 5, suffix: "", label: "plateformes connectées" },
]

function Counter({ value, suffix }) {
  const ref = useRef(null)
  const inView = useInView(ref, { once: true, margin: "-80px" })
  const reduce = useReducedMotion()
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    if (!inView) return undefined
    if (reduce) {
      setDisplay(value)
      return undefined
    }
    let raf
    const start = performance.now()
    const duration = 1800
    const tick = (now) => {
      const p = Math.min((now - start) / duration, 1)
      const eased = 1 - Math.pow(1 - p, 3)
      setDisplay(Math.round(eased * value))
      if (p < 1) raf = requestAnimationFrame(tick)
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [inView, value, reduce])

  return (
    <span ref={ref} className="tabular-nums">
      {display.toLocaleString("fr-FR")}
      {suffix}
    </span>
  )
}

export default function StatsSection() {
  return (
    <section className="py-20 sm:py-28">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 gap-8 lg:grid-cols-4">
          {stats.map((stat, i) => (
            <Reveal key={stat.label} delay={0.08 * i} className="text-center">
              <p className="text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
                <Counter value={stat.value} suffix={stat.suffix} />
              </p>
              <p className="mt-2 text-sm text-muted-foreground">{stat.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}