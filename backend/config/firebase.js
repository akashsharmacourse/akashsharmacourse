import admin from 'firebase-admin'
import dotenv from 'dotenv'

dotenv.config()

let db = null;
let auth = null;

if (process.env.FIREBASE_PROJECT_ID && process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        // Replace escaped newlines in private key
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      }),
    });
  }
  db = admin.firestore();
  auth = admin.auth();
} else {
  console.warn("⚠️ Firebase environment variables are not configured in .env. Firebase services are running in mock/offline mode.");
}

export { admin, db, auth };
