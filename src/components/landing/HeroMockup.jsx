import {
  BriefcaseBusiness,
  FileText,
  LayoutDashboard,
  Search,
  Users,
  Zap,
} from "lucide-react"
import { cn } from "@/lib/utils"

const navItems = [
  { icon: LayoutDashboard, label: "Tableau de bord", active: true },
  { icon: Search, label: "Offres" },
  { icon: FileText, label: "Candidatures" },
  { icon: Users, label: "Recruteurs" },
]

const jobs = [
  { title: "Développeur Frontend", company: "ATLAS Cloud", score: 94, source: "LinkedIn" },
  { title: "Product Designer", company: "Yassir", score: 88, source: "Indeed" },
  { title: "Data Analyst", company: "Umnia Bank", score: 81, source: "WTJ" },
]

const bars = [42, 58, 47, 74, 63, 88, 71, 95, 82, 100, 90, 97]

export default function HeroMockup() {
  return (
    <div className="h-full w-full overflow-hidden rounded-2xl border border-border bg-card text-left shadow-xl">
      <div className="flex items-center gap-1.5 border-b border-border bg-muted/50 px-4 py-3">
        <span className="size-2.5 rounded-full bg-destructive/70" />
        <span className="size-2.5 rounded-full bg-warning/70" />
        <span className="size-2.5 rounded-full bg-accent/70" />
        <div className="ml-3 hidden flex-1 items-center gap-1.5 rounded-lg bg-background/70 px-3 py-1 text-[11px] text-muted-foreground sm:flex">
          <Zap className="size-3 text-primary" />
          app.jobconnect.ai/dashboard
        </div>
        <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-accent/10 px-2.5 py-1 text-[11px] font-semibold text-accent sm:ml-0">
          <span className="size-1.5 animate-pulse rounded-full bg-accent" />
          En direct
        </span>
      </div>

      <div className="flex">
        <aside className="hidden w-36 shrink-0 flex-col gap-1 border-r border-border bg-muted/30 p-3 sm:flex">
          <div className="mb-2 flex items-center gap-1.5 px-1">
            <span className="flex size-5 items-center justify-center rounded-md bg-primary">
              <Zap className="size-3 text-primary-foreground" />
            </span>
            <span className="text-xs font-semibold">JobConnect</span>
          </div>
          {navItems.map((item) => (
            <span
              key={item.label}
              className={cn(
                "flex items-center gap-2 rounded-lg px-2 py-1.5 text-[11px] font-medium",
                item.active
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground"
              )}
            >
              <item.icon className="size-3.5" />
              {item.label}
            </span>
          ))}
        </aside>

        <div className="flex-1 space-y-4 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-semibold">Bonjour, Yasmine</p>
              <p className="text-[11px] text-muted-foreground">
                18 offres correspondent à votre profil
              </p>
            </div>
            <span className="hidden rounded-lg bg-primary px-2.5 py-1.5 text-[11px] font-semibold text-primary-foreground sm:inline-flex sm:items-center sm:gap-1">
              <Zap className="size-3" />
              Lancer le scraping
            </span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Nouvelles offres", value: "128", accent: true },
              { label: "Postulées", value: "47" },
              { label: "Taux de réponse", value: "78%" },
            ].map((stat) => (
              <div
                key={stat.label}
                className="rounded-lg border border-border bg-background p-2.5"
              >
                <p className="text-sm font-bold">
                  {stat.value}
                </p>
                <p className="mt-0.5 text-[10px] text-muted-foreground leading-tight">
                  {stat.label}
                </p>
              </div>
            ))}
          </div>

          <div className="rounded-lg border border-border bg-background p-3">
            <div className="mb-2 flex items-center justify-between">
              <p className="text-[11px] font-semibold">Candidatures / semaine</p>
              <span className="text-[10px] text-accent">+12%</span>
            </div>
            <div className="flex h-16 items-end gap-1">
              {bars.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 rounded-t-sm bg-primary/10"
                  style={{ height: `${h}%` }}
                >
                  <div
                    className="h-full w-full rounded-t-sm bg-primary/70"
                    style={{ height: `${Math.min(h, 90)}%` }}
                  />
                </div>
              ))}
            </div>
          </div>

          <div className="hidden space-y-1.5 sm:block">
            {jobs.map((job) => (
              <div
                key={job.title}
                className="flex items-center gap-2.5 rounded-lg border border-border bg-background px-3 py-2"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-muted">
                  <BriefcaseBusiness className="size-3.5 text-muted-foreground" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[11px] font-semibold">{job.title}</p>
                  <p className="truncate text-[10px] text-muted-foreground">
                    {job.company} · {job.source}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 rounded-full bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  {job.score}%
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}