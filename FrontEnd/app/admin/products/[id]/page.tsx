import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { ContentItemForm } from "@/components/admin/resource-forms"
import { resourceMessage } from "@/components/admin/resource-toolbar"
import { Button } from "@/components/ui/button"
import { AdminApiError, adminFetch } from "@/lib/admin-api"
import type { ContentNode } from "@/lib/cms"
import { updateContentItemAction } from "../../content-actions"

export default async function AdminEditProductPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>
  searchParams: Promise<{ created?: string; saved?: string; error?: string }>
}) {
  const [{ id }, query] = await Promise.all([params, searchParams])
  let item: ContentNode | null = null
  let apiError = false
  try {
    item = await adminFetch<ContentNode>(`/products/${id}`, {}, `/admin/products/${id}`)
  } catch (error) {
    if (error instanceof AdminApiError) apiError = true
    else throw error
  }

  return (
    <AdminShell
      active="products"
      eyebrow="Catalog"
      title={item?.title ?? "Edit Product"}
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/products">
            <ArrowLeft className="h-4 w-4" />
            Products
          </Link>
        </Button>
      }
    >
      <Message text={resourceMessage(query)} />
      {apiError || !item ? (
        <Message destructive text="Product could not be loaded from the admin API." />
      ) : (
        <ContentItemForm action={updateContentItemAction} item={item} mode="edit" resource="products" />
      )}
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
