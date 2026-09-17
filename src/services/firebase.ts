import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  getFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';
import { getDatabase, type Database } from 'firebase/database';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  databaseURL?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const LOCAL_STORAGE_CONFIG_KEY = 'taskpulse_firebase_config';

// Default project configuration provided by user
const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyC4d_WoTibSThR8TVoOzhgQ_rTpCxSRjD0",
  authDomain: "todo-app-d8285.firebaseapp.com",
  projectId: "todo-app-d8285",
  databaseURL: "https://todo-app-d8285-default-rtdb.asia-southeast1.firebasedatabase.app",
  storageBucket: "todo-app-d8285.firebasestorage.app",
  messagingSenderId: "587574075884",
  appId: "1:587574075884:web:717eb5a61fe30c69b820c9",
  measurementId: "G-ES5EHW18DW",
};

/**
 * Retrieves the active Firebase configuration.
 * Checks localStorage first, then Vite environment variables, then default project config.
 */
export function getFirebaseConfig(): FirebaseConfig | null {
  // 1. Check custom configuration in localStorage
  try {
    const savedConfig = localStorage.getItem(LOCAL_STORAGE_CONFIG_KEY);
    if (savedConfig) {
      const parsed = JSON.parse(savedConfig);
      if (parsed.apiKey && parsed.projectId) {
        return {
          ...parsed,
          databaseURL:
            parsed.databaseURL ||
            `https://${parsed.projectId}-default-rtdb.asia-southeast1.firebasedatabase.app`,
        };
      }
    }
  } catch {
    // Ignore parse error
  }

  // 2. Check Vite environment variables
  const envApiKey = import.meta.env.VITE_FIREBASE_API_KEY;
  const envProjectId = import.meta.env.VITE_FIREBASE_PROJECT_ID;

  if (envApiKey && envProjectId && envApiKey !== 'YOUR_API_KEY') {
    return {
      apiKey: envApiKey,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${envProjectId}.firebaseapp.com`,
      projectId: envProjectId,
      databaseURL:
        import.meta.env.VITE_FIREBASE_DATABASE_URL ||
        `https://${envProjectId}-default-rtdb.asia-southeast1.firebasedatabase.app`,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || `${envProjectId}.appspot.com`,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
      appId: import.meta.env.VITE_FIREBASE_APP_ID || '',
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || '',
    };
  }

  return DEFAULT_FIREBASE_CONFIG;
}

export function isFirebaseConfigured(): boolean {
  return getFirebaseConfig() !== null;
}

export function saveCustomFirebaseConfig(config: FirebaseConfig): void {
  localStorage.setItem(LOCAL_STORAGE_CONFIG_KEY, JSON.stringify(config));
  window.location.reload();
}

export function clearCustomFirebaseConfig(): void {
  localStorage.removeItem(LOCAL_STORAGE_CONFIG_KEY);
  window.location.reload();
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let rtdb: Database | null = null;

const config = getFirebaseConfig();

if (config) {
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);

    // Initialize Firebase Realtime Database
    try {
      rtdb = getDatabase(app);
    } catch (rtdbErr) {
      console.warn('Firebase Realtime Database initialization notice:', rtdbErr);
    }

    // Initialize Firestore with offline persistence and ignoreUndefinedProperties
    try {
      db = initializeFirestore(app, {
        ignoreUndefinedProperties: true,
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      try {
        db = getFirestore(app);
      } catch (e) {
        console.warn('Could not initialize or get Firestore:', e);
        db = null;
      }
    }
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }
}

export { app, auth, db, rtdb };
