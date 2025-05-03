"use client"

import type React from "react"
import { useEffect } from "react"

export function InertProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Перевіряємо, чи браузер підтримує атрибут inert
    if (typeof window !== "undefined" && !("inert" in document.createElement("div"))) {
      // Якщо ні, завантажуємо поліфіл
      import("wicg-inert").then(() => {
        console.log("Inert polyfill loaded")
      })
    }
  }, [])

  return <>{children}</>
}
