"use client"

import type React from "react"

import { useEffect } from "react"
import { fixAriaHidden } from "@/lib/fix-aria-hidden"

export function AccessibilityProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Apply the fix when the component mounts
    const cleanup = fixAriaHidden()

    // Clean up when the component unmounts
    return () => {
      if (typeof cleanup === "function") {
        cleanup()
      }
    }
  }, [])

  return <>{children}</>
}
