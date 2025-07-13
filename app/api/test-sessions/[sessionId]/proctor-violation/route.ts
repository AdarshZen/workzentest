import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = await Promise.resolve(params);
    const { violations, email, timestamp } = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    if (!email && !token) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Find candidate id
    let candidateResult;
    if (token) {
      candidateResult = await query(
        `SELECT id FROM candidates WHERE token = $1 AND test_session_id = $2 LIMIT 1`,
        [token, sessionId]
      );
    } else if (email) {
      candidateResult = await query(
        `SELECT id FROM candidates WHERE email = $1 AND test_session_id = $2 LIMIT 1`,
        [email, sessionId]
      );
    }
    
    if (candidateResult?.rowCount === 0) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }
    
    const candidateId = candidateResult?.rows[0].id;
    
    // Log each violation
    for (const violation of violations) {
      await query(
        `INSERT INTO proctoring_violations (
          candidate_id, 
          test_session_id, 
          violation_type, 
          violation_time,
          created_at, 
          updated_at
        ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [candidateId, sessionId, violation, timestamp || new Date().toISOString()]
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error logging proctoring violation:', error);
    return NextResponse.json(
      { error: 'Failed to log violation' },
      { status: 500 }
    );
  }
}
