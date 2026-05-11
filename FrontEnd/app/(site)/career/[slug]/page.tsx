import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Briefcase, CalendarDays, MapPin } from "lucide-react"
import { RichText } from "@/components/cms/rich-text"
import { CtaBanner } from "@/components/cta-banner"
import { PageHero } from "@/components/page-hero"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { employmentTypeLabel, fallbackCareers, formatDate, getCareer } from "@/lib/cms"

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return fallbackCareers.data.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const career = await getCareer((await params).slug)
  if (!career) return {}
  return {
    title: career.seo?.title ?? `${career.title} — PT Multi Daya Mitra Careers`,
    description: career.seo?.description ?? career.summary,
  }
}

export default async function CareerDetailPage({ params }: Props) {
  const career = await getCareer((await params).slug)
  if (!career) notFound()

  return (
    <>
      <PageHero
        eyebrow="Career"
        title={career.title}
        description={career.summary ?? "Open role at PT Multi Daya Mitra."}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Careers", href: "/career" }, { label: career.title }]}
      />
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8">
          <aside className="lg:col-span-4">
            <div className="rounded-xl border border-border bg-card p-5">
              <Badge variant="outline">{career.department}</Badge>
              <dl className="mt-6 space-y-5 text-sm">
                <div className="flex gap-3">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <dt className="font-medium text-muted-foreground">Location</dt>
                    <dd className="text-foreground">{career.location}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <dt className="font-medium text-muted-foreground">Employment</dt>
                    <dd className="text-foreground">{employmentTypeLabel(career.employmentType)}</dd>
                  </div>
                </div>
                <div className="flex gap-3">
                  <CalendarDays className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <dt className="font-medium text-muted-foreground">Deadline</dt>
                    <dd className="text-foreground">{formatDate(career.deadline)}</dd>
                  </div>
                </div>
              </dl>
              <Button asChild className="mt-6 w-full">
                <a href={career.applyUrl || "mailto:hr@multidayamitra.co.id"}>Apply Now</a>
              </Button>
            </div>
          </aside>
          <div className="lg:col-span-8">
            <RichText content={career.description} />
          </div>
        </div>
      </section>
      <CtaBanner
        title="Ready to grow with us?"
        description="Send your profile and our HR team will review it against current openings."
        primaryHref={career.applyUrl || "mailto:hr@multidayamitra.co.id"}
        primaryLabel="Apply Now"
      />
    </>
  )
}
