import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    // In Next.js 13+, we should await the params object
    const { sessionId } = await Promise.resolve(params);
    
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'Session ID is required' },
        { status: 400 }
      );
    }

    // Get test session details
    const result = await query(
      `SELECT 
        id, 
        test_name, 
        company_name, 
        duration, 
        instructions, 
        test_type,
        passing_score,
        is_active
      FROM test_sessions 
      WHERE id = $1`,
      [sessionId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      );
    }

    // Get count of questions for this test
    const questionsResult = await query(
      `SELECT COUNT(*) as total_questions
      FROM questions 
      WHERE test_session_id = $1`,
      [sessionId]
    );
    
    // Get counts by question type
    const questionTypeResult = await query(
      `SELECT 
        question_type, 
        COUNT(*) as count 
      FROM questions 
      WHERE test_session_id = $1 
      GROUP BY question_type`,
      [sessionId]
    );

    // Format question type counts
    const questionTypeCounts = questionTypeResult.rows.reduce((acc, row) => {
      acc[row.question_type + '_questions'] = parseInt(row.count);
      return acc;
    }, {});

    const totalQuestions = parseInt(questionsResult.rows[0]?.total_questions) || 0;

    // Return test session with question counts
    return NextResponse.json({
      ...result.rows[0],
      totalQuestions,
      ...questionTypeCounts
    });
  } catch (error) {
    console.error('Error fetching test session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test session details' },
      { status: 500 }
    );
  }
}
