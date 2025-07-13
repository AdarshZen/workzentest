import { type NextRequest, NextResponse } from "next/server"
import { getCandidate, createCandidate, getTestSession } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const body = await request.json()
    const { email, name } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!params.sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Check if test session exists and is active
    const session = await getTestSession(params.sessionId)
    if (!session) {
      return NextResponse.json({ error: "Test session not found or inactive" }, { status: 404 })
    }

    // Check if candidate already exists
    let candidate = await getCandidate(email, params.sessionId)

    if (!candidate) {
      // Create new candidate
      candidate = await createCandidate(email, params.sessionId, name)
    }

    // Check if candidate has already completed the test
    if (candidate.has_completed) {
      return NextResponse.json({ error: "Test already completed" }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      candidate: {
        id: candidate.id,
        email: candidate.email,
        name: candidate.name,
        hasStarted: candidate.has_started,
      },
    })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to process login" }, { status: 500 })
  }
}
