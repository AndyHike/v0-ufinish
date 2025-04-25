"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function AuthError() {
  const searchParams = useSearchParams()
  const error = searchParams.get("error")

  let errorMessage = "An error occurred during authentication"

  if (error === "CredentialsSignin") {
    errorMessage = "Invalid email or password"
  } else if (error === "AccessDenied") {
    errorMessage = "You do not have permission to access this resource"
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-md dark:bg-gray-800">
        <h1 className="text-2xl font-bold text-center text-red-600 dark:text-red-400">Authentication Error</h1>
        <p className="text-center">{errorMessage}</p>
        <div className="flex justify-center">
          <Button asChild>
            <Link href="/auth/signin">Try Again</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
