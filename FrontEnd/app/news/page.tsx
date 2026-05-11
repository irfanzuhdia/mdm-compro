import type { Metadata } from "next"
import { CtaBanner } from "@/components/cta-banner"
import { NewsList } from "@/components/news-list"
import { PageHero } from "@/components/page-hero"
import { getNews } from "@/lib/cms"

export const metadata: Metadata = {
  title: "News & Insights — PT Multi Daya Mitra",
  description:
    "Latest project milestones, company updates, and engineering insights from PT Multi Daya Mitra.",
}

export default async function NewsPage() {
  const news = await getNews()

  return (
    <>
      <PageHero
        eyebrow="News & Insights"
        title="Project milestones, company updates, and field-tested insights."
        description="Stay current on what our engineers are delivering across power, oil & gas, manufacturing, and infrastructure projects."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News" }]}
      />
      <NewsList news={news} />
      <CtaBanner
        title="Have a project worth talking about?"
        description="We work with industrial owners, EPC partners, and infrastructure operators across Indonesia. Let's talk about your next milestone."
        primaryHref="/contact"
        primaryLabel="Contact Us"
      />
    </>
  )
}
