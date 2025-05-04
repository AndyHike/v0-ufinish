import NextAuth from "next-auth"
import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { createClient } from "@/lib/supabase"
import { verifyPassword } from "@/lib/auth/utils"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
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

        const supabase = createClient()

        const { data, error } = await supabase
          .from("users")
          .select("id, email, role, password_hash")
          .eq("email", credentials.email.toLowerCase())
          .single()

        if (error || !data) {
          return null
        }

        const isPasswordValid = await verifyPassword(credentials.password, data.password_hash)

        if (!isPasswordValid) {
          return null
        }

        return {
          id: data.id,
          email: data.email,
          role: data.role,
        }
      },
    }),
  ],
  callbacks: {
    async session({ session, token }) {
      if (token) {
        session.user = session.user || {}
        session.user.id = token.sub as string
        session.user.role = token.role as string
      }
      return session
    },
    async jwt({ token }) {
      const supabase = createClient()

      const { data: userData } = await supabase.from("users").select("role").eq("id", token.sub).single()

      if (userData) {
        token.role = userData.role
      }

      return token
    },
  },
  pages: {
    signIn: "/auth/signin",
  },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
