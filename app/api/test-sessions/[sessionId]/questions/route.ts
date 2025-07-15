import { query } from "@/lib/db"
import { NextResponse } from "next/server"

export async function GET(
  request: Request, 
  { params }: { params: { sessionId: string } }
) {
  try {
    // Await the params object before destructuring
    const { sessionId } = await params

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
      
      console.log('Processing question:', question.id, 'Type:', question.question_type);
      console.log('Raw options:', question.options);
      console.log('Options type:', typeof question.options);
      
      // Handle JSONB options field for multiple choice questions
      if ((question.question_type === 'multiple_choice' || question.question_type === 'mcq') && question.options) {
        try {
          if (typeof question.options === "string") {
            // Try to parse as JSON string
            console.log('Parsing options as string');
            parsedOptions = JSON.parse(question.options);
            console.log('Parsed string options:', parsedOptions);
          } else if (Array.isArray(question.options)) {
            // If it's already an array, use it directly
            console.log('Using options as array directly');
            parsedOptions = question.options;
          } else if (typeof question.options === "object") {
            // If it's an object, convert to array of {id, text} objects
            console.log('Converting object options to array');
            parsedOptions = Object.entries(question.options).map(([key, value]) => ({
              id: key,
              text: value
            }));
          }
          
          // Ensure parsedOptions is an array
          if (!Array.isArray(parsedOptions)) {
            console.warn("Parsed options is not an array:", parsedOptions);
            parsedOptions = [];
          } else {
            console.log('Final parsed options:', parsedOptions);
          }
        } catch (error) {
          console.error("Error parsing options for question:", question.id, error, question.options);
          parsedOptions = [];
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

      // Ensure options are properly set in the return object
      return {
        id: question.id,
        question_text: question.question_text,
        question_type: question.question_type,
        options: parsedOptions.length > 0 ? parsedOptions : question.options || [],
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
