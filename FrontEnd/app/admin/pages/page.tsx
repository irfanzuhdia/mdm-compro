import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { AdminApiError, adminFetch, type AdminPagesResponse } from "@/lib/admin-api"

export default async function AdminPagesPage() {
  let pages: AdminPagesResponse | null = null
  let apiError = false

  try {
    pages = await adminFetch<AdminPagesResponse>("/pages?perPage=50", {}, "/admin/pages")
  } catch (error) {
    if (error instanceof AdminApiError) {
      apiError = true
    } else {
      throw error
    }
  }

  return (
    <AdminShell active="pages" eyebrow="CMS Pages" title="Pages">
      {apiError && (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          Pages could not be loaded from the admin API.
        </p>
      )}

      <div className="mt-8 overflow-hidden rounded-lg border border-border bg-background">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Version</TableHead>
              <TableHead className="w-24 text-right">Action</TableHead>
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
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/admin/pages/${page.id}`}>
                      Edit
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
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
