import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string } }
) {
  try {
    const { sessionId } = params

    // Get test session details
    const sessionResult = await sql`
      SELECT id, test_name, company_name, duration_minutes
      FROM test_sessions
      WHERE id = ${sessionId}
      LIMIT 1
    `

    if (sessionResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Test session not found' },
        { status: 404 }
      )
    }

    const testSession = sessionResult.rows[0]

    // Get all candidates who haven't started or completed the test
    const candidatesResult = await sql`
      SELECT id, name, email, token
      FROM candidates
      WHERE test_session_id = ${sessionId} 
        AND status IN ('invited', 'not_started')
    `

    if (candidatesResult.rowCount === 0) {
      return NextResponse.json({
        message: 'No candidates to invite',
        invitedCount: 0
      })
    }

    const candidates = candidatesResult.rows
    const results = []

    // Send invitation to each candidate
    for (const candidate of candidates) {
      const testUrl = `${process.env.NEXT_PUBLIC_APP_URL}/test/${sessionId}?token=${candidate.token}`
      
      try {
        const { data, error } = await resend.emails.send({
          from: 'WorkZen <no-reply@workzen.tech>', // Update with your verified domain
          to: candidate.email,
          subject: `You've been invited to take the ${testSession.test_name} test`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h1>You've been invited to take a test</h1>
              <p>Hello ${candidate.name},</p>
              <p>${testSession.company_name} has invited you to take the <strong>${testSession.test_name}</strong> test.</p>
              
              <div style="background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <p><strong>Test Details:</strong></p>
                <ul style="padding-left: 20px;">
                  <li>Test: ${testSession.test_name}</li>
                  <li>Company: ${testSession.company_name}</li>
                  <li>Duration: ${testSession.duration_minutes} minutes</li>
                </ul>
              </div>
              
              <p>Click the button below to start the test:</p>
              <a href="${testUrl}" style="
                display: inline-block;
                background: #4f46e5;
                color: white;
                padding: 12px 24px;
                text-decoration: none;
                border-radius: 6px;
                font-weight: bold;
                margin: 20px 0;
              ">Start Test</a>
              
              <p>Or copy and paste this link into your browser:</p>
              <p style="word-break: break-all;">${testUrl}</p>
              
              <p>This link is unique to you and should not be shared with others.</p>
              
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 20px 0;" />
              
              <p style="font-size: 12px; color: #6b7280;">
                If you did not expect to receive this email, you can safely ignore it.
              </p>
            </div>
          `,
        })

        // Update candidate status
        await sql`
          UPDATE candidates
          SET 
            status = 'invited',
            invite_sent_at = NOW(),
            updated_at = NOW()
          WHERE id = ${candidate.id}
        `

        results.push({
          candidateId: candidate.id,
          email: candidate.email,
          status: 'sent',
          emailId: data?.id
        })
      } catch (error) {
        console.error(`Failed to send to ${candidate.email}:`, error)
        const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
        results.push({
          candidateId: candidate.id,
          email: candidate.email,
          status: 'failed',
          error: errorMessage
        })
      }
    }

    const successCount = results.filter(r => r.status === 'sent').length
    const failedCount = results.length - successCount

    return NextResponse.json({
      message: `Invitations sent to ${successCount} candidates${failedCount > 0 ? `, failed to send to ${failedCount}` : ''}`,
      total: results.length,
      success: successCount,
      failed: failedCount,
      results
    })

  } catch (error) {
    console.error('Error sending bulk invitations:', error)
    return NextResponse.json(
      { error: 'Failed to send invitations' },
      { status: 500 }
    )
  }
}
