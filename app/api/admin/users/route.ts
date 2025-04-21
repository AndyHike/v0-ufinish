import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    // Fetch all users - remove phone from the select since it doesn't exist
    const { data: users, error } = await supabase
      .from("users")
      .select("id, email, name, role, created_at")
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

    return NextResponse.json(users || [])
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
