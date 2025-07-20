import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'

export async function DELETE(
  request: Request,
  { params }: { params: { sessionId: string; candidateId: string } }
) {
  try {
    // Await the params before destructuring to ensure they're available
    const resolvedParams = await Promise.resolve(params)
    const { sessionId, candidateId } = resolvedParams

    // Verify the candidate belongs to the session
    const candidateCheck = await sql`
      SELECT id FROM candidates 
      WHERE id = ${candidateId} AND test_session_id = ${sessionId}
    `

    if (candidateCheck.rowCount === 0) {
      return NextResponse.json(
        { error: 'Candidate not found in this session' },
        { status: 404 }
      )
    }

    try {
      // Try to delete from candidate_answers if it exists
      await sql`DELETE FROM candidate_answers WHERE candidate_id = ${candidateId}`
    } catch (error) {
      // Ignore if the table doesn't exist
      if (!(error instanceof Error && error.message.includes('does not exist'))) {
        throw error // Re-throw if it's a different error
      }
    }
    
    try {
      // Try to delete from candidate_feedback if it exists
      await sql`DELETE FROM candidate_feedback WHERE candidate_id = ${candidateId}`
    } catch (error) {
      // Ignore if the table doesn't exist
      if (!(error instanceof Error && error.message.includes('does not exist'))) {
        throw error // Re-throw if it's a different error
      }
    }
    
    // Now delete the candidate
    await sql`DELETE FROM candidates WHERE id = ${candidateId}`

    return NextResponse.json({ 
      success: true,
      message: 'Candidate deleted successfully' 
    })

  } catch (error) {
    console.error('Error deleting candidate:', error)
    return NextResponse.json(
      { error: 'Failed to delete candidate' },
      { status: 500 }
    )
  }
}
