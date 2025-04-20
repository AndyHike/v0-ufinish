"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"

interface SignInFormProps {
  children: React.ReactNode
  action: (formData: FormData) => Promise<{ error?: string } | undefined>
}

export default function SignInForm({ children, action }: SignInFormProps) {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData(e.currentTarget)
      const result = await action(formData)

      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // If no error, the redirect will happen automatically
    } catch (err) {
      // NEXT_REDIRECT errors should not be caught here
      // as they're part of the normal redirect flow
      if (!(err instanceof Error) || !err.message.includes("NEXT_REDIRECT")) {
        setError("An unexpected error occurred")
        console.error("Sign in error:", err)
      }
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="mt-8 space-y-6">
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="flex">
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">{error}</h3>
            </div>
          </div>
        </div>
      )}
      {children}
      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex w-full justify-center rounded-md border border-transparent bg-blue-600 py-2 px-4 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-400"
        >
          {isLoading ? "Signing in..." : "Sign in"}
        </button>
      </div>
    </form>
  )
}
