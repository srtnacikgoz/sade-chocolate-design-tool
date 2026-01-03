import * as admin from 'firebase-admin';

// Firebase Admin SDK'yı başlat
if (!admin.apps.length) {
  admin.initializeApp();
}

// Firestore instance
export const db = admin.firestore();

// Firebase Storage instance
export const storage = admin.storage();

// Firebase Auth instance
export const auth = admin.auth();

export default admin;
