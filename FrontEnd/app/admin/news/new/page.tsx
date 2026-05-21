import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { NewsForm } from "@/components/admin/resource-forms"
import { resourceMessage } from "@/components/admin/resource-toolbar"
import { Button } from "@/components/ui/button"
import { createNewsAction } from "../../content-actions"

export default async function AdminNewNewsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const query = await searchParams
  return (
    <AdminShell
      active="news"
      eyebrow="Editorial"
      title="New News"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/news">
            <ArrowLeft className="h-4 w-4" />
            News
          </Link>
        </Button>
      }
    >
      <Message text={resourceMessage(query)} />
      <NewsForm action={createNewsAction} mode="create" />
    </AdminShell>
  )
}

function Message({ text }: { text: string }) {
  if (!text) return null
  return <p className="mt-6 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">{text}</p>
}
