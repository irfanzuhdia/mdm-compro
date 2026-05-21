import Link from "next/link"
import type { ReactNode } from "react"
import { FileText, Home, Inbox, Newspaper, Package, Settings, Users, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  { label: "Dashboard", href: "/admin", key: "dashboard", icon: Home },
  { label: "Pages", href: "/admin/pages", key: "pages", icon: FileText },
  { label: "Services", href: "/admin/services", key: "services", icon: FileText },
  { label: "Products", href: "/admin/products", key: "products", icon: Package },
  { label: "News", href: "/admin/news", key: "news", icon: Newspaper },
  { label: "Careers", href: "/admin/careers", key: "careers", icon: Users },
  { label: "Contacts", href: "/admin", key: "contacts", icon: Inbox, disabled: true },
  { label: "Users", href: "/admin", key: "users", icon: Users, disabled: true },
  { label: "Settings", href: "/admin", key: "settings", icon: Settings, disabled: true },
]

type AdminShellProps = {
  active: string
  eyebrow: string
  title: string
  children: ReactNode
  actions?: ReactNode
}

export function AdminShell({ active, eyebrow, title, actions, children }: AdminShellProps) {
  return (
    <main className="min-h-screen bg-secondary/30">
      <div className="mx-auto flex min-h-screen max-w-7xl flex-col lg:flex-row">
        <aside className="border-b border-border bg-background px-4 py-4 lg:w-64 lg:border-b-0 lg:border-r lg:px-5 lg:py-6">
          <Link href="/admin" className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Zap className="h-4 w-4" />
            </span>
            <span>
              <span className="block font-display text-base font-semibold text-foreground">MDM CMS</span>
              <span className="block text-xs text-muted-foreground">Content operations</span>
            </span>
          </Link>

          <nav className="mt-5 flex gap-1 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible lg:pb-0">
            {navItems.map((item) => {
              const Icon = item.icon
              const current = active === item.key
              return (
                <Link
                  aria-disabled={item.disabled}
                  className={cn(
                    "flex h-9 shrink-0 items-center gap-2 rounded-md px-3 text-sm font-medium text-muted-foreground transition-colors",
                    current && "bg-secondary text-foreground",
                    item.disabled ? "pointer-events-none opacity-45" : "hover:bg-secondary hover:text-foreground",
                  )}
                  href={item.href}
                  key={item.key}
                >
                  <Icon className="h-4 w-4" />
                  {item.label}
                </Link>
              )
            })}
          </nav>

          <form action="/api/admin/logout" method="post" className="mt-5 hidden lg:block">
            <Button type="submit" variant="outline" className="w-full">
              Sign Out
            </Button>
          </form>
        </aside>

        <section className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-4 border-b border-border pb-6 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                {eyebrow}
              </p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-2">
              {actions}
              <form action="/api/admin/logout" method="post" className="lg:hidden">
                <Button type="submit" variant="outline">
                  Sign Out
                </Button>
              </form>
            </div>
          </div>

          {children}
        </section>
      </div>
    </main>
  )
}
