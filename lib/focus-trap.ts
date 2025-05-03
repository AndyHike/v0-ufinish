"use client"

import React from "react"

/**
 * Утиліта для управління фокусом в модальних вікнах
 */

// Список селекторів для інтерактивних елементів
const FOCUSABLE_ELEMENTS = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"])',
].join(", ")

/**
 * Створює пастку фокусу в межах вказаного елемента
 * @param element Елемент, в якому потрібно утримувати фокус
 * @returns Функція для очищення пастки фокусу
 */
export function createFocusTrap(element: HTMLElement): () => void {
  // Зберігаємо елемент, який мав фокус до відкриття модального вікна
  const previouslyFocusedElement = document.activeElement as HTMLElement

  // Знаходимо всі фокусовані елементи всередині контейнера
  const focusableElements = Array.from(element.querySelectorAll(FOCUSABLE_ELEMENTS))

  // Якщо немає фокусованих елементів, додаємо tabindex до контейнера
  if (focusableElements.length === 0) {
    element.setAttribute("tabindex", "-1")
    focusableElements.push(element)
  }

  // Встановлюємо фокус на перший елемент
  const firstElement = focusableElements[0] as HTMLElement
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

  // Встановлюємо початковий фокус
  setTimeout(() => {
    firstElement.focus()
  }, 50)

  // Обробник для циклічної навігації по Tab
  const handleTabKey = (e: KeyboardEvent) => {
    if (e.key !== "Tab") return

    // Якщо натиснуто Shift+Tab і фокус на першому елементі
    if (e.shiftKey && document.activeElement === firstElement) {
      e.preventDefault()
      lastElement.focus()
    }
    // Якщо натиснуто Tab і фокус на останньому елементі
    else if (!e.shiftKey && document.activeElement === lastElement) {
      e.preventDefault()
      firstElement.focus()
    }
  }

  // Додаємо обробник клавіатури
  document.addEventListener("keydown", handleTabKey)

  // Функція для очищення
  return () => {
    document.removeEventListener("keydown", handleTabKey)
    // Повертаємо фокус на елемент, який мав фокус до відкриття модального вікна
    if (previouslyFocusedElement && "focus" in previouslyFocusedElement) {
      previouslyFocusedElement.focus()
    }
  }
}

/**
 * Хук для використання пастки фокусу в React-компонентах
 * @param ref Посилання на елемент, в якому потрібно утримувати фокус
 * @param isActive Чи активна пастка фокусу
 */
export function useFocusTrap(ref: React.RefObject<HTMLElement>, isActive: boolean) {
  React.useEffect(() => {
    if (!isActive || !ref.current) return

    const cleanup = createFocusTrap(ref.current)
    return cleanup
  }, [isActive, ref])
}
