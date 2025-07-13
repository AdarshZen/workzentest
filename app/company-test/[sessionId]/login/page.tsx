"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, ArrowLeft, Loader2, Building2, Clock, Trophy, Shield, Eye, CheckCircle } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface TestSession {
  id: string
  test_name: string
  company_name: string
  duration: number
  instructions?: string
  test_type: string
  totalQuestions?: number
}

export default function TestLoginPage() {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [testSession, setTestSession] = useState<TestSession | null>(null)
  const [loadingSession, setLoadingSession] = useState(true)
  const router = useRouter()
  const params = useParams()
  const sessionId = params.sessionId as string

  useEffect(() => {
    const fetchTestSession = async () => {
      if (!sessionId) return

      try {
        const response = await fetch(`/api/test-sessions/${sessionId}`)

        if (!response.ok) {
          if (response.status === 404) {
            setError("Test session not found. Please check the URL and try again.")
          } else {
            throw new Error("Failed to fetch test session details")
          }
        } else {
          const data = await response.json()
          setTestSession(data)
        }
      } catch (err) {
        console.error("Error fetching test session:", err)
        setError("Failed to load test details. Please try again later.")
      } finally {
        setLoadingSession(false)
      }
    }

    fetchTestSession()
  }, [sessionId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) {
      setError("Please enter your email address")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      if (!sessionId) {
        throw new Error("Invalid test session")
      }

      const response = await fetch(`/api/candidates/verify`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          testSessionId: sessionId,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to verify access")
      }

      localStorage.setItem(
        "testSession",
        JSON.stringify({
          testSessionId: sessionId,
          candidateId: data.candidateId,
          token: data.token,
        }),
      )

      localStorage.setItem("candidateEmail", email)

      router.push(`/company-test/${sessionId}/instructions?email=${encodeURIComponent(email)}`)
    } catch (err) {
      console.error("Login error:", err)
      setError(err instanceof Error ? err.message : "Failed to start test. Please check your email and try again.")
    } finally {
      setIsLoading(false)
    }
  }

  if (loadingSession && !error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="relative mb-8">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Loading Assessment Portal</h1>
          <p className="text-gray-600">Please wait while we prepare your test session...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-full overflow-hidden bg-gradient-to-r from-purple-600 to-blue-600 flex items-center justify-center">
                <img src="/apple-touch-icon.png" alt="Logo" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-bold text-gray-900">WorkZen</span>
            </Link>
            <Badge className="bg-purple-100 text-purple-700">Assessment Portal</Badge>
          </div>
        </div>
      </header>

      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-4xl">
          <Link
            href="/company-test"
            className="flex items-center text-sm text-gray-600 hover:text-purple-700 mb-8 transition-colors"
          >
            <ArrowLeft className="h-4 w-4 mr-1" /> Back to assessments
          </Link>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Login Form */}
            <Card className="shadow-2xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="space-y-4 bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-2xl font-bold text-gray-900">Assessment Login</CardTitle>
                    <CardDescription className="text-gray-600 mt-2">
                      Enter your registered email to access the assessment
                    </CardDescription>
                  </div>
                  <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
                    <Shield className="h-6 w-6 text-white" />
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <Alert variant="destructive" className="border-red-200 bg-red-50">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-red-800">{error}</AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-3">
                    <label className="text-sm font-semibold text-gray-700" htmlFor="email">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="your.email@company.com"
                        className="pl-12 h-12 text-lg border-gray-200 focus:border-purple-500 focus:ring-purple-500"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  </div>

                  <Button
                    type="submit"
                    className="w-full h-12 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold text-lg shadow-lg"
                    disabled={isLoading}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                        Verifying Access...
                      </>
                    ) : (
                      <>
                        <Shield className="mr-2 h-5 w-5" />
                        Access Assessment
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            {/* Test Information */}
            {testSession && (
              <div className="space-y-6">
                <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
                  <CardHeader className="bg-gradient-to-r from-blue-50 to-cyan-50 border-b">
                    <CardTitle className="flex items-center space-x-3 text-xl">
                      <Trophy className="w-6 h-6 text-blue-600" />
                      <span>Assessment Details</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="p-6 space-y-6">
                    <div className="space-y-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-gradient-to-r from-purple-100 to-blue-100 rounded-xl flex items-center justify-center">
                          <Building2 className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                          <h3 className="font-bold text-lg text-gray-900">{testSession.test_name}</h3>
                          <p className="text-gray-600">{testSession.company_name}</p>
                        </div>
                      </div>

                      <Separator />

                      <div className="grid gap-4">
                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-green-50 to-emerald-50 border border-green-100">
                          <div className="flex items-center gap-3">
                            <Clock className="h-5 w-5 text-green-600" />
                            <span className="font-medium text-green-800">Duration</span>
                          </div>
                          <span className="font-bold text-green-800">{testSession.duration} minutes</span>
                        </div>

                        <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-100">
                          <div className="flex items-center gap-3">
                            <Trophy className="h-5 w-5 text-blue-600" />
                            <span className="font-medium text-blue-800">Type</span>
                          </div>
                          <Badge className="bg-blue-100 text-blue-700">{testSession.test_type}</Badge>
                        </div>

                        {testSession.totalQuestions && (
                          <div className="flex items-center justify-between p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-100">
                            <div className="flex items-center gap-3">
                              <CheckCircle className="h-5 w-5 text-amber-600" />
                              <span className="font-medium text-amber-800">Questions</span>
                            </div>
                            <span className="font-bold text-amber-800">{testSession.totalQuestions}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card className="shadow-xl border-0 bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-l-amber-500">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-3 text-amber-800">
                      <Eye className="w-5 h-5" />
                      <span>Proctoring Notice</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-amber-800">Camera monitoring will be active</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-amber-800">Fullscreen mode is required</p>
                    </div>
                    <div className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-amber-500 rounded-full mt-2 flex-shrink-0"></div>
                      <p className="text-sm text-amber-800">Face detection will monitor for violations</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
