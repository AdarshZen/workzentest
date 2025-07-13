import { type NextRequest, NextResponse } from "next/server"
import { createTestQuestion, getTestQuestions } from "@/lib/db"
import { getAdminSession } from "@/lib/auth"

export async function GET(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    // Check admin authentication
    const admin = await getAdminSession()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!params.sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const questions = await getTestQuestions(params.sessionId)
    return NextResponse.json(questions)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    // Check admin authentication
    const admin = await getAdminSession()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (!params.sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const questionData = await request.json()

    // Validate required fields
    if (!questionData.questionText || !questionData.type || !questionData.points) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const question = await createTestQuestion(params.sessionId, questionData)
    return NextResponse.json(question)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to create question" }, { status: 500 })
  }
}
