"use server"

import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { AdminApiError, adminFetch, type PageUpdatePayload } from "@/lib/admin-api"

export async function updatePageAction(formData: FormData) {
  const id = String(formData.get("id") ?? "")
  const version = Number(formData.get("version") ?? 0)
  const contentText = String(formData.get("content") ?? "{}")

  if (!id) {
    redirect("/admin/pages?error=missing_id")
  }

  let content: unknown
  try {
    content = JSON.parse(contentText)
  } catch {
    redirect(`/admin/pages/${id}?error=invalid_json`)
  }

  const publishedAtValue = String(formData.get("publishedAt") ?? "")
  const payload: PageUpdatePayload = {
    title: String(formData.get("title") ?? ""),
    content,
    status: String(formData.get("status") ?? "draft"),
    publishedAt: publishedAtValue || null,
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

  revalidatePath("/")
  revalidatePath("/about")
  revalidatePath("/contact")
  revalidatePath("/admin")
  revalidatePath("/admin/pages")
  revalidatePath(`/admin/pages/${id}`)
  redirect(`/admin/pages/${id}?saved=1`)
}
