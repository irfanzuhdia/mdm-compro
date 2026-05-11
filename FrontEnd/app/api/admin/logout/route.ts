import { cookies } from "next/headers"
import { NextResponse, type NextRequest } from "next/server"

export async function POST(request: NextRequest) {
  const cookieStore = await cookies()
  cookieStore.delete("cms_admin_token")
  cookieStore.delete("cms_refresh_token")
  return NextResponse.redirect(new URL("/admin/login", request.url), { status: 303 })
}
