import createMiddleware from "next-intl/middleware"
import { locales, defaultLocale } from "./i18n"

export default createMiddleware({
  // A list of all locales that are supported
  locales,
  // If this locale is matched, pathnames work without a prefix (e.g. `/about`)
  defaultLocale,
  // The default locale will be used when visiting a non-localized path
  localePrefix: "as-needed",
})

export const config = {
  // Skip all paths that should not be internationalized. This includes
  // api routes, _next/static, _next/image, assets, favicon.ico, etc.
  matcher: ["/((?!api|_next|.*\\..*).*)"],
}
