import { NextResponse } from 'next/server';
import { query } from '@/lib/db';

export async function GET() {
  try {
    const result = await query('SELECT NOW()');
    return NextResponse.json({ 
      status: 'success', 
      data: result.rows[0],
      message: 'Database connection successful'
    });
  } catch (error: any) {
    console.error('Database connection error:', error);
    return NextResponse.json(
      { status: 'error', message: 'Database connection failed', error: error.message },
      { status: 500 }
    );
  }
}
