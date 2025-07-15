import * as faceapi from 'face-api.js';

let modelsLoaded = false;
let loadingPromise: Promise<void> | null = null;

/**
 * Loads the face-api.js models asynchronously
 * This prevents shader linking errors by ensuring proper initialization
 */
export async function loadFaceDetectionModels(): Promise<void> {
  // If models are already loaded, return immediately
  if (modelsLoaded) {
    return;
  }
  
  // If models are currently loading, wait for that promise to resolve
  if (loadingPromise) {
    return loadingPromise;
  }
  
  // Create a new loading promise
  loadingPromise = (async () => {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined') {
        return;
      }
      
      // Set the models path
      const MODEL_URL = '/models';
      
      // Load models with proper error handling
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
        faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
        faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
        faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL)
      ]);
      
      modelsLoaded = true;
      console.log('Face detection models loaded successfully');
    } catch (error) {
      console.error('Error loading face detection models:', error);
      // Reset loading promise so we can try again later
      loadingPromise = null;
    }
  })();
  
  return loadingPromise;
}

/**
 * Detects faces in an image or video element
 * @param imageOrVideo - The HTML image or video element to detect faces in
 * @returns Promise with detected face data or null if detection fails
 */
export async function detectFaces(imageOrVideo: HTMLImageElement | HTMLVideoElement) {
  try {
    // Ensure models are loaded before detection
    await loadFaceDetectionModels();
    
    // Perform face detection with TinyFaceDetector for better performance
    const detections = await faceapi
      .detectAllFaces(imageOrVideo, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceExpressions();
    
    return detections;
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}

/**
 * Safely initializes face detection to prevent WebGL shader errors
 * This should be called during app initialization
 */
export function initFaceDetection(): void {
  // Only initialize in browser environment
  if (typeof window !== 'undefined') {
    // Use requestIdleCallback to load models when browser is idle
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => {
        loadFaceDetectionModels().catch(console.error);
      });
    } else {
      // Fallback to setTimeout for browsers that don't support requestIdleCallback
      setTimeout(() => {
        loadFaceDetectionModels().catch(console.error);
      }, 1000);
    }
  }
}
