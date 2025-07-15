import { type NextRequest, NextResponse } from "next/server"
import { query } from "@/lib/db"

export async function POST(request: NextRequest, { params }: { params: { sessionId: string } }) {
  try {
    const body = await request.json()
    const { email, answers = [], violations = [], isAutoSubmit = false } = body

    if (!email) {
      return NextResponse.json({ error: "Email is required" }, { status: 400 })
    }

    if (!params.sessionId) {
      return NextResponse.json({ error: "Session ID is required" }, { status: 400 })
    }

    const { sessionId } = params

    // Get candidate information
    const candidateResult = await query(
      `SELECT c.id, c.email, c.test_session_id, c.status, c.start_time, c.has_completed
       FROM candidates c
       WHERE c.email = $1 AND c.test_session_id = $2
       LIMIT 1`,
      [email, sessionId]
    )

    if (candidateResult.rowCount === 0) {
      return NextResponse.json({ error: "Candidate not found for this test session" }, { status: 404 })
    }

    const candidate = candidateResult.rows[0]

    // Check if candidate has already completed the test
    if (candidate.has_completed) {
      return NextResponse.json({ error: "Test has already been completed" }, { status: 400 })
    }

    // Verify the test session exists and is active
    const sessionCheck = await query(
      `SELECT id, is_active, passing_score, duration
       FROM test_sessions 
       WHERE id = $1 AND is_active = true
       LIMIT 1`,
      [sessionId]
    )

    if (sessionCheck.rowCount === 0) {
      return NextResponse.json({ error: "Test session not found or not active" }, { status: 404 })
    }

    const testSession = sessionCheck.rows[0]

    // Check if auto-submission is due to timer expiry
    if (isAutoSubmit && candidate.start_time) {
      const startTime = new Date(candidate.start_time).getTime()
      const currentTime = new Date().getTime()
      const elapsedMinutes = Math.floor((currentTime - startTime) / (1000 * 60))
      
      // Allow some buffer time (e.g., 1 minute) for network delays
      const maxAllowedTime = testSession.duration + 1
      
      if (elapsedMinutes < testSession.duration - 1) {
        return NextResponse.json({ 
          error: "Auto-submission attempted before timer expiry",
          remainingTime: testSession.duration - elapsedMinutes
        }, { status: 400 })
      }
    }

    const completedAt = new Date().toISOString()

    // Update candidate's completion status
    await query(
      `UPDATE candidates
       SET end_time = $1, 
           status = $2, 
           has_completed = TRUE,
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $3`,
      [completedAt, isAutoSubmit ? 'auto_submitted' : 'completed', candidate.id]
    )

    // Calculate score based on answers
    let totalScore = 0
    let totalPossiblePoints = 0
    let processedAnswers = 0

    // Process each answer if provided
    if (Array.isArray(answers) && answers.length > 0) {
      for (const answer of answers) {
        if (!answer.questionId) continue

        try {
          // Get question details to check if the answer is correct
          const questionResult = await query(
            `SELECT id, question_type, correct_answer, points 
             FROM questions 
             WHERE id = $1 AND test_session_id = $2`,
            [answer.questionId, sessionId]
          )

          if (questionResult.rowCount === 0) continue

          const question = questionResult.rows[0]
          let isCorrect = false
          let pointsEarned = 0

          // Check correctness based on question type
          if (question.question_type === 'multiple_choice') {
            isCorrect = answer.answer === question.correct_answer
            pointsEarned = isCorrect ? question.points : 0
          } else if (question.question_type === 'coding') {
            // For coding questions, you might want to implement test case validation
            // For now, we'll give partial credit if code is provided
            pointsEarned = answer.code && answer.code.trim().length > 0 ? question.points * 0.5 : 0
            isCorrect = pointsEarned > 0
          }

          // Save the answer to candidate_answers table
          await query(
            `INSERT INTO candidate_answers 
             (candidate_id, question_id, answer, code, is_correct, points_earned, created_at, updated_at)
             VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
             ON CONFLICT (candidate_id, question_id) 
             DO UPDATE SET answer = $3, code = $4, is_correct = $5, points_earned = $6, updated_at = CURRENT_TIMESTAMP`,
            [candidate.id, answer.questionId, answer.answer || '', answer.code || '', isCorrect, pointsEarned]
          )

          totalScore += pointsEarned
          totalPossiblePoints += question.points
          processedAnswers++
        } catch (error) {
          console.error(`Error processing answer for question ${answer.questionId}:`, error)
          // Continue processing other answers
        }
      }
    }

    // Calculate percentage score
    const percentageScore = totalPossiblePoints > 0 
      ? Math.round((totalScore / totalPossiblePoints) * 100) 
      : 0

    // Update candidate's score
    await query(
      `UPDATE candidates
       SET score = $1
       WHERE id = $2`,
      [percentageScore, candidate.id]
    )

    // Save proctoring violations if any
    if (violations.length > 0) {
      for (const violation of violations) {
        await query(
          `INSERT INTO proctoring_violations 
           (candidate_id, violation_type, timestamp, created_at)
           VALUES ($1, $2, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
          [candidate.id, violation]
        )
      }
    }

    // Create a test attempt record
    const passingScore = testSession.passing_score || 70
    const attemptStatus = percentageScore >= passingScore ? 'passed' : 'failed'

    await query(
      `INSERT INTO candidate_test_attempts
       (candidate_id, test_session_id, score, status, started_at, completed_at, is_auto_submitted)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        candidate.id, 
        sessionId, 
        percentageScore, 
        attemptStatus, 
        candidate.start_time, 
        completedAt,
        isAutoSubmit
      ]
    )

    return NextResponse.json({
      success: true,
      message: isAutoSubmit ? 'Test auto-submitted successfully due to timer expiry' : 'Test submitted successfully',
      data: {
        candidateId: candidate.id,
        testSessionId: sessionId,
        submittedAt: completedAt,
        answersProcessed: processedAnswers,
        score: percentageScore,
        totalScore: totalScore,
        totalPossiblePoints: totalPossiblePoints,
        status: attemptStatus,
        passed: percentageScore >= passingScore,
        isAutoSubmit: isAutoSubmit,
        violationsRecorded: violations.length
      }
    })

  } catch (error) {
    console.error("Error in auto-submit:", error)
    return NextResponse.json(
      { error: "Failed to submit test" },
      { status: 500 }
    )
  }
}
