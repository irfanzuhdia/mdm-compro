import type { Metadata } from "next"
import { Capabilities } from "@/components/capabilities"
import { CtaBanner } from "@/components/cta-banner"
import { ContentList } from "@/components/cms/content-list"
import { PageHero } from "@/components/page-hero"
import { Services } from "@/components/services"
import { getServices } from "@/lib/cms"

export const metadata: Metadata = {
  title: "Services — PT Multi Daya Mitra",
  description:
    "Electrical services, industrial automation, and fire alarm system solutions delivered by certified engineers across Indonesia.",
}

export default async function ServicesPage() {
  const services = await getServices()

  return (
    <>
      <PageHero
        eyebrow="Our Services"
        title="Three core services. One trusted engineering partner."
        description="From greenfield installation to long-term operation and maintenance, we deliver high-quality solutions tailored to each plant and facility."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services" }]}
      />
      <Services services={services} />
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-10 max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              CMS catalog
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Service categories
            </h2>
          </div>
          <ContentList items={services} basePath="/services" empty="No services have been published yet." />
        </div>
      </section>
      <Capabilities />
      <CtaBanner
        title="Have a specific scope in mind?"
        description="Share your facility details and we'll respond with engineering scope, timeline, and a tailored quotation."
        primaryHref="/contact"
        primaryLabel="Request a Quote"
        secondaryHref="/products"
        secondaryLabel="See Products"
      />
    </>
  )
}
