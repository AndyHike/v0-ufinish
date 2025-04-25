"use client"

import type React from "react"

import { useSession } from "next-auth/react"
import { useRouter, usePathname } from "next/navigation"
import { useEffect } from "react"

export function AuthGuard({
  children,
  requiredRole = null,
}: {
  children: React.ReactNode
  requiredRole?: string | null
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const pathname = usePathname()

  useEffect(() => {
    // Check if the user is authenticated
    if (status === "unauthenticated") {
      router.push(`/auth/signin?callbackUrl=${encodeURIComponent(pathname)}`)
      return
    }

    // Check if the user has the required role
    if (status === "authenticated" && requiredRole && session.user.role !== requiredRole) {
      router.push("/")
    }
  }, [status, session, router, pathname, requiredRole])

  // Show loading or children based on authentication status
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  if (status === "authenticated") {
    if (!requiredRole || session.user.role === requiredRole) {
      return <>{children}</>
    }
  }

  // Don't render anything while redirecting
  return null
}
