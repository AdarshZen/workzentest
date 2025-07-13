import { type NextRequest, NextResponse } from "next/server"
import { getTestResults } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const admin = await getAdminSession()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")

    const results = await getTestResults(sessionId || undefined)
    return NextResponse.json(results)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch results" }, { status: 500 })
  }
}
