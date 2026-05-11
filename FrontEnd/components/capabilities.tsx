import {
  Activity,
  ClipboardList,
  Cog,
  HardHat,
  Hammer,
  Lightbulb,
  Microscope,
  Search,
  Settings2,
  Shield,
  Stethoscope,
  Wrench,
} from "lucide-react"

const capabilities = [
  { icon: HardHat, label: "Installation" },
  { icon: ClipboardList, label: "Testing & Commissioning" },
  { icon: Hammer, label: "Construction" },
  { icon: Wrench, label: "Curative Maintenance" },
  { icon: Shield, label: "Preventive Maintenance" },
  { icon: Activity, label: "Testing & Measurement" },
  { icon: Cog, label: "Operation & Maintenance" },
  { icon: Microscope, label: "Predictive Maintenance" },
  { icon: Lightbulb, label: "Innovation & Improvement" },
  { icon: Search, label: "Assessment & Study" },
  { icon: Stethoscope, label: "Diagnostic" },
  { icon: Settings2, label: "Engineering Design" },
]

export function Capabilities() {
  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Capabilities
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
              End-to-end engineering coverage.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            Our team combines hands-on field execution with deep engineering know-how —
            so we can support your plant from first installation through decades of
            operation.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {capabilities.map((cap) => {
            const Icon = cap.icon
            return (
              <li
                key={cap.label}
                className="group flex items-center gap-3 rounded-lg border border-border bg-card px-4 py-3.5 transition-colors hover:border-accent/60 hover:bg-accent/5"
              >
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-md bg-secondary text-primary transition-colors group-hover:bg-accent/30">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="text-sm font-medium leading-tight text-foreground">
                  {cap.label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
