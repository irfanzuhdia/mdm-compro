"use client"

import { useMemo, useState } from "react"
import { useFormStatus } from "react-dom"
import {
  ArrowDown,
  ArrowUp,
  Eye,
  FileJson,
  FileText,
  Globe2,
  Plus,
  Save,
  Search,
  Trash2,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import type { PageContent, SEO } from "@/lib/cms"

const statusOptions = ["draft", "published", "scheduled", "archived"]
const blockTypes = ["heading", "paragraph", "quote", "list", "image", "cta"]
const fieldTypes = ["text", "list", "json"] as const

type FieldType = (typeof fieldTypes)[number]

type FieldRow = {
  id: string
  key: string
  type: FieldType
  value: string
}

type BlockRow = {
  id: string
  type: string
  text: string
}

type PageEditorProps = {
  action: (formData: FormData) => void | Promise<void>
  mode: "create" | "edit"
  page?: PageContent
}

export function PageEditor({ action, mode, page }: PageEditorProps) {
  const initialContent = page?.content ?? { blocks: [] }
  const [title, setTitle] = useState(page?.title ?? "")
  const [key, setKey] = useState(page?.key ?? "")
  const [slugTouched, setSlugTouched] = useState(mode === "edit")
  const [status, setStatus] = useState(page?.status ?? "draft")
  const [publishedAtInput, setPublishedAtInput] = useState(toDateTimeLocal(page?.publishedAt))
  const [seo, setSeo] = useState<SEO>(page?.seo ?? {})
  const [fields, setFields] = useState<FieldRow[]>(() => contentToFields(initialContent))
  const [blocks, setBlocks] = useState<BlockRow[]>(() => contentToBlocks(initialContent))

  const publishedAt = useMemo(() => toIsoDateTime(publishedAtInput), [publishedAtInput])
  const content = useMemo(() => buildContent(fields, blocks), [fields, blocks])
  const contentJson = useMemo(() => JSON.stringify(content), [content])
  const prettyContentJson = useMemo(() => JSON.stringify(content, null, 2), [content])

  function updateTitle(value: string) {
    setTitle(value)
    if (!slugTouched) {
      setKey(slugifyPath(value))
    }
  }

  function addField() {
    setFields((current) => [
      ...current,
      { id: makeId("field"), key: "", type: "text", value: "" },
    ])
  }

  function updateField(id: string, patch: Partial<FieldRow>) {
    setFields((current) =>
      current.map((field) => (field.id === id ? { ...field, ...patch } : field)),
    )
  }

  function removeField(id: string) {
    setFields((current) => current.filter((field) => field.id !== id))
  }

  function addBlock(type = "paragraph") {
    setBlocks((current) => [...current, { id: makeId("block"), type, text: "" }])
  }

  function updateBlock(id: string, patch: Partial<BlockRow>) {
    setBlocks((current) =>
      current.map((block) => (block.id === id ? { ...block, ...patch } : block)),
    )
  }

  function removeBlock(id: string) {
    setBlocks((current) => current.filter((block) => block.id !== id))
  }

  function moveBlock(index: number, direction: -1 | 1) {
    setBlocks((current) => {
      const nextIndex = index + direction
      if (nextIndex < 0 || nextIndex >= current.length) return current
      const copy = [...current]
      const [item] = copy.splice(index, 1)
      copy.splice(nextIndex, 0, item)
      return copy
    })
  }

  return (
    <form action={action} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {mode === "edit" && page && (
        <>
          <input name="id" type="hidden" value={page.id} />
          <input name="version" type="hidden" value={page.version} />
          <input name="oldKey" type="hidden" value={page.key} />
        </>
      )}
      <input name="content" type="hidden" value={contentJson} />
      <input name="publishedAt" type="hidden" value={publishedAt} />
      <input name="seoTitle" type="hidden" value={seo.title ?? ""} />
      <input name="seoDescription" type="hidden" value={seo.description ?? ""} />
      <input name="seoCanonical" type="hidden" value={seo.canonical ?? ""} />
      {seo.noIndex && <input name="seoNoIndex" type="hidden" value="on" />}

      <div className="space-y-6">
        <section className="rounded-lg border border-border bg-background p-5">
          <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_260px]">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="title">
                Title
              </label>
              <Input
                className="mt-2 h-12 text-lg font-semibold"
                id="title"
                name="title"
                onChange={(event) => updateTitle(event.target.value)}
                required
                value={title}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="key">
                Path
              </label>
              <Input
                className="mt-2"
                id="key"
                name="key"
                onChange={(event) => {
                  setSlugTouched(true)
                  setKey(slugifyPath(event.target.value))
                }}
                placeholder="company/about"
                required
                value={key}
              />
            </div>
          </div>
        </section>

        <Tabs defaultValue="content" className="gap-4">
          <TabsList className="grid h-auto w-full grid-cols-3 rounded-md">
            <TabsTrigger value="content">
              <FileText className="h-4 w-4" />
              Content
            </TabsTrigger>
            <TabsTrigger value="preview">
              <Eye className="h-4 w-4" />
              Preview
            </TabsTrigger>
            <TabsTrigger value="source">
              <FileJson className="h-4 w-4" />
              JSON
            </TabsTrigger>
          </TabsList>

          <TabsContent value="content" className="space-y-6">
            <section className="rounded-lg border border-border bg-background p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Page Fields</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Reusable page data outside the main article blocks.
                  </p>
                </div>
                <Button onClick={addField} type="button" variant="outline">
                  <Plus className="h-4 w-4" />
                  Field
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                {fields.map((field) => (
                  <div
                    className="grid gap-3 rounded-md border border-border bg-secondary/30 p-3 md:grid-cols-[180px_120px_minmax(0,1fr)_40px]"
                    key={field.id}
                  >
                    <Input
                      aria-label="Field key"
                      onChange={(event) => updateField(field.id, { key: slugifyField(event.target.value) })}
                      placeholder="overview"
                      value={field.key}
                    />
                    <select
                      aria-label="Field type"
                      className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                      onChange={(event) => updateField(field.id, { type: event.target.value as FieldType })}
                      value={field.type}
                    >
                      {fieldTypes.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                    <Textarea
                      aria-label="Field value"
                      className="min-h-20 bg-background"
                      onChange={(event) => updateField(field.id, { value: event.target.value })}
                      placeholder={field.type === "list" ? "One item per line" : "Content"}
                      value={field.value}
                    />
                    <Button
                      aria-label="Remove field"
                      onClick={() => removeField(field.id)}
                      size="icon"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}

                {fields.length === 0 && (
                  <div className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                    No custom fields yet.
                  </div>
                )}
              </div>
            </section>

            <section className="rounded-lg border border-border bg-background p-5">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h2 className="font-display text-lg font-semibold text-foreground">Blocks</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    The publishable body content for this page.
                  </p>
                </div>
                <Button onClick={() => addBlock()} type="button" variant="outline">
                  <Plus className="h-4 w-4" />
                  Block
                </Button>
              </div>

              <div className="mt-5 space-y-4">
                {blocks.map((block, index) => (
                  <div className="rounded-md border border-border bg-secondary/30 p-3" key={block.id}>
                    <div className="flex flex-wrap items-center gap-2">
                      <select
                        aria-label="Block type"
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                        onChange={(event) => updateBlock(block.id, { type: event.target.value })}
                        value={block.type}
                      >
                        {blockTypes.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                      <Button
                        aria-label="Move block up"
                        disabled={index === 0}
                        onClick={() => moveBlock(index, -1)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <ArrowUp className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Move block down"
                        disabled={index === blocks.length - 1}
                        onClick={() => moveBlock(index, 1)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <ArrowDown className="h-4 w-4" />
                      </Button>
                      <Button
                        aria-label="Remove block"
                        className="ml-auto"
                        onClick={() => removeBlock(block.id)}
                        size="icon"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                    <Textarea
                      className="mt-3 min-h-28 bg-background"
                      onChange={(event) => updateBlock(block.id, { text: event.target.value })}
                      placeholder={blockPlaceholder(block.type)}
                      value={block.text}
                    />
                  </div>
                ))}

                {blocks.length === 0 && (
                  <div className="rounded-md border border-dashed border-border py-8 text-center text-sm text-muted-foreground">
                    No blocks yet.
                  </div>
                )}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="preview">
            <section className="rounded-lg border border-border bg-background p-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                /{key || "new-page"}
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground">
                {title || "Untitled page"}
              </h2>
              <div className="mt-6 space-y-4 text-sm leading-relaxed text-muted-foreground">
                {previewFields(fields)}
                {previewBlocks(blocks)}
              </div>
            </section>
          </TabsContent>

          <TabsContent value="source">
            <Textarea
              className="min-h-[520px] rounded-lg border-border bg-background font-mono text-xs"
              readOnly
              value={prettyContentJson}
            />
          </TabsContent>
        </Tabs>
      </div>

      <aside className="space-y-4 xl:sticky xl:top-6 xl:self-start">
        <section className="rounded-lg border border-border bg-background p-5">
          <h2 className="font-display text-lg font-semibold text-foreground">Publish</h2>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="status">
                Status
              </label>
              <select
                className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                id="status"
                name="status"
                onChange={(event) => setStatus(event.target.value)}
                value={status}
              >
                {statusOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="publishedAtInput">
                Publish date
              </label>
              <Input
                className="mt-2"
                disabled={status !== "published" && status !== "scheduled"}
                id="publishedAtInput"
                onChange={(event) => setPublishedAtInput(event.target.value)}
                type="datetime-local"
                value={publishedAtInput}
              />
            </div>

            {mode === "edit" && page && (
              <div className="rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
                <p>Version: {page.version}</p>
                <p>Current URL: /{page.key}</p>
              </div>
            )}

            <SubmitButton mode={mode} />
          </div>
        </section>

        <section className="rounded-lg border border-border bg-background p-5">
          <div className="flex items-center gap-2">
            <Search className="h-4 w-4 text-muted-foreground" />
            <h2 className="font-display text-lg font-semibold text-foreground">SEO</h2>
          </div>
          <div className="mt-4 space-y-4">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="seoTitle">
                SEO title
              </label>
              <Input
                className="mt-2"
                id="seoTitle"
                onChange={(event) => setSeo((current) => ({ ...current, title: event.target.value }))}
                value={seo.title ?? ""}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="seoDescription">
                Description
              </label>
              <Textarea
                className="mt-2 min-h-24"
                id="seoDescription"
                onChange={(event) =>
                  setSeo((current) => ({ ...current, description: event.target.value }))
                }
                value={seo.description ?? ""}
              />
            </div>
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="seoCanonical">
                Canonical URL
              </label>
              <div className="relative mt-2">
                <Globe2 className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  id="seoCanonical"
                  onChange={(event) =>
                    setSeo((current) => ({ ...current, canonical: event.target.value }))
                  }
                  value={seo.canonical ?? ""}
                />
              </div>
            </div>
            <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
              <Checkbox
                checked={Boolean(seo.noIndex)}
                onCheckedChange={(checked) =>
                  setSeo((current) => ({ ...current, noIndex: checked === true }))
                }
              />
              Hide from search engines
            </label>
          </div>
        </section>
      </aside>
    </form>
  )
}

function SubmitButton({ mode }: { mode: "create" | "edit" }) {
  const { pending } = useFormStatus()
  return (
    <Button className="w-full" disabled={pending} type="submit">
      <Save className="h-4 w-4" />
      {pending ? "Saving..." : mode === "create" ? "Create Page" : "Save Page"}
    </Button>
  )
}

function contentToFields(content: Record<string, unknown>): FieldRow[] {
  return Object.entries(content)
    .filter(([fieldKey]) => fieldKey !== "blocks")
    .map(([fieldKey, value]) => ({
      id: `field-${fieldKey}`,
      key: fieldKey,
      type: valueType(value),
      value: valueToText(value),
    }))
}

function contentToBlocks(content: Record<string, unknown>): BlockRow[] {
  const maybeBlocks = content.blocks
  if (!Array.isArray(maybeBlocks)) return []
  return maybeBlocks.map((item, index) => {
    if (!item || typeof item !== "object") {
      return { id: `block-${index}`, type: "paragraph", text: "" }
    }
    const block = item as { type?: unknown; text?: unknown; items?: unknown }
    const type = typeof block.type === "string" ? block.type : "paragraph"
    return {
      id: `block-${index}`,
      type,
      text: blockToText(item as Record<string, unknown>, type),
    }
  })
}

function buildContent(fields: FieldRow[], blocks: BlockRow[]) {
  const content: Record<string, unknown> = {}
  for (const field of fields) {
    const fieldKey = field.key.trim()
    if (!fieldKey) continue
    content[fieldKey] = parseFieldValue(field)
  }
  content.blocks = blocks
    .map((block) => {
      if (block.type === "list") {
        return {
          type: "list",
          items: block.text
            .split("\n")
            .map((item) => item.trim())
            .filter(Boolean),
        }
      }
      if (block.type === "image") {
        const [imageUrl = "", alt = ""] = block.text.split("\n").map((item) => item.trim())
        return { type: "image", imageUrl, alt }
      }
      if (block.type === "cta") {
        const [title = "", description = "", href = "", label = ""] = block.text
          .split("\n")
          .map((item) => item.trim())
        return { type: "cta", title, description, href, label }
      }
      return { type: block.type, text: block.text.trim() }
    })
    .filter((block) => {
      if ("items" in block) return Array.isArray(block.items) && block.items.length > 0
      if ("imageUrl" in block) return Boolean(block.imageUrl)
      if ("title" in block || "href" in block) return Boolean(block.title || block.href)
      return "text" in block && Boolean(block.text)
    })
  return content
}

function parseFieldValue(field: FieldRow) {
  if (field.type === "list") {
    return field.value
      .split("\n")
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (field.type === "json") {
    try {
      return JSON.parse(field.value)
    } catch {
      return field.value
    }
  }
  return field.value
}

function previewFields(fields: FieldRow[]) {
  return fields
    .filter((field) => field.key.trim())
    .map((field) => (
      <div className="rounded-md border border-border p-3" key={field.id}>
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">{field.key}</p>
        <p className="mt-2 whitespace-pre-line">{field.value || "-"}</p>
      </div>
    ))
}

function previewBlocks(blocks: BlockRow[]) {
  return blocks
    .filter((block) => block.text.trim())
    .map((block) => {
      if (block.type === "heading") {
        return (
          <h3 className="font-display text-2xl font-semibold text-foreground" key={block.id}>
            {block.text}
          </h3>
        )
      }
      if (block.type === "quote") {
        return (
          <blockquote className="border-l-2 border-primary pl-4 text-foreground" key={block.id}>
            {block.text}
          </blockquote>
        )
      }
      if (block.type === "list") {
        return (
          <ul className="list-disc space-y-1 pl-5" key={block.id}>
            {block.text
              .split("\n")
              .map((item) => item.trim())
              .filter(Boolean)
              .map((item, index) => (
                <li key={`${item}-${index}`}>{item}</li>
              ))}
          </ul>
        )
      }
      if (block.type === "image") {
        const [imageUrl = "", alt = ""] = block.text.split("\n").map((item) => item.trim())
        return (
          <figure className="rounded-md border border-border p-3" key={block.id}>
            <p className="font-medium text-foreground">{imageUrl || "Image URL"}</p>
            {alt && <figcaption className="mt-1 text-sm">{alt}</figcaption>}
          </figure>
        )
      }
      if (block.type === "cta") {
        const [title = "", description = "", href = "", label = ""] = block.text
          .split("\n")
          .map((item) => item.trim())
        return (
          <div className="rounded-md border border-border p-3" key={block.id}>
            <p className="font-semibold text-foreground">{title || "CTA title"}</p>
            {description && <p className="mt-1">{description}</p>}
            {href && (
              <p className="mt-2 text-xs text-muted-foreground">
                {label || "Learn more"} {"->"} {href}
              </p>
            )}
          </div>
        )
      }
      return <p key={block.id}>{block.text}</p>
    })
}

function blockToText(block: Record<string, unknown>, type: string) {
  if (type === "list" && Array.isArray(block.items)) {
    return block.items.map((value) => String(value)).join("\n")
  }
  if (type === "image") {
    return [block.imageUrl, block.alt].filter((value) => typeof value === "string" && value).join("\n")
  }
  if (type === "cta") {
    return [block.title, block.description, block.href, block.label]
      .filter((value) => typeof value === "string" && value)
      .join("\n")
  }
  return typeof block.text === "string" ? block.text : ""
}

function blockPlaceholder(type: string) {
  if (type === "list") return "One item per line"
  if (type === "image") return "Image URL\nAlt text"
  if (type === "cta") return "Title\nDescription\n/link\nButton label"
  return "Write content"
}

function valueType(value: unknown): FieldType {
  if (Array.isArray(value) && value.every((item) => typeof item !== "object")) return "list"
  if (typeof value === "object" && value !== null) return "json"
  return "text"
}

function valueToText(value: unknown) {
  if (Array.isArray(value) && value.every((item) => typeof item !== "object")) {
    return value.map((item) => String(item)).join("\n")
  }
  if (typeof value === "object" && value !== null) {
    return JSON.stringify(value, null, 2)
  }
  return value == null ? "" : String(value)
}

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

function slugifyPath(value: string) {
  return value
    .split("/")
    .map((segment) => slugify(segment))
    .filter(Boolean)
    .join("/")
}

function slugifyField(value: string) {
  return value
    .trim()
    .replace(/[^a-zA-Z0-9_]+/g, "_")
    .replace(/^_+|_+$/g, "")
}

function toDateTimeLocal(value?: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  const offset = date.getTimezoneOffset()
  const local = new Date(date.getTime() - offset * 60_000)
  return local.toISOString().slice(0, 16)
}

function toIsoDateTime(value: string) {
  if (!value) return ""
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ""
  return date.toISOString()
}

function makeId(prefix: string) {
  return `${prefix}-${Math.random().toString(36).slice(2, 9)}`
}
