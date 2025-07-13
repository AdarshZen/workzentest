import { NextResponse } from 'next/server'
import { sql } from '@vercel/postgres'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface TestSession {
  id: string
  test_name: string
  company_name: string
  duration_minutes: number
}

interface Candidate {
  id: string
  name: string
  email: string
  token: string
}

export async function POST(
  request: Request,
  { params }: { params: { sessionId: string; candidateId: string } }
) {
  try {
    const { sessionId, candidateId } = params

    // Get candidate details
    const candidateResult = await sql`
      SELECT c.id, c.name, c.email, c.token
      FROM candidates c
      WHERE c.id = ${candidateId} AND c.test_session_id = ${sessionId}
      LIMIT 1
    `

    if (candidateResult.rowCount === 0) {
      return NextResponse.json(
        { error: 'Candidate not found' },
        { status: 404 }
      )
    }

    const candidate = candidateResult.rows[0] as Candidate

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

    const testSession = sessionResult.rows[0] as TestSession
    const testUrl = `${process.env.NEXT_PUBLIC_APP_URL}/test/${sessionId}?token=${candidate.token}`

    // Send email using Resend
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

    if (error) {
      console.error('Error sending email:', error)
      return NextResponse.json(
        { error: 'Failed to send invitation email' },
        { status: 500 }
      )
    }

    // Update candidate status to 'invited' and set invitation timestamp
    await sql`
      UPDATE candidates
      SET 
        status = 'invited',
        invite_sent_at = NOW(),
        updated_at = NOW()
      WHERE id = ${candidateId}
    `

    return NextResponse.json({ 
      message: 'Invitation sent successfully',
      emailId: data?.id 
    })

  } catch (error) {
    console.error('Error sending invitation:', error)
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    )
  }
}
