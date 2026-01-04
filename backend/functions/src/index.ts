import { onRequest } from 'firebase-functions/v2/https';
import app from './api/app.js';
// Firebase Admin otomatik olarak config/firebase.ts'de başlatılıyor

// Export the Express app as a Cloud Function
export const api = onRequest(
  {
    region: 'europe-west3',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '512MiB'
  },
  app
);
