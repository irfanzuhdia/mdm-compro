import Image from "next/image"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { BlockRenderer } from "@/components/cms/block-renderer"
import { CtaBanner } from "@/components/cta-banner"
import { PageHero } from "@/components/page-hero"
import { fallbackNews, formatDate, getNewsItem } from "@/lib/cms"

type Props = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return fallbackNews.data.map((item) => ({ slug: item.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const news = await getNewsItem((await params).slug)
  if (!news) return {}
  return {
    title: news.seo?.title ?? `${news.title} — PT Multi Daya Mitra`,
    description: news.seo?.description ?? news.excerpt,
  }
}

export default async function NewsDetailPage({ params }: Props) {
  const news = await getNewsItem((await params).slug)
  if (!news) notFound()

  return (
    <>
      <PageHero
        eyebrow={news.category ?? "News"}
        title={news.title}
        description={news.excerpt ?? "Company update from PT Multi Daya Mitra."}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: "News", href: "/news" }, { label: news.title }]}
      />
      <article className="border-b border-border/60 bg-background">
        <div className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
          <div className="mb-8 flex flex-wrap items-center gap-3">
            {news.category && <Badge variant="outline">{news.category}</Badge>}
            {(news.tags ?? []).map((tag) => (
              <Badge key={tag} variant="secondary">
                {tag}
              </Badge>
            ))}
            <span className="text-sm text-muted-foreground">{formatDate(news.publishedAt)}</span>
          </div>
          <div className="relative mb-10 aspect-[16/9] overflow-hidden rounded-xl border border-border bg-secondary">
            <Image src={news.featuredImageUrl || "/placeholder.jpg"} alt={news.title} fill className="object-cover" priority />
          </div>
          <BlockRenderer content={news.body} />
        </div>
      </article>
      <CtaBanner
        title="Have a project worth discussing?"
        description="Talk with our engineers about electrical, automation, and fire system needs."
        primaryHref="/contact"
        primaryLabel="Contact Us"
      />
    </>
  )
}
