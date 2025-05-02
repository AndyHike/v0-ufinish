"use client"

import type React from "react"
import { useRef, useEffect } from "react"
import { useOnClickOutside } from "@/hooks/use-click-outside"

interface DropdownWrapperProps {
  children: React.ReactNode
  isOpen: boolean
  onClose: () => void
}

export function DropdownWrapper({ children, isOpen, onClose }: DropdownWrapperProps) {
  const ref = useRef<HTMLDivElement>(null)

  // Закриття при кліку поза меню
  useOnClickOutside(ref, () => {
    if (isOpen) {
      onClose()
    }
  })

  // Закриття при натисканні Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)
    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  // Запобігання блокуванню фокусу
  useEffect(() => {
    if (isOpen) {
      // Зберігаємо попередній елемент з фокусом
      const previousActiveElement = document.activeElement as HTMLElement

      // Повертаємо фокус при закритті
      return () => {
        if (previousActiveElement) {
          previousActiveElement.focus()
        }
      }
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <div ref={ref} className="relative z-50" role="dialog" aria-modal="true">
      {children}
    </div>
  )
}
