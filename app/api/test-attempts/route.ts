import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const candidateId = searchParams.get('candidateId');
    const testSessionId = searchParams.get('testSessionId');
    
    let queryString = `
      SELECT cta.*, c.name as candidate_name, ts.title as test_session_title
      FROM candidate_test_attempts cta
      JOIN candidates c ON cta.candidate_id = c.id
      JOIN test_sessions ts ON cta.test_session_id = ts.id
    `;
    
    const params: any[] = [];
    let paramCount = 1;
    
    if (candidateId) {
      queryString += ` WHERE cta.candidate_id = $${paramCount++}`;
      params.push(candidateId);
    }
    
    if (testSessionId) {
      queryString += ` ${params.length ? 'AND' : 'WHERE'} cta.test_session_id = $${paramCount++}`;
      params.push(testSessionId);
    }
    
    queryString += ' ORDER BY cta.started_at DESC';
    
    const result = await query(queryString, params);
    
    return NextResponse.json({ 
      status: 'success', 
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching test attempts:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch test attempts' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidate_id, test_session_id } = body;
    
    // Check if candidate exists and is eligible
    const candidateCheck = await query(
      'SELECT * FROM candidates WHERE id = $1 AND status = $2',
      [candidate_id, 'active']
    );
    
    if (candidateCheck.rowCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Candidate not found or not active' },
        { status: 404 }
      );
    }
    
    // Check if test session exists and is active
    const testSessionCheck = await query(
      'SELECT * FROM test_sessions WHERE id = $1 AND is_active = true',
      [test_session_id]
    );
    
    if (testSessionCheck.rowCount === 0) {
      return NextResponse.json(
        { status: 'error', message: 'Test session not found or not active' },
        { status: 404 }
      );
    }
    
    // Check for existing active attempts
    const existingAttempt = await query(
      `SELECT * FROM candidate_test_attempts 
       WHERE candidate_id = $1 AND test_session_id = $2 
       AND completed_at IS NULL`,
      [candidate_id, test_session_id]
    );
    
    if (existingAttempt.rowCount > 0) {
      return NextResponse.json({
        status: 'success',
        data: existingAttempt.rows[0],
        message: 'Existing active attempt found'
      });
    }
    
    // Get the next attempt number
    const attemptNumberResult = await query(
      `SELECT COALESCE(MAX(attempt_number), 0) + 1 as next_attempt 
       FROM candidate_test_attempts 
       WHERE candidate_id = $1 AND test_session_id = $2`,
      [candidate_id, test_session_id]
    );
    
    const attempt_number = parseInt(attemptNumberResult.rows[0].next_attempt) || 1;
    
    // Create new test attempt
    const result = await query(
      `INSERT INTO candidate_test_attempts (
        candidate_id, test_session_id, attempt_number, status, started_at
      ) VALUES ($1, $2, $3, $4, NOW())
      RETURNING *`,
      [candidate_id, test_session_id, attempt_number, 'in_progress']
    );
    
    return NextResponse.json({ 
      status: 'success', 
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating test attempt:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create test attempt' },
      { status: 500 }
    );
  }
}
