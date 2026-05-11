import { BellRing, Cpu, Zap } from "lucide-react"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import type { ContentNode } from "@/lib/cms"
import { fallbackServices } from "@/lib/cms"

const defaultDetails = [
  {
    icon: Zap,
    items: [
      "Build & assembly",
      "Installation & construction",
      "Testing & commissioning",
      "Predictive & preventive maintenance",
      "Operation & maintenance",
      "Electrical study, design & engineering",
    ],
  },
  {
    icon: Cpu,
    items: [
      "HMI, SCADA & remote monitoring",
      "PLC programming & integration",
      "Design & engineering of control systems",
      "Implementation & application",
      "Reporting & data analytics",
      "Process improvement & optimization",
    ],
  },
  {
    icon: BellRing,
    items: [
      "Installation",
      "Maintenance",
      "Centralized fire alarm",
      "Inspection & troubleshooting",
      "Compliance & commissioning",
      "Long-term service partnership",
    ],
  },
]

export function Services({ services = fallbackServices }: { services?: ContentNode[] }) {
  return (
    <section className="border-b border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            What we do
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
            Three core services. One trusted partner.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-muted-foreground">
            From greenfield installation to long-term operation and maintenance, our
            certified engineers deliver high-quality solutions tailored to each plant
            and facility.
          </p>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {services.map((service, index) => {
            const detail = defaultDetails[index % defaultDetails.length]
            const Icon = detail.icon
            return (
              <Card
                key={service.title}
                className="group relative overflow-hidden border-border/70 bg-card transition-shadow hover:shadow-md"
              >
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 top-0 h-1 bg-accent opacity-0 transition-opacity group-hover:opacity-100"
                />
                <CardHeader>
                  <span className="mb-3 inline-flex h-11 w-11 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </span>
                  <CardTitle className="font-display text-xl">
                    {service.title}
                  </CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {service.summary}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2.5 border-t border-border/70 pt-5">
                    {detail.items.map((item) => (
                      <li
                        key={item}
                        className="flex items-start gap-2.5 text-sm leading-snug text-foreground"
                      >
                        <span
                          aria-hidden="true"
                          className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-accent"
                        />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
