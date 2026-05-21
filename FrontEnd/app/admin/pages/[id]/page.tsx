import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { PageEditor } from "@/components/admin/page-editor"
import { Button } from "@/components/ui/button"
import { AdminApiError, adminFetch } from "@/lib/admin-api"
import type { PageContent } from "@/lib/cms"
import { updatePageAction } from "../actions"

export default async function AdminEditPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string; saved?: string; error?: string }>
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

  const message = query.created
    ? "Page created."
    : query.saved
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
        <PageEditor action={updatePageAction} mode="edit" page={page} />
      )}
    </AdminShell>
  )
}
