"use client"

import { useState, useRef, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Camera, Mic, MicOff, Eye, EyeOff, AlertTriangle, Users, Volume2, Shield, Activity } from "lucide-react"
import { FaceDetector, createFaceDetector } from "@/lib/mediapipe-face-detection"

interface ProctoringEvent {
  type: "FACE_NOT_DETECTED" | "MULTIPLE_FACES" | "VOICE_DETECTED" | "TAB_SWITCH" | "SUSPICIOUS_ACTIVITY"
  timestamp: Date
  severity: "low" | "medium" | "high"
  description: string
}

interface ProctoringMonitorProps {
  onViolation: (event: ProctoringEvent) => void
  isActive: boolean
}

export function ProctoringMonitor({ onViolation, isActive }: ProctoringMonitorProps) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const mediaStreamRef = useRef<MediaStream | null>(null)
  const lastViolationTimeRef = useRef<{ [key: string]: number }>({})

  const [cameraActive, setCameraActive] = useState(false)
  const [microphoneActive, setMicrophoneActive] = useState(false)
  const [faceDetected, setFaceDetected] = useState(true) // Start optimistic
  const [faceCount, setFaceCount] = useState(1)
  const [voiceLevel, setVoiceLevel] = useState(0)
  const [recentViolations, setRecentViolations] = useState<ProctoringEvent[]>([])
  const voiceStartTimeRef = useRef<number | null>(null)
  const VOICE_MIN_DURATION = 1000 // Minimum voice duration in ms to trigger detection
  const VOICE_THRESHOLD = 70 // Increased threshold to ignore keyboard/background noise

  // Throttled violation handler to prevent spam
  const throttledOnViolation = (event: ProctoringEvent) => {
    const now = Date.now()
    const lastTime = lastViolationTimeRef.current[event.type] || 0

    // Throttle violations by type (minimum 3 seconds between same type)
    if (now - lastTime < 3000) return

    lastViolationTimeRef.current[event.type] = now
    onViolation(event)

    setRecentViolations((prev) => [...prev.slice(-2), event]) // Keep only last 3
  }

  // Initialize media devices
  useEffect(() => {
    if (!isActive) return

    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { ideal: 640 },
            height: { ideal: 480 },
            facingMode: "user",
          },
          audio: {
            echoCancellation: true,
            noiseSuppression: true,
            sampleRate: 44100,
          },
        })

        mediaStreamRef.current = stream

        if (videoRef.current) {
          videoRef.current.srcObject = stream
          setCameraActive(true)
        }

        // Initialize audio context for voice detection
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)()
        const source = audioContextRef.current.createMediaStreamSource(stream)
        analyserRef.current = audioContextRef.current.createAnalyser()
        analyserRef.current.fftSize = 256
        source.connect(analyserRef.current)
        setMicrophoneActive(true)
      } catch (error) {
        console.error("Media access denied:", error)
        const event: ProctoringEvent = {
          type: "SUSPICIOUS_ACTIVITY",
          timestamp: new Date(),
          severity: "high",
          description: "Camera/microphone access denied",
        }
        throttledOnViolation(event)
      }
    }

    initializeMedia()

    return () => {
      // Cleanup
      if (mediaStreamRef.current) {
        mediaStreamRef.current.getTracks().forEach((track) => track.stop())
      }
      if (audioContextRef.current && audioContextRef.current.state !== "closed") {
        audioContextRef.current.close()
      }
    }
  }, [isActive])

  // Initialize face detection when component mounts
  useEffect(() => {
    if (!isActive || !videoRef.current) return
    
    let faceDetector: FaceDetector | null = null;
    
    const onFaceDetection = (results: any) => {
      try {
        const detections = results.detections || [];
        const detectedFaces = detections.length;
        
        setFaceCount(detectedFaces);
        setFaceDetected(detectedFaces > 0);

        // Check for violations
        if (detectedFaces === 0) {
          const event: ProctoringEvent = {
            type: "FACE_NOT_DETECTED",
            timestamp: new Date(),
            severity: "medium",
            description: "No face detected in camera feed",
          }
          throttledOnViolation(event);
        } else if (detectedFaces > 1) {
          const event: ProctoringEvent = {
            type: "MULTIPLE_FACES",
            timestamp: new Date(),
            severity: "high",
            description: `${detectedFaces} faces detected - possible collaboration`,
          }
          throttledOnViolation(event)
        }
      } catch (error) {
        console.error("Face detection error:", error)
        // Fallback to optimistic values on error
        setFaceDetected(true)
        setFaceCount(1)
      }
    };

    // Initialize the face detector
    faceDetector = createFaceDetector(onFaceDetection);
    
    return () => {
      if (faceDetector) {
        faceDetector.stop();
      }
    };
  }, [isActive, throttledOnViolation])

  // Voice detection - runs every 200ms for better responsiveness
  useEffect(() => {
    if (!isActive || !microphoneActive || !analyserRef.current) return

    const voiceDetectionInterval = setInterval(() => {
      if (!analyserRef.current) return

      const analyser = analyserRef.current
      const dataArray = new Uint8Array(analyser.frequencyBinCount)
      analyser.getByteFrequencyData(dataArray)

      // Calculate average volume (only for mid-range frequencies where human voice typically is)
      const midRange = dataArray.slice(10, 50) // Focus on mid-range frequencies (human voice)
      const average = midRange.reduce((sum, value) => sum + value, 0) / midRange.length
      setVoiceLevel(average)

      const now = Date.now()
      
      // Check if we're above the noise threshold
      if (average > VOICE_THRESHOLD) {
        // If this is the first time we're detecting voice, note the start time
        if (voiceStartTimeRef.current === null) {
          voiceStartTimeRef.current = now
        } else {
          // Check if we've been hearing voice for the minimum duration
          const voiceDuration = now - voiceStartTimeRef.current
          if (voiceDuration >= VOICE_MIN_DURATION) {
            const event: ProctoringEvent = {
              type: "VOICE_DETECTED",
              timestamp: new Date(),
              severity: "medium",
              description: `Voice activity detected (level: ${Math.round(average)})`,
            }
            throttledOnViolation(event)
          }
        }
      } else {
        // Reset the timer if we drop below threshold
        voiceStartTimeRef.current = null
      }
    }, 200) // Check more frequently (200ms) for better duration accuracy

    return () => clearInterval(voiceDetectionInterval)
  }, [isActive, microphoneActive])

  const getViolationIcon = (type: string) => {
    switch (type) {
      case "FACE_NOT_DETECTED":
        return <EyeOff className="w-4 h-4" />
      case "MULTIPLE_FACES":
        return <Users className="w-4 h-4" />
      case "VOICE_DETECTED":
        return <Volume2 className="w-4 h-4" />
      case "TAB_SWITCH":
        return <AlertTriangle className="w-4 h-4" />
      default:
        return <Shield className="w-4 h-4" />
    }
  }

  const getViolationColor = (severity: string) => {
    switch (severity) {
      case "high":
        return "text-red-600 bg-red-50 border-red-200"
      case "medium":
        return "text-orange-600 bg-orange-50 border-orange-200"
      case "low":
        return "text-yellow-600 bg-yellow-50 border-yellow-200"
      default:
        return "text-gray-600 bg-gray-50 border-gray-200"
    }
  }

  return (
    <div className="space-y-4">
      {/* Camera Feed */}
      <Card className="border border-gray-200 rounded-xl">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Camera className="w-5 h-5 text-purple-600" />
              <span>Live Monitoring</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              {cameraActive && (
                <div className="flex items-center space-x-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-xs text-red-600 font-medium">LIVE</span>
                </div>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative bg-gray-900 rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay muted playsInline className="w-full h-48 object-cover" />

            {/* Status Overlay */}
            <div className="absolute top-2 left-2 flex items-center space-x-2">
              <Badge className={`${faceDetected ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                {faceDetected ? (
                  <>
                    <Eye className="w-3 h-3 mr-1" />
                    Face Detected
                  </>
                ) : (
                  <>
                    <EyeOff className="w-3 h-3 mr-1" />
                    No Face
                  </>
                )}
              </Badge>

              {faceCount > 1 && (
                <Badge className="bg-red-100 text-red-700">
                  <Users className="w-3 h-3 mr-1" />
                  {faceCount} Faces
                </Badge>
              )}
            </div>

            {/* Voice Level Indicator */}
            <div className="absolute bottom-2 left-2 flex items-center space-x-2">
              {microphoneActive ? (
                <div className="flex items-center space-x-2 bg-black/50 rounded px-2 py-1">
                  <Mic className="w-4 h-4 text-white" />
                  <div className="w-16 h-2 bg-gray-600 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-green-400 transition-all duration-300"
                      style={{ width: `${Math.min(voiceLevel * 3, 100)}%` }}
                    />
                  </div>
                </div>
              ) : (
                <Badge className="bg-red-100 text-red-700">
                  <MicOff className="w-3 h-3 mr-1" />
                  Mic Off
                </Badge>
              )}
            </div>
          </div>

          {/* Status Indicators */}
          <div className="grid grid-cols-2 gap-3">
            <Alert className={`${cameraActive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <Camera className="w-4 h-4" />
              <AlertDescription className="text-sm">Camera: {cameraActive ? "Active" : "Inactive"}</AlertDescription>
            </Alert>

            <Alert className={`${microphoneActive ? "bg-green-50 border-green-200" : "bg-red-50 border-red-200"}`}>
              <Mic className="w-4 h-4" />
              <AlertDescription className="text-sm">
                Microphone: {microphoneActive ? "Active" : "Inactive"}
              </AlertDescription>
            </Alert>
          </div>
        </CardContent>
      </Card>

      {/* Recent Violations */}
      <Card className="border border-gray-200 rounded-xl">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center space-x-2">
            <Activity className="w-5 h-5 text-orange-600" />
            <span>Recent Events</span>
            {recentViolations.length > 0 && (
              <Badge className="bg-orange-100 text-orange-700">{recentViolations.length}</Badge>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent>
          {recentViolations.length > 0 ? (
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {recentViolations
                .slice(-3)
                .reverse()
                .map((violation, index) => (
                  <div
                    key={index}
                    className={`flex items-center space-x-2 p-2 rounded-lg border ${getViolationColor(violation.severity)}`}
                  >
                    {getViolationIcon(violation.type)}
                    <div className="flex-1 min-w-0">
                      <div className="text-xs font-medium truncate">{violation.description}</div>
                      <div className="text-xs opacity-75">{violation.timestamp.toLocaleTimeString()}</div>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="text-center py-4 text-gray-500">
              <Shield className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <div className="text-sm">No recent events</div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
