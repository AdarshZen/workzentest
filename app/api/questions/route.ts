import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testSessionId = searchParams.get('testSessionId');
    
    if (!testSessionId) {
      return NextResponse.json(
        { status: 'error', message: 'testSessionId is required' },
        { status: 400 }
      );
    }
    
    const result = await query(
      'SELECT * FROM questions WHERE test_session_id = $1 ORDER BY created_at',
      [testSessionId]
    );
    
    return NextResponse.json({ 
      status: 'success', 
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching questions:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch questions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      test_session_id,
      question_text,
      question_type,
      options,
      correct_answer,
      points,
      difficulty_level,
      category,
      time_limit,
      code_template,
      test_cases = []
    } = body;

    const result = await query(
      `INSERT INTO questions (
        test_session_id, question_text, question_type, options, correct_answer,
        points, difficulty_level, category, time_limit, code_template, test_cases
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
      RETURNING *`,
      [
        test_session_id,
        question_text,
        question_type,
        JSON.stringify(options),
        correct_answer,
        points,
        difficulty_level,
        category,
        time_limit,
        code_template,
        JSON.stringify(test_cases)
      ]
    );

    return NextResponse.json({ 
      status: 'success', 
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating question:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create question' },
      { status: 500 }
    );
  }
}
