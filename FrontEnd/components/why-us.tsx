import { Award, Headphones, ShieldCheck, Users } from "lucide-react"

const reasons = [
  {
    icon: Users,
    title: "Certified, experienced engineers",
    body: "A multidisciplinary team specialized in electrical, automation, fire alarm, and mechanical works.",
  },
  {
    icon: ShieldCheck,
    title: "ISO-certified quality management",
    body: "Standardized processes for design, execution, and maintenance — verified by recognized certification bodies.",
  },
  {
    icon: Award,
    title: "End-to-end project delivery",
    body: "From engineering and construction to commissioning, predictive maintenance, and long-term operation.",
  },
  {
    icon: Headphones,
    title: "Long-term service partnership",
    body: "Operation & maintenance contracts that keep your plant safe, efficient, and always running.",
  },
]

export function WhyUs() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Why partner with us
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
              Engineering you can rely on, every shift.
            </h2>
            <p className="mt-4 text-base leading-relaxed text-muted-foreground">
              We combine technical depth with operational discipline so your assets
              stay reliable, safe, and ready for the next decade of production.
            </p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:col-span-8">
            {reasons.map((reason) => {
              const Icon = reason.icon
              return (
                <li
                  key={reason.title}
                  className="rounded-xl border border-border bg-card p-6"
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/30 text-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <h3 className="mt-4 font-display text-base font-semibold leading-snug text-foreground">
                    {reason.title}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    {reason.body}
                  </p>
                </li>
              )
            })}
          </ul>
        </div>
      </div>
    </section>
  )
}
