import { cookies } from "next/headers"
import { FileText, ImageIcon, Newspaper, Package, Settings, Users } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

const API_BASE =
  process.env.CMS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_CMS_API_BASE_URL ??
  "http://localhost:8080/api/v1/public"

const ADMIN_BASE = API_BASE.replace("/public", "/admin")

const modules = [
  { label: "Users", key: "users", icon: Users },
  { label: "Pages", key: "pages", icon: FileText },
  { label: "Services", key: "services", icon: FileText },
  { label: "Products", key: "products", icon: Package },
  { label: "News", key: "news", icon: Newspaper },
  { label: "Careers", key: "careers", icon: FileText },
  { label: "Media", key: "media", icon: ImageIcon },
  { label: "Contacts", key: "contacts", icon: FileText },
  { label: "Settings", key: "settings", icon: Settings },
]

export default async function AdminPage() {
  const cookieStore = await cookies()
  const token = cookieStore.get("cms_admin_token")?.value
  const dashboard = token
    ? await fetch(`${ADMIN_BASE}/dashboard`, {
        headers: { Authorization: `Bearer ${token}` },
        cache: "no-store",
      })
        .then((res) => (res.ok ? res.json() : null))
        .catch(() => null)
    : null
  const counts = (dashboard?.counts ?? {}) as Record<string, number>

  return (
    <main className="min-h-screen bg-secondary/30">
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              CMS Dashboard
            </p>
            <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
              Content operations
            </h1>
          </div>
          <form action="/api/admin/logout" method="post">
            <Button type="submit" variant="outline">
              Sign Out
            </Button>
          </form>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((module) => {
            const Icon = module.icon
            return (
              <Card key={module.key} className="rounded-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                  <CardTitle className="font-display text-lg">{module.label}</CardTitle>
                  <Icon className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <p className="font-display text-3xl font-semibold text-foreground">
                    {counts[module.key] ?? 0}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    API contract ready at <code>/api/v1/admin/{module.key}</code>
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </main>
  )
}
