import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const sessionId = params.sessionId;
    const { email, feedback, testSessionId } = await request.json();

    if (!email || !feedback) {
      return NextResponse.json(
        { error: 'Email and feedback are required' },
        { status: 400 }
      );
    }

    // Verify the candidate exists
    const candidateResult = await query(
      `SELECT id 
       FROM candidates 
       WHERE email = $1
       AND test_session_id = $2
       LIMIT 1`,
      [email.toLowerCase(), sessionId]
    );

    if (candidateResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      );
    }

    const candidateId = candidateResult.rows[0].id;

    // Store the feedback
    await query(
      `INSERT INTO candidate_feedback
       (candidate_id, test_session_id, feedback_text, created_at, updated_at)
       VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [candidateId, sessionId, feedback]
    );

    return NextResponse.json({
      success: true,
      message: 'Feedback submitted successfully'
    });

  } catch (error) {
    console.error('Error submitting feedback:', error);
    return NextResponse.json(
      { error: 'Failed to submit feedback' },
      { status: 500 }
    );
  }
}
