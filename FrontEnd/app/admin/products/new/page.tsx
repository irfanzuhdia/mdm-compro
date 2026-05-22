import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { ContentItemForm } from "@/components/admin/resource-forms"
import { resourceMessage } from "@/components/admin/resource-toolbar"
import { Button } from "@/components/ui/button"
import { AdminApiError, adminFetch, type AdminContentResponse } from "@/lib/admin-api"
import type { ContentNode } from "@/lib/cms"
import { createContentItemAction } from "../../content-actions"

export default async function AdminNewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const query = await searchParams
  let parentOptions: ContentNode[] = []
  let apiError = false
  try {
    parentOptions = (await adminFetch<AdminContentResponse>("/products?perPage=100", {}, "/admin/products/new")).data
  } catch (error) {
    if (error instanceof AdminApiError) apiError = true
    else throw error
  }
  return (
    <AdminShell
      active="products"
      eyebrow="Catalog"
      title="New Product"
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
      {apiError && <Message text="Parent options could not be loaded. You can still create a root product." />}
      <ContentItemForm
        action={createContentItemAction}
        mode="create"
        parentOptions={parentOptions}
        resource="products"
      />
    </AdminShell>
  )
}

function Message({ text }: { text: string }) {
  if (!text) return null
  return <p className="mt-6 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">{text}</p>
}
