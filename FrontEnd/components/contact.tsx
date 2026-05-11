"use client"

import Link from "next/link"
import { ArrowRight, Globe, Mail, MapPin, Phone } from "lucide-react"
import type { FormEvent } from "react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

const channels = [
  {
    icon: MapPin,
    title: "Head Office",
    body: "East Java, Indonesia",
    href: null,
  },
  {
    icon: Phone,
    title: "Phone",
    body: "+62 (0) Contact for details",
    href: null,
  },
  {
    icon: Mail,
    title: "Email",
    body: "info@multidayamitra.co.id",
    href: "mailto:info@multidayamitra.co.id",
  },
  {
    icon: Globe,
    title: "Website",
    body: "multidayamitra.co.id",
    href: "https://multidayamitra.co.id",
  },
]

export function Contact() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle")

  async function submitContact(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setStatus("submitting")
    const form = new FormData(event.currentTarget)
    const apiBase =
      process.env.NEXT_PUBLIC_CMS_API_BASE_URL ?? "http://localhost:8080/api/v1/public"

    const response = await fetch(`${apiBase}/contacts`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        phone: form.get("phone"),
        company: form.get("company"),
        subject: form.get("subject"),
        message: form.get("message"),
      }),
    }).catch(() => null)

    if (response?.ok) {
      event.currentTarget.reset()
      setStatus("success")
      return
    }
    setStatus("error")
  }

  return (
    <section className="bg-secondary/40">
      <div className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-sm">
          <div className="grid gap-0 lg:grid-cols-12">
            <div className="relative bg-primary p-8 text-primary-foreground sm:p-10 lg:col-span-5">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-accent">
                Let&apos;s talk
              </p>
              <h2 className="mt-3 font-display text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
                Plan your next electrical or automation project with us.
              </h2>
              <p className="mt-4 text-sm leading-relaxed text-primary-foreground/80">
                Tell us about your facility and the outcomes you&apos;re after — our
                engineers will get back with a tailored scope, approach, and quote.
              </p>

              <Button
                asChild
                size="lg"
                className="mt-8 bg-accent text-accent-foreground hover:bg-accent/90"
              >
                <Link href="mailto:info@multidayamitra.co.id">
                  Email our team
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>

              <div
                aria-hidden="true"
                className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-accent/15 blur-3xl"
              />
            </div>

            <div className="grid grid-cols-1 gap-px bg-border sm:grid-cols-2 lg:col-span-7">
              {channels.map((channel) => {
                const Icon = channel.icon
                const content = (
                  <>
                    <span className="flex h-10 w-10 items-center justify-center rounded-md bg-secondary text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="mt-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                        {channel.title}
                      </p>
                      <p className="mt-1.5 font-display text-base font-medium text-foreground">
                        {channel.body}
                      </p>
                    </div>
                  </>
                )

                return channel.href ? (
                  <Link
                    key={channel.title}
                    href={channel.href}
                    className="flex flex-col bg-card p-7 transition-colors hover:bg-secondary/40"
                  >
                    {content}
                  </Link>
                ) : (
                  <div
                    key={channel.title}
                    className="flex flex-col bg-card p-7"
                  >
                    {content}
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        <form
          onSubmit={submitContact}
          className="mt-8 grid gap-4 rounded-xl border border-border bg-card p-5 shadow-sm md:grid-cols-2"
        >
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="name">
              Name
            </label>
            <Input id="name" name="name" required className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="email">
              Email
            </label>
            <Input id="email" name="email" type="email" required className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="phone">
              Phone
            </label>
            <Input id="phone" name="phone" className="mt-2" />
          </div>
          <div>
            <label className="text-sm font-medium text-foreground" htmlFor="company">
              Company
            </label>
            <Input id="company" name="company" className="mt-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="subject">
              Subject
            </label>
            <Input id="subject" name="subject" required className="mt-2" />
          </div>
          <div className="md:col-span-2">
            <label className="text-sm font-medium text-foreground" htmlFor="message">
              Message
            </label>
            <Textarea id="message" name="message" required className="mt-2 min-h-32" />
          </div>
          <div className="flex flex-col gap-3 md:col-span-2 md:flex-row md:items-center">
            <Button type="submit" disabled={status === "submitting"}>
              {status === "submitting" ? "Sending..." : "Send Inquiry"}
            </Button>
            {status === "success" && (
              <p className="text-sm text-muted-foreground">Your inquiry has been sent.</p>
            )}
            {status === "error" && (
              <p className="text-sm text-destructive">Unable to send right now. Please email us directly.</p>
            )}
          </div>
        </form>
      </div>
    </section>
  )
}
