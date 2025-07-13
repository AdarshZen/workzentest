"use client"

import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle, Home } from 'lucide-react'
import Link from 'next/link'

export default function TestCompletePage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get('email')

  useEffect(() => {
    // Redirect to login if no email
    if (typeof window !== 'undefined' && !email) {
      router.push(`/company-test/${params.sessionId}/login`)
    }
  }, [email, params.sessionId, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="mt-4 text-2xl font-bold">
            Test Submitted Successfully!
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-6">
          <p className="text-gray-600">
            Thank you for completing the assessment. Your responses have been recorded.
          </p>
          
          <div className="space-y-2 text-sm text-gray-500">
            <p>You can now close this window or return to the homepage.</p>
            <p>We'll review your submission and get back to you soon.</p>
          </div>

          <div className="pt-4">
            <Link href="/">
              <Button>
                <Home className="mr-2 h-4 w-4" />
                Return to Home
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
