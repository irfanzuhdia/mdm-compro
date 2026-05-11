import { GraduationCap, HeartHandshake, Layers, ShieldCheck, Sparkles, TrendingUp } from "lucide-react"

const benefits = [
  {
    icon: TrendingUp,
    title: "Career growth",
    body: "Clear paths from engineer to senior, lead, and project director roles — supported by mentorship and certifications.",
  },
  {
    icon: GraduationCap,
    title: "Continuous learning",
    body: "Funded technical training, vendor certifications, and on-the-job exposure to the latest industrial systems.",
  },
  {
    icon: ShieldCheck,
    title: "Safety first",
    body: "An HSE-led culture with rigorous standards, PPE, and safety briefings on every site we operate.",
  },
  {
    icon: Layers,
    title: "Diverse projects",
    body: "Work across power plants, oil & gas, manufacturing, and infrastructure — no two months look the same.",
  },
  {
    icon: HeartHandshake,
    title: "Team that cares",
    body: "A professional, supportive culture where engineers help each other succeed on every assignment.",
  },
  {
    icon: Sparkles,
    title: "Meaningful work",
    body: "Your work keeps critical facilities safe, reliable, and ready for the next decade of operation.",
  },
]

export function CareerBenefits() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Why work with us
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
            Engineering careers built on real projects.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            We believe great engineers grow fastest when they tackle real problems alongside experienced
            mentors — and we structure our company to make that happen.
          </p>
        </div>

        <ul className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {benefits.map((benefit) => {
            const Icon = benefit.icon
            return (
              <li
                key={benefit.title}
                className="rounded-xl border border-border bg-card p-6"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/30 text-foreground">
                  <Icon className="h-5 w-5" />
                </span>
                <h3 className="mt-4 font-display text-base font-semibold leading-snug text-foreground">
                  {benefit.title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  {benefit.body}
                </p>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
