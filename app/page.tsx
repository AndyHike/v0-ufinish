import { redirect } from "next/navigation"
import { defaultLocale } from "./i18n"

// This is the root page that redirects to the default locale
export default function Home() {
  redirect(`/${defaultLocale}`)
}
