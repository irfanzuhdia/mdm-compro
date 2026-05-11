import type { Metadata } from "next"
import { CareerBenefits } from "@/components/career-benefits"
import { CareerOpenings } from "@/components/career-openings"
import { CtaBanner } from "@/components/cta-banner"
import { PageHero } from "@/components/page-hero"
import { getCareers } from "@/lib/cms"

export const metadata: Metadata = {
  title: "Career — PT Multi Daya Mitra",
  description:
    "Join PT Multi Daya Mitra. Open roles in electrical engineering, automation, project management, and operations across Indonesia.",
}

export default async function CareerPage() {
  const careers = await getCareers()

  return (
    <>
      <PageHero
        eyebrow="Career"
        title="Build your engineering career on real, large-scale projects."
        description="Join a team that designs, installs, and maintains the electrical and automation systems behind Indonesia's most demanding industries."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Career" }]}
      />
      <CareerBenefits />
      <CareerOpenings jobs={careers.data} />
      <CtaBanner
        title="Don't see the right role?"
        description="We're always interested in meeting talented engineers and operators. Send us your CV and we'll keep you in mind."
        primaryHref="mailto:hr@multidayamitra.co.id"
        primaryLabel="Send Your CV"
      />
    </>
  )
}
