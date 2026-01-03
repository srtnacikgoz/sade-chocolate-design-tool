import { initializeApp, getApps, App } from 'firebase-admin/app';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

let app: App;
let db: Firestore;

export const initializeFirebase = () => {
  if (getApps().length === 0) {
    app = initializeApp();
  } else {
    app = getApps()[0];
  }

  db = getFirestore(app);

  // Set Firestore settings
  db.settings({
    ignoreUndefinedProperties: true
  });

  return db;
};

export const getDb = (): Firestore => {
  if (!db) {
    return initializeFirebase();
  }
  return db;
};
