import type { ReactNode } from "react"
import type { Career, ContentNode, NewsItem } from "@/lib/cms"
import {
  adminStatusOptions,
  employmentTypeOptions,
  specsToText,
  textFromBlocks,
  toDateTimeLocal,
} from "@/lib/admin-content"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Save } from "lucide-react"

type Action = (formData: FormData) => void | Promise<void>

type ContentItemFormProps = {
  action: Action
  item?: ContentNode
  mode: "create" | "edit"
  parentOptions?: ContentNode[]
  resource: "services" | "products"
}

type NewsFormProps = {
  action: Action
  item?: NewsItem
  mode: "create" | "edit"
}

type CareerFormProps = {
  action: Action
  item?: Career
  mode: "create" | "edit"
}

export function ContentItemForm({ action, item, mode, parentOptions = [], resource }: ContentItemFormProps) {
  const isProduct = resource === "products"
  const availableParents = parentOptions.filter((option) => {
    if (option.id === item?.id) return false
    if (item?.fullPath && option.fullPath.startsWith(`${item.fullPath}/`)) return false
    return option.depth < 4
  })

  return (
    <form action={action} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      <input name="resource" type="hidden" value={resource} />
      {mode === "edit" && item && (
        <>
          <input name="id" type="hidden" value={item.id} />
          <input name="version" type="hidden" value={item.version ?? 0} />
          <input name="oldPath" type="hidden" value={item.fullPath} />
        </>
      )}

      <div className="space-y-6 rounded-lg border border-border bg-background p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <Field label="Name" name="title" required defaultValue={item?.title} />
          <Field label="Slug" name="slug" required defaultValue={item?.slug} />
        </div>
        <ParentField defaultValue={item?.parentId} options={availableParents} />
        <Field label="Short description" name="summary" defaultValue={item?.summary} />
        <TextAreaField
          label="Description"
          name="contentText"
          rows={12}
          defaultValue={textFromBlocks(item?.content)}
        />
        <Field label="Image URL" name="imageUrl" defaultValue={item?.imageUrl} />
        {isProduct && (
          <>
            <Field label="Datasheet URL" name="datasheetUrl" defaultValue={item?.datasheetUrl} />
            <TextAreaField
              label="Specs"
              name="specsText"
              placeholder="Brand: Schneider&#10;Voltage: 20kV&#10;Availability: In stock"
              rows={7}
              defaultValue={specsToText(item?.specs)}
            />
          </>
        )}
      </div>

      <Sidebar
        buttonLabel={mode === "create" ? `Create ${isProduct ? "Product" : "Service"}` : "Save Changes"}
        itemVersion={item?.version}
      >
        <StatusField defaultValue={item?.status} />
        <Field label="Publish date" name="publishedAt" type="datetime-local" defaultValue={toDateTimeLocal(item?.publishedAt)} />
        <Field label="Sort order" name="sortOrder" type="number" defaultValue={String(item?.sortOrder ?? 0)} />
        <SeoFields seo={item?.seo} />
      </Sidebar>
    </form>
  )
}

function ParentField({
  defaultValue,
  options,
}: {
  defaultValue?: string
  options: ContentNode[]
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground" htmlFor="parentId">
        Parent
      </label>
      <select
        className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        defaultValue={defaultValue ?? ""}
        id="parentId"
        name="parentId"
      >
        <option value="">No parent</option>
        {options.map((option) => (
          <option key={option.id} value={option.id}>
            {optionLabel(option)}
          </option>
        ))}
      </select>
    </div>
  )
}

function optionLabel(option: ContentNode) {
  const prefix = option.depth > 0 ? `${"--".repeat(option.depth)} ` : ""
  return `${prefix}${option.title} (${option.fullPath})`
}

export function NewsForm({ action, item, mode }: NewsFormProps) {
  return (
    <form action={action} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {mode === "edit" && item && (
        <>
          <input name="id" type="hidden" value={item.id} />
          <input name="version" type="hidden" value={item.version} />
          <input name="oldSlug" type="hidden" value={item.slug} />
        </>
      )}

      <div className="space-y-6 rounded-lg border border-border bg-background p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <Field label="Title" name="title" required defaultValue={item?.title} />
          <Field label="Slug" name="slug" required defaultValue={item?.slug} />
        </div>
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
          <Field label="Excerpt" name="excerpt" defaultValue={item?.excerpt} />
          <Field label="Category" name="category" defaultValue={item?.category} />
        </div>
        <TextAreaField
          label="Tags"
          name="tagsText"
          placeholder="Automation, Commissioning, Project"
          rows={3}
          defaultValue={item?.tags?.join(", ")}
        />
        <TextAreaField label="Body" name="bodyText" rows={14} defaultValue={textFromBlocks(item?.body)} />
        <Field label="Featured image URL" name="featuredImageUrl" defaultValue={item?.featuredImageUrl} />
      </div>

      <Sidebar buttonLabel={mode === "create" ? "Create News" : "Save News"} itemVersion={item?.version}>
        <StatusField defaultValue={item?.status} />
        <Field label="Publish date" name="publishedAt" type="datetime-local" defaultValue={toDateTimeLocal(item?.publishedAt)} />
        <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
          <input defaultChecked={Boolean(item?.featured)} name="featured" type="checkbox" />
          Featured
        </label>
        <SeoFields seo={item?.seo} />
      </Sidebar>
    </form>
  )
}

export function CareerForm({ action, item, mode }: CareerFormProps) {
  return (
    <form action={action} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_320px]">
      {mode === "edit" && item && (
        <>
          <input name="id" type="hidden" value={item.id} />
          <input name="version" type="hidden" value={item.version} />
          <input name="oldSlug" type="hidden" value={item.slug} />
        </>
      )}

      <div className="space-y-6 rounded-lg border border-border bg-background p-5">
        <div className="grid gap-4 md:grid-cols-[minmax(0,1fr)_240px]">
          <Field label="Role title" name="title" required defaultValue={item?.title} />
          <Field label="Slug" name="slug" required defaultValue={item?.slug} />
        </div>
        <TextAreaField label="Summary" name="summary" rows={4} defaultValue={item?.summary} />
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Department" name="department" required defaultValue={item?.department} />
          <Field label="Location" name="location" required defaultValue={item?.location} />
        </div>
        <TextAreaField
          label="Job description"
          name="descriptionText"
          rows={14}
          defaultValue={textFromBlocks(item?.description)}
        />
        <Field label="Apply URL or email" name="applyUrl" defaultValue={item?.applyUrl} />
      </div>

      <Sidebar buttonLabel={mode === "create" ? "Create Career" : "Save Career"} itemVersion={item?.version}>
        <StatusField defaultValue={item?.status} />
        <SelectField
          label="Employment"
          name="employmentType"
          defaultValue={item?.employmentType ?? "full_time"}
          options={employmentTypeOptions}
        />
        <Field label="Deadline" name="deadline" type="datetime-local" defaultValue={toDateTimeLocal(item?.deadline)} />
        <Field label="Publish date" name="publishedAt" type="datetime-local" defaultValue={toDateTimeLocal(item?.publishedAt)} />
      </Sidebar>
    </form>
  )
}

function Sidebar({
  buttonLabel,
  children,
  itemVersion,
}: {
  buttonLabel: string
  children: ReactNode
  itemVersion?: number
}) {
  return (
    <aside className="space-y-4 rounded-lg border border-border bg-background p-5 xl:sticky xl:top-6 xl:self-start">
      <h2 className="font-display text-lg font-semibold text-foreground">Publish</h2>
      {children}
      {itemVersion && (
        <div className="rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
          Version: {itemVersion}
        </div>
      )}
      <Button className="w-full" type="submit">
        <Save className="h-4 w-4" />
        {buttonLabel}
      </Button>
    </aside>
  )
}

function StatusField({ defaultValue }: { defaultValue?: string }) {
  return (
    <SelectField
      label="Status"
      name="status"
      defaultValue={defaultValue ?? "draft"}
      options={adminStatusOptions.map((status) => ({ value: status, label: status }))}
    />
  )
}

function SeoFields({ seo }: { seo?: { title?: string; description?: string; canonical?: string; noIndex?: boolean } }) {
  return (
    <div className="space-y-3 border-t border-border pt-4">
      <h3 className="text-sm font-semibold text-foreground">SEO</h3>
      <Field label="SEO title" name="seoTitle" defaultValue={seo?.title} />
      <TextAreaField label="SEO description" name="seoDescription" rows={3} defaultValue={seo?.description} />
      <Field label="Canonical URL" name="seoCanonical" defaultValue={seo?.canonical} />
      <label className="flex items-center gap-3 rounded-md border border-border px-3 py-2 text-sm">
        <input defaultChecked={Boolean(seo?.noIndex)} name="seoNoIndex" type="checkbox" />
        Hide from search engines
      </label>
    </div>
  )
}

function Field({
  label,
  name,
  defaultValue,
  placeholder,
  required,
  type = "text",
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  required?: boolean
  type?: string
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground" htmlFor={name}>
        {label}
      </label>
      <Input
        className="mt-2"
        defaultValue={defaultValue ?? ""}
        id={name}
        name={name}
        placeholder={placeholder}
        required={required}
        type={type}
      />
    </div>
  )
}

function TextAreaField({
  label,
  name,
  defaultValue,
  placeholder,
  rows,
}: {
  label: string
  name: string
  defaultValue?: string
  placeholder?: string
  rows: number
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground" htmlFor={name}>
        {label}
      </label>
      <Textarea
        className="mt-2"
        defaultValue={defaultValue ?? ""}
        id={name}
        name={name}
        placeholder={placeholder}
        rows={rows}
      />
    </div>
  )
}

function SelectField({
  label,
  name,
  defaultValue,
  options,
}: {
  label: string
  name: string
  defaultValue: string
  options: Array<{ value: string; label: string }>
}) {
  return (
    <div>
      <label className="text-sm font-medium text-foreground" htmlFor={name}>
        {label}
      </label>
      <select
        className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
        defaultValue={defaultValue}
        id={name}
        name={name}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}
