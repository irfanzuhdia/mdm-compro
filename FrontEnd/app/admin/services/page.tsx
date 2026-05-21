import { AdminShell } from "@/components/admin-shell"
import { ResourceToolbar, resourceMessage } from "@/components/admin/resource-toolbar"
import { AdminResourceTable } from "@/components/admin/resource-table"
import { AdminApiError, adminFetch, type AdminContentResponse } from "@/lib/admin-api"
import { deleteContentItemAction } from "../content-actions"

export default async function AdminServicesPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; deleted?: string; error?: string }>
}) {
  const query = await searchParams
  const q = query.q?.trim() ?? ""
  const status = query.status?.trim() ?? ""
  const params = new URLSearchParams({ perPage: "50" })
  if (q) params.set("q", q)
  if (status) params.set("status", status)

  let response: AdminContentResponse | null = null
  let apiError = false
  try {
    response = await adminFetch<AdminContentResponse>(`/services?${params}`, {}, "/admin/services")
  } catch (error) {
    if (error instanceof AdminApiError) apiError = true
    else throw error
  }

  return (
    <AdminShell active="services" eyebrow="Catalog" title="Services">
      <Message text={resourceMessage(query)} />
      {apiError && <Message destructive text="Services could not be loaded from the admin API." />}
      <ResourceToolbar addHref="/admin/services/new" addLabel="Add Service" q={q} status={status} />
      <AdminResourceTable
        basePath="/admin/services"
        deleteAction={deleteContentItemAction}
        empty="No services found."
        publicBasePath="/services"
        resource="services"
        rows={(response?.data ?? []).map((item) => ({
          id: item.id,
          title: item.title,
          slug: item.slug,
          path: item.fullPath,
          status: item.status,
          version: item.version,
          meta: item.summary,
        }))}
      />
    </AdminShell>
  )
}

function Message({ text, destructive = false }: { text: string; destructive?: boolean }) {
  if (!text) return null
  return (
    <p className={`mt-6 rounded-md border px-3 py-2 text-sm ${destructive ? "border-destructive/30 bg-destructive/10 text-destructive" : "border-border bg-background text-foreground"}`}>
      {text}
    </p>
  )
}
