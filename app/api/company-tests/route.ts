import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const result = await sql`
      SELECT 
        id,
        test_name as "testName",
        company_name as "companyName",
        duration,
        is_active as "isActive"
      FROM test_sessions
      WHERE is_active = true
      ORDER BY created_at DESC
    `;

    return NextResponse.json(result.rows);
  } catch (error) {
    console.error('Error fetching active test sessions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch active test sessions' },
      { status: 500 }
    );
  }
}
