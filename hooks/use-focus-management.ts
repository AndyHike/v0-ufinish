"use client"

import { useEffect, useRef } from "react"

/**
 * Хук для керування фокусом при відкритті/закритті модальних вікон
 * @param isOpen Чи відкрите модальне вікно
 * @param onClose Функція для закриття модального вікна
 * @returns Об'єкт з ref для контейнера модального вікна
 */
export function useFocusManagement(isOpen: boolean, onClose?: () => void) {
  // Зберігаємо елемент, який мав фокус до відкриття модального вікна
  const previouslyFocusedElementRef = useRef<HTMLElement | null>(null)
  // Посилання на контейнер модального вікна
  const containerRef = useRef<HTMLDivElement>(null)

  // Зберігаємо елемент, який мав фокус до відкриття модального вікна
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElementRef.current = document.activeElement as HTMLElement
    }
  }, [isOpen])

  // Встановлюємо фокус на перший фокусований елемент при відкритті модального вікна
  useEffect(() => {
    if (isOpen && containerRef.current) {
      const focusableElements = containerRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      )

      if (focusableElements.length > 0) {
        // Встановлюємо фокус на перший елемент з затримкою, щоб дати час для рендерингу
        setTimeout(() => {
          ;(focusableElements[0] as HTMLElement).focus()
        }, 0)
      }
    }
  }, [isOpen])

  // Повертаємо фокус на елемент, який мав фокус до відкриття модального вікна
  useEffect(() => {
    return () => {
      if (isOpen && previouslyFocusedElementRef.current) {
        // Повертаємо фокус при розмонтуванні компонента
        previouslyFocusedElementRef.current.focus()
      }
    }
  }, [isOpen])

  // Обробка клавіші Escape
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && onClose) {
        onClose()
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleKeyDown)
    }

    return () => {
      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [isOpen, onClose])

  return { containerRef }
}
