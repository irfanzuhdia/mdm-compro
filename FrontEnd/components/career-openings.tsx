"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import { ArrowUpRight, Briefcase, CalendarDays, MapPin } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import type { Career } from "@/lib/cms"
import { employmentTypeLabel, fallbackCareers, formatDate } from "@/lib/cms"
import { cn } from "@/lib/utils"

export function CareerOpenings({ jobs = fallbackCareers.data }: { jobs?: Career[] }) {
  const departments = useMemo(
    () => ["All", ...Array.from(new Set(jobs.map((job) => job.department)))],
    [jobs],
  )
  const [active, setActive] = useState("All")

  const filtered = useMemo(() => {
    if (active === "All") return jobs
    return jobs.filter((j) => j.department === active)
  }, [active, jobs])

  return (
    <section className="border-b border-border/60 bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
              Open positions
            </p>
            <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-foreground text-balance sm:text-4xl">
              Find your next role.
            </h2>
          </div>
          <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
            We&apos;re hiring across engineering, operations, and project management. Filter by department to
            explore the roles that fit you best.
          </p>
        </div>

        {/* Department filter */}
        <div className="mt-10 flex flex-wrap gap-2">
          {departments.map((dept) => (
            <button
              key={dept}
              type="button"
              onClick={() => setActive(dept)}
              className={cn(
                "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                active === dept
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border bg-card text-muted-foreground hover:border-foreground/30 hover:text-foreground",
              )}
            >
              {dept}
                  {dept !== "All" && (
                    <span className="ml-1.5 text-xs opacity-70">
                  {jobs.filter((j) => j.department === dept).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Jobs list */}
        <ul className="mt-8 divide-y divide-border overflow-hidden rounded-xl border border-border bg-card">
          {filtered.length === 0 ? (
            <li className="p-8 text-center text-sm text-muted-foreground">
              No open roles in this department right now. Check back soon or send us your CV.
            </li>
          ) : (
            filtered.map((job) => (
              <li key={job.slug} className="group">
                <Link
                  href={`/career/${job.slug}`}
                  className="grid gap-4 p-5 transition-colors hover:bg-secondary/50 sm:p-6 lg:grid-cols-12 lg:items-center lg:gap-6"
                >
                  <div className="lg:col-span-5">
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge variant="outline">{job.department}</Badge>
                      <Badge variant="secondary" className="bg-accent/25 text-foreground hover:bg-accent/25">
                        {employmentTypeLabel(job.employmentType)}
                      </Badge>
                    </div>
                    <h3 className="mt-2 font-display text-lg font-semibold leading-snug text-foreground">
                      {job.title}
                    </h3>
                    <p className="mt-1 line-clamp-2 text-sm leading-relaxed text-muted-foreground">
                      {job.summary}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground sm:grid-cols-3 lg:col-span-6 lg:grid-cols-3">
                    <div className="flex items-start gap-2">
                      <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                          Location
                        </p>
                        <p className="font-medium text-foreground">{job.location}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <Briefcase className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                          Type
                        </p>
                        <p className="font-medium text-foreground">{employmentTypeLabel(job.employmentType)}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <CalendarDays className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/70" />
                      <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.14em] text-muted-foreground/80">
                          Deadline
                        </p>
                        <p className="font-medium text-foreground">{formatDate(job.deadline ?? job.publishedAt)}</p>
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-start lg:col-span-1 lg:justify-end">
                    <Button
                      asChild
                      variant="outline"
                      size="sm"
                      className="pointer-events-none w-fit"
                      tabIndex={-1}
                    >
                      <span>
                        Apply
                        <ArrowUpRight className="ml-1 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </span>
                    </Button>
                  </div>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </section>
  )
}
