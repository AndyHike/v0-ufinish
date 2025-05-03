"use client"

import type React from "react"

import { AriaHiddenPatch } from "@/lib/accessibility-patch"
import { useEffect } from "react"

interface AccessibilityProviderProps {
  children: React.ReactNode
}

export function AccessibilityProvider({ children }: AccessibilityProviderProps) {
  // Завантажуємо поліфіл для атрибуту inert
  useEffect(() => {
    // Перевіряємо, чи браузер підтримує атрибут inert
    if (typeof window !== "undefined" && !("inert" in HTMLElement.prototype)) {
      // Якщо ні, завантажуємо поліфіл
      import("wicg-inert").then(() => {
        console.log("Inert polyfill loaded")
      })
    }
  }, [])

  return (
    <>
      <AriaHiddenPatch />
      {children}
    </>
  )
}
