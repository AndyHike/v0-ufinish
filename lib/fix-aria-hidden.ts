"use client"

/**
 * Fixes the aria-hidden issue by monitoring focus and removing aria-hidden from ancestors of focused elements
 */
export function fixAriaHidden() {
  if (typeof window === "undefined") return

  // Keep track of elements we've modified
  const modifiedElements = new Set<HTMLElement>()

  // Function to check and fix aria-hidden on ancestors
  const checkAndFixAriaHidden = () => {
    // First, restore all previously modified elements
    modifiedElements.forEach((el) => {
      if (el.hasAttribute("data-original-aria-hidden")) {
        const originalValue = el.getAttribute("data-original-aria-hidden")
        if (originalValue === "null") {
          el.removeAttribute("aria-hidden")
        } else {
          el.setAttribute("aria-hidden", originalValue)
        }
        el.removeAttribute("data-original-aria-hidden")
      }
      modifiedElements.delete(el)
    })

    // Get the currently focused element
    const activeElement = document.activeElement
    if (!activeElement || activeElement === document.body) return

    // Check all ancestors for aria-hidden
    let element = activeElement.parentElement
    while (element) {
      if (element.hasAttribute("aria-hidden") && element.getAttribute("aria-hidden") === "true") {
        // Store the original value
        element.setAttribute("data-original-aria-hidden", element.getAttribute("aria-hidden") || "null")
        // Remove aria-hidden
        element.removeAttribute("aria-hidden")
        // Add to our set of modified elements
        modifiedElements.add(element)
      }
      element = element.parentElement
    }
  }

  // Run the check immediately
  checkAndFixAriaHidden()

  // Set up event listeners for focus changes
  document.addEventListener("focusin", checkAndFixAriaHidden)
  document.addEventListener("click", checkAndFixAriaHidden)

  // Return a cleanup function
  return () => {
    document.removeEventListener("focusin", checkAndFixAriaHidden)
    document.removeEventListener("click", checkAndFixAriaHidden)

    // Restore all modified elements
    modifiedElements.forEach((el) => {
      if (el.hasAttribute("data-original-aria-hidden")) {
        const originalValue = el.getAttribute("data-original-aria-hidden")
        if (originalValue === "null") {
          el.removeAttribute("aria-hidden")
        } else {
          el.setAttribute("aria-hidden", originalValue)
        }
        el.removeAttribute("data-original-aria-hidden")
      }
    })
  }
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
    // fixAriaHidden() // This line is removed because fixAriaHidden now handles event listeners internally
    // Відновлюємо aria-hidden для елементів, які більше не містять фокусований елемент
    restoreAriaHidden()
  }

  // Додаємо обробники подій
  // document.addEventListener("focusin", handleFocusChange) // These lines are removed because fixAriaHidden now handles event listeners internally
  // document.addEventListener("focusout", handleFocusChange)

  // Виправляємо aria-hidden при монтуванні
  const cleanup = fixAriaHidden()

  // Повертаємо функцію для видалення обробників подій
  return () => {
    // document.removeEventListener("focusin", handleFocusChange) // This line is removed because fixAriaHidden now handles event listeners internally
    // document.removeEventListener("focusout", handleFocusChange)
    // Відновлюємо aria-hidden при розмонтуванні
    restoreAriaHidden()
    cleanup && cleanup()
  }
}
