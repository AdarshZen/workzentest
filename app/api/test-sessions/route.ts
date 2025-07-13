import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query(
      'SELECT * FROM test_sessions ORDER BY created_at DESC'
    );
    return NextResponse.json({ 
      status: 'success', 
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching test sessions:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch test sessions' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      company_name,
      start_date,
      end_date,
      duration,
      instructions,
      test_type,
      max_candidates,
      passing_score,
      retest_cooldown_days,
      created_by
    } = body;

    const result = await query(
      `INSERT INTO test_sessions (
        title, description, company_name, start_date, end_date, 
        duration, instructions, test_type, max_candidates, 
        passing_score, retest_cooldown_days, created_by
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)
      RETURNING *`,
      [
        title,
        description,
        company_name,
        start_date,
        end_date,
        duration,
        instructions,
        test_type,
        max_candidates,
        passing_score,
        retest_cooldown_days,
        created_by
      ]
    );

    return NextResponse.json({ 
      status: 'success', 
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating test session:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create test session' },
      { status: 500 }
    );
  }
}
