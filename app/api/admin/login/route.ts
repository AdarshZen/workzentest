import { type NextRequest, NextResponse } from "next/server"
import { validateAdminCredentials } from "@/app/actions"

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const admin = await validateAdminCredentials(email, password)

    if (!admin) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 })
    }

    // Set session cookie
    const response = NextResponse.json({
      success: true,
      admin: { 
        id: admin.id,
        email: admin.email, 
        name: admin.name,
        role: admin.role 
      },
    })

    response.cookies.set("admin-session", JSON.stringify(admin), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/"
    })

    return response
  } catch (error) {
    console.error("Admin login error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
