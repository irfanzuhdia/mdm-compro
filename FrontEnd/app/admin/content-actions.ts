"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  AdminApiError,
  adminFetch,
  type CareerPayload,
  type ContentItemPayload,
  type NewsPayload,
} from "@/lib/admin-api"
import type { Career, ContentNode, NewsItem } from "@/lib/cms"
import { blocksFromText, slugify, specsFromText, toIsoDateTime } from "@/lib/admin-content"

type Resource = "services" | "products" | "news" | "careers"

const resourceConfig: Record<Resource, { adminPath: string; publicPath: string }> = {
  services: { adminPath: "/admin/services", publicPath: "/services" },
  products: { adminPath: "/admin/products", publicPath: "/products" },
  news: { adminPath: "/admin/news", publicPath: "/news" },
  careers: { adminPath: "/admin/careers", publicPath: "/career" },
}

export async function createContentItemAction(formData: FormData) {
  const resource = resourceFromForm(formData)
  const payload = contentPayload(formData)
  const path = resourceConfig[resource].adminPath

  const result = await adminFetch<ContentNode>(
    `/${resource}`,
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    `${path}/new`,
  )
    .then((item) => ({ ok: true as const, item }))
    .catch(toActionError)

  if (!result.ok) redirect(`${path}/new?error=${errorCode(result.error)}`)
  revalidateResource(resource, result.item.fullPath || result.item.slug)
  redirect(`${path}/${result.item.id}?created=1`)
}

export async function updateContentItemAction(formData: FormData) {
  const resource = resourceFromForm(formData)
  const path = resourceConfig[resource].adminPath
  const id = String(formData.get("id") ?? "")
  const oldPath = String(formData.get("oldPath") ?? "")
  if (!id) redirect(`${path}?error=missing_id`)

  const payload = {
    ...contentPayload(formData),
    version: Number(formData.get("version") ?? 0),
  } satisfies ContentItemPayload

  const result = await adminFetch<ContentNode>(
    `/${resource}/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    `${path}/${id}`,
  )
    .then((item) => ({ ok: true as const, item }))
    .catch(toActionError)

  if (!result.ok) redirect(`${path}/${id}?error=${errorCode(result.error)}`)
  revalidateResource(resource, oldPath, result.item.fullPath || result.item.slug)
  redirect(`${path}/${id}?saved=1`)
}

export async function deleteContentItemAction(formData: FormData) {
  const resource = resourceFromForm(formData)
  const path = resourceConfig[resource].adminPath
  const id = String(formData.get("id") ?? "")
  const version = Number(formData.get("version") ?? 0)
  const oldPath = String(formData.get("oldPath") ?? "")
  if (!id || version < 1) redirect(`${path}?error=missing_id`)

  const result = await adminFetch<null>(
    `/${resource}/${id}?version=${version}`,
    { method: "DELETE" },
    path,
  )
    .then(() => ({ ok: true as const }))
    .catch(toActionError)

  if (!result.ok) redirect(`${path}?error=${errorCode(result.error)}`)
  revalidateResource(resource, oldPath)
  redirect(`${path}?deleted=1`)
}

export async function createNewsAction(formData: FormData) {
  const payload = newsPayload(formData)
  const result = await adminFetch<NewsItem>(
    "/news",
    { method: "POST", body: JSON.stringify(payload) },
    "/admin/news/new",
  )
    .then((item) => ({ ok: true as const, item }))
    .catch(toActionError)

  if (!result.ok) redirect(`/admin/news/new?error=${errorCode(result.error)}`)
  revalidateResource("news", result.item.slug)
  redirect(`/admin/news/${result.item.id}?created=1`)
}

export async function updateNewsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const oldSlug = String(formData.get("oldSlug") ?? "")
  if (!id) redirect("/admin/news?error=missing_id")

  const payload = {
    ...newsPayload(formData),
    version: Number(formData.get("version") ?? 0),
  } satisfies NewsPayload
  const result = await adminFetch<NewsItem>(
    `/news/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    `/admin/news/${id}`,
  )
    .then((item) => ({ ok: true as const, item }))
    .catch(toActionError)

  if (!result.ok) redirect(`/admin/news/${id}?error=${errorCode(result.error)}`)
  revalidateResource("news", oldSlug, result.item.slug)
  redirect(`/admin/news/${id}?saved=1`)
}

export async function deleteNewsAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const version = Number(formData.get("version") ?? 0)
  const oldSlug = String(formData.get("oldSlug") ?? "")
  if (!id || version < 1) redirect("/admin/news?error=missing_id")

  const result = await adminFetch<null>(
    `/news/${id}?version=${version}`,
    { method: "DELETE" },
    "/admin/news",
  )
    .then(() => ({ ok: true as const }))
    .catch(toActionError)

  if (!result.ok) redirect(`/admin/news?error=${errorCode(result.error)}`)
  revalidateResource("news", oldSlug)
  redirect("/admin/news?deleted=1")
}

export async function createCareerAction(formData: FormData) {
  const payload = careerPayload(formData)
  const result = await adminFetch<Career>(
    "/careers",
    { method: "POST", body: JSON.stringify(payload) },
    "/admin/careers/new",
  )
    .then((item) => ({ ok: true as const, item }))
    .catch(toActionError)

  if (!result.ok) redirect(`/admin/careers/new?error=${errorCode(result.error)}`)
  revalidateResource("careers", result.item.slug)
  redirect(`/admin/careers/${result.item.id}?created=1`)
}

export async function updateCareerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const oldSlug = String(formData.get("oldSlug") ?? "")
  if (!id) redirect("/admin/careers?error=missing_id")

  const payload = {
    ...careerPayload(formData),
    version: Number(formData.get("version") ?? 0),
  } satisfies CareerPayload
  const result = await adminFetch<Career>(
    `/careers/${id}`,
    { method: "PUT", body: JSON.stringify(payload) },
    `/admin/careers/${id}`,
  )
    .then((item) => ({ ok: true as const, item }))
    .catch(toActionError)

  if (!result.ok) redirect(`/admin/careers/${id}?error=${errorCode(result.error)}`)
  revalidateResource("careers", oldSlug, result.item.slug)
  redirect(`/admin/careers/${id}?saved=1`)
}

export async function deleteCareerAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const version = Number(formData.get("version") ?? 0)
  const oldSlug = String(formData.get("oldSlug") ?? "")
  if (!id || version < 1) redirect("/admin/careers?error=missing_id")

  const result = await adminFetch<null>(
    `/careers/${id}?version=${version}`,
    { method: "DELETE" },
    "/admin/careers",
  )
    .then(() => ({ ok: true as const }))
    .catch(toActionError)

  if (!result.ok) redirect(`/admin/careers?error=${errorCode(result.error)}`)
  revalidateResource("careers", oldSlug)
  redirect("/admin/careers?deleted=1")
}

function contentPayload(formData: FormData): ContentItemPayload {
  const parentId = String(formData.get("parentId") ?? "").trim()
  return {
    parentId: parentId || null,
    slug: slugify(String(formData.get("slug") ?? "")),
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    content: blocksFromText(String(formData.get("contentText") ?? "")),
    imageUrl: String(formData.get("imageUrl") ?? ""),
    specs: specsFromText(String(formData.get("specsText") ?? "")),
    datasheetUrl: String(formData.get("datasheetUrl") ?? ""),
    status: String(formData.get("status") ?? "draft"),
    publishedAt: toIsoDateTime(formData.get("publishedAt")),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    seo: seoPayload(formData),
  }
}

function newsPayload(formData: FormData): NewsPayload {
  return {
    slug: slugify(String(formData.get("slug") ?? "")),
    title: String(formData.get("title") ?? ""),
    excerpt: String(formData.get("excerpt") ?? ""),
    body: blocksFromText(String(formData.get("bodyText") ?? "")),
    category: String(formData.get("category") ?? ""),
    tags: tagsFromText(String(formData.get("tagsText") ?? "")),
    featuredImageUrl: String(formData.get("featuredImageUrl") ?? ""),
    featured: formData.get("featured") === "on",
    status: String(formData.get("status") ?? "draft"),
    publishedAt: toIsoDateTime(formData.get("publishedAt")),
    seo: seoPayload(formData),
  }
}

function tagsFromText(value: string) {
  return value
    .split(/[,\n]/)
    .map((tag) => tag.trim())
    .filter(Boolean)
}

function careerPayload(formData: FormData): CareerPayload {
  return {
    slug: slugify(String(formData.get("slug") ?? "")),
    title: String(formData.get("title") ?? ""),
    summary: String(formData.get("summary") ?? ""),
    description: blocksFromText(String(formData.get("descriptionText") ?? "")),
    department: String(formData.get("department") ?? ""),
    location: String(formData.get("location") ?? ""),
    employmentType: String(formData.get("employmentType") ?? "full_time"),
    applyUrl: String(formData.get("applyUrl") ?? ""),
    deadline: toIsoDateTime(formData.get("deadline")),
    status: String(formData.get("status") ?? "draft"),
    publishedAt: toIsoDateTime(formData.get("publishedAt")),
  }
}

function seoPayload(formData: FormData) {
  return {
    title: String(formData.get("seoTitle") ?? ""),
    description: String(formData.get("seoDescription") ?? ""),
    canonical: String(formData.get("seoCanonical") ?? ""),
    noIndex: formData.get("seoNoIndex") === "on",
  }
}

function resourceFromForm(formData: FormData): "services" | "products" {
  return formData.get("resource") === "products" ? "products" : "services"
}

function revalidateResource(resource: Resource, ...slugs: string[]) {
  const { adminPath, publicPath } = resourceConfig[resource]
  revalidatePath("/")
  revalidatePath(adminPath)
  revalidatePath(publicPath)
  for (const slug of slugs) {
    if (slug) {
      revalidatePath(`${publicPath}/${slug}`)
    }
  }
}

function toActionError(error: unknown) {
  if (error instanceof AdminApiError) {
    return { ok: false as const, error }
  }
  throw error
}

function errorCode(error: AdminApiError) {
  if (error.code === "version_conflict") return "conflict"
  if (error.code === "validation_error") return "validation"
  if (error.code === "invalid_parent") return "invalid_parent"
  return "save_failed"
}
