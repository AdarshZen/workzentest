import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    
    const { email, startTime } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Verify the candidate is registered for this session
    const candidateCheck = await query(
      `UPDATE candidates
       SET 
         status = 'in_progress',
         start_time = $1,
         has_started = TRUE,
         updated_at = CURRENT_TIMESTAMP
       WHERE email = $2
       AND test_session_id = $3
       RETURNING id, name, email, status, token`,
      [startTime || new Date().toISOString(), email.toLowerCase(), sessionId]
    )

    if (candidateCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Candidate not found for this test session' },
        { status: 404 }
      )
    }

    // Update test session metrics if needed
    await query(
      `UPDATE test_sessions
       SET 
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $1`,
      [sessionId]
    )

    return NextResponse.json({
      success: true,
      message: 'Test started successfully',
      data: {
        candidate: candidateCheck.rows[0],
        startedAt: new Date().toISOString()
      },
      token: candidateCheck.rows[0]?.token || null
    })

  } catch (error) {
    console.error('Error starting test:', error)
    return NextResponse.json(
      { error: 'Failed to start test' },
      { status: 500 }
    )
  }
}
