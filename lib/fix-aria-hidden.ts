"use client"

/**
 * Цей файл містить функцію для виправлення проблеми з aria-hidden на елементах, які містять фокус.
 * Функція працює на рівні DOM, знаходячи всі елементи з aria-hidden="true" і видаляючи цей атрибут,
 * якщо елемент містить фокусований елемент.
 */

/**
 * Функція для виправлення проблеми з aria-hidden
 */
export function fixAriaHidden() {
  // Перевіряємо, чи ми в браузері
  if (typeof window === "undefined") return

  // Функція для перевірки, чи елемент містить фокусований елемент
  function containsFocusedElement(element: Element): boolean {
    // Якщо елемент сам має фокус
    if (document.activeElement === element) {
      return true
    }

    // Якщо елемент містить фокусований елемент
    return element.contains(document.activeElement) && document.activeElement !== document.body
  }

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

/**
 * Функція для відновлення aria-hidden
 */
export function restoreAriaHidden() {
  // Перевіряємо, чи ми в браузері
  if (typeof window === "undefined") return

  // Функція для перевірки, чи елемент містить фокусований елемент
  function containsFocusedElement(element: Element): boolean {
    // Якщо елемент сам має фокус
    if (document.activeElement === element) {
      return true
    }

    // Якщо елемент містить фокусований елемент
    return element.contains(document.activeElement) && document.activeElement !== document.body
  }

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

/**
 * Хук для виправлення проблеми з aria-hidden
 */
export function useFixAriaHidden() {
  // Перевіряємо, чи ми в браузері
  if (typeof window === "undefined") return

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

  // Повертаємо функцію для видалення обробників подій
  return () => {
    document.removeEventListener("focusin", handleFocusChange)
    document.removeEventListener("focusout", handleFocusChange)
    // Відновлюємо aria-hidden при розмонтуванні
    restoreAriaHidden()
  }
}
