import Link from "next/link"
import { FileText, ImageIcon, Newspaper, Package, Settings, Users } from "lucide-react"
import { AdminShell } from "@/components/admin-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AdminApiError, adminFetch } from "@/lib/admin-api"

const modules = [
  { label: "Pages", key: "pages", icon: FileText, href: "/admin/pages", status: "Live" },
  { label: "Services", key: "services", icon: FileText, status: "Reserved" },
  { label: "Products", key: "products", icon: Package, status: "Reserved" },
  { label: "News", key: "news", icon: Newspaper, status: "Reserved" },
  { label: "Careers", key: "careers", icon: FileText, status: "Reserved" },
  { label: "Media", key: "media", icon: ImageIcon, status: "Reserved" },
  { label: "Contacts", key: "contacts", icon: FileText, status: "Read only" },
  { label: "Users", key: "users", icon: Users, status: "Reserved" },
  { label: "Settings", key: "settings", icon: Settings, status: "Reserved" },
]

export default async function AdminPage() {
  let dashboard: { counts?: Record<string, number> } | null = null
  let apiError = false
  try {
    dashboard = await adminFetch<{ counts?: Record<string, number> }>("/dashboard")
  } catch (error) {
    if (error instanceof AdminApiError) {
      apiError = true
    } else {
      throw error
    }
  }
  const counts = (dashboard?.counts ?? {}) as Record<string, number>

  return (
    <AdminShell active="dashboard" eyebrow="CMS Dashboard" title="Content operations">
      {apiError && (
        <p className="mt-6 rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
          The admin API is unavailable.
        </p>
      )}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map((module) => {
          const Icon = module.icon
          const card = (
            <Card className="h-full rounded-lg transition-shadow hover:shadow-sm">
              <CardHeader className="flex flex-row items-center justify-between">
                <div className="min-w-0">
                  <CardTitle className="font-display text-lg">{module.label}</CardTitle>
                  <Badge variant={module.status === "Live" ? "default" : "outline"} className="mt-2">
                    {module.status}
                  </Badge>
                </div>
                <Icon className="h-5 w-5 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <p className="font-display text-3xl font-semibold text-foreground">
                  {counts[module.key] ?? 0}
                </p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {module.href ? "Manage records" : "API contract reserved"}
                </p>
              </CardContent>
            </Card>
          )

          if (module.href) {
            return (
              <Link key={module.key} href={module.href} className="block">
                {card}
              </Link>
            )
          }

          return (
            <div key={module.key} className="opacity-75">
              {card}
            </div>
          )
        })}
      </div>
    </AdminShell>
  )
}
