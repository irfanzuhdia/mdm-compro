import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

const API_BASE =
  process.env.CMS_API_BASE_URL ??
  process.env.NEXT_PUBLIC_CMS_API_BASE_URL ??
  "http://localhost:8080/api/v1/public"

const AUTH_BASE = API_BASE.replace("/public", "/auth")

export async function POST(request: NextRequest) {
  const form = await request.formData()
  const email = String(form.get("email") ?? "")
  const password = String(form.get("password") ?? "")

  const response = await fetch(`${AUTH_BASE}/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    cache: "no-store",
  }).catch(() => null)

  if (!response?.ok) {
    const url = new URL("/admin/login", request.url)
    url.searchParams.set("error", "1")
    return NextResponse.redirect(url, { status: 303 })
  }

  const payload = (await response.json()) as {
    accessToken: string
    refreshToken: string
    accessTokenExpiresAt: string
    refreshTokenExpiresAt: string
  }
  const cookieStore = await cookies()
  cookieStore.set("cms_admin_token", payload.accessToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(payload.accessTokenExpiresAt),
    path: "/",
  })
  cookieStore.set("cms_refresh_token", payload.refreshToken, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    expires: new Date(payload.refreshTokenExpiresAt),
    path: "/",
  })

  return NextResponse.redirect(new URL("/admin", request.url), { status: 303 })
}
