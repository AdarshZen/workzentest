import { query } from '@/lib/db'
import { NextResponse } from 'next/server'

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Get sessionId from URL params
    const resolvedParams = await Promise.resolve(params);
    const sessionId = resolvedParams.sessionId;
    
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
    
    // Get the candidate's start_time
    const startTimeResult = await query(
      `SELECT start_time FROM candidates WHERE id = $1`,
      [candidate.id]
    );
    
    // Use the start_time if available, otherwise use a default value
    const startTime = startTimeResult.rows[0]?.start_time || completedAt || new Date().toISOString();
    
    // First check if this candidate has already submitted this test
    const existingSubmissionCheck = await query(
      `SELECT id FROM candidate_test_attempts 
       WHERE candidate_id = $1 AND test_session_id = $2 LIMIT 1`,
      [candidate.id, sessionId]
    );
    
    if (existingSubmissionCheck?.rowCount && existingSubmissionCheck.rowCount > 0) {
      // If a submission already exists, just update it instead of creating a new one
      // This avoids the unique constraint violation
      // Update existing test attempt
      await query(
        `UPDATE candidate_test_attempts
         SET score = $1, 
             status = $2, 
             completed_at = $3
         WHERE candidate_id = $4 AND test_session_id = $5`,
        [percentageScore, attemptStatus, completedAt || new Date().toISOString(), candidate.id, sessionId]
      );
    } else {
      // No existing submission, create a new one with attempt_number = 1
      // Get the next attempt number
      const attemptNumberResult = await query(
        `SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt 
         FROM candidate_test_attempts 
         WHERE candidate_id = $1 AND test_session_id = $2`,
        [candidate.id, sessionId]
      );
      
      const attempt_number = parseInt(attemptNumberResult.rows[0]?.next_attempt) || 1;
      
      try {
        await query(
          `INSERT INTO candidate_test_attempts
           (candidate_id, test_session_id, score, status, started_at, completed_at, attempt_number)
           VALUES ($1, $2, $3, $4, $5, $6, $7)`,
          [
            candidate.id, 
            sessionId, 
            percentageScore, 
            attemptStatus, 
            startTime, 
            completedAt || new Date().toISOString(),
            attempt_number
          ]
        );
      } catch (insertError) {
        console.error('Error inserting test attempt:', insertError);
        
        // If insertion fails, try to update the existing record
        await query(
          `UPDATE candidate_test_attempts
           SET score = $1, 
               status = $2, 
               completed_at = $3
           WHERE candidate_id = $4 AND test_session_id = $5`,
          [percentageScore, attemptStatus, completedAt || new Date().toISOString(), candidate.id, sessionId]
        );
      }
    }

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
