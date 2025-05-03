"use client"

import { useEffect, useRef } from "react"

interface UseFocusTrapOptions {
  enabled?: boolean
  onEscape?: () => void
}

export function useFocusTrap(options: UseFocusTrapOptions = {}) {
  const { enabled = true, onEscape } = options
  const containerRef = useRef<HTMLElement | null>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Зберігаємо попередній елемент з фокусом
  useEffect(() => {
    if (!enabled) return

    previousFocusRef.current = document.activeElement as HTMLElement
  }, [enabled])

  // Встановлюємо фокус на перший фокусований елемент при монтуванні
  useEffect(() => {
    if (!enabled || !containerRef.current) return

    const focusableElements = containerRef.current.querySelectorAll<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    )

    if (focusableElements.length > 0) {
      focusableElements[0].focus()
    }
  }, [enabled])

  // Повертаємо фокус на попередній елемент при розмонтуванні
  useEffect(() => {
    return () => {
      if (previousFocusRef.current && document.body.contains(previousFocusRef.current)) {
        try {
          previousFocusRef.current.focus()
        } catch (e) {
          console.error("Error returning focus:", e)
        }
      }
    }
  }, [])

  // Обробляємо клавішу Escape
  useEffect(() => {
    if (!enabled || !onEscape) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onEscape()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [enabled, onEscape])

  return { containerRef }
}
