import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    console.log("Login route called")
    const { username, password } = await request.json()
    console.log("Received credentials:", { username, password })

    if (!username || !password) {
      console.log("Missing credentials")
      return NextResponse.json({ message: "Username and password are required" }, { status: 400 })
    }

    // Encode credentials in base64 for Basic auth
    const credentials = Buffer.from(`${username}:${password}`).toString("base64")
    console.log("Generated token:", credentials)

    // Since the API doesn't require authentication, we'll simulate a successful login
    // In a real scenario, you would validate credentials against Django's user system
    console.log("Login successful, returning response")
    
    const response = {
      token: credentials,
      user: {
        username,
        is_superuser: true,
      },
    }
    
    console.log("Response:", response)
    return NextResponse.json(response)
  } catch (error) {
    console.error("[v0] Login error:", error)
    return NextResponse.json({ message: "An error occurred during login" }, { status: 500 })
  }
}
