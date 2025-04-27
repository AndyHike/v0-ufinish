"use client"

import { useEffect, useState } from "react"

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia(query)

    // Встановлюємо початкове значення
    setMatches(mediaQuery.matches)

    // Функція для оновлення стану при зміні розміру екрану
    const listener = (event: MediaQueryListEvent) => {
      setMatches(event.matches)
    }

    // Додаємо слухача подій
    mediaQuery.addEventListener("change", listener)

    // Прибираємо слухача при розмонтуванні компонента
    return () => {
      mediaQuery.removeEventListener("change", listener)
    }
  }, [query])

  return matches
}
