import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    // Ensure params is properly awaited
    const { sessionId } = await Promise.resolve(params);

    // Get the test session
    const result = await sql`
      SELECT 
        ts.*,
        (
          SELECT COUNT(*) 
          FROM candidates c 
          WHERE c.test_session_id = ts.id
        ) as candidate_count
      FROM test_sessions ts
      WHERE ts.id = ${sessionId}
      LIMIT 1
    `;

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      );
    }

    const session = result.rows[0];

    return NextResponse.json({
      id: session.id,
      name: session.name,
      testName: session.test_name,
      companyName: session.company_name,
      description: session.instructions,
      status: session.is_active ? 'active' : 'inactive',
      startTime: null, // Not in your schema
      endTime: null,   // Not in your schema
      duration: session.duration,
      createdAt: session.created_at,
      updatedAt: session.updated_at,
      candidateCount: Number(session.candidate_count) || 0,
      settings: session.settings || {}
    });
  } catch (error) {
    console.error('Error fetching test session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
