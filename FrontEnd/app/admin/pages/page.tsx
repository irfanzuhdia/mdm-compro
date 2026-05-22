import Link from "next/link"
import { Archive, Copy, Edit3, Plus, Search } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminApiError, adminFetch, type AdminPagesResponse } from "@/lib/admin-api"
import { deletePageAction, duplicatePageAction } from "./actions"

const statusOptions = ["", "draft", "published", "scheduled", "archived"]

export default async function AdminPagesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; deleted?: string; error?: string }>
}) {
  const query = await searchParams
  const q = query.q?.trim() ?? ""
  const status = query.status?.trim() ?? ""
  let pages: AdminPagesResponse | null = null
  let apiError = false

  try {
    const params = new URLSearchParams({ perPage: "50" })
    if (q) params.set("q", q)
    if (status) params.set("status", status)
    pages = await adminFetch<AdminPagesResponse>(`/pages?${params}`, {}, "/admin/pages")
  } catch (error) {
    if (error instanceof AdminApiError) {
      apiError = true
    } else {
      throw error
    }
  }

  const message = query.deleted
    ? "Page archived."
    : query.error === "conflict"
      ? "This page changed elsewhere. Reload before trying again."
      : query.error === "duplicate_failed"
        ? "Page could not be duplicated."
        : query.error === "delete_failed"
          ? "Page could not be archived."
          : query.error
            ? "Pages request failed."
            : ""

  return (
    <AdminShell
      active="pages"
      eyebrow="CMS Pages"
      title="Pages"
      actions={
        <Button asChild>
          <Link href="/admin/pages/new">
            <Plus className="h-4 w-4" />
            Add New
          </Link>
        </Button>
      }
    >
      {message && (
        <p className="mt-6 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">
          {message}
        </p>
      )}

      {apiError && (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Pages could not be loaded from the admin API.
        </p>
      )}

      <form className="mt-8 flex flex-col gap-3 rounded-lg border border-border bg-background p-4 md:flex-row md:items-end" method="get">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground" htmlFor="q">
            Search
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" defaultValue={q} id="q" name="q" placeholder="Title or slug" />
          </div>
        </div>
        <div className="md:w-48">
          <label className="text-sm font-medium text-foreground" htmlFor="status">
            Status
          </label>
          <select
            className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={status}
            id="status"
            name="status"
          >
            {statusOptions.map((option) => (
              <option key={option || "all"} value={option}>
                {option || "all"}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
          Filter
        </Button>
      </form>

      <div className="mt-8 overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Path</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="w-56 text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(pages?.data ?? []).map((page) => (
              <TableRow key={page.id}>
                <TableCell className="font-medium">{page.title}</TableCell>
                <TableCell className="text-muted-foreground">{page.key}</TableCell>
                <TableCell>
                  <Badge variant={page.status === "published" ? "default" : "outline"}>
                    {page.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{page.version}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`/admin/pages/${page.id}`}>
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <form action={duplicatePageAction}>
                      <input name="id" type="hidden" value={page.id} />
                      <Button size="sm" type="submit" variant="outline">
                        <Copy className="h-4 w-4" />
                        Copy
                      </Button>
                    </form>
                    <form action={deletePageAction}>
                      <input name="id" type="hidden" value={page.id} />
                      <input name="version" type="hidden" value={page.version} />
                      <input name="key" type="hidden" value={page.key} />
                      <Button size="sm" type="submit" variant="ghost">
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {!apiError && (pages?.data ?? []).length === 0 && (
              <TableRow>
                <TableCell className="py-8 text-center text-muted-foreground" colSpan={5}>
                  No pages found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminShell>
  )
}
