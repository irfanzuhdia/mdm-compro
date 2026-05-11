import Link from "next/link"
import { Zap } from "lucide-react"

const footerNav = [
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Products", href: "/products" },
      { label: "News", href: "/news" },
      { label: "Career", href: "/career" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Services",
    links: [
      { label: "Electrical Services", href: "/services" },
      { label: "Industrial Automation", href: "/services" },
      { label: "Fire Alarm Systems", href: "/services" },
    ],
  },
  {
    title: "Products",
    links: [
      { label: "Testing Equipment", href: "/products/testing-equipment" },
      { label: "Protection Relay", href: "/products/protection-relay" },
      { label: "Instrumentation", href: "/products/instrumentation" },
    ],
  },
]

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <Link href="/" className="flex items-center gap-2.5">
              <span
                aria-hidden="true"
                className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
              >
                <Zap className="h-4 w-4" strokeWidth={2.5} />
              </span>
              <span className="font-display text-base font-semibold tracking-tight text-foreground">
                PT Multi Daya Mitra
              </span>
            </Link>
            <p className="mt-5 max-w-sm text-sm leading-relaxed text-muted-foreground">
              Indonesian electrical, industrial automation, and fire alarm services
              company — delivering reliable engineering across power, oil &amp; gas,
              manufacturing, and infrastructure since 2013.
            </p>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-7">
            {footerNav.map((column) => (
              <div key={column.title}>
                <h3 className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground">
                  {column.title}
                </h3>
                <ul className="mt-4 space-y-2.5">
                  {column.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
          <p>
            &copy; {new Date().getFullYear()} PT Multi Daya Mitra. All rights reserved.
          </p>
          <p className="font-medium uppercase tracking-[0.14em]">
            Electrical · Automation · Fire System
          </p>
        </div>
      </div>
    </footer>
  )
}
