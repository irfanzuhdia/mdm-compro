import Image from "next/image"
import Link from "next/link"
import { ArrowRight, ShieldCheck } from "lucide-react"
import { Button } from "@/components/ui/button"

export function Hero() {
  return (
    <section className="relative overflow-hidden border-b border-border/60 bg-background">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [background-image:linear-gradient(to_right,oklch(0.92_0.01_250)_1px,transparent_1px),linear-gradient(to_bottom,oklch(0.92_0.01_250)_1px,transparent_1px)] [background-size:48px_48px] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)]"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 lg:grid-cols-12 lg:gap-10 lg:px-8 lg:py-24">
        <div className="lg:col-span-7">
          <span className="inline-flex items-center gap-2 rounded-full border border-border bg-secondary/60 px-3 py-1 text-xs font-medium tracking-wide text-secondary-foreground">
            <span className="h-1.5 w-1.5 rounded-full bg-accent" />
            Trusted partner since 2013
          </span>

          <h1 className="mt-5 font-display text-4xl font-semibold leading-[1.05] tracking-tight text-foreground text-balance sm:text-5xl lg:text-6xl">
            Powering industry with{" "}
            <span className="relative whitespace-nowrap">
              <span className="relative z-10">reliable</span>
              <span
                aria-hidden="true"
                className="absolute inset-x-0 bottom-1 -z-0 h-3 bg-accent/60"
              />
            </span>{" "}
            electrical &amp; automation services.
          </h1>

          <p className="mt-6 max-w-xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            PT Multi Daya Mitra delivers end-to-end electrical, industrial automation,
            and fire alarm solutions for power, oil &amp; gas, manufacturing, and
            infrastructure projects across Indonesia and beyond.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            <Button asChild size="lg">
              <Link href="/contact">
                Start a Project
                <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/services">Explore Services</Link>
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-6 border-t border-border/60 pt-8 sm:gap-10">
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Established
              </dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                2013
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Industries served
              </dt>
              <dd className="mt-1 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                10+
              </dd>
            </div>
            <div>
              <dt className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Certified team
              </dt>
              <dd className="mt-1 inline-flex items-center gap-1.5 font-display text-2xl font-semibold text-foreground sm:text-3xl">
                ISO
                <ShieldCheck className="h-5 w-5 text-accent" />
              </dd>
            </div>
          </dl>
        </div>

        <div className="relative lg:col-span-5">
          <div className="relative aspect-[4/5] overflow-hidden rounded-2xl border border-border bg-secondary shadow-sm">
            <Image
              src="/placeholder.jpg"
              alt="Engineer inspecting medium voltage substation switchgear"
              fill
              className="object-cover"
              priority
            />
            <div
              aria-hidden="true"
              className="absolute inset-0 bg-gradient-to-t from-primary/40 via-transparent to-transparent"
            />
          </div>

          <div className="absolute -bottom-6 -left-6 hidden w-64 rounded-xl border border-border bg-card p-4 shadow-lg sm:block">
            <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Now offering
            </p>
            <p className="mt-1 font-display text-base font-semibold leading-snug text-foreground">
              Energy Monitoring System for Sustainability &amp; ESG Reporting
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
