import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth'; // Only import getAuth
import { getFirestore, Firestore } from 'firebase/firestore';
import { getStorage, FirebaseStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// IMPORTANT: It's STRONGLY recommended to use environment variables for these values,
// especially the API key, to avoid exposing sensitive information in your codebase.
// Example using environment variables (preferred):
// const firebaseConfig = {
//   apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
//   authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
//   projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
//   storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
//   messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
//   appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
//   measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
// };

// Using the provided key directly (less secure, ensure this isn't committed publicly)
const firebaseConfig = {
  apiKey: "AIzaSyCuFSnai7-bpjpeeaBd6eSvZpZqqI02RoI", // Directly using the provided key
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID // Optional
};


// Validate required Firebase config variables
if (
    !firebaseConfig.apiKey ||
    !firebaseConfig.authDomain ||
    !firebaseConfig.projectId ||
    !firebaseConfig.storageBucket ||
    !firebaseConfig.messagingSenderId ||
    !firebaseConfig.appId
) {
    // Log a more specific error if variables are missing (especially if using process.env)
    console.error(
      "Firebase configuration is missing or incomplete. " +
      "Check your environment variables (NEXT_PUBLIC_FIREBASE_*) or the direct configuration in firebase.ts. " +
      "Ensure the API key is correct."
     );
     // Optionally throw an error to prevent the app from running with invalid config
     // throw new Error("Firebase configuration is incomplete.");
}


// Initialize Firebase
// Make sure to only initialize the app once
let app: FirebaseApp;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully.");
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        // Log the problematic config for easier debugging (avoid logging API key in production logs)
        console.error("Using config:", { ...firebaseConfig, apiKey: firebaseConfig.apiKey ? '***REDACTED***' : 'MISSING!' });
        throw error; // Rethrow to make the issue more visible
    }
} else {
    app = getApp();
    // console.log("Firebase app already initialized."); // Less noisy log
}

// Initialize other Firebase services conditionally
let auth: Auth | null = null;
let db: Firestore | null = null;
let storage: FirebaseStorage | null = null;

if (app) {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
  } catch (error) {
     console.error("Failed to initialize Firebase services (Auth, Firestore, Storage):", error);
  }

}

// Ensure auth is exported even if initialization failed, but it will be null
export { app, auth, db, storage }; // Export initialized services
