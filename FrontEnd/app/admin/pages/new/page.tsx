import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { PageEditor } from "@/components/admin/page-editor"
import { Button } from "@/components/ui/button"
import { createPageAction } from "../actions"

export default async function AdminNewPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const query = await searchParams
  const message =
    query.error === "invalid_json"
      ? "Content must be valid JSON."
      : query.error === "conflict"
        ? "A page with this slug already exists."
        : query.error
          ? "Page could not be created."
          : ""

  return (
    <AdminShell
      active="pages"
      eyebrow="CMS Pages"
      title="New Page"
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

      <PageEditor action={createPageAction} mode="create" />
    </AdminShell>
  )
}
