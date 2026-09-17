import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
  type Firestore,
} from 'firebase/firestore';

export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
}

const LOCAL_STORAGE_CONFIG_KEY = 'taskpulse_firebase_config';

// Default project configuration provided by user
const DEFAULT_FIREBASE_CONFIG: FirebaseConfig = {
  apiKey: "AIzaSyC2SQDkw33dkFcIVGNVqLAOb9O_19ArFpQ",
  authDomain: "todo-list-app-b3c33.firebaseapp.com",
  projectId: "todo-list-app-b3c33",
  storageBucket: "todo-list-app-b3c33.firebasestorage.app",
  messagingSenderId: "602416508290",
  appId: "1:602416508290:web:b7a9e71abd806cbf7cb39b",
  measurementId: "G-D782790J19",
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
        return parsed;
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

const config = getFirebaseConfig();

if (config) {
  try {
    if (!getApps().length) {
      app = initializeApp(config);
    } else {
      app = getApps()[0];
    }

    auth = getAuth(app);

    // Initialize Firestore with offline persistence
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({
          tabManager: persistentMultipleTabManager(),
        }),
      });
    } catch {
      // Fallback if multiple tab cache isn't available
      db = initializeFirestore(app, {});
    }
  } catch (error) {
    console.warn('Firebase initialization notice:', error);
  }
}

export { app, auth, db };
