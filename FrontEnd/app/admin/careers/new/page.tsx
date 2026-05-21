import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { CareerForm } from "@/components/admin/resource-forms"
import { resourceMessage } from "@/components/admin/resource-toolbar"
import { Button } from "@/components/ui/button"
import { createCareerAction } from "../../content-actions"

export default async function AdminNewCareerPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>
}) {
  const query = await searchParams
  return (
    <AdminShell
      active="careers"
      eyebrow="Hiring"
      title="New Career"
      actions={
        <Button asChild variant="outline">
          <Link href="/admin/careers">
            <ArrowLeft className="h-4 w-4" />
            Careers
          </Link>
        </Button>
      }
    >
      <Message text={resourceMessage(query)} />
      <CareerForm action={createCareerAction} mode="create" />
    </AdminShell>
  )
}

function Message({ text }: { text: string }) {
  if (!text) return null
  return <p className="mt-6 rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground">{text}</p>
}
