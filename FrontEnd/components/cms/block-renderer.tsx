import Image from "next/image"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"

type Block = {
  type?: string
  text?: string
  items?: string[]
  title?: string
  description?: string
  href?: string
  label?: string
  imageUrl?: string
  alt?: string
}

export function BlockRenderer({ content }: { content?: { blocks?: Block[] } | unknown }) {
  const blocks = isBlockContent(content) ? content.blocks : []

  if (blocks.length === 0) {
    return <p className="text-muted-foreground">Details will be published soon.</p>
  }

  return (
    <div className="space-y-6 text-base leading-relaxed text-muted-foreground">
      {blocks.map((block, index) => renderBlock(block, index))}
    </div>
  )
}

function renderBlock(block: Block, index: number) {
  if (block.type === "heading") {
    return (
      <h2 key={index} className="font-display text-2xl font-semibold tracking-tight text-foreground">
        {block.text}
      </h2>
    )
  }

  if (block.type === "quote") {
    return (
      <blockquote key={index} className="border-l-2 border-primary pl-4 text-foreground">
        {block.text}
      </blockquote>
    )
  }

  if (block.type === "list") {
    return (
      <ul key={index} className="list-disc space-y-2 pl-5">
        {(block.items ?? []).map((item, itemIndex) => (
          <li key={`${item}-${itemIndex}`}>{item}</li>
        ))}
      </ul>
    )
  }

  if (block.type === "image" && block.imageUrl) {
    return (
      <figure key={index} className="space-y-2">
        <div className="relative aspect-[16/9] overflow-hidden rounded-lg border border-border bg-secondary">
          <Image src={block.imageUrl} alt={block.alt ?? ""} fill className="object-cover" />
        </div>
        {block.alt && <figcaption className="text-sm text-muted-foreground">{block.alt}</figcaption>}
      </figure>
    )
  }

  if (block.type === "cta") {
    return (
      <div key={index} className="rounded-lg border border-border bg-card p-5">
        <h3 className="font-display text-xl font-semibold text-foreground">
          {block.title || block.text || "Next step"}
        </h3>
        {block.description && <p className="mt-2 text-sm leading-relaxed">{block.description}</p>}
        {block.href && (
          <Button asChild className="mt-4">
            <Link href={block.href}>
              {block.label || "Learn more"}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        )}
      </div>
    )
  }

  return <p key={index}>{block.text}</p>
}

function isBlockContent(value: unknown): value is { blocks: Block[] } {
  return Boolean(
    value &&
      typeof value === "object" &&
      "blocks" in value &&
      Array.isArray((value as { blocks?: unknown }).blocks),
  )
}
