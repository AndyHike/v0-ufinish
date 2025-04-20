import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "@/lib/i18n-config"

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // The default locale to use when visiting a non-localized route
  defaultLocale,
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  localePrefix: "as-needed",
})

export const config = {
  // Skip all paths that should not be internationalized
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
