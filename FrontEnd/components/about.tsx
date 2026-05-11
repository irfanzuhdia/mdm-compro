import Image from "next/image"
import { Compass, Handshake, Target } from "lucide-react"
import type { PageContent } from "@/lib/cms"

export function About({ page }: { page?: PageContent | null }) {
  const content = page?.content ?? {}
  const overview = String(content.overview ?? "Established in 2013, PT Multi Daya Mitra was founded by a group of seasoned engineers with deep expertise in electricity, industrial automation, fire alarm systems, and mechanical works.")
  const vision = String(content.vision ?? "To become a global electrical, automation, and fire alarm services company.")
  const mission = String(content.mission ?? "Build mutual partnerships and deliver every engagement with professional excellence.")

  return (
    <section className="border-b border-border/60 bg-background">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-secondary">
              <Image
                src="/placeholder.jpg"
                alt="Industrial automation control room with engineers monitoring SCADA systems"
                fill
                className="object-cover"
              />
            </div>
          </div>

          <div className="lg:col-span-7">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent-foreground/80">
              <span className="rounded-sm bg-accent/30 px-2 py-1">About the company</span>
            </p>
            <h2 className="mt-5 font-display text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
              A team built for your most demanding electrical projects.
            </h2>
            <div className="mt-6 space-y-4 text-base leading-relaxed text-muted-foreground">
              <p>{overview}</p>
              <p>
                We have grown into one of the largest electrical service partners in
                East Java — delivering projects across Indonesia and on selected
                overseas assignments. Our company culture of professional discipline
                drives every milestone, and we are certified to recognized quality
                management standards.
              </p>
            </div>

            <div className="mt-10 grid gap-5 sm:grid-cols-2">
              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Compass className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                    Our Vision
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {vision}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-accent/30 text-foreground">
                    <Target className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                    Our Mission
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  {mission}
                </p>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 sm:col-span-2">
                <div className="flex items-center gap-2.5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                    <Handshake className="h-4 w-4" />
                  </span>
                  <h3 className="font-display text-sm font-semibold uppercase tracking-wider text-foreground">
                    Our Culture
                  </h3>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                  A professional, fast-moving organization driven by certified
                  engineers, structured processes, and a commitment to safety on every
                  site we operate.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
