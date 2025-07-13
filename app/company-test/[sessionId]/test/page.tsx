"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useRouter } from "next/navigation"
import dynamic from 'next/dynamic'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Loader2,
  CheckCircle,
  XCircle,
  Clock,
  Building2,
  AlertCircle,
  Trophy,
  Maximize,
  Users,
  Mic,
  Camera,
  Code,
  FileText,
  ChevronRight,
  ChevronLeft,
  Monitor,
  Shield,
  Eye,
  MicOff,
  Minimize,
  Play,
} from "lucide-react"
import { Badge } from "@/components/ui/badge"

// Dynamically import the face-api models with SSR disabled
const loadFaceApi = async () => {
  if (typeof window !== 'undefined') {
    try {
      // Use dynamic import to avoid SSR issues
      const faceapi = (await import('face-api.js/dist/face-api.min.js')).default;
      
      // Only load models in browser environment
      if (typeof window !== 'undefined') {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri('/models'),
          faceapi.nets.faceLandmark68Net.loadFromUri('/models'),
          faceapi.nets.faceRecognitionNet.loadFromUri('/models'),
        ]);
      }
      return faceapi;
    } catch (error) {
      console.error('Error loading face-api models:', error);
      throw error;
    }
  }
  return null;
}

interface FaceDetectionProps {
  onFaceDetected: (detections: any[]) => void;
  onError: (error: Error) => void;
}

// Create a component that will load face-api only on the client side
const FaceDetection = ({ onFaceDetected, onError }: FaceDetectionProps) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let faceapi: any = null
    let stream: MediaStream | null = null
    let detectionInterval: NodeJS.Timeout

    const startFaceDetection = async () => {
      try {
        faceapi = await loadFaceApi()
        if (!faceapi) return

        stream = await navigator.mediaDevices.getUserMedia({ video: true })
        if (videoRef.current) {
          videoRef.current.srcObject = stream
          await new Promise((resolve) => {
            if (videoRef.current) {
              videoRef.current.onloadedmetadata = resolve
            }
          })

          detectionInterval = setInterval(async () => {
            if (videoRef.current && canvasRef.current) {
              const detections = await faceapi.detectAllFaces(
                videoRef.current,
                new faceapi.TinyFaceDetectorOptions()
              ).withFaceLandmarks().withFaceExpressions()
              
              if (detections.length > 0) {
                onFaceDetected(detections)
              } else {
                onFaceDetected([])
              }
            }
          }, 500)
          
          setIsLoading(false)
        }
      } catch (err) {
        console.error('Face detection error:', err)
        setError('Could not access camera or load face detection')
        onError(err instanceof Error ? err : new Error(String(err)))
        setIsLoading(false)
      }
    }

    startFaceDetection()

    return () => {
      clearInterval(detectionInterval)
      if (stream) {
        stream.getTracks().forEach(track => track.stop())
      }
    }
  }, [onFaceDetected, onError])

  if (error) {
    return <div className="text-red-500">{error}</div>
  }

  return (
    <div className="relative w-full max-w-md mx-auto">
      <video
        ref={videoRef}
        autoPlay
        muted
        playsInline
        className="w-full h-auto rounded-lg"
      />
      <canvas
        ref={canvasRef}
        className="absolute top-0 left-0 w-full h-full"
      />
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
          <Loader2 className="w-8 h-8 animate-spin text-white" />
        </div>
      )}
    </div>
  )
}

// Export a component that only renders on client side
const FaceDetectionComponent = dynamic(
  () => Promise.resolve(({ onFaceDetected, onError }: any) => (
    <Suspense fallback={<div>Loading face detection...</div>}>
      <FaceDetection onFaceDetected={onFaceDetected} onError={onError} />
    </Suspense>
  )),
  { ssr: false }
)
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Progress } from "@/components/ui/progress"
import { CodeEditor } from "@/components/code-editor"
import { Separator } from "@/components/ui/separator"
import Webcam from "react-webcam"
import * as faceapi from "face-api.js"
import screenfull from "screenfull"

interface Question {
  id: string
  question_text: string
  question_type: "multiple_choice" | "coding"
  options?: string[]
  order_num: number
  points?: number
  language?: string
  template_code?: string
  test_cases?: Array<{
    input: string
    expected: string
    description?: string
  }>
}

interface TestSessionInfo {
  testSessionId: string
  email?: string
  duration: number
  testName: string
  companyName: string
  startTime: string
  token?: string
  proctorSettings?: {
    requireCamera?: boolean
    detectFaces?: boolean
    requireFullScreen?: boolean
    monitorAudio?: boolean
    requireScreenShare?: boolean
  }
}

export default function TestPage({ params }: { params: { sessionId: string } }) {
  const router = useRouter()
  const { sessionId } = params

  // Test state management
  const [questions, setQuestions] = useState<Question[]>([])
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<Record<number, { answer: string; code?: string; type: string }>>({})
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [timeLeft, setTimeLeft] = useState(60 * 60)
  const [testSession, setTestSession] = useState<TestSessionInfo | null>(null)
  const [testStarted, setTestStarted] = useState(false)

  // Proctoring state management
  const [isCameraOn, setIsCameraOn] = useState(false)
  const [isMicOn, setIsMicOn] = useState(false)
  const [isFullScreen, setIsFullScreen] = useState(false)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [faceCount, setFaceCount] = useState(0)
  const [faceWarning, setFaceWarning] = useState(false)
  const [audioLevel, setAudioLevel] = useState(0)
  const [proctoringViolations, setProctoringViolations] = useState<string[]>([])
  const [canStartTest, setCanStartTest] = useState(false)

  // Refs
  const webcamRef = useRef<Webcam>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const audioAnalyserRef = useRef<AnalyserNode | null>(null)
  const audioStreamRef = useRef<MediaStream | null>(null)
  const screenStreamRef = useRef<MediaStream | null>(null)

  // Disable right-click and keyboard shortcuts
  useEffect(() => {
    const disableRightClick = (e: MouseEvent) => {
      e.preventDefault()
      return false
    }

    const disableKeyboardShortcuts = (e: KeyboardEvent) => {
      // Disable F12, Ctrl+Shift+I, Ctrl+Shift+J, Ctrl+U, Ctrl+S, etc.
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && (e.key === "I" || e.key === "J" || e.key === "C")) ||
        (e.ctrlKey && (e.key === "u" || e.key === "U" || e.key === "s" || e.key === "S")) ||
        (e.ctrlKey && e.shiftKey && e.key === "Delete") ||
        e.key === "F5" ||
        (e.ctrlKey && e.key === "r")
      ) {
        e.preventDefault()
        return false
      }
    }

    const disableSelection = (e: Event) => {
      e.preventDefault()
      return false
    }

    if (testStarted) {
      document.addEventListener("contextmenu", disableRightClick)
      document.addEventListener("keydown", disableKeyboardShortcuts)
      document.addEventListener("selectstart", disableSelection)
      document.addEventListener("dragstart", disableSelection)
    }

    return () => {
      document.removeEventListener("contextmenu", disableRightClick)
      document.removeEventListener("keydown", disableKeyboardShortcuts)
      document.removeEventListener("selectstart", disableSelection)
      document.removeEventListener("dragstart", disableSelection)
    }
  }, [testStarted])

  // Initialize face-api models
  useEffect(() => {
    const loadFaceApiModels = async () => {
      try {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri("/models"),
          faceapi.nets.faceLandmark68Net.loadFromUri("/models"),
          faceapi.nets.faceRecognitionNet.loadFromUri("/models"),
          faceapi.nets.faceExpressionNet.loadFromUri("/models"),
        ])
      } catch (error) {
        console.error("Error loading Face API models:", error)
      }
    }

    loadFaceApiModels()

    return () => {
      // Cleanup
      if (screenfull.isEnabled && screenfull.isFullscreen) {
        screenfull.exit()
      }
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  // Load test session data
  useEffect(() => {
    const loadSession = () => {
      try {
        if (typeof window === "undefined") return null

        const sessionData = localStorage.getItem("testSession")
        if (!sessionData) {
          router.push(`/company-test/${sessionId}/login`)
          return null
        }

        const session = JSON.parse(sessionData)
        if (!session.testSessionId) {
          throw new Error("Invalid session data")
        }

        if (!session.proctorSettings) {
          session.proctorSettings = {
            requireCamera: true,
            detectFaces: true,
            requireFullScreen: true,
            monitorAudio: true,
            requireScreenShare: true,
          }
        }

        return session
      } catch (error) {
        console.error("Error loading session:", error)
        router.push(`/company-test/${sessionId}/login`)
        return null
      }
    }

    const session = loadSession()
    if (!session) return

    setTestSession(session)

    const fetchQuestions = async () => {
      try {
        const token = localStorage.getItem("testSessionToken") || session?.token

        const response = await fetch(`/api/test-sessions/${sessionId}/questions`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: `Bearer ${token}` } : {}),
          },
          cache: "no-store",
        })

        if (!response.ok) {
          throw new Error("Failed to fetch questions")
        }

        const data = await response.json()
        if (data.questions && data.questions.length > 0) {
          setQuestions(data.questions)
        } else {
          throw new Error("No questions available for this test")
        }
      } catch (error) {
        console.error("Error fetching questions:", error)
        setError(error instanceof Error ? error.message : "Failed to load questions. Please try again.")
      } finally {
        setIsLoading(false)
      }
    }

    fetchQuestions()
  }, [sessionId, router])

  // Check if all proctoring requirements are met
  useEffect(() => {
    const checkProctoringRequirements = () => {
      if (!testSession?.proctorSettings) return false

      const requirements = [
        !testSession.proctorSettings.requireCamera || isCameraOn,
        !testSession.proctorSettings.monitorAudio || isMicOn,
        !testSession.proctorSettings.requireFullScreen || isFullScreen,
        !testSession.proctorSettings.requireScreenShare || isScreenSharing,
      ]

      return requirements.every(Boolean)
    }

    setCanStartTest(checkProctoringRequirements())
  }, [isCameraOn, isMicOn, isFullScreen, isScreenSharing, testSession])

  // Timer effect
  useEffect(() => {
    if (!testStarted) return

    if (testSession?.startTime && testSession?.duration) {
      const startTime = new Date(testSession.startTime).getTime()
      const currentTime = new Date().getTime()
      const elapsedSeconds = Math.floor((currentTime - startTime) / 1000)
      const durationSeconds = testSession.duration * 60
      const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds)

      setTimeLeft(remainingSeconds)
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          handleSubmitTest()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [testSession, testStarted])

  // Handle answer changes
  const handleAnswerChange = (questionIndex: number, answer: string, code?: string) => {
    const question = questions[questionIndex]
    setAnswers((prev) => ({
      ...prev,
      [questionIndex]: {
        answer,
        code,
        type: question.question_type,
      },
    }))
  }

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1)
    }
  }

  const handlePreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1)
    }
  }

  const handleSubmitTest = async () => {
    if (!testSession) {
      router.push(`/company-test/${sessionId}/login`)
      return
    }

    setIsSubmitting(true)
    try {
      const token = localStorage.getItem("testSessionToken") || testSession?.token
      const email = testSession.email || localStorage.getItem("candidateEmail")

      if (!email) {
        throw new Error("Email not found in session")
      }

      const submissionAnswers = questions.map((q, index) => ({
        questionId: q.id,
        answer: answers[index]?.answer || "",
        code: answers[index]?.code || "",
        questionType: q.question_type,
        timestamp: new Date().toISOString(),
      }))

      const response = await fetch(`/api/test-sessions/${sessionId}/submit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          email,
          completedAt: new Date().toISOString(),
          answers: submissionAnswers,
          violations: proctoringViolations,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.error || "Failed to submit test")
      }

      const result = await response.json()

      localStorage.setItem(
        "testResults",
        JSON.stringify({
          score: result.score,
          totalQuestions: questions.length,
          passed: result.passed,
          completedAt: new Date().toISOString(),
        }),
      )

      localStorage.removeItem("testSession")
      router.push(`/company-test/${sessionId}/thank-you`)
    } catch (error) {
      console.error("Error submitting test:", error)
      setError(error instanceof Error ? error.message : "Failed to submit test. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Proctoring functions
  const detectFaces = async () => {
    if (!webcamRef.current || !webcamRef.current.video || !canvasRef.current) return

    const video = webcamRef.current.video
    const canvas = canvasRef.current

    canvas.width = video.width
    canvas.height = video.height

    if (video.readyState !== 4) return

    try {
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions())
        .withFaceLandmarks()
        .withFaceExpressions()

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      setFaceCount(detections.length)

      if (detections.length > 1) {
        setFaceWarning(true)
        if (!proctoringViolations.includes("multiple_faces")) {
          setProctoringViolations([...proctoringViolations, "multiple_faces"])
        }
      } else if (detections.length === 0) {
        if (!proctoringViolations.includes("no_face_detected")) {
          setProctoringViolations([...proctoringViolations, "no_face_detected"])
        }
      } else {
        setFaceWarning(false)
      }

      faceapi.draw.drawDetections(canvas, detections)
      faceapi.draw.drawFaceLandmarks(canvas, detections)
    } catch (error) {
      console.error("Error during face detection:", error)
    }
  }

  const toggleFullScreen = async () => {
    if (!screenfull.isEnabled) {
      setError("Fullscreen is not supported in your browser")
      return
    }

    try {
      if (!screenfull.isFullscreen) {
        await screenfull.request(document.documentElement)
        setIsFullScreen(true)
      } else {
        await screenfull.exit()
        setIsFullScreen(false)

        if (testSession?.proctorSettings?.requireFullScreen && !proctoringViolations.includes("exited_fullscreen")) {
          setProctoringViolations([...proctoringViolations, "exited_fullscreen"])
        }
      }
    } catch (error) {
      console.error("Error toggling fullscreen:", error)
      setError("Failed to toggle fullscreen mode")
    }
  }

  const toggleCamera = async () => {
    if (isCameraOn) {
      setIsCameraOn(false)
      if (audioStreamRef.current) {
        audioStreamRef.current.getTracks().forEach((track) => track.stop())
        audioStreamRef.current = null
      }

      if (testSession?.proctorSettings?.requireCamera && !proctoringViolations.includes("camera_off")) {
        setProctoringViolations([...proctoringViolations, "camera_off"])
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: testSession?.proctorSettings?.monitorAudio || false,
        })

        setIsCameraOn(true)
        audioStreamRef.current = stream

        if (testSession?.proctorSettings?.monitorAudio) {
          setIsMicOn(true)
          setupAudioMonitoring(stream)
        }
      } catch (error) {
        console.error("Error accessing camera:", error)
        setError("Failed to access camera. Please check your permissions and try again.")
      }
    }
  }

  const toggleMicrophone = async () => {
    if (isMicOn) {
      setIsMicOn(false)
      if (audioContextRef.current) {
        audioContextRef.current.close()
        audioContextRef.current = null
      }
    } else {
      try {
        if (!audioStreamRef.current) {
          const stream = await navigator.mediaDevices.getUserMedia({
            video: false,
            audio: true,
          })
          audioStreamRef.current = stream
        }
        setIsMicOn(true)
        setupAudioMonitoring(audioStreamRef.current)
      } catch (error) {
        console.error("Error accessing microphone:", error)
        setError("Failed to access microphone. Please check your permissions and try again.")
      }
    }
  }

  const toggleScreenShare = async () => {
    if (isScreenSharing) {
      setIsScreenSharing(false)
      if (screenStreamRef.current) {
        screenStreamRef.current.getTracks().forEach((track) => track.stop())
        screenStreamRef.current = null
      }
    } else {
      try {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: false,
        })

        setIsScreenSharing(true)
        screenStreamRef.current = stream

        // Listen for when user stops sharing
        stream.getVideoTracks()[0].addEventListener("ended", () => {
          setIsScreenSharing(false)
          screenStreamRef.current = null
          if (!proctoringViolations.includes("screen_share_stopped")) {
            setProctoringViolations([...proctoringViolations, "screen_share_stopped"])
          }
        })
      } catch (error) {
        console.error("Error accessing screen share:", error)
        setError("Failed to start screen sharing. Please check your permissions and try again.")
      }
    }
  }

  const setupAudioMonitoring = (stream: MediaStream) => {
    try {
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
      const analyser = audioContext.createAnalyser()
      const microphone = audioContext.createMediaStreamSource(stream)
      microphone.connect(analyser)
      analyser.fftSize = 512

      audioContextRef.current = audioContext
      audioAnalyserRef.current = analyser

      const dataArray = new Uint8Array(analyser.frequencyBinCount)

      const checkAudioLevel = () => {
        if (!audioAnalyserRef.current) return

        audioAnalyserRef.current.getByteFrequencyData(dataArray)
        let sum = 0
        for (let i = 0; i < dataArray.length; i++) {
          sum += dataArray[i]
        }

        const avg = sum / dataArray.length
        setAudioLevel(avg)
      }

      const audioInterval = setInterval(checkAudioLevel, 100)

      return () => {
        clearInterval(audioInterval)
        if (audioContextRef.current) {
          audioContextRef.current.close()
        }
      }
    } catch (error) {
      console.error("Error setting up audio monitoring:", error)
    }
  }

  const startTest = () => {
    if (canStartTest) {
      setTestStarted(true)
    }
  }

  // Face detection loop
  useEffect(() => {
    if (!isCameraOn || !testSession?.proctorSettings?.detectFaces || !testStarted) return

    const faceDetectionInterval = setInterval(detectFaces, 500)

    return () => clearInterval(faceDetectionInterval)
  }, [isCameraOn, testSession?.proctorSettings?.detectFaces, testStarted])

  // Monitor fullscreen changes
  useEffect(() => {
    if (!screenfull.isEnabled || !testSession?.proctorSettings?.requireFullScreen) return

    const handleFullscreenChange = () => {
      setIsFullScreen(screenfull.isFullscreen)

      if (
        !screenfull.isFullscreen &&
        testSession?.proctorSettings?.requireFullScreen &&
        testStarted &&
        !proctoringViolations.includes("exited_fullscreen")
      ) {
        setProctoringViolations((prev) => [...prev, "exited_fullscreen"])
      }
    }

    if (screenfull.isEnabled) {
      screenfull.on("change", handleFullscreenChange)
    }

    return () => {
      if (screenfull.isEnabled) {
        screenfull.off("change", handleFullscreenChange)
      }
    }
  }, [testSession?.proctorSettings?.requireFullScreen, testStarted])

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 to-blue-50">
        <div className="text-center">
          <div className="relative">
            <div className="w-20 h-20 border-4 border-purple-200 rounded-full animate-pulse"></div>
            <div className="absolute top-0 left-0 w-20 h-20 border-4 border-purple-600 rounded-full border-t-transparent animate-spin"></div>
          </div>
          <p className="text-xl font-semibold text-gray-900 mt-6">Loading Assessment...</p>
          <p className="text-gray-600 mt-2">Please wait while we prepare your test</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-orange-50">
        <div className="text-center max-w-md p-8 bg-white rounded-2xl shadow-xl">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="h-8 w-8 text-red-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Load Test</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <Button onClick={() => window.location.reload()} className="bg-purple-600 hover:bg-purple-700">
            Try Again
          </Button>
        </div>
      </div>
    )
  }

  const currentQuestion = questions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / questions.length) * 100
  const currentAnswer = answers[currentQuestionIndex]
  const isAnswered = currentAnswer && (currentAnswer.answer || currentAnswer.code)

  // Show proctoring setup if requirements not met or test not started
  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl shadow-2xl">
          <CardHeader className="text-center bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-t-lg">
            <Shield className="h-12 w-12 mx-auto mb-4" />
            <CardTitle className="text-2xl">Proctoring Setup Required</CardTitle>
            <p className="text-purple-100 mt-2">Please enable all monitoring features to start your test</p>
          </CardHeader>
          <CardContent className="p-8 space-y-6">
            {/* Camera */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Camera className={`h-6 w-6 ${isCameraOn ? "text-green-600" : "text-gray-400"}`} />
                <div>
                  <h3 className="font-semibold">Camera Access</h3>
                  <p className="text-sm text-gray-600">Required for identity verification</p>
                </div>
              </div>
              <Button
                onClick={toggleCamera}
                variant={isCameraOn ? "default" : "outline"}
                className={isCameraOn ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isCameraOn ? "Enabled" : "Enable"}
              </Button>
            </div>

            {/* Microphone */}
            {testSession?.proctorSettings?.monitorAudio && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Mic className={`h-6 w-6 ${isMicOn ? "text-green-600" : "text-gray-400"}`} />
                  <div>
                    <h3 className="font-semibold">Microphone Access</h3>
                    <p className="text-sm text-gray-600">Required for audio monitoring</p>
                  </div>
                </div>
                <Button
                  onClick={toggleMicrophone}
                  variant={isMicOn ? "default" : "outline"}
                  className={isMicOn ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isMicOn ? "Enabled" : "Enable"}
                </Button>
              </div>
            )}

            {/* Screen Share */}
            {testSession?.proctorSettings?.requireScreenShare && (
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Monitor className={`h-6 w-6 ${isScreenSharing ? "text-green-600" : "text-gray-400"}`} />
                  <div>
                    <h3 className="font-semibold">Screen Sharing</h3>
                    <p className="text-sm text-gray-600">Required for screen monitoring</p>
                  </div>
                </div>
                <Button
                  onClick={toggleScreenShare}
                  variant={isScreenSharing ? "default" : "outline"}
                  className={isScreenSharing ? "bg-green-600 hover:bg-green-700" : ""}
                >
                  {isScreenSharing ? "Sharing" : "Start Sharing"}
                </Button>
              </div>
            )}

            {/* Fullscreen */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex items-center space-x-3">
                <Maximize className={`h-6 w-6 ${isFullScreen ? "text-green-600" : "text-gray-400"}`} />
                <div>
                  <h3 className="font-semibold">Fullscreen Mode</h3>
                  <p className="text-sm text-gray-600">Required to prevent distractions</p>
                </div>
              </div>
              <Button
                onClick={toggleFullScreen}
                variant={isFullScreen ? "default" : "outline"}
                className={isFullScreen ? "bg-green-600 hover:bg-green-700" : ""}
              >
                {isFullScreen ? "Enabled" : "Enable"}
              </Button>
            </div>

            {/* Start Test Button */}
            <div className="pt-4">
              <Button
                className={`w-full text-lg py-3 ${
                  canStartTest ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-300 cursor-not-allowed"
                }`}
                onClick={startTest}
                disabled={!canStartTest}
              >
                <Play className="h-5 w-5 mr-2" />
                {canStartTest ? "Start Test" : "Enable All Requirements"}
              </Button>

              {!canStartTest && (
                <p className="text-sm text-gray-500 text-center mt-2">
                  Please enable all required features above to start the test
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50" ref={containerRef}>
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h1 className="text-xl font-bold text-gray-900">{testSession?.testName || "Assessment"}</h1>
                  <p className="text-sm text-gray-600">{testSession?.companyName || "Company"}</p>
                </div>
              </div>
              <div className="flex items-center space-x-4">
                <div className="flex items-center bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800 px-4 py-2 rounded-full text-sm font-semibold shadow-sm">
                  <Clock className="h-4 w-4 mr-2" />
                  {formatTime(timeLeft)}
                </div>
                <Badge className="bg-purple-100 text-purple-700 px-3 py-1">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </Badge>
              </div>
            </div>
          </div>

          <div className="py-4">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-700">Progress</span>
              <span className="text-sm text-gray-500">{Math.round(progress)}% Complete</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
          {/* Question Navigation Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm mb-6">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-purple-600" />
                  Questions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                {questions.map((_, index) => {
                  const isAnswered = answers[index] && (answers[index].answer || answers[index].code)
                  const isCurrent = index === currentQuestionIndex

                  return (
                    <Button
                      key={index}
                      variant={isCurrent ? "default" : "ghost"}
                      size="sm"
                      className={`w-full justify-start ${
                        isCurrent
                          ? "bg-purple-600 text-white"
                          : isAnswered
                            ? "bg-green-50 text-green-700 hover:bg-green-100"
                            : "hover:bg-gray-100"
                      }`}
                      onClick={() => setCurrentQuestionIndex(index)}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span>Q{index + 1}</span>
                        {isAnswered && !isCurrent && <CheckCircle className="h-4 w-4" />}
                        {questions[index].question_type === "coding" && <Code className="h-4 w-4" />}
                      </div>
                    </Button>
                  )
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Question Area */}
          <div className="lg:col-span-3">
            <Card className="shadow-xl border-0 bg-white/90 backdrop-blur-sm">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Badge variant="outline" className="bg-white">
                        {currentQuestion?.question_type === "coding" ? (
                          <>
                            <Code className="h-3 w-3 mr-1" />
                            Coding
                          </>
                        ) : (
                          <>
                            <FileText className="h-3 w-3 mr-1" />
                            Multiple Choice
                          </>
                        )}
                      </Badge>
                      {currentQuestion?.points && (
                        <Badge className="bg-amber-100 text-amber-700">{currentQuestion.points} points</Badge>
                      )}
                    </div>
                    <CardTitle className="text-2xl">Question {currentQuestionIndex + 1}</CardTitle>
                  </div>
                </div>
              </CardHeader>

              <CardContent className="p-8">
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-6 leading-relaxed">
                    {currentQuestion?.question_text}
                  </h3>

                  {/* Multiple Choice Questions */}
                  {currentQuestion?.question_type === "multiple_choice" && (
                    <div className="space-y-3">
                      {currentQuestion.options && currentQuestion.options.length > 0 ? (
                        currentQuestion.options.map((option, index) => {
                          const isSelected = currentAnswer?.answer === option
                          return (
                            <Button
                              key={index}
                              variant="outline"
                              className={`w-full justify-start text-left h-auto py-4 px-6 transition-all duration-200 ${
                                isSelected
                                  ? "bg-purple-50 border-purple-300 text-purple-800 shadow-md"
                                  : "hover:bg-gray-50 hover:border-gray-300"
                              }`}
                              onClick={() => handleAnswerChange(currentQuestionIndex, option)}
                            >
                              <div className="flex items-center w-full">
                                <div
                                  className={`w-6 h-6 rounded-full border-2 mr-4 flex items-center justify-center ${
                                    isSelected ? "border-purple-500 bg-purple-500" : "border-gray-300"
                                  }`}
                                >
                                  {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                                </div>
                                <div className="flex-1">
                                  <span className="font-medium mr-3 text-gray-600">
                                    {String.fromCharCode(65 + index)}.
                                  </span>
                                  <span className="text-gray-900">{option}</span>
                                </div>
                              </div>
                            </Button>
                          )
                        })
                      ) : (
                        <div className="text-center py-8 text-gray-500">
                          <AlertCircle className="h-8 w-8 mx-auto mb-2" />
                          <p>No options available for this question</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Coding Questions */}
                  {currentQuestion?.question_type === "coding" && (
                    <div className="mt-6">
                      <CodeEditor
                        language={currentQuestion.language || "javascript"}
                        templateCode={currentQuestion.template_code || "// Write your code here\n"}
                        testCases={currentQuestion.test_cases || []}
                        onCodeChange={(code) => handleAnswerChange(currentQuestionIndex, code, code)}
                        questionText={currentQuestion.question_text}
                      />
                    </div>
                  )}
                </div>

                {/* Navigation */}
                <div className="flex justify-between items-center pt-6 border-t">
                  <Button
                    variant="outline"
                    onClick={handlePreviousQuestion}
                    disabled={currentQuestionIndex === 0}
                    className="flex items-center bg-transparent"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Previous
                  </Button>

                  <div className="flex items-center space-x-4">
                    {isAnswered && (
                      <div className="flex items-center text-green-600 text-sm">
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Answered
                      </div>
                    )}

                    {currentQuestionIndex < questions.length - 1 ? (
                      <Button
                        onClick={handleNextQuestion}
                        className="bg-purple-600 hover:bg-purple-700 flex items-center"
                      >
                        Next
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Button>
                    ) : (
                      <Button
                        onClick={handleSubmitTest}
                        disabled={isSubmitting}
                        className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-lg"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Submitting...
                          </>
                        ) : (
                          <>
                            <Trophy className="mr-2 h-4 w-4" />
                            Submit Test
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Proctoring Sidebar */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8 shadow-lg border-0 bg-white/80 backdrop-blur-sm">
              <CardHeader className="pb-4">
                <CardTitle className="text-lg flex items-center">
                  <Shield className="h-5 w-5 mr-2 text-purple-600" />
                  Proctoring
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Camera Feed */}
                {isCameraOn && (
                  <div className="relative">
                    <Webcam
                      ref={webcamRef}
                      audio={false}
                      videoConstraints={{
                        width: 200,
                        height: 150,
                        facingMode: "user",
                      }}
                      className="w-full rounded-lg"
                    />
                    <canvas
                      ref={canvasRef}
                      className="absolute top-0 left-0 w-full h-full rounded-lg"
                      style={{ width: "100%", height: "auto" }}
                    />
                    <div className="absolute bottom-2 left-2 right-2 bg-black bg-opacity-70 text-white p-1 text-xs rounded flex justify-between items-center">
                      <div className="flex items-center">
                        <Users className="h-3 w-3 mr-1" />
                        <span>{faceCount}</span>
                      </div>
                      <Eye className="h-3 w-3 text-green-400" />
                    </div>
                  </div>
                )}

                <Separator />

                {/* Status Indicators */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Camera className={`h-4 w-4 ${isCameraOn ? "text-green-600" : "text-red-500"}`} />
                      <span className="text-sm">Camera</span>
                    </div>
                    <Badge variant={isCameraOn ? "default" : "destructive"} className="text-xs">
                      {isCameraOn ? "ON" : "OFF"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isMicOn ? (
                        <Mic className="h-4 w-4 text-green-600" />
                      ) : (
                        <MicOff className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">Microphone</span>
                    </div>
                    <Badge variant={isMicOn ? "default" : "destructive"} className="text-xs">
                      {isMicOn ? "ON" : "OFF"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      {isFullScreen ? (
                        <Maximize className="h-4 w-4 text-green-600" />
                      ) : (
                        <Minimize className="h-4 w-4 text-red-500" />
                      )}
                      <span className="text-sm">Fullscreen</span>
                    </div>
                    <Badge variant={isFullScreen ? "default" : "destructive"} className="text-xs">
                      {isFullScreen ? "ON" : "OFF"}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Monitor className={`h-4 w-4 ${isScreenSharing ? "text-green-600" : "text-red-500"}`} />
                      <span className="text-sm">Screen Share</span>
                    </div>
                    <Badge variant={isScreenSharing ? "default" : "destructive"} className="text-xs">
                      {isScreenSharing ? "ON" : "OFF"}
                    </Badge>
                  </div>
                </div>

                {/* Violations */}
                {proctoringViolations.length > 0 && (
                  <>
                    <Separator />
                    <div>
                      <h4 className="text-sm font-medium text-red-600 mb-2">Violations Detected</h4>
                      <div className="space-y-1">
                        {proctoringViolations.slice(-3).map((violation, index) => (
                          <div key={index} className="text-xs text-red-500 bg-red-50 p-2 rounded">
                            {violation.replace(/_/g, " ").toUpperCase()}
                          </div>
                        ))}
                      </div>
                    </div>
                  </>
                )}

                {/* Face Warning */}
                {faceWarning && (
                  <Alert className="bg-red-50 border-red-500">
                    <AlertCircle className="h-4 w-4 text-red-500" />
                    <AlertDescription className="text-red-800 text-xs">Multiple faces detected</AlertDescription>
                  </Alert>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
