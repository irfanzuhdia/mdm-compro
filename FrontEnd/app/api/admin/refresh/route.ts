import { cookies } from "next/headers"
import { type NextRequest } from "next/server"
import {
  adminCookieOptions,
  adminLoginLocation,
  relativeRedirect,
  safeAdminNext,
} from "@/lib/admin-auth"

const API_BASE =
  process.env.CMS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_CMS_API_BASE_URL ??
  "http://localhost:8080/api/v1/public"

const AUTH_BASE = API_BASE.replace("/public", "/auth")

export async function GET(request: NextRequest) {
  const nextPath = safeAdminNext(request.nextUrl.searchParams.get("next"))
  const cookieStore = await cookies()
  const refreshToken = cookieStore.get("cms_refresh_token")?.value

  if (!refreshToken) {
    return relativeRedirect(adminLoginLocation(nextPath))
  }

  const response = await fetch(`${AUTH_BASE}/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refreshToken }),
    cache: "no-store",
  }).catch(() => null)

  if (!response?.ok) {
    const loginResponse = relativeRedirect(adminLoginLocation(nextPath))
    loginResponse.cookies.delete("cms_admin_token")
    loginResponse.cookies.delete("cms_refresh_token")
    return loginResponse
  }

  const payload = (await response.json()) as {
    accessToken: string
    refreshToken: string
    accessTokenExpiresAt: string
    refreshTokenExpiresAt: string
  }
  const redirectResponse = relativeRedirect(nextPath)
  redirectResponse.cookies.set(
    "cms_admin_token",
    payload.accessToken,
    adminCookieOptions(request, new Date(payload.accessTokenExpiresAt)),
  )
  redirectResponse.cookies.set(
    "cms_refresh_token",
    payload.refreshToken,
    adminCookieOptions(request, new Date(payload.refreshTokenExpiresAt)),
  )
  return redirectResponse
}
