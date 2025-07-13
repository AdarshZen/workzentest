import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  try {
    // Get the admin session from cookies
    const sessionCookie = request.cookies.get('admin-session')
    
    if (!sessionCookie || !sessionCookie.value) {
      return NextResponse.json({ error: "Unauthorized - No session found" }, { status: 401 })
    }

    try {
      // Parse the session cookie value
      const user = JSON.parse(sessionCookie.value)
      
      if (!user || !user.id || !user.email || user.role !== 'admin') {
        return NextResponse.json({ error: "Forbidden - Admin access required" }, { status: 403 })
      }
      
      // Return the user info without sensitive data
      return NextResponse.json({
        authenticated: true,
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      })
    } catch (error) {
      console.error('Error parsing admin session:', error)
      return NextResponse.json({ error: "Unauthorized - Invalid session" }, { status: 401 })
    }
  } catch (error) {
    console.error("Auth check error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
