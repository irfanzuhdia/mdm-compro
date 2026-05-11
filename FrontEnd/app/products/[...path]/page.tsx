import Image from "next/image"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { RichText } from "@/components/cms/rich-text"
import { CtaBanner } from "@/components/cta-banner"
import { PageHero } from "@/components/page-hero"
import { flattenContent, getProduct, getProducts } from "@/lib/cms"

type Props = {
  params: Promise<{ path: string[] }>
}

export async function generateStaticParams() {
  const products = await getProducts()
  return flattenContent(products).map((item) => ({ path: item.fullPath.split("/") }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const path = (await params).path.join("/")
  const product = await getProduct(path)
  if (!product) return {}
  return {
    title: product.seo?.title ?? `${product.title} — PT Multi Daya Mitra`,
    description: product.seo?.description ?? product.summary,
  }
}

export default async function ProductDetailPage({ params }: Props) {
  const path = (await params).path.join("/")
  const product = await getProduct(path)
  if (!product) notFound()
  const specs = Object.entries(product.specs ?? {})

  return (
    <>
      <PageHero
        eyebrow="Product"
        title={product.title}
        description={product.summary ?? "Product detail from PT Multi Daya Mitra."}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "Products", href: "/products" }, { label: product.title }]}
      />
      <section className="border-b border-border/60 bg-background">
        <div className="mx-auto grid max-w-7xl gap-10 px-4 py-20 sm:px-6 lg:grid-cols-12 lg:px-8">
          <div className="lg:col-span-5">
            <div className="relative aspect-[4/3] overflow-hidden rounded-xl border border-border bg-secondary">
              <Image src={product.imageUrl || "/placeholder.jpg"} alt={product.title} fill className="object-cover" />
            </div>
            {specs.length > 0 && (
              <dl className="mt-6 divide-y divide-border rounded-xl border border-border bg-card">
                {specs.map(([key, value]) => (
                  <div key={key} className="grid grid-cols-2 gap-4 p-4 text-sm">
                    <dt className="font-medium text-muted-foreground">{key}</dt>
                    <dd className="text-foreground">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </div>
          <div className="lg:col-span-7">
            <RichText content={product.content} />
          </div>
        </div>
      </section>
      <CtaBanner
        title="Need product availability or a datasheet?"
        description="Send us your requirement and our product team will respond with specifications and next steps."
        primaryHref="/contact"
        primaryLabel="Contact Sales"
      />
    </>
  )
}
