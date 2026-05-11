"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ChevronDown, Menu, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import type { Navigation } from "@/lib/cms"
import { cn } from "@/lib/utils"

const baseNav = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About Us" },
  { href: "/services", label: "Services", menu: "services" as const },
  { href: "/products", label: "Products", menu: "products" as const },
  { href: "/news", label: "News" },
  { href: "/career", label: "Careers" },
  { href: "/contact", label: "Contact Us" },
]

export function SiteHeaderClient({ navigation }: { navigation: Navigation }) {
  const [open, setOpen] = useState(false)
  const pathname = usePathname()

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname === href || pathname.startsWith(href + "/")

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/85 backdrop-blur supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2.5">
          <span
            aria-hidden="true"
            className="flex h-9 w-9 items-center justify-center rounded-md bg-primary text-primary-foreground"
          >
            <Zap className="h-4 w-4" strokeWidth={2.5} />
          </span>
          <span className="flex flex-col leading-tight">
            <span className="font-display text-sm font-semibold tracking-tight text-foreground">
              Multi Daya Mitra
            </span>
            <span className="text-[10px] font-medium uppercase tracking-[0.14em] text-muted-foreground">
              Electrical · Automation · Fire
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-1 lg:flex">
          {baseNav.map((item) => {
            const children = item.menu === "services" ? navigation.services : item.menu === "products" ? navigation.products : []
            return (
              <div key={item.href} className="group relative">
                <Link
                  href={item.href}
                  aria-current={isActive(item.href) ? "page" : undefined}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    isActive(item.href)
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground",
                  )}
                >
                  {item.label}
                  {children.length > 0 && <ChevronDown className="h-3.5 w-3.5" />}
                </Link>
                {children.length > 0 && (
                  <div className="invisible absolute left-0 top-full z-50 mt-2 w-72 rounded-md border border-border bg-popover p-2 opacity-0 shadow-lg transition group-hover:visible group-hover:opacity-100">
                    {children.map((child) => (
                      <Link
                        key={child.id}
                        href={`${item.href}/${child.fullPath}`}
                        className="block rounded-md px-3 py-2 text-sm text-popover-foreground hover:bg-secondary"
                      >
                        <span className="font-medium">{child.title}</span>
                        {child.summary && (
                          <span className="mt-1 line-clamp-2 block text-xs leading-relaxed text-muted-foreground">
                            {child.summary}
                          </span>
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </nav>

        <div className="hidden lg:flex">
          <Button asChild size="sm">
            <Link href="/contact">Request a Quote</Link>
          </Button>
        </div>

        <Sheet open={open} onOpenChange={setOpen}>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="lg:hidden" aria-label="Open menu">
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-80">
            <SheetHeader>
              <SheetTitle className="font-display">Navigation</SheetTitle>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1 px-4 pb-4">
              {baseNav.map((item) => {
                const children = item.menu === "services" ? navigation.services : item.menu === "products" ? navigation.products : []
                return (
                  <div key={item.href}>
                    <Link
                      href={item.href}
                      onClick={() => setOpen(false)}
                      aria-current={isActive(item.href) ? "page" : undefined}
                      className={cn(
                        "block rounded-md px-3 py-2.5 text-sm font-medium transition-colors",
                        isActive(item.href) ? "bg-secondary text-foreground" : "text-foreground hover:bg-secondary",
                      )}
                    >
                      {item.label}
                    </Link>
                    {children.length > 0 && (
                      <div className="mb-2 ml-3 border-l border-border pl-3">
                        {children.map((child) => (
                          <Link
                            key={child.id}
                            href={`${item.href}/${child.fullPath}`}
                            onClick={() => setOpen(false)}
                            className="block rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-secondary hover:text-foreground"
                          >
                            {child.title}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
              <Button asChild className="mt-3">
                <Link href="/contact" onClick={() => setOpen(false)}>
                  Request a Quote
                </Link>
              </Button>
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </header>
  )
}
