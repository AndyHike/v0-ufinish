import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET() {
  try {
    const supabase = createClient()

    // Fetch users and join with profiles to get phone
    const { data: users, error } = await supabase
      .from("users")
      .select(`
        id, 
        email, 
        name, 
        role, 
        created_at,
        profiles!inner(phone)
      `)
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

    // Transform the data to flatten the structure
    const transformedUsers = users.map((user) => ({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      created_at: user.created_at,
      phone: user.profiles?.phone || null,
    }))

    return NextResponse.json(transformedUsers || [])
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
