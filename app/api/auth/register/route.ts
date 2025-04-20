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
    if (email === "admin@example.com" || email === "user@example.com") {
      return NextResponse.json({ message: "Email already in use" }, { status: 409 })
    }

    // In a real app, you would hash the password and save the user to a database
    // For this example, we'll just return a success response
    return NextResponse.json({ message: "User registered successfully" }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ message: "Internal server error" }, { status: 500 })
  }
}
