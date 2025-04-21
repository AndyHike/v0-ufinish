import { type NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase"

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()
    const searchParams = request.nextUrl.searchParams
    const search = searchParams.get("search") || ""
    const sortBy = searchParams.get("sortBy") || "created_at"
    const sortOrder = searchParams.get("sortOrder") || "desc"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const offset = (page - 1) * limit

    // First, get users
    let query = supabase.from("users").select("*", { count: "exact" })

    // Add search if provided
    if (search) {
      query = query.or(`email.ilike.%${search}%, name.ilike.%${search}%, phone.ilike.%${search}%`)
    }

    // Add sorting
    query = query.order(sortBy as any, { ascending: sortOrder === "asc" })

    // Add pagination
    query = query.range(offset, offset + limit - 1)

    const { data: users, count, error } = await query

    if (error) {
      console.error("Error fetching users:", error)
      return NextResponse.json({ error: "Failed to fetch users" }, { status: 500 })
    }

    // If we have users, get their profiles
    if (users && users.length > 0) {
      const userIds = users.map((user) => user.id)

      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .in("user_id", userIds)

      if (profilesError) {
        console.error("Error fetching profiles:", profilesError)
        // Continue without profiles
      } else if (profiles) {
        // Merge profiles with users
        const profilesByUserId = profiles.reduce(
          (acc, profile) => {
            acc[profile.user_id] = profile
            return acc
          },
          {} as Record<string, any>,
        )

        // Add profiles to users
        users.forEach((user) => {
          user.profiles = profilesByUserId[user.id] || null
        })
      }
    }

    return NextResponse.json({
      users,
      pagination: {
        total: count || 0,
        page,
        limit,
        totalPages: count ? Math.ceil(count / limit) : 0,
      },
    })
  } catch (error) {
    console.error("Error in users API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
