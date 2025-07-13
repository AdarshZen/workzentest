import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Get sessionId from URL params
    const { sessionId } = params;
    
    // Parse request body
    const { answers = [], completedAt, email } = await request.json();
    
    // Get the authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.split(' ')[1];
    
    // Validate required fields
    if (!email && !token) {
      return NextResponse.json(
        { error: 'Email or authentication token is required' },
        { status: 400 }
      );
    }
    
    if (!Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Answers must be an array' },
        { status: 400 }
      );
    }

    // Verify the candidate - try token first, then fall back to email
    let candidateResult;
    if (token) {
      candidateResult = await query(
        `SELECT id, email, test_session_id, status 
         FROM candidates 
         WHERE token = $1 AND test_session_id = $2
         LIMIT 1`,
        [token, sessionId]
      );
    }
    
    // If no candidate found by token, try email
    if (!candidateResult?.rowCount && email) {
      candidateResult = await query(
        `SELECT id, email, test_session_id, status
         FROM candidates 
         WHERE email = $1 AND test_session_id = $2
         LIMIT 1`,
        [email, sessionId]
      );
    }
    
    // If still no candidate found
    if (!candidateResult?.rowCount) {
      return NextResponse.json(
        { error: 'Candidate not found for this test session' },
        { status: 404 }
      );
    }

    if (candidateResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      )
    }

    const candidate = candidateResult.rows[0]

    // Verify the test session exists and is active
    const sessionCheck = await query(
      `SELECT id, is_active, passing_score 
       FROM test_sessions 
       WHERE id = $1 AND is_active = true
       LIMIT 1`,
      [sessionId]
    )

    if (sessionCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Test session not found or not active' },
        { status: 404 }
      )
    }

    // Update candidate's end time
    await query(
      `UPDATE candidates
       SET end_time = $1, 
           status = 'completed', 
           has_completed = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [completedAt || new Date().toISOString(), candidate.id]
    )

    // Save answers and calculate score
    let totalScore = 0;
    let totalPossiblePoints = 0;
    
    // Process each answer
    for (const answer of answers) {
      if (!answer.questionId) continue;
      
      // Get question details to check if the answer is correct
      const questionResult = await query(
        `SELECT id, question_type, correct_answer, points 
         FROM questions 
         WHERE id = $1 AND test_session_id = $2`,
        [answer.questionId, sessionId]
      );
      
      if (questionResult.rowCount === 0) continue;
      
      const question = questionResult.rows[0];
      const isCorrect = answer.answer === question.correct_answer;
      const pointsEarned = isCorrect ? question.points : 0;
      
      // Save the answer to candidate_answers table
      await query(
        `INSERT INTO candidate_answers 
         (candidate_id, question_id, answer, is_correct, points_earned, created_at, updated_at)
         VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
        [candidate.id, answer.questionId, answer.answer, isCorrect, pointsEarned]
      );
      
      totalScore += pointsEarned;
      totalPossiblePoints += question.points;
    }
    
    // Calculate percentage score
    const percentageScore = totalPossiblePoints > 0 
      ? Math.round((totalScore / totalPossiblePoints) * 100) 
      : 0;
    
    // Update candidate's score
    await query(
      `UPDATE candidates
       SET score = $1
       WHERE id = $2`,
      [percentageScore, candidate.id]
    );
    
    // Create a test attempt record
    const passingScore = sessionCheck.rows[0]?.passing_score || 70;
    const attemptStatus = percentageScore >= passingScore ? 'passed' : 'failed';
    
    await query(
      `INSERT INTO candidate_test_attempts
       (candidate_id, test_session_id, score, status, started_at, completed_at)
       VALUES ($1, $2, $3, $4, 
         (SELECT start_time FROM candidates WHERE id = $1),
         $5
       )`,
      [candidate.id, sessionId, percentageScore, attemptStatus, completedAt || new Date().toISOString()]
    );

    return NextResponse.json({
      success: true,
      message: 'Test submitted successfully',
      data: {
        candidateId: candidate.id,
        testSessionId: sessionId,
        submittedAt: completedAt || new Date().toISOString(),
        answersSubmitted: answers.length,
        score: percentageScore,
        status: attemptStatus
      }
    })

  } catch (error) {
    console.error('Error submitting test:', error)
    return NextResponse.json(
      { error: 'Failed to submit test' },
      { status: 500 }
    )
  }
}
