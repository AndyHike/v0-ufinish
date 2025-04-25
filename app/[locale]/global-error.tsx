"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Логуємо помилку для діагностики
    console.error("Global application error:", error)
  }, [error])

  const clearSession = async () => {
    try {
      // Очищаємо сесію через JavaScript (API може бути недоступним при глобальній помилці)
      document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"

      // Перезавантажуємо сторінку
      window.location.href = "/"
    } catch (e) {
      console.error("Failed to clear session:", e)
      // Якщо не вдалося очистити сесію, перенаправляємо на спеціальну сторінку
      window.location.href = "/uk/clear-session"
    }
  }

  return (
    <html>
      <body>
        <div className="container flex items-center justify-center min-h-screen py-12">
          <Card className="w-full max-w-md">
            <CardHeader>
              <CardTitle>Критична помилка</CardTitle>
              <CardDescription>
                Сталася критична помилка при завантаженні додатку. Спробуйте наступні дії для вирішення проблеми.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Помилка додатку</AlertTitle>
                <AlertDescription>
                  Виникла критична помилка при завантаженні додатку. Спробуйте очистити сесію або перезавантажити
                  сторінку.
                  {error.digest && <div className="mt-2 text-xs">Код помилки: {error.digest}</div>}
                </AlertDescription>
              </Alert>
            </CardContent>
            <CardFooter className="flex flex-col space-y-2">
              <Button className="w-full" onClick={clearSession} variant="default">
                Очистити сесію і перезавантажити
              </Button>
              <Button className="w-full" onClick={() => reset()} variant="outline">
                Спробувати ще раз
              </Button>
              <Button className="w-full" onClick={() => (window.location.href = "/uk/clear-session")} variant="ghost">
                Перейти на сторінку очищення сесії
              </Button>
            </CardFooter>
          </Card>
        </div>
      </body>
    </html>
  )
}
