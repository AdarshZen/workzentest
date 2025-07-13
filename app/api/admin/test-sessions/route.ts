import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@vercel/postgres"
import { getAdminSession } from "../../../../lib/auth"

interface Question {
  type: string
  question: string
  options?: string[]
  correctAnswer?: string
  points: number
  order?: number
  languages?: string[]
  templateCode?: string
  testCases?: any[]
}

export async function GET(request: NextRequest) {
  try {
    // Check admin authentication
    const { user } = await getAdminSession(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const result = await sql`
      SELECT 
        ts.*,
        COUNT(c.id) as candidate_count,
        COUNT(CASE WHEN c.has_completed = true THEN 1 END) as completed_count
      FROM test_sessions ts
      LEFT JOIN candidates c ON ts.id = c.test_session_id
      GROUP BY ts.id
      ORDER BY ts.created_at DESC
    `
    
    return NextResponse.json(result.rows)
  } catch (error) {
    console.error("Database error:", error)
    return NextResponse.json({ error: "Failed to fetch test sessions" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const client = await sql.connect()
  
  try {
    // Check admin authentication
    const { user } = await getAdminSession(request)
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const data = await request.json()
    console.log('Raw request data:', data);
    const { test_name, company_name, duration, instructions, test_type, questions } = data
    
    // Determine test type based on provided test_type or questions
    let testType = test_type || 'mixed'
    
    // If no test_type was provided, determine it from questions
    if (!test_type && questions && questions.length > 0) {
      const types = new Set(questions.map((q: Question) => q.type))
      if (types.size === 1) {
        testType = questions[0].type
      }
    }

    // Validate required fields and log detailed information
    console.log('Received data:', { test_name, company_name, duration, testType, questionsCount: questions?.length });
    
    // Ensure testType is set to a valid value
    if (!testType) {
      testType = questions && questions.length > 0 ? 'mixed' : 'mcq';
    }
    
    const missingFields = [];
    if (!test_name) missingFields.push('test_name');
    if (!company_name) missingFields.push('company_name');
    if (!duration) missingFields.push('duration');
    
    if (missingFields.length > 0) {
      console.error('Validation error - missing fields:', missingFields);
      
      return NextResponse.json(
        { error: `Test name, company name, and duration are required. Missing: ${missingFields.join(', ')}` },
        { status: 400 }
      );
    }
    
    // Ensure user is available for created_by field
    if (!user || !user.email) {
      console.error('Validation error - missing user email for created_by field');
      return NextResponse.json(
        { error: 'User information is required to create a test' },
        { status: 400 }
      );
    }

    // Start transaction
    await client.query('BEGIN')

    try {
      // Create test session
      const sessionResult = await client.query(
        `INSERT INTO test_sessions (
          test_name, 
          company_name, 
          duration, 
          instructions,
          test_type,
          created_by,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
        RETURNING *`,
        [test_name, company_name, duration, instructions, testType, user.email]
      )
      
      const testSession = sessionResult.rows[0]

      // Insert questions if provided
      if (Array.isArray(questions) && questions.length > 0) {
        for (const [index, question] of questions.entries()) {
          await client.query(
            `INSERT INTO questions (
              test_session_id,
              question_text,
              question_type,
              options,
              correct_answer,
              points,
              order_num,
              languages,
              template_code,
              test_cases,
              created_at,
              updated_at
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())`,
            [
              testSession.id,
              question.question_text,
              question.question_type,
              // Ensure options is properly stringified if it's not already a string
              typeof question.options === 'string' ? question.options : JSON.stringify(question.options),
              question.correct_answer || null,
              question.points || 1,
              index + 1,
              // Ensure languages is properly stringified if it's not already a string
              typeof question.languages === 'string' ? question.languages : JSON.stringify(question.languages),
              question.template_code || null,
              // Ensure test_cases is properly stringified if it's not already a string
              typeof question.test_cases === 'string' ? question.test_cases : JSON.stringify(question.test_cases)
            ]
          )
        }
      }

      // Commit transaction
      await client.query('COMMIT')
      
      // Fetch the complete test session with questions
      const completeSession = await getCompleteTestSession(testSession.id)
      
      return NextResponse.json(completeSession, { status: 201 })
    } catch (error) {
      // Rollback transaction on error
      await client.query('ROLLBACK')
      throw error
    }
  } catch (error) {
    console.error("Error creating test session:", error)
    
    // Provide more detailed error information
    let errorMessage = "Failed to create test session";
    let statusCode = 500;
    
    if (error instanceof Error) {
      errorMessage = `${errorMessage}: ${error.message}`;
      
      // Check for specific database errors
      const pgError = error as any;
      if (pgError.code) {
        console.error('PostgreSQL error code:', pgError.code);
        console.error('PostgreSQL error detail:', pgError.detail);
        
        // Handle specific PostgreSQL error codes
        if (pgError.code === '23502') { // not_null_violation
          errorMessage = `Required field missing: ${pgError.column || 'unknown field'}`;
          statusCode = 400;
        } else if (pgError.code === '23505') { // unique_violation
          errorMessage = `Duplicate entry: ${pgError.detail || 'A record with this data already exists'}`;
          statusCode = 409;
        } else if (pgError.code === '42703') { // undefined_column
          errorMessage = `Database schema error: ${pgError.message || 'Column does not exist'}`;
          statusCode = 500;
        }
      }
    }
    
    return NextResponse.json(
      { error: errorMessage },
      { status: statusCode }
    )
  } finally {
    client.release()
  }
}

async function getCompleteTestSession(sessionId: string) {
  const sessionResult = await sql`
    SELECT * FROM test_sessions WHERE id = ${sessionId} LIMIT 1
  `
  
  if (sessionResult.rowCount === 0) {
    throw new Error('Test session not found')
  }
  
  const questionsResult = await sql`
    SELECT * FROM questions 
    WHERE test_session_id = ${sessionId}
    ORDER BY order_num ASC
  `
  
  return {
    ...sessionResult.rows[0],
    questions: questionsResult.rows.map(q => {
      // Safely parse JSON fields or use as-is if already parsed
      let options = q.options;
      let testCases = q.test_cases;
      let languages = q.languages;
      
      // Check if options is a string and needs parsing
      if (typeof q.options === 'string') {
        try {
          options = JSON.parse(q.options);
        } catch (error) {
          console.error('Error parsing options JSON:', error);
          options = null;
        }
      }
      
      // Check if test_cases is a string and needs parsing
      if (typeof q.test_cases === 'string') {
        try {
          testCases = JSON.parse(q.test_cases);
        } catch (error) {
          console.error('Error parsing test_cases JSON:', error);
          testCases = null;
        }
      }
      
      // Check if languages is a string and needs parsing
      if (typeof q.languages === 'string') {
        try {
          languages = JSON.parse(q.languages);
        } catch (error) {
          console.error('Error parsing languages JSON:', error);
          languages = [];
        }
      }
      
      return {
        ...q,
        options: options,
        testCases: testCases,
        languages: languages
      };
    })
  }
}
