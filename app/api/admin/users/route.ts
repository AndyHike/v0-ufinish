import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"

    const supabase = createClient()

    // Fetch users from the users table
    let usersQuery = supabase
      .from("users")
      .select("id, email, role, name, phone, created_at")
      .order(sortBy as any, { ascending: sortOrder === "asc" })

    // Apply search filter if query is provided
    if (query) {
      usersQuery = usersQuery.or(`email.ilike.%${query}%, name.ilike.%${query}%, phone.ilike.%${query}%`)
    }

    const { data: users, error } = await usersQuery

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(users)
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
