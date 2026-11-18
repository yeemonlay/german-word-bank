import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getFirestore, type Firestore } from 'firebase/firestore';

export interface FirebaseConfigParams {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
}

export function getFirebaseConfig(): FirebaseConfigParams {
  return {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
    appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
  };
}

export function isFirebaseConfigured(config: FirebaseConfigParams = getFirebaseConfig()): boolean {
  const hasValidApiKey = Boolean(
    config.apiKey &&
      config.apiKey !== 'your_api_key_here' &&
      !config.apiKey.includes('your_')
  );
  const hasValidProjectId = Boolean(
    config.projectId &&
      config.projectId !== 'your_project_id' &&
      !config.projectId.includes('your_')
  );

  return hasValidApiKey && hasValidProjectId;
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;

export function getFirestoreDb(): Firestore {
  if (firestoreDb) return firestoreDb;

  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !isFirebaseConfigured(config)) {
    throw new Error(
      'Firebase is not configured. Please set VITE_FIREBASE_API_KEY and VITE_FIREBASE_PROJECT_ID in .env.'
    );
  }

  const cleanConfig: Record<string, string> = {
    apiKey: config.apiKey,
    projectId: config.projectId,
  };

  if (config.authDomain && !config.authDomain.includes('your_')) {
    cleanConfig.authDomain = config.authDomain;
  }
  if (config.storageBucket && !config.storageBucket.includes('your_')) {
    cleanConfig.storageBucket = config.storageBucket;
  }
  if (config.messagingSenderId && !config.messagingSenderId.includes('your_')) {
    cleanConfig.messagingSenderId = config.messagingSenderId;
  }
  if (config.appId && !config.appId.includes('your_')) {
    cleanConfig.appId = config.appId;
  }

  const existingApps = getApps();
  firebaseApp = existingApps.length > 0 ? existingApps[0] : initializeApp(cleanConfig);
  firestoreDb = getFirestore(firebaseApp);
  return firestoreDb;
}
