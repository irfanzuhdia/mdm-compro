"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import {
  AdminApiError,
  adminFetch,
  type PageCreatePayload,
  type PageUpdatePayload,
} from "@/lib/admin-api"
import type { PageContent } from "@/lib/cms"

function pagePayload(formData: FormData): PageCreatePayload {
  const contentText = String(formData.get("content") ?? '{"blocks":[]}')
  let content: unknown
  try {
    content = JSON.parse(contentText)
  } catch {
    throw new Error("invalid_json")
  }

  const publishedAtValue = String(formData.get("publishedAt") ?? "")
  return {
    key: String(formData.get("key") ?? ""),
    title: String(formData.get("title") ?? ""),
    content,
    status: String(formData.get("status") ?? "draft"),
    publishedAt: publishedAtValue || null,
    seo: {
      title: String(formData.get("seoTitle") ?? ""),
      description: String(formData.get("seoDescription") ?? ""),
      canonical: String(formData.get("seoCanonical") ?? ""),
      noIndex: formData.get("seoNoIndex") === "on",
    },
  }
}

function revalidatePagePaths(...keys: string[]) {
  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/contact")
  for (const key of keys) {
    if (key) {
      revalidatePath(`/${key}`)
    }
  }
  revalidatePath("/admin")
  revalidatePath("/admin/pages")
}

export async function createPageAction(formData: FormData) {
  let payload: PageCreatePayload
  try {
    payload = pagePayload(formData)
  } catch {
    redirect("/admin/pages/new?error=invalid_json")
  }

  const result = await adminFetch<PageContent>(
    "/pages",
    {
      method: "POST",
      body: JSON.stringify(payload),
    },
    "/admin/pages/new",
  )
    .then((page) => ({ ok: true as const, page }))
    .catch((error) => {
      if (error instanceof AdminApiError) {
        return { ok: false as const, error }
      }
      throw error
    })

  if (!result.ok) {
    const errorCode = result.error.code === "version_conflict" ? "conflict" : "save_failed"
    redirect(`/admin/pages/new?error=${errorCode}`)
  }

  revalidatePagePaths(result.page.key)
  redirect(`/admin/pages/${result.page.id}?created=1`)
}

export async function updatePageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const version = Number(formData.get("version") ?? 0)
  const oldKey = String(formData.get("oldKey") ?? "")

  if (!id) {
    redirect("/admin/pages?error=missing_id")
  }

  let payloadBase: PageCreatePayload
  try {
    payloadBase = pagePayload(formData)
  } catch {
    redirect(`/admin/pages/${id}?error=invalid_json`)
  }

  const payload: PageUpdatePayload = {
    ...payloadBase,
    version,
  }

  const result = await adminFetch(
    `/pages/${id}`,
    {
      method: "PUT",
      body: JSON.stringify(payload),
    },
    `/admin/pages/${id}`,
  )
    .then(() => ({ ok: true as const }))
    .catch((error) => {
      if (error instanceof AdminApiError) {
        return { ok: false as const, error }
      }
      throw error
    })

  if (!result.ok) {
    const errorCode = result.error.code === "version_conflict" ? "conflict" : "save_failed"
    redirect(`/admin/pages/${id}?error=${errorCode}`)
  }

  revalidatePagePaths(oldKey, payload.key)
  revalidatePath(`/admin/pages/${id}`)
  redirect(`/admin/pages/${id}?saved=1`)
}

export async function duplicatePageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  if (!id) {
    redirect("/admin/pages?error=missing_id")
  }

  const source = await adminFetch<PageContent>(`/pages/${id}`, {}, "/admin/pages")
  const key = uniqueCopyKey(source.key)
  const result = await adminFetch<PageContent>(
    "/pages",
    {
      method: "POST",
      body: JSON.stringify({
        key,
        title: `${source.title} Copy`,
        content: source.content,
        status: "draft",
        publishedAt: null,
        seo: source.seo ?? {},
      } satisfies PageCreatePayload),
    },
    "/admin/pages",
  )
    .then((page) => ({ ok: true as const, page }))
    .catch((error) => {
      if (error instanceof AdminApiError) {
        return { ok: false as const, error }
      }
      throw error
    })

  if (!result.ok) {
    redirect("/admin/pages?error=duplicate_failed")
  }

  revalidatePagePaths(result.page.key)
  redirect(`/admin/pages/${result.page.id}?created=1`)
}

export async function deletePageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const version = Number(formData.get("version") ?? 0)
  const key = String(formData.get("key") ?? "")
  if (!id || version < 1) {
    redirect("/admin/pages?error=missing_id")
  }

  const result = await adminFetch<null>(
    `/pages/${id}?version=${version}`,
    { method: "DELETE" },
    "/admin/pages",
  )
    .then(() => ({ ok: true as const }))
    .catch((error) => {
      if (error instanceof AdminApiError) {
        return { ok: false as const, error }
      }
      throw error
    })

  if (!result.ok) {
    const errorCode = result.error.code === "version_conflict" ? "conflict" : "delete_failed"
    redirect(`/admin/pages?error=${errorCode}`)
  }

  revalidatePagePaths(key)
  redirect("/admin/pages?deleted=1")
}

function uniqueCopyKey(key: string) {
  return `${key.replace(/-copy(?:-[a-z0-9]+)?$/, "")}-copy-${Date.now().toString(36)}`
}
