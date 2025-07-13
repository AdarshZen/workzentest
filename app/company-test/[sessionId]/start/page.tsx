"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Clock, AlertTriangle, CheckCircle, Trophy, Loader2 } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { CodeEditor } from "@/components/code-editor"
import { ProctoringMonitor } from "@/components/proctoring-monitor"

interface TestSession {
  id: string
  test_name: string
  company_name: string
  duration_minutes: number
  test_type: string
  instructions: string
}

interface TestQuestion {
  id: string
  type: string
  question_order: number
  question_text: string
  options?: string[]
  correct_answer?: string
  language?: string
  template_code?: string
  test_cases?: any[]
  points: number
}

export default function CompanyTestStartPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  // Data state
  const [testSession, setTestSession] = useState<TestSession | null>(null)
  const [questions, setQuestions] = useState<TestQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState("")

  // Test state
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<Record<string, any>>({})
  const [timeLeft, setTimeLeft] = useState(0)
  const [tabSwitchWarnings, setTabSwitchWarnings] = useState(0)
  const [proctoringViolations, setProctoringViolations] = useState(0)
  const [faceDetectionFailures, setFaceDetectionFailures] = useState(0)
  const [voiceDetections, setVoiceDetections] = useState(0)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Refs to prevent re-renders and control submission
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const submittedRef = useRef(false)
  const violationCountRef = useRef(0)

  // Load test data
  useEffect(() => {
    const loadTestData = async () => {
      try {
        if (!params.sessionId) {
          setError("Invalid session ID")
          return
        }

        const response = await fetch(`/api/company-test/${params.sessionId}`)
        if (response.ok) {
          const data = await response.json()
          setTestSession(data.session)
          setQuestions(data.questions)
          setTimeLeft(data.session.duration_minutes * 60)
        } else {
          const errorData = await response.json()
          setError(errorData.error || "Failed to load test")
          router.push(`/company-test/${params.sessionId}/login`)
        }
      } catch (error) {
        console.error("Failed to load test data:", error)
        setError("Failed to load test data")
        router.push(`/company-test/${params.sessionId}/login`)
      } finally {
        setIsLoading(false)
      }
    }

    loadTestData()
  }, [params.sessionId, router])

  // Mark test as started
  useEffect(() => {
    if (testSession && email) {
      fetch(`/api/company-test/${params.sessionId}/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      }).catch(console.error)
    }
  }, [testSession, email, params.sessionId])

  // Timer effect
  useEffect(() => {
    if (timeLeft <= 0 || !testSession) return

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (!submittedRef.current) {
            submittedRef.current = true
            handleSubmit()
          }
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current)
      }
    }
  }, [timeLeft, testSession])

  // Tab switch detection
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden && !submittedRef.current) {
        setTabSwitchWarnings((prev) => {
          const newCount = prev + 1
          if (newCount === 1) {
            alert("WARNING: Tab switching detected. One more violation will terminate your assessment.")
          } else if (newCount >= 2) {
            alert("Assessment terminated due to multiple tab switches.")
            if (!submittedRef.current) {
              submittedRef.current = true
              handleSubmit()
            }
          }
          return newCount
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange)
  }, [])

  // Handle proctoring violations
  const handleProctoringViolation = (event: any) => {
    if (submittedRef.current) return

    if (event.type === "FACE_NOT_DETECTED") {
      setFaceDetectionFailures((prev) => prev + 1)
    } else if (event.type === "VOICE_DETECTED") {
      setVoiceDetections((prev) => prev + 1)
    }

    setProctoringViolations((prev) => {
      const newCount = prev + 1
      violationCountRef.current = newCount

      if (event.severity === "high" && newCount >= 5) {
        setTimeout(() => {
          if (!submittedRef.current) {
            alert("Assessment terminated due to multiple security violations.")
            submittedRef.current = true
            handleSubmit()
          }
        }, 100)
      }

      return newCount
    })
  }

  const handleSubmit = async () => {
    if (submittedRef.current) return

    setIsSubmitting(true)

    try {
      const response = await fetch(`/api/company-test/${params.sessionId}/submit`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          candidateEmail: email,
          answers,
          timeSpent: testSession ? testSession.duration_minutes * 60 - timeLeft : 0,
          proctoringData: {
            tabSwitches: tabSwitchWarnings,
            totalViolations: violationCountRef.current,
            faceDetectionFailures,
            voiceDetections,
          },
        }),
      })

      if (response.ok) {
        router.push(`/company-test/${params.sessionId}/thank-you?email=${encodeURIComponent(email || "")}`)
      } else {
        throw new Error("Submission failed")
      }
    } catch (error) {
      console.error("Submission error:", error)
      setIsSubmitting(false)
      submittedRef.current = false
      alert("Failed to submit test. Please try again.")
    }
  }

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const handleAnswerChange = (questionId: string, answer: any) => {
    setAnswers((prev) => ({ ...prev, [questionId]: answer }))
  }

  const handleNext = () => {
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion((prev) => prev + 1)
    }
  }

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion((prev) => prev - 1)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-purple-600 mx-auto mb-4" />
          <p className="text-gray-600">Loading assessment...</p>
        </div>
      </div>
    )
  }

  if (error || !testSession || questions.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Assessment Not Available</h2>
          <p className="text-gray-600 mb-4">{error || "This test session is not available or has no questions."}</p>
          <Link href={`/company-test/${params.sessionId}/login`}>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6">Return to Login</Button>
          </Link>
        </div>
      </div>
    )
  }

  const currentQ = questions[currentQuestion]
  const progress = ((currentQuestion + 1) / questions.length) * 100

  if (isSubmitting) {
    return (
      <div className="min-h-screen bg-purple-600 flex items-center justify-center">
        <div className="text-center text-white">
          <div className="animate-spin w-12 h-12 border-2 border-white border-t-transparent rounded-full mx-auto mb-6"></div>
          <h2 className="text-2xl font-semibold mb-4">Submitting Assessment</h2>
          <p className="text-purple-200">Processing your responses...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full overflow-hidden">
                  <img src="/apple-touch-icon.png" alt="Logo" className="w-full h-full object-cover" />
                </div>
                <span className="text-xl font-semibold text-gray-900">WorkZen</span>
              </Link>
              <Badge variant="outline" className="border-purple-200 text-purple-700 px-4 py-2">
                {testSession.test_name}
              </Badge>
            </div>

            <div className="flex items-center space-x-4">
              {tabSwitchWarnings > 0 && (
                <div className="flex items-center space-x-2 text-red-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Tab Switches: {tabSwitchWarnings}</span>
                </div>
              )}

              {faceDetectionFailures > 0 && (
                <div className="flex items-center space-x-2 text-orange-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Face Issues: {faceDetectionFailures}</span>
                </div>
              )}

              {voiceDetections > 0 && (
                <div className="flex items-center space-x-2 text-yellow-600">
                  <AlertTriangle className="w-4 h-4" />
                  <span className="text-sm font-medium">Voice: {voiceDetections}</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <Clock className="w-4 h-4 text-gray-600" />
                <span className="font-mono text-lg font-semibold text-gray-900">{formatTime(timeLeft)}</span>
              </div>

              <Alert className="bg-red-50 border-red-200 text-red-800 py-2 px-3">
                <AlertTriangle className="w-4 h-4" />
                <AlertDescription className="text-sm">Monitored Assessment</AlertDescription>
              </Alert>
            </div>
          </div>
        </div>
      </header>

      {/* Progress Bar */}
      <div className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">
              Question {currentQuestion + 1} of {questions.length}
            </span>
            <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="flex h-[calc(100vh-140px)]">
        {/* Main Content */}
        <div className="flex-1 p-6 overflow-y-auto">
          <div className="max-w-6xl mx-auto">
            {currentQ.type === "CODING" ? (
              <CodeEditor
                language={currentQ.language || "python"}
                templateCode={currentQ.template_code || ""}
                testCases={currentQ.test_cases || []}
                onCodeChange={(code) => handleAnswerChange(currentQ.id, code)}
                questionText={currentQ.question_text}
              />
            ) : (
              <Card className="border border-gray-200 rounded-xl shadow-sm">
                <CardHeader>
                  <CardTitle className="flex items-center space-x-3">
                    <CheckCircle className="w-6 h-6 text-purple-600" />
                    <span>Multiple Choice Question</span>
                    <Badge variant="outline" className="bg-purple-50 text-purple-700">
                      {currentQ.points} {currentQ.points === 1 ? "point" : "points"}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-6">
                    <pre className="whitespace-pre-wrap text-gray-900 font-mono text-sm leading-relaxed">
                      {currentQ.question_text}
                    </pre>
                  </div>

                  {currentQ.options && (
                    <RadioGroup
                      value={answers[currentQ.id]?.toString() || ""}
                      onValueChange={(value) => handleAnswerChange(currentQ.id, Number.parseInt(value))}
                      className="space-y-3"
                    >
                      {currentQ.options.map((option, index) => (
                        <div
                          key={index}
                          className="flex items-center space-x-4 p-4 border border-gray-200 hover:border-purple-300 rounded-xl hover:bg-purple-50 transition-colors"
                        >
                          <RadioGroupItem value={index.toString()} id={`option-${index}`} />
                          <Label htmlFor={`option-${index}`} className="flex-1 cursor-pointer text-gray-900">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}

                  <div className="flex justify-between pt-6 border-t border-gray-200">
                    <Button
                      variant="outline"
                      onClick={handlePrevious}
                      disabled={currentQuestion === 0}
                      className="border-gray-300 text-gray-700 hover:bg-gray-50 rounded-full px-6 bg-transparent"
                    >
                      Previous
                    </Button>

                    <div className="space-x-3">
                      {currentQuestion === questions.length - 1 ? (
                        <Button
                          onClick={() => {
                            if (!submittedRef.current) {
                              submittedRef.current = true
                              handleSubmit()
                            }
                          }}
                          className="bg-green-600 hover:bg-green-700 text-white rounded-full px-8 font-medium"
                          disabled={isSubmitting}
                        >
                          Submit Assessment
                        </Button>
                      ) : (
                        <Button
                          onClick={handleNext}
                          className="bg-purple-600 hover:bg-purple-700 text-white rounded-full px-6"
                        >
                          Next Question
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>

        {/* Proctoring Panel */}
        <div className="w-80 bg-white border-l border-gray-200 p-6 overflow-y-auto">
          <ProctoringMonitor onViolation={handleProctoringViolation} isActive={true} />

          {/* Test Progress */}
          <Card className="mt-6 border border-gray-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Test Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {questions.map((_, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <div
                      className={`w-3 h-3 rounded-full ${
                        index < currentQuestion
                          ? "bg-green-500"
                          : index === currentQuestion
                            ? "bg-purple-500"
                            : "bg-gray-300"
                      }`}
                    />
                    <span className="text-sm text-gray-600">
                      Question {index + 1}
                      {answers[questions[index].id] !== undefined && index !== currentQuestion && (
                        <CheckCircle className="w-3 h-3 text-green-500 inline ml-1" />
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Violation Summary */}
          <Card className="mt-4 border border-gray-200 rounded-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm flex items-center space-x-2">
                <AlertTriangle className="w-4 h-4 text-orange-600" />
                <span>Security Summary</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Tab Switches:</span>
                <span className="font-medium text-red-600">{tabSwitchWarnings}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Face Issues:</span>
                <span className="font-medium text-orange-600">{faceDetectionFailures}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Voice Detected:</span>
                <span className="font-medium text-yellow-600">{voiceDetections}</span>
              </div>
              <div className="flex justify-between text-sm pt-2 border-t border-gray-200">
                <span className="text-gray-600">Total Violations:</span>
                <span className="font-medium text-red-600">{proctoringViolations}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
