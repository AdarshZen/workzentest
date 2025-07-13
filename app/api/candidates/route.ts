import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const testSessionId = searchParams.get('testSessionId');
    
    let queryString = 'SELECT * FROM candidates';
    let params: any[] = [];
    
    if (testSessionId) {
      queryString += ' WHERE test_session_id = $1';
      params.push(testSessionId);
    }
    
    queryString += ' ORDER BY created_at DESC';
    
    const result = await query(queryString, params);
    
    return NextResponse.json({ 
      status: 'success', 
      data: result.rows,
      count: result.rowCount
    });
  } catch (error) {
    console.error('Error fetching candidates:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to fetch candidates' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      name,
      email,
      phone,
      resume_url,
      test_session_id,
      status = 'invited',
      metadata = {}
    } = body;

    const result = await query(
      `INSERT INTO candidates (
        name, email, phone, resume_url, test_session_id, status, metadata
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING *`,
      [
        name,
        email,
        phone,
        resume_url,
        test_session_id,
        status,
        JSON.stringify(metadata)
      ]
    );

    return NextResponse.json({ 
      status: 'success', 
      data: result.rows[0]
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating candidate:', error);
    return NextResponse.json(
      { status: 'error', message: 'Failed to create candidate' },
      { status: 500 }
    );
  }
}
