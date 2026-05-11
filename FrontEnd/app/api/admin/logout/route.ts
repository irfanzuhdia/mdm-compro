import { cookies } from "next/headers"
import { relativeRedirect } from "@/lib/admin-auth"

const API_BASE =
  process.env.CMS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_CMS_API_BASE_URL ??
  "http://localhost:8080/api/v1/public"

const AUTH_BASE = API_BASE.replace("/public", "/auth")

export async function POST() {
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("cms_refresh_token")?.value
  if (refreshToken) {
    await fetch(`${AUTH_BASE}/logout`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken }),
      cache: "no-store",
    }).catch(() => null)
  }
  cookieStore.delete("cms_admin_token")
  cookieStore.delete("cms_refresh_token")
  return relativeRedirect("/admin/login")
}
