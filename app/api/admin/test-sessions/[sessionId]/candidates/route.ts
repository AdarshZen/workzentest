import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

interface CandidateResponse {
  id: string;
  name: string;
  email: string;
  phone: string;
  status: string;
  startTime: string | null;
  endTime: string | null;
  createdAt: string;
  score: {
    correct: number;
    total: number;
    percentage: number;
  };
}

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Ensure params is properly awaited
    const { sessionId } = await Promise.resolve(params)

    // Verify test session exists
    const sessionCheck = await sql`
      SELECT id FROM test_sessions WHERE id = ${sessionId} LIMIT 1
    `
    if (sessionCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      )
    }

    // Get all candidates for this test session
    const result = await sql`
      SELECT 
        c.id,
        c.name,
        c.email,
        c.phone,
        c.status,
        c.start_time,
        c.end_time,
        c.created_at,
        (
          SELECT COUNT(*) 
          FROM candidate_answers ca
          JOIN questions q ON ca.question_id = q.id
          WHERE ca.candidate_id = c.id 
          AND ca.is_correct = true
          AND q.test_session_id = c.test_session_id
        ) as correct_answers,
        (
          SELECT COUNT(*) 
          FROM questions q 
          WHERE q.test_session_id = c.test_session_id
        ) as total_questions
      FROM candidates c
      WHERE c.test_session_id = ${sessionId}
      ORDER BY c.created_at DESC
    `

    const candidates: CandidateResponse[] = result.rows.map((row: any) => ({
      id: row.id,
      name: row.name || '',
      email: row.email || '',
      phone: row.phone || '',
      status: row.status || 'invited',
      startTime: row.start_time,
      endTime: row.end_time,
      createdAt: row.created_at,
      score: {
        correct: Number(row.correct_answers) || 0,
        total: Number(row.total_questions) || 0,
        percentage: row.total_questions 
          ? Math.round((Number(row.correct_answers) / Number(row.total_questions)) * 100) 
          : 0
      }
    }))

    return NextResponse.json(candidates)
  } catch (error) {
    console.error('Error fetching candidates:', error)
    return NextResponse.json(
      { error: 'Failed to fetch candidates' },
      { status: 500 }
    )
  }
}

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params
    const { name, email, phone } = await request.json()

    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if test session exists
    const sessionCheck = await sql`
      SELECT id FROM test_sessions WHERE id = ${sessionId} LIMIT 1
    `
    if (sessionCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      )
    }

    // Check if candidate already exists
    const existingCandidate = await sql`
      SELECT id FROM candidates 
      WHERE test_session_id = ${sessionId} AND email = ${email.toLowerCase()}
      LIMIT 1
    `

    if (existingCandidate.rowCount && existingCandidate.rowCount > 0) {
      return NextResponse.json(
        { error: 'A candidate with this email already exists in this test session' },
        { status: 409 }
      )
    }

    // Create new candidate
    const result = await sql`
      INSERT INTO candidates (
        test_session_id,
        name,
        email,
        phone,
        status,
        created_at,
        updated_at
      ) VALUES (
        ${sessionId},
        ${name},
        ${email.toLowerCase()},
        ${phone || null},
        'invited',
        NOW(),
        NOW()
      )
      RETURNING id, name, email, phone, status
    `

    return NextResponse.json(result.rows[0], { status: 201 })
  } catch (error) {
    console.error('Error creating candidate:', error)
    return NextResponse.json(
      { error: 'Failed to create candidate' },
      { status: 500 }
    )
  }
}
