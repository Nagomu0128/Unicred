// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAnalytics, isSupported } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getDatabase } from "firebase/database";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
};

// Initialize Firebase with performance optimizations
let appInstance: ReturnType<typeof initializeApp> | null = null;

export const getAppInstance = () => {
  if (!appInstance) {
    appInstance = !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }
  return appInstance;
};

// Lazy initialize services to improve initial load time
let authInstance: ReturnType<typeof getAuth> | null = null;
let dbInstance: ReturnType<typeof getFirestore> | null = null;
let rtdbInstance: ReturnType<typeof getDatabase> | null = null;

export const getAuthInstance = () => {
  if (!authInstance) {
    authInstance = getAuth(getAppInstance());
  }
  return authInstance;
};

export const getDbInstance = () => {
  if (!dbInstance) {
    dbInstance = getFirestore(getAppInstance());
  }
  return dbInstance;
};

export const getRtdbInstance = () => {
  if (!rtdbInstance) {
    rtdbInstance = getDatabase(getAppInstance());
  }
  return rtdbInstance;
};

// For backward compatibility - lazy initialization
export const auth = getAuthInstance();
export const db = getDbInstance();
export const rtdb = getRtdbInstance();
export const app = getAppInstance();

// Initialize Analytics only on the client side with error handling
if (typeof window !== 'undefined') {
  isSupported().then((supported) => {
    if (supported) {
      try {
        getAnalytics(app);
      } catch (error) {
        console.warn('Analytics initialization failed:', error);
      }
    }
  }).catch(() => {
    // Silently fail if analytics is not supported
  });
}
