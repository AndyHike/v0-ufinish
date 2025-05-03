"use client"

import type React from "react"

import { useEffect } from "react"
import { RadixUiPatch } from "@/lib/radix-ui-patch"

interface InertProviderProps {
  children: React.ReactNode
}

export function InertProvider({ children }: InertProviderProps) {
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
      <RadixUiPatch />
      {children}
    </>
  )
}
