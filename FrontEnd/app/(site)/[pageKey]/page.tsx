import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { PageHero } from "@/components/page-hero"
import { RichText } from "@/components/cms/rich-text"
import { getPage } from "@/lib/cms"

type PageProps = {
  params: Promise<{ pageKey: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { pageKey } = await params
  const page = await getPage(pageKey)
  if (!page) return {}

  return {
    title: page.seo?.title || `${page.title} - PT Multi Daya Mitra`,
    description: page.seo?.description,
    alternates: page.seo?.canonical ? { canonical: page.seo.canonical } : undefined,
    robots: page.seo?.noIndex ? { index: false, follow: false } : undefined,
  }
}

export default async function DynamicCmsPage({ params }: PageProps) {
  const { pageKey } = await params
  const page = await getPage(pageKey)
  if (!page || page.status !== "published") {
    notFound()
  }

  const fields = Object.entries(page.content ?? {}).filter(([key]) => key !== "blocks")
  const description = page.seo?.description || firstStringField(fields)

  return (
    <>
      <PageHero
        eyebrow="Page"
        title={page.title}
        description={description}
        breadcrumbs={[{ label: "Home", href: "/" }, { label: page.title }]}
      />
      <section className="mx-auto grid max-w-7xl gap-8 px-4 py-16 sm:px-6 lg:grid-cols-[minmax(0,1fr)_320px] lg:px-8">
        <article className="min-w-0">
          <RichText content={page.content} />
        </article>

        {fields.length > 0 && (
          <aside className="space-y-3 lg:sticky lg:top-6 lg:self-start">
            {fields.map(([key, value]) => (
              <div className="rounded-lg border border-border bg-background p-4" key={key}>
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  {humanize(key)}
                </p>
                <div className="mt-2 text-sm leading-relaxed text-foreground">
                  {renderField(value)}
                </div>
              </div>
            ))}
          </aside>
        )}
      </section>
    </>
  )
}

function firstStringField(fields: Array<[string, unknown]>) {
  for (const [, value] of fields) {
    if (typeof value === "string" && value.trim()) return value
  }
  return undefined
}

function renderField(value: unknown) {
  if (Array.isArray(value)) {
    return (
      <ul className="list-disc space-y-1 pl-5">
        {value.map((item, index) => (
          <li key={`${String(item)}-${index}`}>{String(item)}</li>
        ))}
      </ul>
    )
  }
  if (value && typeof value === "object") {
    return <pre className="overflow-auto whitespace-pre-wrap text-xs">{JSON.stringify(value, null, 2)}</pre>
  }
  return <p className="whitespace-pre-line">{String(value ?? "")}</p>
}

function humanize(value: string) {
  return value
    .replaceAll("_", " ")
    .replaceAll("-", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
}
