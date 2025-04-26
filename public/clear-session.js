// Функція для очищення всіх cookies
function clearAllCookies() {
  document.cookie.split(";").forEach((c) => {
    document.cookie = c.trim().split("=")[0] + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;"
  })
  console.log("Всі cookies очищено")
  return "Cookies очищено. Спробуйте перезавантажити сторінку."
}

// Функція для перенаправлення на головну сторінку
function redirectToHome() {
  window.location.href = "/"
  return "Перенаправлення на головну сторінку..."
}

// Функція для очищення сесії через API
async function clearSessionViaAPI() {
  try {
    const response = await fetch("/api/auth/clear-session")
    const data = await response.json()
    console.log("API відповідь:", data)
    return data.success
      ? "Сесію успішно очищено через API. Спробуйте перезавантажити сторінку."
      : "Не вдалося очистити сесію через API. Спробуйте очистити cookies вручну."
  } catch (error) {
    console.error("Помилка при виклику API:", error)
    return "Помилка при виклику API. Спробуйте очистити cookies вручну."
  }
}

// Експортуємо функції для використання в консолі
window.clearAllCookies = clearAllCookies
window.redirectToHome = redirectToHome
window.clearSessionViaAPI = clearSessionViaAPI

// Повідомлення про доступні функції
console.log("Доступні функції для очищення сесії:")
console.log("clearAllCookies() - очистити всі cookies")
console.log("redirectToHome() - перейти на головну сторінку")
console.log("clearSessionViaAPI() - очистити сесію через API")
