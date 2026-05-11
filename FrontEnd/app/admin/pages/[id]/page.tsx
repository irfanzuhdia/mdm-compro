import Link from "next/link"
import { ArrowLeft, Save } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { AdminApiError, adminFetch } from "@/lib/admin-api"
import type { PageContent } from "@/lib/cms"
import { updatePageAction } from "../actions"

const statusOptions = ["draft", "published", "scheduled", "archived"]

export default async function AdminEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ saved?: string; error?: string }>
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  let page: PageContent | null = null
  let apiError = false

  try {
    page = await adminFetch<PageContent>(`/pages/${id}`, {}, `/admin/pages/${id}`)
  } catch (error) {
    if (error instanceof AdminApiError) {
      apiError = true
    } else {
      throw error
    }
  }

  const message = query.saved
    ? "Page saved."
    : query.error === "invalid_json"
      ? "Content must be valid JSON."
      : query.error === "conflict"
        ? "This page changed elsewhere. Reload before saving again."
        : query.error
          ? "Page could not be saved."
          : ""

  return (
    <AdminShell
      active="pages"
      eyebrow="CMS Pages"
      title={page?.title ?? "Page editor"}
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/pages">
            <ArrowLeft className="h-4 w-4" />
            Pages
          </Link>
        </Button>
      }
    >
      {message && (
        <p className="mt-6 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
          {message}
        </p>
      )}

      {apiError || !page ? (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Page could not be loaded from the admin API.
        </p>
      ) : (
        <form action={updatePageAction} className="mt-8 grid gap-6 xl:grid-cols-[minmax(0,1fr)_280px]">
          <input name="id" type="hidden" value={page.id} />
          <input name="version" type="hidden" value={page.version} />
          <input name="publishedAt" type="hidden" value={page.publishedAt ?? ""} />

          <div className="space-y-6 rounded-lg border border-border bg-background p-5">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="title">
                Title
              </label>
              <Input id="title" name="title" required className="mt-2" defaultValue={page.title} />
            </div>

            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="content">
                Content JSON
              </label>
              <Textarea
                className="mt-2 min-h-96 font-mono text-sm"
                id="content"
                name="content"
                required
                defaultValue={JSON.stringify(page.content ?? {}, null, 2)}
              />
            </div>
          </div>

          <aside className="space-y-4 rounded-lg border border-border bg-background p-5 xl:sticky xl:top-6 xl:self-start">
            <div>
              <label className="text-sm font-medium text-foreground" htmlFor="status">
                Status
              </label>
              <select
                className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
                defaultValue={page.status}
                id="status"
                name="status"
              >
                {statusOptions.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-md bg-secondary px-3 py-2 text-sm text-muted-foreground">
              <p>Key: {page.key}</p>
              <p>Version: {page.version}</p>
            </div>

            <Button type="submit" className="w-full">
              <Save className="h-4 w-4" />
              Save
            </Button>
          </aside>
        </form>
      )}
    </AdminShell>
  )
}
