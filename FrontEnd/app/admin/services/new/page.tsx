import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { ContentItemForm } from "@/components/admin/resource-forms"
import { resourceMessage } from "@/components/admin/resource-toolbar"
import { Button } from "@/components/ui/button"
import { createContentItemAction } from "../../content-actions"

export default async function AdminNewServicePage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const query = await searchParams
  return (
    <AdminShell
      active="services"
      eyebrow="Catalog"
      title="New Service"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/services">
            <ArrowLeft className="h-4 w-4" />
            Services
          </Link>
        </Button>
      }
    >
      <Message text={resourceMessage(query)} />
      <ContentItemForm action={createContentItemAction} mode="create" resource="services" />
    </AdminShell>
  )
}

function Message({ text }: { text: string }) {
  if (!text) return null
  return <p className="mt-6 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">{text}</p>
}
