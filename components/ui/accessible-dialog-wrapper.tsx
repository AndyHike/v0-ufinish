"use client"

import type React from "react"
import { useEffect, useRef } from "react"

interface AccessibleDialogWrapperProps {
  children: React.ReactNode
  isOpen: boolean
}

/**
 * Компонент-обгортка для діалогів, який використовує атрибут inert
 * замість aria-hidden для запобігання проблем з фокусом
 */
export function AccessibleDialogWrapper({ children, isOpen }: AccessibleDialogWrapperProps) {
  const wrapperRef = useRef<HTMLDivElement>(null)
  const previousFocusRef = useRef<HTMLElement | null>(null)

  // Зберігаємо елемент, який мав фокус до відкриття діалогу
  useEffect(() => {
    if (isOpen) {
      previousFocusRef.current = document.activeElement as HTMLElement
    }
  }, [isOpen])

  // Керуємо атрибутом inert для запобігання проблем з фокусом
  useEffect(() => {
    // Знаходимо всі діалоги з aria-hidden="true"
    const ariaHiddenDialogs = document.querySelectorAll('[role="dialog"][aria-hidden="true"]')

    // Для кожного діалогу з aria-hidden="true"
    ariaHiddenDialogs.forEach((dialog) => {
      // Видаляємо aria-hidden
      dialog.removeAttribute("aria-hidden")
      // Додаємо inert
      dialog.setAttribute("inert", "")

      // Зберігаємо оригінальний стан для відновлення
      dialog.setAttribute("data-was-aria-hidden", "true")
    })

    // Відновлюємо оригінальний стан при розмонтуванні
    return () => {
      const inertDialogs = document.querySelectorAll('[role="dialog"][inert]')
      inertDialogs.forEach((dialog) => {
        // Видаляємо inert
        dialog.removeAttribute("inert")

        // Відновлюємо aria-hidden, якщо він був
        if (dialog.getAttribute("data-was-aria-hidden") === "true") {
          dialog.setAttribute("aria-hidden", "true")
          dialog.removeAttribute("data-was-aria-hidden")
        }
      })
    }
  }, [isOpen])

  // Повертаємо фокус на елемент, який мав фокус до відкриття діалогу
  useEffect(() => {
    return () => {
      if (!isOpen && previousFocusRef.current) {
        try {
          // Перевіряємо, чи елемент все ще в DOM
          if (document.body.contains(previousFocusRef.current)) {
            // Повертаємо фокус при розмонтуванні компонента
            previousFocusRef.current.focus()
          }
        } catch (e) {
          console.error("Error returning focus:", e)
        }
      }
    }
  }, [isOpen])

  return <div ref={wrapperRef}>{children}</div>
}
