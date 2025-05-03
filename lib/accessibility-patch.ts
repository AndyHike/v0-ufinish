"use client"

/**
 * Цей файл містить патч для вирішення проблеми з aria-hidden на елементах, які містять фокус.
 * Патч працює на рівні DOM, знаходячи всі елементи з aria-hidden="true" і видаляючи цей атрибут,
 * якщо елемент містить фокусований елемент.
 */

import { useEffect } from "react"

/**
 * Хук для патчу aria-hidden
 */
export function useAriaHiddenPatch() {
  useEffect(() => {
    // Функція для перевірки, чи елемент містить фокусований елемент
    function containsFocusedElement(element: Element): boolean {
      // Якщо елемент сам має фокус
      if (document.activeElement === element) {
        return true
      }

      // Якщо елемент містить фокусований елемент
      return element.contains(document.activeElement) && document.activeElement !== document.body
    }

    // Функція для виправлення aria-hidden
    function fixAriaHidden() {
      // Знаходимо всі елементи з aria-hidden="true"
      const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]')

      // Для кожного елемента
      ariaHiddenElements.forEach((element) => {
        // Якщо елемент містить фокусований елемент
        if (containsFocusedElement(element)) {
          // Видаляємо aria-hidden
          element.removeAttribute("aria-hidden")
          // Додаємо data-fixed-aria-hidden для відстеження
          element.setAttribute("data-fixed-aria-hidden", "true")
        }
      })
    }

    // Функція для відновлення aria-hidden
    function restoreAriaHidden() {
      // Знаходимо всі елементи з data-fixed-aria-hidden="true"
      const fixedElements = document.querySelectorAll('[data-fixed-aria-hidden="true"]')

      // Для кожного елемента
      fixedElements.forEach((element) => {
        // Видаляємо data-fixed-aria-hidden
        element.removeAttribute("data-fixed-aria-hidden")
        // Відновлюємо aria-hidden, якщо елемент більше не містить фокусований елемент
        if (!containsFocusedElement(element)) {
          element.setAttribute("aria-hidden", "true")
        }
      })
    }

    // Функція для обробки подій фокусу
    function handleFocusChange() {
      // Виправляємо aria-hidden
      fixAriaHidden()
      // Відновлюємо aria-hidden для елементів, які більше не містять фокусований елемент
      restoreAriaHidden()
    }

    // Додаємо обробники подій
    document.addEventListener("focusin", handleFocusChange)
    document.addEventListener("focusout", handleFocusChange)

    // Виправляємо aria-hidden при монтуванні
    fixAriaHidden()

    // Видаляємо обробники подій при розмонтуванні
    return () => {
      document.removeEventListener("focusin", handleFocusChange)
      document.removeEventListener("focusout", handleFocusChange)
      // Відновлюємо aria-hidden при розмонтуванні
      restoreAriaHidden()
    }
  }, [])
}

/**
 * Компонент для патчу aria-hidden
 */
export function AriaHiddenPatch() {
  useAriaHiddenPatch()
  return null
}
