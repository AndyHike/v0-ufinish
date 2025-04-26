import { NextResponse } from "next/server"
import fs from "fs"
import path from "path"

export async function GET() {
  try {
    // Шлях до HTML-файлу
    const filePath = path.join(process.cwd(), "app", "clear-session.html")

    // Читаємо вміст файлу
    const htmlContent = fs.readFileSync(filePath, "utf8")

    // Повертаємо HTML-вміст
    return new NextResponse(htmlContent, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  } catch (error) {
    console.error("Error serving static HTML:", error)

    // Якщо виникла помилка, повертаємо простий HTML
    const fallbackHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Очищення сесії</title>
        <meta charset="utf-8">
      </head>
      <body>
        <h1>Очищення сесії</h1>
        <p>Виконується очищення сесії...</p>
        <script>
          // Очищаємо всі cookies
          document.cookie.split(';').forEach(function(c) {
            document.cookie = c.trim().split('=')[0] + '=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/;';
          });
          
          // Перенаправляємо на головну сторінку
          setTimeout(function() {
            window.location.href = '/';
          }, 2000);
        </script>
      </body>
      </html>
    `

    return new NextResponse(fallbackHtml, {
      headers: {
        "Content-Type": "text/html",
      },
    })
  }
}
