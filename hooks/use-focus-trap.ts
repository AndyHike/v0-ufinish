"use client"

import { useEffect, useRef } from "react"

/**
 * Хук для керування фокусом в модальних вікнах та діалогах
 * Запобігає проблемам з aria-hidden та фокусом
 */
export function useFocusTrap(isOpen: boolean, onClose?: () => void) {
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
      if (previouslyFocusedElementRef.current) {
        try {
          // Перевіряємо, чи елемент все ще в DOM
          if (document.body.contains(previouslyFocusedElementRef.current)) {
            // Повертаємо фокус при розмонтуванні компонента
            previouslyFocusedElementRef.current.focus()
          }
        } catch (e) {
          console.error("Error returning focus:", e)
        }
      }
    }
  }, [])

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

  // Запобігаємо проблемам з aria-hidden
  useEffect(() => {
    if (isOpen && containerRef.current) {
      // Знаходимо всі елементи з aria-hidden="true"
      const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]')

      // Зберігаємо оригінальні значення для відновлення
      const originalValues = new Map<Element, string | null>()

      // Тимчасово видаляємо aria-hidden з елементів, які містять наш контейнер
      ariaHiddenElements.forEach((el) => {
        if (el.contains(containerRef.current)) {
          originalValues.set(el, el.getAttribute("aria-hidden"))
          el.removeAttribute("aria-hidden")
        }
      })

      // Відновлюємо оригінальні значення при розмонтуванні
      return () => {
        originalValues.forEach((value, element) => {
          if (value !== null) {
            element.setAttribute("aria-hidden", value)
          }
        })
      }
    }
  }, [isOpen])

  return { containerRef }
}
