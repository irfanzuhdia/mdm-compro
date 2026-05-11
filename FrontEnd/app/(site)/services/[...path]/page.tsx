import Image from "next/image"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RichText } from "@/components/cms/rich-text"
import { CtaBanner } from "@/components/cta-banner"
import { PageHero } from "@/components/page-hero"
import { flattenContent, getService, getServices } from "@/lib/cms"

type Props = {
  params: Promise<{ path: string[] }>
}

export async function generateStaticParams() {
  const services = await getServices()
  return flattenContent(services).map((item) => ({ path: item.fullPath.split("/") }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = (await params).path.join("/")
  const service = await getService(path)
  if (!service) return {}
  return {
    title: service.seo?.title ?? `${service.title} — PT Multi Daya Mitra`,
    description: service.seo?.description ?? service.summary,
  }
}

export default async function ServiceDetailPage({ params }: Props) {
  const path = (await params).path.join("/")
  const service = await getService(path)
  if (!service) notFound()

  return (
    <>
      <PageHero
        eyebrow="Service"
        title={service.title}
        description={service.summary ?? "Engineering service detail from PT Multi Daya Mitra."}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Services", href: "/services" }, { label: service.title }]}
      />
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary">
              <Image src={service.imageUrl || "/placeholder.jpg"} alt={service.title} fill className="object-cover" />
            </div>
          </div>
          <div className="lg:col-span-7">
            <RichText content={service.content} />
          </div>
        </div>
      </section>
      <CtaBanner
        title="Discuss this service with our engineers"
        description="Share your project scope and our team will respond with a tailored approach."
        primaryHref="/contact"
        primaryLabel="Request a Quote"
      />
    </>
  )
}
