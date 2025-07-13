import { type NextRequest, NextResponse } from "next/server"
import { getCandidate, updateCandidateStart } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!params.sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Get candidate
    const candidate = await getCandidate(email, params.sessionId)
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    // Update candidate start time if not already started
    if (!candidate.has_started) {
      await updateCandidateStart(candidate.id)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to start test" }, { status: 500 })
  }
}
