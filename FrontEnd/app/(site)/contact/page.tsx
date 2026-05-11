import type { Metadata } from "next"
import { Contact } from "@/components/contact"
import { PageHero } from "@/components/page-hero"

export const metadata: Metadata = {
  title: "Contact — PT Multi Daya Mitra",
  description:
    "Get in touch with PT Multi Daya Mitra. Our engineering team responds with tailored scope, approach, and quotation for your project.",
}

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in Touch"
        title="Plan your next electrical or automation project with us."
        description="Tell us about your facility and the outcomes you're after — our engineers will respond with a tailored scope, approach, and quote."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Contact" }]}
      />
      <Contact />
    </>
  )
}
