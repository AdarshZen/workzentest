import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import * as XLSX from 'xlsx'
import { Readable } from 'stream'

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession()
    if (!session?.user) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    // Get file from form data
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const testSessionId = formData.get('testSessionId') as string

    if (!file || !testSessionId) {
      return NextResponse.json(
        { error: 'File and test session ID are required' },
        { status: 400 }
      )
    }

    // Read the file
    const buffer = Buffer.from(await file.arrayBuffer())
    const workbook = XLSX.read(buffer, { type: 'buffer' })
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const data = XLSX.utils.sheet_to_json(worksheet)

    // Validate and process candidates
    const candidates = data.map((row: any) => ({
      name: row['Name'] || row['name'] || '',
      email: row['Email'] || row['email'] || '',
      phone: row['Phone'] || row['phone'] || '',
      // Add other fields as needed
    })).filter((c: any) => c.email) // Only include rows with email

    // Insert candidates into database
    const insertedCandidates = await Promise.all(
      candidates.map(async (candidate: any) => {
        const result = await sql`
          INSERT INTO candidates (
            test_session_id, 
            name, 
            email, 
            phone,
            created_at,
            updated_at
          ) VALUES (
            ${testSessionId},
            ${candidate.name},
            ${candidate.email.toLowerCase()},
            ${candidate.phone},
            NOW(),
            NOW()
          )
          RETURNING id, email, name
        `
        return result.rows[0]
      })
    )

    return NextResponse.json({
      message: 'Candidates imported successfully',
      count: insertedCandidates.length,
      candidates: insertedCandidates,
    })
  } catch (error) {
    console.error('Error importing candidates:', error)
    return NextResponse.json(
      { error: 'Failed to import candidates' },
      { status: 500 }
    )
  }
}

// Add this to your existing auth utility or create a new one
async function getServerSession() {
  // Implement your session logic here
  // This should return the current user session or null
  return { user: { id: '1', role: 'admin' } } // Mock implementation
}
