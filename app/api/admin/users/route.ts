import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Fetch all users
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, name, phone, role, created_at")
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json(
        {
          error: "Failed to fetch users",
          details: error.message,
        },
        { status: 500 },
      )
    }

    return NextResponse.json({ users: users || [] })
  } catch (error) {
    console.error("Unexpected error fetching users:", error)
    return NextResponse.json(
      {
        error: "An unexpected error occurred",
      },
      { status: 500 },
    )
  }
}
