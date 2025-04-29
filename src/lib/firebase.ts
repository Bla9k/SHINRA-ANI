import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

// Your web app's Firebase configuration
// Use environment variables for sensitive information
// Ensure these variables are set in your .env.local file for local development
// and in your hosting environment for production.
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
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
    console.error("Firebase configuration is missing or incomplete. Check your .env.local file and environment variables.");
    // Optionally throw an error to prevent the app from starting with invalid config
    // throw new Error("Firebase configuration is missing or incomplete.");
}


// Initialize Firebase
// Make sure to only initialize the app once
let app;
if (!getApps().length) {
    try {
        app = initializeApp(firebaseConfig);
        console.log("Firebase initialized successfully.");
    } catch (error) {
        console.error("Firebase initialization failed:", error);
        // Handle initialization error appropriately, maybe show an error message to the user
        // or prevent parts of the app that rely on Firebase from rendering.
    }
} else {
    app = getApp();
    console.log("Firebase app already initialized.");
}

// Initialize other Firebase services conditionally, only if app was successfully initialized
let auth: any, db: any, storage: any, googleProvider: any; // Use 'any' or appropriate Firebase types

if (app) {
  try {
    auth = getAuth(app);
    db = getFirestore(app);
    storage = getStorage(app);
    googleProvider = new GoogleAuthProvider();
  } catch (error) {
     console.error("Failed to initialize Firebase services (Auth, Firestore, Storage):", error);
     // Set services to null or handle the error as needed
     auth = null;
     db = null;
     storage = null;
     googleProvider = null;
  }

} else {
    // Handle the case where app initialization failed
    auth = null;
    db = null;
    storage = null;
    googleProvider = null;
}


export { app, auth, db, storage, googleProvider };
