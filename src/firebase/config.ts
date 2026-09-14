import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase configuration placeholder or environment variables
const env = (import.meta as any).env || {};
const firebaseConfig = {
  apiKey: env.VITE_FIREBASE_API_KEY || "AIzaSyDummyKeyForCapacityConnect928",
  authDomain: env.VITE_FIREBASE_AUTH_DOMAIN || "capacity-connect.firebaseapp.com",
  projectId: env.VITE_FIREBASE_PROJECT_ID || "capacity-connect-ent",
  storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET || "capacity-connect-ent.appspot.com",
  messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID || "102938475612",
  appId: env.VITE_FIREBASE_APP_ID || "1:102938475612:web:9876543210abcdef"
};

let app: FirebaseApp;
let auth: Auth;
let firestore: Firestore;

try {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  auth = getAuth(app);
  firestore = getFirestore(app);
} catch (e) {
  console.warn('[Firebase] Running in local decoupled mode with Node.js backend sync:', e);
}

export { app, auth, firestore };
