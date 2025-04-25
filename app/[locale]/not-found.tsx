import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"

export default function NotFound() {
  return (
    <div className="container flex items-center justify-center min-h-screen py-12">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Сторінку не знайдено</CardTitle>
          <CardDescription>Сторінка, яку ви шукаєте, не існує або була переміщена.</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">
            Якщо ви вважаєте, що це помилка, спробуйте очистити сесію або зверніться до адміністратора.
          </p>
        </CardContent>
        <CardFooter className="flex flex-col space-y-2">
          <Button className="w-full" asChild>
            <Link href="/">На головну сторінку</Link>
          </Button>
          <Button className="w-full" variant="outline" asChild>
            <Link href="/clear-session">Очистити сесію</Link>
          </Button>
        </CardFooter>
      </Card>
    </div>
  )
}
