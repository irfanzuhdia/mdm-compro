import Link from "next/link"
import { Archive, Edit3, ExternalLink } from "lucide-react"
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

type Action = (formData: FormData) => void | Promise<void>

export type AdminResourceRow = {
  id: string
  title: string
  slug: string
  path?: string
  status: string
  version?: number
  meta?: string
}

type AdminResourceTableProps = {
  basePath: string
  deleteAction: Action
  empty: string
  publicBasePath: string
  resource?: "services" | "products"
  rows: AdminResourceRow[]
}

export function AdminResourceTable({
  basePath,
  deleteAction,
  empty,
  publicBasePath,
  resource,
  rows,
}: AdminResourceTableProps) {
  return (
    <div className="mt-8 overflow-hidden rounded-lg border border-border bg-background">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Slug</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Info</TableHead>
            <TableHead className="w-60 text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => {
            const path = row.path || row.slug
            return (
              <TableRow key={row.id}>
                <TableCell className="font-medium">{row.title}</TableCell>
                <TableCell className="text-muted-foreground">{path}</TableCell>
                <TableCell>
                  <Badge variant={row.status === "published" ? "default" : "outline"}>
                    {row.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-muted-foreground">{row.meta ?? "-"}</TableCell>
                <TableCell>
                  <div className="flex justify-end gap-2">
                    <Button asChild size="sm" variant="outline">
                      <Link href={`${basePath}/${row.id}`}>
                        <Edit3 className="h-4 w-4" />
                        Edit
                      </Link>
                    </Button>
                    <Button asChild size="sm" variant="outline">
                      <Link href={`${publicBasePath}/${path}`} rel="noreferrer" target="_blank">
                        <ExternalLink className="h-4 w-4" />
                        View
                      </Link>
                    </Button>
                    <form action={deleteAction}>
                      {resource && <input name="resource" type="hidden" value={resource} />}
                      <input name="id" type="hidden" value={row.id} />
                      <input name="version" type="hidden" value={row.version ?? 0} />
                      <input name={resource ? "oldPath" : "oldSlug"} type="hidden" value={path} />
                      <Button size="sm" type="submit" variant="ghost">
                        <Archive className="h-4 w-4" />
                        Archive
                      </Button>
                    </form>
                  </div>
                </TableCell>
              </TableRow>
            )
          })}
          {rows.length === 0 && (
            <TableRow>
              <TableCell className="py-8 text-center text-muted-foreground" colSpan={5}>
                {empty}
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
