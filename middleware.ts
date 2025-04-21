import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { locales, defaultLocale } from "./i18n.js"

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname

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
      const redirectUrl = new URL(`/${locale}/auth/signin`, request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return response
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
