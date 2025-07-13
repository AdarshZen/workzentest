import { type NextRequest, NextResponse } from "next/server"
import { getCandidate, submitTestResults } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const body = await request.json()
    const { candidateEmail, answers, timeSpent, proctoringData } = body

    if (!candidateEmail) {
      return NextResponse.json({ error: "Candidate email is required" }, { status: 400 })
    }

    if (!params.sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    // Get candidate
    const candidate = await getCandidate(candidateEmail, params.sessionId)
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found" }, { status: 404 })
    }

    // Submit test results
    await submitTestResults(candidate.id, answers || {}, proctoringData || {})

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to submit test results" }, { status: 500 })
  }
}
