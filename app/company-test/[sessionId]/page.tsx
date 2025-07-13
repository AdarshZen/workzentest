"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

export default function CompanyTestSessionPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()

  useEffect(() => {
    // Redirect to login page for the session
    router.replace(`/company-test/${params.sessionId}/login`)
  }, [params.sessionId, router])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-purple-600 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-gray-600">Redirecting to assessment...</p>
      </div>
    </div>
  )
}
