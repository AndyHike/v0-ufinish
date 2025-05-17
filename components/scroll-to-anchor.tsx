"use client"

import { useEffect } from "react"

export function ScrollToAnchor() {
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash
      if (hash) {
        const element = document.querySelector(hash)
        if (element) {
          // Додаємо невелику затримку, щоб дати сторінці повністю завантажитися
          setTimeout(() => {
            const headerOffset = 96 // Висота фіксованого заголовка
            const elementPosition = element.getBoundingClientRect().top
            const offsetPosition = elementPosition + window.pageYOffset - headerOffset

            window.scrollTo({
              top: offsetPosition,
              behavior: "smooth",
            })
          }, 100)
        }
      }
    }

    // Обробляємо хеш при початковому завантаженні
    if (window.location.hash) {
      handleHashChange()
    }

    // Додаємо обробник для кліків на посилання з якорями
    const handleAnchorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      const anchor = target.closest("a")

      if (anchor && anchor.hash && anchor.href.includes(window.location.pathname)) {
        e.preventDefault()
        window.history.pushState({}, "", anchor.hash)
        handleHashChange()
      }
    }

    document.addEventListener("click", handleAnchorClick)
    window.addEventListener("hashchange", handleHashChange)

    return () => {
      document.removeEventListener("click", handleAnchorClick)
      window.removeEventListener("hashchange", handleHashChange)
    }
  }, [])

  return null
}
