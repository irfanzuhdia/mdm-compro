import type { Metadata } from "next"
import { ContentList } from "@/components/cms/content-list"
import { CtaBanner } from "@/components/cta-banner"
import { PageHero } from "@/components/page-hero"
import { getProducts } from "@/lib/cms"

export const metadata: Metadata = {
  title: "Products — PT Multi Daya Mitra",
  description:
    "Testing equipment, protection relay, instrumentation, and industrial electrical products from PT Multi Daya Mitra.",
}

export default async function ProductsPage() {
  const products = await getProducts()

  return (
    <>
      <PageHero
        eyebrow="Products"
        title="Industrial products for testing, protection, and instrumentation."
        description="Explore CMS-managed product categories, datasheets, specifications, galleries, and product details."
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products" }]}
      />
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
          <ContentList items={products} basePath="/products" empty="No products have been published yet." />
        </div>
      </section>
      <CtaBanner
        title="Need a specific product or datasheet?"
        description="Tell us what you are sourcing and our team will respond with availability, specifications, and support options."
        primaryHref="/contact"
        primaryLabel="Ask Our Team"
        secondaryHref="/services"
        secondaryLabel="View Services"
      />
    </>
  )
}
