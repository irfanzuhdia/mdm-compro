import Image from "next/image"
import Link from "next/link"
import { ArrowUpRight } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { ContentNode } from "@/lib/cms"

export function ContentList({
  items,
  basePath,
  empty,
}: {
  items: ContentNode[]
  basePath: "/services" | "/products"
  empty: string
}) {
  if (items.length === 0) {
    return <p className="text-sm text-muted-foreground">{empty}</p>
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {items.map((item) => (
        <Link key={item.id} href={`${basePath}/${item.fullPath}`} className="group">
          <Card className="h-full overflow-hidden transition-shadow hover:shadow-md">
            <div className="relative aspect-[16/10] bg-secondary">
              <Image
                src={item.imageUrl || "/placeholder.jpg"}
                alt={item.title}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
              />
            </div>
            <CardHeader>
              <CardTitle className="font-display text-xl">{item.title}</CardTitle>
              <CardDescription className="line-clamp-3 leading-relaxed">{item.summary}</CardDescription>
            </CardHeader>
            <CardContent>
              <span className="inline-flex items-center gap-1.5 text-sm font-medium text-foreground">
                View detail
                <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
              </span>
            </CardContent>
          </Card>
        </Link>
      ))}
    </div>
  )
}
