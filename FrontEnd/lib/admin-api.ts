import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { adminLoginLocation, adminRefreshLocation } from "@/lib/admin-auth"
import type { Career, ContentNode, ListResponse, NewsItem, PageContent } from "@/lib/cms"

const API_BASE =
  process.env.CMS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_CMS_API_BASE_URL ??
  "http://localhost:8080/api/v1/public"

const ADMIN_BASE = API_BASE.replace("/public", "/admin")

export type AdminPagesResponse = ListResponse<PageContent>
export type AdminContentResponse = ListResponse<ContentNode>
export type AdminNewsResponse = ListResponse<NewsItem>
export type AdminCareersResponse = ListResponse<Career>

export type PageUpdatePayload = {
  key: string
  title: string
  content: unknown
  status: string
  publishedAt: string | null
  seo: {
    title?: string
    description?: string
    canonical?: string
    noIndex?: boolean
  }
  version: number
}

export type PageCreatePayload = Omit<PageUpdatePayload, "version">

export type ContentItemPayload = {
  slug: string
  title: string
  summary: string
  content: unknown
  imageUrl: string
  specs?: Record<string, string>
  datasheetUrl?: string
  status: string
  publishedAt: string | null
  sortOrder: number
  seo?: {
    title?: string
    description?: string
    canonical?: string
    noIndex?: boolean
  }
  version?: number
}

export type NewsPayload = {
  slug: string
  title: string
  excerpt: string
  body: unknown
  category: string
  featuredImageUrl: string
  featured: boolean
  status: string
  publishedAt: string | null
  seo?: {
    title?: string
    description?: string
    canonical?: string
    noIndex?: boolean
  }
  version?: number
}

export type CareerPayload = {
  slug: string
  title: string
  summary: string
  description: unknown
  department: string
  location: string
  employmentType: string
  applyUrl: string
  deadline: string | null
  status: string
  publishedAt: string | null
  version?: number
}

export class AdminApiError extends Error {
  constructor(
    readonly status: number,
    message: string,
    readonly code?: string,
  ) {
    super(message)
  }
}

export async function adminFetch<T>(
  path: string,
  init: RequestInit = {},
  nextPath = "/admin",
): Promise<T> {
  const cookieStore = await cookies()
  const token = cookieStore.get("cms_admin_token")?.value
  if (!token) {
    const refreshToken = cookieStore.get("cms_refresh_token")?.value
    redirect(refreshToken ? adminRefreshLocation(nextPath) : adminLoginLocation(nextPath))
  }

  const headers = new Headers(init.headers)
  headers.set("Accept", "application/json")
  headers.set("Authorization", `Bearer ${token}`)
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json")
  }

  const response = await fetch(`${ADMIN_BASE}${path}`, {
    ...init,
    headers,
    cache: init.cache ?? "no-store",
  })

  if (response.status === 401) {
    const refreshToken = cookieStore.get("cms_refresh_token")?.value
    redirect(refreshToken ? adminRefreshLocation(nextPath) : adminLoginLocation(nextPath))
  }

  if (!response.ok) {
    throw await toAdminApiError(response)
  }

  if (response.status === 204) {
    return null as T
  }

  return (await response.json()) as T
}

async function toAdminApiError(response: Response) {
  try {
    const payload = (await response.json()) as { error?: string; message?: string }
    return new AdminApiError(
      response.status,
      payload.message ?? "Admin API request failed.",
      payload.error,
    )
  } catch {
    return new AdminApiError(response.status, "Admin API request failed.")
  }
}
