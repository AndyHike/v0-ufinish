"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import Link from "next/link"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    // Логуємо помилку для діагностики
    console.error("Application error:", error)
  }, [error])

  const clearSession = async () => {
    try {
      // Очищаємо сесію через API
      await fetch("/api/auth/clear-session")

      // Перезавантажуємо сторінку
      window.location.reload()
    } catch (e) {
      console.error("Failed to clear session:", e)
      // Якщо API не працює, очищаємо cookie вручну через JavaScript
      document.cookie = "session_id=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
      window.location.reload()
    }
  }

  return (
    <div className="container flex items-center justify-center min-h-[70vh] py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Виникла помилка</CardTitle>
          <CardDescription>
            Сталася помилка при завантаженні сторінки. Спробуйте наступні дії для вирішення проблеми.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Помилка сервера</AlertTitle>
            <AlertDescription>
              Виникла помилка при завантаженні даних. Спробуйте очистити сесію або перезавантажити сторінку.
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
          <Button className="w-full" asChild variant="ghost">
            <Link href="/">На головну сторінку</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
