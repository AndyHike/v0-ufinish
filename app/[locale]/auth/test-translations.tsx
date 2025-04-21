"use client"

import { useTranslations } from "next-intl"

export default function TestTranslations() {
  const t = useTranslations("Auth")

  return (
    <div className="p-4 space-y-4 border rounded">
      <h1 className="text-xl font-bold">Translation Test</h1>
      <div>
        <p>signIn: {t("signIn")}</p>
        <p>signInToAccount: {t("signInToAccount")}</p>
        <p>email: {t("email")}</p>
        <p>password: {t("password")}</p>
      </div>
    </div>
  )
}
