import type { SupabaseClient } from "@supabase/supabase-js"
import type { NextAuthOptions } from "next-auth"
import { createClient } from "@/lib/supabase"

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [],
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
      const supabase: SupabaseClient = createClient()

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
