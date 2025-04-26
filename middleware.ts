import createMiddleware from "next-intl/middleware"
import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@/utils/supabase/middleware"

// Hardcode the locales and defaultLocale to avoid importing from i18n.js
const locales = ["uk", "cs", "en"]
const defaultLocale = "uk"

// Create the next-intl middleware
const intlMiddleware = createMiddleware({
  locales,
  defaultLocale,
  localePrefix: "always",
})

// Список відомих дайджестів помилок, пов'язаних з сесією
const knownSessionErrorDigests = ["3725655055", "3535959504", "2270157684", "194015031", "5575-5d5ce150e08db6d3.js:1"]

// HTML для автоматичного очищення cookies
const autoCleanupHtml = `
<!DOCTYPE html>
<html>
<head>
  <title>Автоматичне відновлення сесії</title>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
      background-color: #f7f7f7;
      color: #333;
      display: flex;
      justify-content: center;
      align-items: center;
      height: 100vh;
      margin: 0;
      padding: 20px;
    }
    .container {
      background-color: white;
      border-radius: 8px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      padding: 30px;
      max-width: 500px;
      width: 100%;
      text-align: center;
    }
    h1 {
      color: #2563eb;
      margin-top: 0;
    }
    .progress {
      margin: 20px 0;
      height: 10px;
      background-color: #e5e7eb;
      border-radius: 5px;
      overflow: hidden;
    }
    .progress-bar {
      height: 100%;
      background-color: #2563eb;
      width: 0%;
      transition: width 2s ease;
    }
    .status {
      margin-bottom: 20px;
      font-size: 16px;
    }
    .spinner {
      border: 4px solid rgba(0, 0, 0, 0.1);
      border-left-color: #2563eb;
      border-radius: 50%;
      width: 30px;
      height: 30px;
      animation: spin 1s linear infinite;
      margin: 0 auto 20px;
    }
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="spinner"></div>
    <h1>Автоматичне відновлення сесії</h1>
    <div class="progress">
      <div class="progress-bar" id="progress-bar"></div>
    </div>
    <div class="status" id="status">Очищення даних сесії...</div>
    <script>
      // Функція для очищення всіх cookies
      function clearAllCookies() {
        const cookies = document.cookie.split(';');
        
        for (let i = 0; i < cookies.length; i++) {
          const cookie = cookies[i];
          const eqPos = cookie.indexOf('=');
          const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/';
          document.cookie = name + '=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=' + window.location.hostname;
        }
        
        return cookies.length;
      }

      // Функція для очищення localStorage
      function clearLocalStorage() {
        try {
          localStorage.clear();
          return true;
        } catch (e) {
          console.error('Помилка при очищенні localStorage:', e);
          return false;
        }
      }

      // Функція для очищення sessionStorage
      function clearSessionStorage() {
        try {
          sessionStorage.clear();
          return true;
        } catch (e) {
          console.error('Помилка при очищенні sessionStorage:', e);
          return false;
        }
      }

      // Оновлення прогрес-бару
      function updateProgress(percent) {
        document.getElementById('progress-bar').style.width = percent + '%';
      }

      // Оновлення статусу
      function updateStatus(message) {
        document.getElementById('status').textContent = message;
      }

      // Головна функція очищення
      async function performCleanup() {
        // Крок 1: Очищення cookies
        updateProgress(10);
        updateStatus('Очищення cookies...');
        const cookiesCount = clearAllCookies();
        
        // Крок 2: Очищення localStorage
        updateProgress(30);
        updateStatus('Очищення локального сховища...');
        clearLocalStorage();
        
        // Крок 3: Очищення sessionStorage
        updateProgress(50);
        updateStatus('Очищення сесійного сховища...');
        clearSessionStorage();
        
        // Крок 4: Повторне очищення cookies для впевненості
        updateProgress(70);
        updateStatus('Фінальне очищення cookies...');
        clearAllCookies();
        
        // Крок 5: Підготовка до перезавантаження
        updateProgress(90);
        updateStatus('Підготовка до перезавантаження сторінки...');
        
        // Затримка перед перезавантаженням
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Крок 6: Перезавантаження
        updateProgress(100);
        updateStatus('Перезавантаження сторінки...');
        
        // Затримка перед перезавантаженням для показу 100% прогресу
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Перезавантаження на головну сторінку
        window.location.href = '/';
      }

      // Запуск процесу очищення при завантаженні сторінки
      window.onload = performCleanup;
    </script>
  </div>
</body>
</html>
`

export default async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname
  const searchParams = request.nextUrl.searchParams.toString()
  const url = pathname + (searchParams ? `?${searchParams}` : "")

  // Перевіряємо, чи є параметр помилки в URL
  const hasErrorParam = searchParams.includes("__error")
  const errorDigest = searchParams.includes("digest") ? searchParams.split("digest=")[1]?.split("&")[0] : null

  // Якщо URL містить параметр помилки або відомий дайджест, повертаємо сторінку автоматичного очищення
  if (hasErrorParam || (errorDigest && knownSessionErrorDigests.includes(errorDigest))) {
    return new NextResponse(autoCleanupHtml, {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
      },
    })
  }

  // Add exceptions for API routes and webhooks
  // This will prevent redirects for webhook requests
  if (pathname.startsWith("/api/") || pathname.includes("/webhooks/") || pathname.startsWith("/app/api/")) {
    return NextResponse.next()
  }

  // Special handling for root path
  if (pathname === "/") {
    // Redirect to the default locale
    return NextResponse.redirect(new URL(`/${defaultLocale}`, request.url))
  }

  // Handle internationalization
  const response = intlMiddleware(request)

  // Check for protected routes
  if (pathname.includes("/profile") || pathname.includes("/admin")) {
    const sessionId = request.cookies.get("session_id")?.value

    if (!sessionId) {
      // Get locale from URL
      const locale = pathname.split("/")[1] || defaultLocale

      // Redirect to login page
      const redirectUrl = new URL(`/${locale}/auth/login`, request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Verify that the session exists in the database and is valid
    // This is important to catch cases where a user was deleted but still has a cookie
    try {
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
      const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_ANON_KEY!

      // Використовуємо спеціальний клієнт для middleware
      const supabase = createMiddlewareClient(supabaseUrl, supabaseKey)

      const { data: session, error } = await supabase
        .from("sessions")
        .select("id, user_id, expires_at")
        .eq("id", sessionId)
        .single()

      if (error || !session || new Date(session.expires_at) < new Date()) {
        // Session is invalid or expired, redirect to login
        const locale = pathname.split("/")[1] || defaultLocale
        const redirectUrl = new URL(`/${locale}/auth/login`, request.url)
        redirectUrl.searchParams.set("redirect", pathname)

        // Створюємо нову відповідь для видалення cookie
        const response = NextResponse.redirect(redirectUrl)

        // Видаляємо cookie безпечним способом
        response.cookies.set("session_id", "", {
          expires: new Date(0),
          path: "/",
        })

        return response
      }
    } catch (error) {
      console.error("Error verifying session in middleware:", error)

      // При помилці перевірки сесії, перенаправляємо на сторінку входу
      const locale = pathname.split("/")[1] || defaultLocale
      const redirectUrl = new URL(`/${locale}/auth/login`, request.url)
      redirectUrl.searchParams.set("redirect", pathname)
      redirectUrl.searchParams.set("error", "session_verification_failed")

      const response = NextResponse.redirect(redirectUrl)

      // Видаляємо cookie для безпеки
      response.cookies.set("session_id", "", {
        expires: new Date(0),
        path: "/",
      })

      return response
    }
  }

  return response
}

export const config = {
  // Update matcher to exclude API routes and webhooks
  matcher: [
    // Include all paths that don't start with api, _next, webhooks, or have a file extension
    "/((?!api|_next|webhooks|.*\\..*).*)",
    // Include root path
    "/",
  ],
}
