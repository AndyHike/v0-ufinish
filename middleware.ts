import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createClient } from "@/lib/supabase"

// Список підтримуваних локалей
const locales = ["uk", "en", "cs"]
const defaultLocale = "uk"

// Створюємо middleware для next-intl
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "as-needed",
})

export default async function middleware(request: NextRequest) {
  // Перевіряємо, чи це запит до API
  if (request.nextUrl.pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // Для всіх інших запитів використовуємо next-intl middleware
  const pathname = request.nextUrl.pathname

  // Add exceptions for API routes and webhooks
  // This will prevent redirects for webhook requests
  if (pathname.includes("/webhooks/") || pathname.startsWith("/app/api/")) {
    return NextResponse.next()
  }

  // Special handling for root path
  if (pathname === "/") {
    // Redirect to the default locale
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // Handle internationalization
  const response = intlMiddleware(request)

  // Check for protected routes
  if (pathname.includes("/profile") || pathname.includes("/admin")) {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      // Get locale from URL
      const locale = pathname.split("/")[1] || defaultLocale

      // Redirect to login page
      const redirectUrl = new URL(`/${locale}/auth/login`, request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Verify that the session exists in the database and is valid
    // This is important to catch cases where a user was deleted but still has a cookie
    try {
      // We can't use server actions in middleware, so we need to check the session directly
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!

      const supabase = createClient()

      const { data: session, error } = await supabase
        .from("sessions")
        .select("id, user_id, expires_at")
        .eq("id", sessionId)
        .single()

      if (error || !session || new Date(session.expires_at) < new Date()) {
        // Session is invalid or expired, redirect to login
        const locale = pathname.split("/")[1] || defaultLocale
        const redirectUrl = new URL(`/${locale}/auth/login`, request.url)
        redirectUrl.searchParams.set("redirect", pathname)

        // Clear the invalid session cookie
        const response = NextResponse.redirect(redirectUrl)
        response.cookies.delete("session_id")
        return response
      }
    } catch (error) {
      console.error("Error verifying session in middleware:", error)
      // On error, we'll let the request through and let the page handle authentication
    }
  }

  return response
}

export const config = {
  // Виключаємо статичні файли та API маршрути
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
