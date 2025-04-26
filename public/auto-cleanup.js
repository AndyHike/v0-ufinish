// Функція для очищення всіх cookies
function clearAllCookies() {
  const cookies = document.cookie.split(";")

  for (let i = 0; i < cookies.length; i++) {
    const cookie = cookies[i]
    const eqPos = cookie.indexOf("=")
    const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim()
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/"
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=" + window.location.hostname
  }

  return cookies.length
}

// Функція для очищення localStorage
function clearLocalStorage() {
  try {
    localStorage.clear()
    return true
  } catch (e) {
    console.error("Помилка при очищенні localStorage:", e)
    return false
  }
}

// Функція для очищення sessionStorage
function clearSessionStorage() {
  try {
    sessionStorage.clear()
    return true
  } catch (e) {
    console.error("Помилка при очищенні sessionStorage:", e)
    return false
  }
}

// Головна функція очищення
async function performCleanup() {
  console.log("Запуск автоматичного очищення сесії...")

  // Крок 1: Очищення cookies
  const cookiesCount = clearAllCookies()
  console.log(`Очищено ${cookiesCount} cookies`)

  // Крок 2: Очищення localStorage
  const localStorageCleared = clearLocalStorage()
  console.log(`localStorage очищено: ${localStorageCleared}`)

  // Крок 3: Очищення sessionStorage
  const sessionStorageCleared = clearSessionStorage()
  console.log(`sessionStorage очищено: ${sessionStorageCleared}`)

  // Крок 4: Повторне очищення cookies для впевненості
  clearAllCookies()

  // Крок 5: Перезавантаження сторінки
  console.log("Перезавантаження сторінки...")

  // Затримка перед перезавантаженням
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // Перезавантаження на головну сторінку
  window.location.href = "/"
}

// Перевірка наявності помилки на сторінці
function checkForErrors() {
  // Перевірка наявності тексту помилки на сторінці
  const pageText = document.body.innerText
  const errorTexts = [
    "Application error",
    "server-side exception",
    "Digest:",
    "An error occurred in the Server Components render",
  ]

  const hasError = errorTexts.some((text) => pageText.includes(text))

  if (hasError) {
    console.log("Виявлено помилку на сторінці. Запуск автоматичного очищення...")
    performCleanup()
  }
}

// Запуск перевірки при завантаженні сторінки
window.addEventListener("DOMContentLoaded", checkForErrors)
window.addEventListener("load", checkForErrors)

// Експорт функцій для можливого використання в консолі
window.clearAllCookies = clearAllCookies
window.clearLocalStorage = clearLocalStorage
window.clearSessionStorage = clearSessionStorage
window.performCleanup = performCleanup
