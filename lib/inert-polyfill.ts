"use client"

import React from "react"

/**
 * Поліфіл для атрибуту inert
 * Використовується для запобігання фокусу на елементах, які не повинні бути доступні
 */

// Перевіряємо, чи підтримується атрибут inert
export function isInertSupported(): boolean {
  if (typeof window === "undefined") return false
  return "inert" in HTMLElement.prototype
}

// Додаємо атрибут inert до елемента
export function makeInert(element: HTMLElement): void {
  if (isInertSupported()) {
    element.setAttribute("inert", "")
  } else {
    // Якщо inert не підтримується, використовуємо aria-hidden та tabindex
    element.setAttribute("aria-hidden", "true")

    // Зберігаємо попереднє значення tabindex
    const previousTabIndex = element.getAttribute("tabindex")
    if (previousTabIndex) {
      element.dataset.previousTabIndex = previousTabIndex
    }

    element.setAttribute("tabindex", "-1")

    // Знаходимо всі фокусовані елементи та робимо їх недоступними
    const focusableElements = element.querySelectorAll(
      'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
    )

    focusableElements.forEach((el) => {
      const focusableElement = el as HTMLElement
      const previousTabIndex = focusableElement.getAttribute("tabindex")

      if (previousTabIndex) {
        focusableElement.dataset.previousTabIndex = previousTabIndex
      }

      focusableElement.setAttribute("tabindex", "-1")
    })
  }
}

// Видаляємо атрибут inert з елемента
export function removeInert(element: HTMLElement): void {
  if (isInertSupported()) {
    element.removeAttribute("inert")
  } else {
    // Якщо inert не підтримується, видаляємо aria-hidden та відновлюємо tabindex
    element.removeAttribute("aria-hidden")

    // Відновлюємо попереднє значення tabindex
    if (element.dataset.previousTabIndex) {
      element.setAttribute("tabindex", element.dataset.previousTabIndex)
      delete element.dataset.previousTabIndex
    } else {
      element.removeAttribute("tabindex")
    }

    // Відновлюємо фокусовані елементи
    const focusableElements = element.querySelectorAll("[data-previous-tab-index]")

    focusableElements.forEach((el) => {
      const focusableElement = el as HTMLElement

      if (focusableElement.dataset.previousTabIndex) {
        focusableElement.setAttribute("tabindex", focusableElement.dataset.previousTabIndex)
        delete focusableElement.dataset.previousTabIndex
      } else {
        focusableElement.removeAttribute("tabindex")
      }
    })
  }
}

// Хук для використання атрибуту inert в React-компонентах
export function useInert(ref: React.RefObject<HTMLElement>, shouldBeInert: boolean): void {
  React.useEffect(() => {
    if (!ref.current) return

    if (shouldBeInert) {
      makeInert(ref.current)
    } else {
      removeInert(ref.current)
    }

    return () => {
      if (ref.current && shouldBeInert) {
        removeInert(ref.current)
      }
    }
  }, [ref, shouldBeInert])
}
