"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const router = useRouter()

  // Перевіряємо, чи це помилка cookies
  const isCookieError = error.message?.includes("Cookies can only be modified") || error.digest === "3725655055"

  useEffect(() => {
    // Логуємо помилку для діагностики
    console.error("Application error:", error)
  }, [error])

  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Щось пішло не так</CardTitle>
          <CardDescription>Виникла помилка при обробці вашого запиту</CardDescription>
        </CardHeader>
        <CardContent>
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Помилка</AlertTitle>
            <AlertDescription>
              {isCookieError
                ? "Виникла проблема з вашою сесією. Спробуйте очистити сесію або увійти знову."
                : error.message || "Невідома помилка"}
            </AlertDescription>
          </Alert>
        </CardContent>
        <CardFooter className="flex justify-between">
          <Button variant="outline" onClick={() => router.push("/")}>
            На головну
          </Button>
          {isCookieError ? (
            <Button onClick={() => router.push("/uk/auth/reset-session")} variant="default">
              Очистити сесію
            </Button>
          ) : (
            <Button onClick={reset} variant="default">
              Спробувати ще раз
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  )
}
