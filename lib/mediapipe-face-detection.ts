import { FaceDetection, Options } from '@mediapipe/face_detection';
import { Camera } from '@mediapipe/camera_utils';

export class FaceDetector {
  private faceDetection: FaceDetection;
  private camera: Camera | null = null;
  private onResultsCallback: (results: any) => void;

  constructor(onResults: (results: any) => void) {
    this.onResultsCallback = onResults;
    
    this.faceDetection = new FaceDetection({
      locateFile: (file) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/face_detection@0.4/${file}`;
      }
    });

    this.faceDetection.setOptions({
      model: 'short',  // or 'full' for more accuracy but slower performance
      minDetectionConfidence: 0.5
    });

    this.faceDetection.onResults(this.onResults.bind(this));
  }

  private onResults(results: any) {
    this.onResultsCallback(results);
  }

  public async start(videoElement: HTMLVideoElement) {
    if (this.camera) {
      await this.stop();
    }

    this.camera = new Camera(videoElement, {
      onFrame: async () => {
        if (this.faceDetection) {
          await this.faceDetection.send({ image: videoElement });
        }
      },
      width: 640,
      height: 480
    });

    await this.camera.start();
  }

  public async stop() {
    if (this.camera) {
      await this.camera.stop();
      this.camera = null;
    }
  }

  public updateOptions(options: Options) {
    this.faceDetection.setOptions(options);
  }
}

export const createFaceDetector = (onResults: (results: any) => void) => {
  return new FaceDetector(onResults);
};
