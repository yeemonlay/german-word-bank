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

const STORAGE_KEY_FIREBASE_CONFIG = 'german_word_bank_firebase_config';
const STORAGE_KEY_FIRESTORE_ENABLED = 'german_word_bank_firestore_enabled';

// Read config from Vite environment or localStorage override
export function getFirebaseConfig(): FirebaseConfigParams {
  const localSaved = localStorage.getItem(STORAGE_KEY_FIREBASE_CONFIG);
  if (localSaved) {
    try {
      const parsed = JSON.parse(localSaved);
      if (parsed && typeof parsed === 'object' && parsed.apiKey) {
        return parsed;
      }
    } catch {
      // ignore
    }
  }

  return {
    apiKey: (import.meta.env.VITE_FIREBASE_API_KEY || '').trim(),
    authDomain: (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || '').trim(),
    projectId: (import.meta.env.VITE_FIREBASE_PROJECT_ID || '').trim(),
    storageBucket: (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || '').trim(),
    messagingSenderId: (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '').trim(),
    appId: (import.meta.env.VITE_FIREBASE_APP_ID || '').trim(),
  };
}

export function saveFirebaseConfig(config: FirebaseConfigParams): void {
  localStorage.setItem(STORAGE_KEY_FIREBASE_CONFIG, JSON.stringify(config));
}

export function isFirebaseConfigured(): boolean {
  const config = getFirebaseConfig();
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

export function isFirestoreEnabledByUser(): boolean {
  const stored = localStorage.getItem(STORAGE_KEY_FIRESTORE_ENABLED);
  if (stored !== null) {
    return stored === 'true';
  }
  // Default to true if Firebase is configured via .env or localStorage!
  return isFirebaseConfigured();
}

export function setFirestoreEnabledByUser(enabled: boolean): void {
  localStorage.setItem(STORAGE_KEY_FIRESTORE_ENABLED, enabled ? 'true' : 'false');
}

let firebaseApp: FirebaseApp | null = null;
let firestoreDb: Firestore | null = null;
let lastFirestoreError: string | null = null;

export function getLastFirestoreError(): string | null {
  return lastFirestoreError;
}

export function setLastFirestoreError(err: string | null): void {
  lastFirestoreError = err;
}

export function getFirestoreInstance(): Firestore | null {
  if (firestoreDb) return firestoreDb;

  const config = getFirebaseConfig();
  if (!config.apiKey || !config.projectId || !isFirebaseConfigured()) {
    return null;
  }

  try {
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
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.warn('Firebase initialization error:', err);
    lastFirestoreError = message;
    return null;
  }
}
