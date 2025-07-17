"use client";

import { useEffect } from "react";
import { FaceDetector, createFaceDetector } from "@/lib/mediapipe-face-detection";

// Initialize face detection when the app loads
// This ensures proper initialization and prevents WebGL shader linking errors
export function FaceDetectionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // The face detection is now initialized on-demand when the component mounts
    // No need for explicit initialization here as it's handled by the FaceDetection component
    return () => {
      // Cleanup any resources if needed
    };
  }, []);

  return <>{children}</>;
}
