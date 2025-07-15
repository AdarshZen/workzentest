"use client";

import { useEffect } from "react";
import { initFaceDetection } from "@/lib/face-detection";

export function FaceDetectionProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    // Initialize face detection when the app loads
    // This prevents WebGL shader linking errors by ensuring proper initialization
    initFaceDetection();
  }, []);

  return <>{children}</>;
}
