type Block = {
  type?: string
  text?: string
}

export function RichText({ content }: { content?: { blocks?: Block[] } | unknown }) {
  const blocks = isBlockContent(content) ? content.blocks : []

  if (blocks.length === 0) {
    return <p className="text-muted-foreground">Details will be published soon.</p>
  }

  return (
    <div className="space-y-4 text-base leading-relaxed text-muted-foreground">
      {blocks.map((block, index) => {
        if (block.type === "heading") {
          return (
            <h2 key={index} className="font-display text-2xl font-semibold tracking-tight text-foreground">
              {block.text}
            </h2>
          )
        }
        return <p key={index}>{block.text}</p>
      })}
    </div>
  )
}

function isBlockContent(value: unknown): value is { blocks: Block[] } {
  return Boolean(value && typeof value === "object" && "blocks" in value && Array.isArray((value as { blocks?: unknown }).blocks))
}
