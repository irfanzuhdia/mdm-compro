import { CtaBanner } from "@/components/cta-banner"
import { Hero } from "@/components/hero"
import { Industries } from "@/components/industries"
import { Services } from "@/components/services"
import { WhyUs } from "@/components/why-us"
import { getServices } from "@/lib/cms"

export default async function HomePage() {
  const services = await getServices()

  return (
    <>
      <Hero />
      <Services services={services} />
      <WhyUs />
      <Industries />
      <CtaBanner
        title="Ready to power your next project?"
        description="Tell us about your facility — our engineers will respond with a tailored scope, approach, and quote."
        primaryHref="/contact"
        primaryLabel="Get in Touch"
        secondaryHref="/services"
        secondaryLabel="View Services"
      />
    </>
  )
}
