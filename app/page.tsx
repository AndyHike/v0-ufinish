import { redirect } from "next/navigation"
import { defaultLocale } from "../i18n.js"

export default function Home() {
  redirect(`/${defaultLocale}`)
}
