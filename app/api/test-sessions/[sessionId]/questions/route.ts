import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request, 
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    // Verify the test session exists and is active
    const sessionCheck = await query(
      `SELECT id, is_active 
       FROM test_sessions 
       WHERE id = $1 AND is_active = true
       LIMIT 1`,
      [sessionId],
    )

    if (sessionCheck.rowCount === 0) {
      return NextResponse.json({ error: "Test session not found or not active" }, { status: 404 })
    }

    // Get questions for this test session
    const questionsResult = await query(
      `SELECT 
        id, 
        question_text, 
        question_type, 
        options,
        order_num,
        points,
        template_code,
        test_cases,
        languages
      FROM questions
      WHERE test_session_id = $1
      ORDER BY order_num ASC`,
      [sessionId],
    )

    // Format questions with proper options parsing
    const questions = questionsResult.rows.map((question) => {
      let parsedOptions = []

      // Handle JSONB options field
      if (question.options) {
        try {
          if (typeof question.options === "string") {
            parsedOptions = JSON.parse(question.options)
          } else if (Array.isArray(question.options)) {
            parsedOptions = question.options
          } else if (typeof question.options === "object") {
            // If it's already a parsed object, convert to array
            parsedOptions = Object.values(question.options)
          }
        } catch (error) {
          console.error("Error parsing options for question:", question.id, error)
          parsedOptions = []
        }
      }

      // Parse test cases if they exist
      let parsedTestCases = []
      if (question.test_cases) {
        try {
          if (typeof question.test_cases === "string") {
            parsedTestCases = JSON.parse(question.test_cases)
          } else if (Array.isArray(question.test_cases)) {
            parsedTestCases = question.test_cases
          }
        } catch (error) {
          console.error("Error parsing test cases for question:", question.id, error)
          parsedTestCases = []
        }
      }

      // Parse languages if they exist
      let parsedLanguages = []
      if (question.languages) {
        try {
          if (typeof question.languages === "string") {
            parsedLanguages = JSON.parse(question.languages)
          } else if (Array.isArray(question.languages)) {
            parsedLanguages = question.languages
          }
        } catch (error) {
          console.error("Error parsing languages for question:", question.id, error)
          parsedLanguages = ["javascript"] // default
        }
      }

      return {
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        options: parsedOptions,
        order_num: question.order_num,
        points: question.points || 1,
        template_code: question.template_code || "",
        test_cases: parsedTestCases,
        language: parsedLanguages.length > 0 ? parsedLanguages[0] : "javascript",
      }
    })

    return NextResponse.json({ questions })
  } catch (error) {
    console.error("Error fetching questions:", error)
    return NextResponse.json({ error: "Failed to fetch questions" }, { status: 500 })
  }
}
