import admin from 'firebase-admin';

// Firebase Admin SDK'yı başlat (emulator otomatik başlatır)
try {
  if (!admin.apps || admin.apps.length === 0) {
    admin.initializeApp();
  }
} catch (error) {
  // Emulator zaten başlatmış olabilir, sessizce geç
  console.log('Firebase admin already initialized');
}

// Firestore instance
export const db = admin.firestore();

// Firebase Storage instance
export const storage = admin.storage();

// Firebase Auth instance
export const auth = admin.auth();

export default admin;
