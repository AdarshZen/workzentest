import { NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';

export async function POST(request: Request) {
  try {
    const { email, testSessionId } = await request.json();

    // Validate input
    if (!email || !testSessionId) {
      return NextResponse.json(
        { error: 'Email and test session ID are required' },
        { status: 400 }
      );
    }

    // Verify test session exists and is active
    const sessionResult = await query(
      `SELECT id, is_active 
       FROM test_sessions 
       WHERE id = $1 
       AND is_active = true`,
      [testSessionId]
    );

    if (sessionResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Test session not found or inactive' },
        { status: 404 }
      );
    }

    // Verify candidate has access to this test session
    const candidateResult = await query(
      `SELECT id, name, email, status, token, has_started, has_completed
       FROM candidates 
       WHERE email = $1
       AND test_session_id = $2
       LIMIT 1`,
      [email.toLowerCase(), testSessionId]
    );

    if (candidateResult.rowCount === 0) {
      // If candidate doesn't exist, create a new one
      const token = uuidv4();
      
      const createResult = await query(
        `INSERT INTO candidates
         (name, email, test_session_id, status, token, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
         RETURNING id, name, email, status, token`,
        [email.split('@')[0], email.toLowerCase(), testSessionId, 'registered', token]
      );
      
      if (createResult.rowCount === 0) {
        return NextResponse.json(
          { error: 'Failed to register candidate' },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        candidateId: createResult.rows[0].id,
        token,
        message: 'Access granted'
      });
    }

    const candidate = candidateResult.rows[0];

    // Check if candidate has already completed the test
    if (candidate.has_completed || candidate.status === 'completed') {
      return NextResponse.json(
        { error: 'You have already completed this test' },
        { status: 403 }
      );
    }

    // Generate a new token for this session if not exists
    const token = candidate.token || uuidv4();
    
    // Update candidate with token and updated time
    await query(
      `UPDATE candidates
       SET 
         token = $1,
         updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [token, candidate.id]
    );

    return NextResponse.json({
      success: true,
      candidateId: candidate.id,
      token,
      message: 'Access granted'
    });

  } catch (error) {
    console.error('Error verifying candidate access:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
