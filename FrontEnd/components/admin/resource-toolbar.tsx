import Link from "next/link"
import { Plus, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type ResourceToolbarProps = {
  addHref: string
  addLabel: string
  q: string
  status: string
}

const statusOptions = ["", "draft", "published", "scheduled", "archived"]

export function ResourceToolbar({ addHref, addLabel, q, status }: ResourceToolbarProps) {
  return (
    <div className="mt-8 flex flex-col gap-4 rounded-lg border border-border bg-background p-4 lg:flex-row lg:items-end lg:justify-between">
      <form className="flex flex-1 flex-col gap-3 md:flex-row md:items-end" method="get">
        <div className="flex-1">
          <label className="text-sm font-medium text-foreground" htmlFor="q">
            Search
          </label>
          <div className="relative mt-2">
            <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input className="pl-9" defaultValue={q} id="q" name="q" placeholder="Title or slug" />
          </div>
        </div>
        <div className="md:w-48">
          <label className="text-sm font-medium text-foreground" htmlFor="status">
            Status
          </label>
          <select
            className="mt-2 h-9 w-full rounded-md border border-input bg-transparent px-3 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
            defaultValue={status}
            id="status"
            name="status"
          >
            {statusOptions.map((option) => (
              <option key={option || "all"} value={option}>
                {option || "all"}
              </option>
            ))}
          </select>
        </div>
        <Button type="submit" variant="outline">
          <Search className="h-4 w-4" />
          Filter
        </Button>
      </form>
      <Button asChild>
        <Link href={addHref}>
          <Plus className="h-4 w-4" />
          {addLabel}
        </Link>
      </Button>
    </div>
  )
}

export function resourceMessage(query: { created?: string; saved?: string; deleted?: string; error?: string }) {
  if (query.created) return "Item created."
  if (query.saved) return "Item saved."
  if (query.deleted) return "Item archived."
  if (query.error === "conflict") return "This item changed elsewhere. Reload before trying again."
  if (query.error === "validation") return "Please check the required fields."
  if (query.error === "invalid_parent") return "Parent selection would create an invalid hierarchy."
  if (query.error) return "Request failed."
  return ""
}
