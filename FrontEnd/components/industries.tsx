import Image from "next/image"
import {
  Building2,
  Cog,
  Droplets,
  Factory,
  Flame,
  FlaskConical,
  Layers,
  Network,
  Pill,
  UtensilsCrossed,
  Wheat,
  Zap,
} from "lucide-react"

const industries = [
  { icon: Factory, label: "Industrial Plants" },
  { icon: Building2, label: "Buildings" },
  { icon: FlaskConical, label: "Petrochemical" },
  { icon: Droplets, label: "Oil & Gas" },
  { icon: Zap, label: "Power Plants" },
  { icon: Network, label: "Infrastructure" },
  { icon: UtensilsCrossed, label: "Food & Beverage" },
  { icon: Cog, label: "Manufacturing" },
  { icon: Layers, label: "Cement" },
  { icon: Pill, label: "Pharmaceuticals" },
  { icon: Flame, label: "Natural Gas" },
  { icon: Wheat, label: "Agro-Industry" },
]

export function Industries() {
  return (
    <section className="relative border-b border-border/60 bg-primary text-primary-foreground">
      <div className="absolute inset-0 -z-0 opacity-15">
        <Image
          src="/placeholder.jpg"
          alt=""
          fill
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/85 via-primary/95 to-primary" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="max-w-2xl">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
            Industries we serve
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            Trusted across heavy industry &amp; critical infrastructure.
          </h2>
          <p className="mt-4 text-base leading-relaxed text-primary-foreground/80">
            From power generation and oil &amp; gas to pharmaceuticals and food
            processing, we deliver electrical and automation expertise where
            reliability matters most.
          </p>
        </div>

        <ul className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-primary-foreground/15 bg-primary-foreground/15 sm:grid-cols-3 lg:grid-cols-4">
          {industries.map((industry) => {
            const Icon = industry.icon
            return (
              <li
                key={industry.label}
                className="flex flex-col items-start gap-3 bg-primary p-5 transition-colors hover:bg-primary-foreground/5"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-md bg-accent/20 text-accent">
                  <Icon className="h-5 w-5" />
                </span>
                <span className="text-sm font-medium leading-tight">
                  {industry.label}
                </span>
              </li>
            )
          })}
        </ul>
      </div>
    </section>
  )
}
