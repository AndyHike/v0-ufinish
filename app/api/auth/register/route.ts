import { NextResponse } from "next/server"

// In a real app, this would save to a database
export async function POST(request: Request) {
  try {
    const { name, email, password } = await request.json()

    // Validate input
    if (!name || !email || !password) {
      return NextResponse.json({ message: "Missing required fields" }, { status: 400 })
    }

    // Check if email is already in use (mock implementation)
    // For testing purposes, let's allow all emails to register
    // In a real app, you would check against a database

    // Mock successful registration
    return NextResponse.json(
      {
        message: "User registered successfully",
        user: { name, email, id: Math.random().toString(36).substring(2, 15) },
      },
      { status: 201 },
    )
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
