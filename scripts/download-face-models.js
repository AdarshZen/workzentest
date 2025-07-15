const fs = require('fs');
const path = require('path');
const https = require('https');

// Define the model files to download
const modelFiles = [
  // TinyFaceDetector model
  'tiny_face_detector_model-weights_manifest.json',
  'tiny_face_detector_model-shard1',
  
  // FaceLandmark68 model
  'face_landmark_68_model-weights_manifest.json',
  'face_landmark_68_model-shard1',
  
  // FaceRecognition model
  'face_recognition_model-weights_manifest.json',
  'face_recognition_model-shard1',
  'face_recognition_model-shard2',
  
  // FaceExpression model
  'face_expression_model-weights_manifest.json',
  'face_expression_model-shard1',
];

// Base URL for the model files
const baseUrl = 'https://raw.githubusercontent.com/justadudewhohacks/face-api.js/master/weights/';

// Target directory
const targetDir = path.join(__dirname, '../public/models');

// Ensure the target directory exists
if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

// Function to download a file
function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    
    https.get(url, response => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download ${url}, status code: ${response.statusCode}`));
        return;
      }
      
      response.pipe(file);
      
      file.on('finish', () => {
        file.close();
        console.log(`Downloaded: ${path.basename(dest)}`);
        resolve();
      });
    }).on('error', err => {
      fs.unlink(dest, () => {}); // Delete the file on error
      reject(err);
    });
  });
}

// Download all model files
async function downloadAllModels() {
  console.log('Starting download of face-api.js model files...');
  
  for (const fileName of modelFiles) {
    const url = baseUrl + fileName;
    const dest = path.join(targetDir, fileName);
    
    try {
      await downloadFile(url, dest);
    } catch (error) {
      console.error(`Error downloading ${fileName}:`, error.message);
    }
  }
  
  console.log('All model files downloaded successfully!');
}

// Run the download
downloadAllModels().catch(console.error);
