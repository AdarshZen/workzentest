import { query } from '@/lib/db'
import { v4 as uuidv4 } from 'uuid'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId
    
    // Get email from request body
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Verify the test session exists and is active
    const sessionCheck = await query(
      `SELECT 
         id, 
         test_name AS title, 
         duration, 
         company_name, 
         instructions,
         test_type,
         is_active
       FROM test_sessions
       WHERE id = $1 
       AND is_active = true
       LIMIT 1`,
      [sessionId]
    )

    if (sessionCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Test session not found, inactive, or expired' },
        { status: 404 }
      )
    }

    // Verify email is registered for this session
    const candidateCheck = await query(
      `SELECT id, name, email, status, token
       FROM candidates
       WHERE email = $1
       AND test_session_id = $2
       LIMIT 1`,
      [email.toLowerCase(), sessionId]
    )

    let candidate;
    
    if (candidateCheck.rowCount === 0) {
      // If candidate doesn't exist, create a new one
      const token = uuidv4();
      
      const createResult = await query(
        `INSERT INTO candidates
         (name, email, test_session_id, status, token, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, status, token`,
        [email.split('@')[0], email.toLowerCase(), sessionId, 'registered', token]
      );
      
      if (createResult.rowCount === 0) {
        return NextResponse.json(
          { error: 'Failed to register candidate' },
          { status: 500 }
        );
      }
      
      candidate = createResult.rows[0];
    } else {
      candidate = candidateCheck.rows[0];
      
      // If token doesn't exist, generate one
      if (!candidate.token) {
        const token = uuidv4();
        await query(
          `UPDATE candidates 
           SET token = $1, updated_at = CURRENT_TIMESTAMP 
           WHERE id = $2`,
          [token, candidate.id]
        );
        candidate.token = token;
      }
    }
    
    const testSession = sessionCheck.rows[0]

    return NextResponse.json({
      success: true,
      testSession: {
        id: testSession.id,
        testName: testSession.title,
        companyName: testSession.company_name,
        duration: testSession.duration,
        instructions: testSession.instructions,
        testType: testSession.test_type,
        isActive: testSession.is_active
      },
      candidate: {
        id: candidate.id,
        name: candidate.name,
        email: candidate.email,
        status: candidate.status
      },
      candidateId: candidate.id,
      token: candidate.token
    })

  } catch (error) {
    console.error('Error verifying email:', error)
    return NextResponse.json(
      { error: 'Failed to verify email' },
      { status: 500 }
    )
  }
}
