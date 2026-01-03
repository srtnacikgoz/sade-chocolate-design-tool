import { onRequest } from 'firebase-functions/v2/https';
import app from './api/app.js';
import { initializeFirebase } from './config/firestore.js';

// Initialize Firebase Admin
initializeFirebase();

// Export the Express app as a Cloud Function
export const api = onRequest(
  {
    region: 'us-central1',
    maxInstances: 10,
    timeoutSeconds: 60,
    memory: '512MiB'
  },
  app
);
