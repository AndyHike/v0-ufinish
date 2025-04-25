import NextAuth from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { verifyPassword } from "@/utils/auth"
import { createClient } from "@/lib/supabase"
import type { NextAuthOptions } from "next-auth"

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const supabase = createClient()

          // Get user by email
          const { data: userData, error: userError } = await supabase
            .from("users")
            .select("id, email, password_hash, role")
            .eq("email", credentials.email.toLowerCase())
            .maybeSingle()

          if (userError || !userData) {
            console.error("User not found:", userError)
            return null
          }

          // Verify password
          const isPasswordValid = await verifyPassword(credentials.password, userData.password_hash)

          if (!isPasswordValid) {
            console.error("Invalid password")
            return null
          }

          // Return user data
          return {
            id: userData.id,
            email: userData.email,
            role: userData.role,
          }
        } catch (error) {
          console.error("Authorization error:", error)
          return null
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          role: token.role as string,
        }
      }
      return session
    },
  },
  pages: {
    signIn: "/auth/signin",
    error: "/auth/error",
  },
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === "development",
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
