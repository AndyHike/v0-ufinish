"use client"

/**
 * Цей файл містить патч для Radix UI, який вирішує проблему з aria-hidden
 * на елементах, які містять фокус.
 */

import { useEffect } from "react"

/**
 * Функція для патчу Radix UI
 * Замінює aria-hidden на inert для всіх діалогів
 */
export function useRadixUiPatch() {
  useEffect(() => {
    // Функція для заміни aria-hidden на inert
    function replaceAriaHiddenWithInert() {
      // Знаходимо всі елементи з aria-hidden="true"
      const ariaHiddenElements = document.querySelectorAll('[aria-hidden="true"]')

      // Для кожного елемента
      ariaHiddenElements.forEach((element) => {
        // Перевіряємо, чи елемент містить фокусовані елементи
        const focusableElements = element.querySelectorAll(
          'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
        )

        // Якщо елемент містить фокусовані елементи
        if (focusableElements.length > 0) {
          // Видаляємо aria-hidden
          element.removeAttribute("aria-hidden")
          // Додаємо inert
          if ("inert" in element) {
            element.setAttribute("inert", "")
          }
          // Зберігаємо оригінальний стан для відновлення
          element.setAttribute("data-was-aria-hidden", "true")
        }
      })
    }

    // Функція для відновлення оригінального стану
    function restoreAriaHidden() {
      // Знаходимо всі елементи з data-was-aria-hidden="true"
      const inertElements = document.querySelectorAll('[data-was-aria-hidden="true"]')

      // Для кожного елемента
      inertElements.forEach((element) => {
        // Видаляємо inert
        element.removeAttribute("inert")
        // Відновлюємо aria-hidden
        element.setAttribute("aria-hidden", "true")
        // Видаляємо data-was-aria-hidden
        element.removeAttribute("data-was-aria-hidden")
      })
    }

    // Створюємо MutationObserver для відстеження змін в DOM
    const observer = new MutationObserver((mutations) => {
      // Для кожної мутації
      mutations.forEach((mutation) => {
        // Якщо додано або видалено вузли
        if (mutation.type === "childList") {
          // Перевіряємо, чи додано елементи з aria-hidden
          const addedNodes = Array.from(mutation.addedNodes)
          const hasAriaHidden = addedNodes.some((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element
              return element.hasAttribute("aria-hidden") || element.querySelector('[aria-hidden="true"]')
            }
            return false
          })

          // Якщо додано елементи з aria-hidden
          if (hasAriaHidden) {
            // Замінюємо aria-hidden на inert
            replaceAriaHiddenWithInert()
          }
        } else if (mutation.type === "attributes" && mutation.attributeName === "aria-hidden") {
          // Якщо змінено атрибут aria-hidden
          const element = mutation.target as Element
          if (element.getAttribute("aria-hidden") === "true") {
            // Перевіряємо, чи елемент містить фокусовані елементи
            const focusableElements = element.querySelectorAll(
              'a[href], button, input, textarea, select, details, [tabindex]:not([tabindex="-1"])',
            )

            // Якщо елемент містить фокусовані елементи
            if (focusableElements.length > 0) {
              // Видаляємо aria-hidden
              element.removeAttribute("aria-hidden")
              // Додаємо inert
              if ("inert" in element) {
                element.setAttribute("inert", "")
              }
              // Зберігаємо оригінальний стан для відновлення
              element.setAttribute("data-was-aria-hidden", "true")
            }
          }
        }
      })
    })

    // Починаємо відстежувати зміни в DOM
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ["aria-hidden"],
    })

    // Замінюємо aria-hidden на inert для існуючих елементів
    replaceAriaHiddenWithInert()

    // Зупиняємо відстеження змін в DOM при розмонтуванні
    return () => {
      observer.disconnect()
      // Відновлюємо оригінальний стан
      restoreAriaHidden()
    }
  }, [])
}

/**
 * Компонент для патчу Radix UI
 */
export function RadixUiPatch() {
  useRadixUiPatch()
  return null
}
