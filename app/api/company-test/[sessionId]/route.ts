import { type NextRequest, NextResponse } from "next/server"
import { getTestSession, getTestQuestions } from "@/lib/db"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  const { sessionId } = await params;
  
  try {
    if (!sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const session = await getTestSession(sessionId)

    if (!session) {
      return NextResponse.json({ error: "Test session not found or inactive" }, { status: 404 })
    }

    const questions = await getTestQuestions(sessionId)

    return NextResponse.json({
      session,
      questions,
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to load test session" }, { status: 500 })
  }
}
