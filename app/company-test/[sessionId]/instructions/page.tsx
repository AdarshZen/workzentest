"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Clock,
  FileText,
  Shield,
  Camera,
  Mic,
  Monitor,
  Maximize,
  AlertTriangle,
  CheckCircle,
  Building2,
  Users,
  Trophy,
  Eye,
  Lock,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"

interface TestSession {
  id: string
  name: string
  test_name: string
  duration: number
  description?: string
  company_name?: string
  instructions?: string
  proctoring_enabled?: boolean
}

export default function InstructionsPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const { sessionId } = params
  const [testSession, setTestSession] = useState<TestSession | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [hasAgreed, setHasAgreed] = useState(false)
  const [hasReadInstructions, setHasReadInstructions] = useState(false)
  const [understandsProctoring, setUnderstandsProctoring] = useState(false)

  useEffect(() => {
    const fetchTestSession = async () => {
      if (!sessionId) return

      try {
        const response = await fetch(`/api/test-sessions/${sessionId}`)
        if (!response.ok) {
          throw new Error("Failed to fetch test session")
        }
        const data = await response.json()
        setTestSession(data)
      } catch (err) {
        console.error("Error fetching test session:", err)
        setError("Failed to load test details. Please try again later.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchTestSession()
  }, [sessionId])

  const handleStartTest = () => {
    if (!hasAgreed || !hasReadInstructions || !understandsProctoring) {
      return
    }

    // Store session info for the test page
    const sessionInfo = {
      testSessionId: sessionId,
      testName: testSession?.test_name || "Assessment",
      companyName: testSession?.company_name || "Company",
      duration: testSession?.duration || 60,
      startTime: new Date().toISOString(),
      proctorSettings: {
        requireCamera: true,
        detectFaces: true,
        requireFullScreen: true,
        monitorAudio: true,
        requireScreenShare: true,
      },
    }

    localStorage.setItem("testSession", JSON.stringify(sessionInfo))
    router.push(`/company-test/${sessionId}/test`)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-16 h-16 border-4 border-purple-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-16 h-16 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-lg font-medium text-gray-900 mt-4">Loading instructions...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Instructions</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const canStartTest = hasAgreed && hasReadInstructions && understandsProctoring

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
              <Building2 className="h-7 w-7 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{testSession?.test_name || "Assessment"}</h1>
              <p className="text-gray-600">{testSession?.company_name || "Company Assessment"}</p>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Instructions */}
          <div className="lg:col-span-2 space-y-6">
            {/* Test Overview */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <CardTitle className="text-xl flex items-center">
                  <FileText className="h-6 w-6 mr-3 text-purple-600" />
                  Test Overview
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center p-4 bg-purple-50 rounded-lg">
                    <Clock className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">{testSession?.duration} Minutes</p>
                    <p className="text-sm text-gray-600">Total Duration</p>
                  </div>
                  <div className="text-center p-4 bg-blue-50 rounded-lg">
                    <Users className="h-8 w-8 text-blue-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">Proctored</p>
                    <p className="text-sm text-gray-600">Monitored Test</p>
                  </div>
                  <div className="text-center p-4 bg-green-50 rounded-lg">
                    <Trophy className="h-8 w-8 text-green-600 mx-auto mb-2" />
                    <p className="font-semibold text-gray-900">Scored</p>
                    <p className="text-sm text-gray-600">Auto Graded</p>
                  </div>
                </div>

                {testSession?.description && (
                  <div className="mt-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Description</h3>
                    <p className="text-gray-700 leading-relaxed">{testSession.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* General Instructions */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-green-50 to-emerald-50 border-b">
                <CardTitle className="text-xl flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3 text-green-600" />
                  General Instructions
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">1</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Read Each Question Carefully</h4>
                      <p className="text-gray-600 text-sm">
                        Take your time to understand what is being asked before selecting your answer.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">2</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Navigate Between Questions</h4>
                      <p className="text-gray-600 text-sm">
                        Use the "Previous" and "Next" buttons to move between questions. You can return to previous
                        questions to review or change your answers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">3</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Submit When Complete</h4>
                      <p className="text-gray-600 text-sm">
                        Click "Submit Test" when you have answered all questions. You cannot change answers after
                        submission.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-xs font-bold text-purple-600">4</span>
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900">Time Management</h4>
                      <p className="text-gray-600 text-sm">
                        Keep an eye on the timer. The test will auto-submit when time expires.
                      </p>
                    </div>
                  </div>
                </div>

                {testSession?.instructions && (
                  <div className="mt-6 p-4 bg-blue-50 rounded-lg">
                    <h4 className="font-semibold text-blue-900 mb-2">Additional Instructions</h4>
                    <p className="text-blue-800 text-sm leading-relaxed">{testSession.instructions}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Proctoring Information */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-amber-50 to-orange-50 border-b">
                <CardTitle className="text-xl flex items-center">
                  <Shield className="h-6 w-6 mr-3 text-amber-600" />
                  Proctoring & Monitoring
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <Alert className="mb-6 bg-amber-50 border-amber-200">
                  <Eye className="h-4 w-4 text-amber-600" />
                  <AlertDescription className="text-amber-800">
                    <strong>Important:</strong> This test is proctored and monitored for security purposes. Please
                    ensure you meet all requirements before starting.
                  </AlertDescription>
                </Alert>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Camera className="h-5 w-5 text-blue-600" />
                      <h4 className="font-semibold text-gray-900">Camera Access</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Your camera will monitor you throughout the test to verify your identity and detect any
                      unauthorized assistance.
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Mic className="h-5 w-5 text-green-600" />
                      <h4 className="font-semibold text-gray-900">Microphone Access</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Audio monitoring helps detect any verbal communication or external assistance during the test.
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Monitor className="h-5 w-5 text-purple-600" />
                      <h4 className="font-semibold text-gray-900">Screen Sharing</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      Screen sharing allows monitoring of your desktop to ensure no unauthorized applications are used.
                    </p>
                  </div>

                  <div className="p-4 border border-gray-200 rounded-lg">
                    <div className="flex items-center space-x-3 mb-2">
                      <Maximize className="h-5 w-5 text-red-600" />
                      <h4 className="font-semibold text-gray-900">Fullscreen Mode</h4>
                    </div>
                    <p className="text-sm text-gray-600">
                      The test must be taken in fullscreen mode to prevent access to other applications or websites.
                    </p>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-red-600 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-red-900 mb-2">Security Measures</h4>
                      <ul className="text-sm text-red-800 space-y-1">
                        <li>• Right-click and keyboard shortcuts are disabled</li>
                        <li>• Browser developer tools are blocked</li>
                        <li>• Tab switching and window minimizing are monitored</li>
                        <li>• Multiple faces in camera view will trigger violations</li>
                        <li>• Suspicious behavior will be flagged and recorded</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Consent and Agreement */}
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-gray-50 to-slate-50 border-b">
                <CardTitle className="text-xl flex items-center">
                  <CheckCircle className="h-6 w-6 mr-3 text-gray-600" />
                  Consent & Agreement
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="read-instructions"
                    checked={hasReadInstructions}
                    onCheckedChange={(checked) => setHasReadInstructions(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="read-instructions" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                    I have read and understood all the test instructions and requirements.
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="understand-proctoring"
                    checked={understandsProctoring}
                    onCheckedChange={(checked) => setUnderstandsProctoring(checked as boolean)}
                    className="mt-1"
                  />
                  <label
                    htmlFor="understand-proctoring"
                    className="text-sm text-gray-700 leading-relaxed cursor-pointer"
                  >
                    I understand that this test is proctored and monitored, and I consent to camera, microphone, and
                    screen sharing access for security purposes.
                  </label>
                </div>

                <div className="flex items-start space-x-3">
                  <Checkbox
                    id="agree-terms"
                    checked={hasAgreed}
                    onCheckedChange={(checked) => setHasAgreed(checked as boolean)}
                    className="mt-1"
                  />
                  <label htmlFor="agree-terms" className="text-sm text-gray-700 leading-relaxed cursor-pointer">
                    I agree to the terms and conditions and confirm that I will take this test honestly without any
                    external assistance.
                  </label>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="bg-gradient-to-r from-purple-50 to-blue-50 border-b">
                <CardTitle className="text-lg">Quick Info</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Duration</span>
                    <Badge className="bg-purple-100 text-purple-700">{testSession?.duration} min</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Type</span>
                    <Badge className="bg-blue-100 text-blue-700">Proctored</Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Attempts</span>
                    <Badge className="bg-green-100 text-green-700">1 Only</Badge>
                  </div>
                </div>

                <Separator />

                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Required Permissions</h4>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2 text-sm">
                      <Camera className="h-4 w-4 text-blue-600" />
                      <span className="text-gray-700">Camera Access</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Mic className="h-4 w-4 text-green-600" />
                      <span className="text-gray-700">Microphone Access</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Monitor className="h-4 w-4 text-purple-600" />
                      <span className="text-gray-700">Screen Sharing</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Maximize className="h-4 w-4 text-red-600" />
                      <span className="text-gray-700">Fullscreen Mode</span>
                    </div>
                  </div>
                </div>

                <Separator />

                <Button
                  onClick={handleStartTest}
                  disabled={!canStartTest}
                  className={`w-full py-3 text-lg font-semibold ${
                    canStartTest
                      ? "bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white shadow-lg"
                      : "bg-gray-200 text-gray-500 cursor-not-allowed"
                  }`}
                >
                  {canStartTest ? (
                    <>
                      <Trophy className="mr-2 h-5 w-5" />
                      Start Test
                    </>
                  ) : (
                    "Complete All Checkboxes"
                  )}
                </Button>

                {!canStartTest && (
                  <p className="text-xs text-gray-500 text-center">
                    Please read and agree to all terms before starting the test.
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
