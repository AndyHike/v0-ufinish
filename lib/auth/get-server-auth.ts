import { getServerSession } from "next-auth/next"
import { redirect } from "next/navigation"
import { authOptions } from "@/app/api/auth/[...nextauth]/route"

export async function getServerAuth(requiredRole?: string) {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/signin")
  }

  if (requiredRole && session.user.role !== requiredRole) {
    redirect("/")
  }

  return session
}
