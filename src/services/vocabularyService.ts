import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import type {
  Noun,
  Verb,
  Sentence,
  Adjective,
  VocabularyItem,
  VocabularyStats,
  StorageMode,
} from '../types/vocabulary';
import {
  INITIAL_NOUNS,
  INITIAL_VERBS,
  INITIAL_SENTENCES,
  INITIAL_ADJECTIVES,
} from '../constants/seedData';
import {
  getFirestoreInstance,
  isFirebaseConfigured,
  isFirestoreEnabledByUser,
  setLastFirestoreError,
} from './firebase';

const LOCAL_STORAGE_NOUNS = 'gwb_nouns';
const LOCAL_STORAGE_VERBS = 'gwb_verbs';
const LOCAL_STORAGE_ADJECTIVES = 'gwb_adjectives';
const LOCAL_STORAGE_SENTENCES = 'gwb_sentences';

function getLocalData<T>(key: string, initialData: T[]): T[] {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(initialData));
      return initialData;
    }
    return JSON.parse(raw);
  } catch (e) {
    console.error(`Error reading ${key} from localStorage`, e);
    return initialData;
  }
}

function setLocalData<T>(key: string, data: T[]): void {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Error writing ${key} to localStorage`, e);
  }
}

export function getCurrentStorageMode(): StorageMode {
  if (isFirestoreEnabledByUser() && isFirebaseConfigured()) {
    const db = getFirestoreInstance();
    if (db) return 'firestore';
  }
  return 'local';
}

/* ==========================================================================
   NOUNS CRUD
   ========================================================================== */

export async function fetchNouns(): Promise<Noun[]> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const snapshot = await getDocs(collection(db, 'nouns'));
        const list: Noun[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Noun, 'id'>),
        }));
        // Sort descending by createdAt
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setLastFirestoreError(null);
        return list;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore fetchNouns failed:', err);
      setLastFirestoreError(`Nouns: ${msg}`);
      throw err;
    }
  }

  // Fallback to local storage
  return getLocalData<Noun>(LOCAL_STORAGE_NOUNS, INITIAL_NOUNS);
}

export async function createNoun(noun: Omit<Noun, 'id' | 'createdAt'>): Promise<Noun> {
  const newItem: Omit<Noun, 'id'> = {
    ...noun,
    createdAt: Date.now(),
  };

  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = await addDoc(collection(db, 'nouns'), newItem);
        setLastFirestoreError(null);
        return { id: docRef.id, ...newItem };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore createNoun failed:', err);
      setLastFirestoreError(`Create Noun: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Noun>(LOCAL_STORAGE_NOUNS, INITIAL_NOUNS);
  const created: Noun = {
    id: 'noun-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    ...newItem,
  };
  setLocalData(LOCAL_STORAGE_NOUNS, [created, ...existing]);
  return created;
}

export async function updateNoun(id: string, updates: Partial<Omit<Noun, 'id'>>): Promise<void> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = doc(db, 'nouns', id);
        await updateDoc(docRef, updates);
        setLastFirestoreError(null);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore updateNoun failed:', err);
      setLastFirestoreError(`Update Noun: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Noun>(LOCAL_STORAGE_NOUNS, INITIAL_NOUNS);
  const updated = existing.map((n) => (n.id === id ? { ...n, ...updates } : n));
  setLocalData(LOCAL_STORAGE_NOUNS, updated);
}

export async function deleteNoun(id: string): Promise<void> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = doc(db, 'nouns', id);
        await deleteDoc(docRef);
        setLastFirestoreError(null);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore deleteNoun failed:', err);
      setLastFirestoreError(`Delete Noun: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Noun>(LOCAL_STORAGE_NOUNS, INITIAL_NOUNS);
  const filtered = existing.filter((n) => n.id !== id);
  setLocalData(LOCAL_STORAGE_NOUNS, filtered);
}

/* ==========================================================================
   VERBS CRUD
   ========================================================================== */

export async function fetchVerbs(): Promise<Verb[]> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const snapshot = await getDocs(collection(db, 'verbs'));
        const list: Verb[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Verb, 'id'>),
        }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setLastFirestoreError(null);
        return list;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore fetchVerbs failed:', err);
      setLastFirestoreError(`Verbs: ${msg}`);
      throw err;
    }
  }

  return getLocalData<Verb>(LOCAL_STORAGE_VERBS, INITIAL_VERBS);
}

export async function createVerb(verb: Omit<Verb, 'id' | 'createdAt'>): Promise<Verb> {
  const newItem: Omit<Verb, 'id'> = {
    ...verb,
    createdAt: Date.now(),
  };

  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = await addDoc(collection(db, 'verbs'), newItem);
        setLastFirestoreError(null);
        return { id: docRef.id, ...newItem };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore createVerb failed:', err);
      setLastFirestoreError(`Create Verb: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Verb>(LOCAL_STORAGE_VERBS, INITIAL_VERBS);
  const created: Verb = {
    id: 'verb-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    ...newItem,
  };
  setLocalData(LOCAL_STORAGE_VERBS, [created, ...existing]);
  return created;
}

export async function updateVerb(id: string, updates: Partial<Omit<Verb, 'id'>>): Promise<void> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = doc(db, 'verbs', id);
        await updateDoc(docRef, updates);
        setLastFirestoreError(null);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore updateVerb failed:', err);
      setLastFirestoreError(`Update Verb: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Verb>(LOCAL_STORAGE_VERBS, INITIAL_VERBS);
  const updated = existing.map((v) => (v.id === id ? { ...v, ...updates } : v));
  setLocalData(LOCAL_STORAGE_VERBS, updated);
}

export async function deleteVerb(id: string): Promise<void> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = doc(db, 'verbs', id);
        await deleteDoc(docRef);
        setLastFirestoreError(null);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore deleteVerb failed:', err);
      setLastFirestoreError(`Delete Verb: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Verb>(LOCAL_STORAGE_VERBS, INITIAL_VERBS);
  const filtered = existing.filter((v) => v.id !== id);
  setLocalData(LOCAL_STORAGE_VERBS, filtered);
}

/* ==========================================================================
   SENTENCES CRUD
   ========================================================================== */

export async function fetchSentences(): Promise<Sentence[]> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const snapshot = await getDocs(collection(db, 'sentences'));
        const list: Sentence[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Sentence, 'id'>),
        }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setLastFirestoreError(null);
        return list;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore fetchSentences failed:', err);
      setLastFirestoreError(`Sentences: ${msg}`);
      throw err;
    }
  }

  return getLocalData<Sentence>(LOCAL_STORAGE_SENTENCES, INITIAL_SENTENCES);
}

export async function createSentence(sentence: Omit<Sentence, 'id' | 'createdAt'>): Promise<Sentence> {
  const newItem: Omit<Sentence, 'id'> = {
    ...sentence,
    createdAt: Date.now(),
  };

  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = await addDoc(collection(db, 'sentences'), newItem);
        setLastFirestoreError(null);
        return { id: docRef.id, ...newItem };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore createSentence failed:', err);
      setLastFirestoreError(`Create Sentence: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Sentence>(LOCAL_STORAGE_SENTENCES, INITIAL_SENTENCES);
  const created: Sentence = {
    id: 'sent-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    ...newItem,
  };
  setLocalData(LOCAL_STORAGE_SENTENCES, [created, ...existing]);
  return created;
}

export async function updateSentence(id: string, updates: Partial<Omit<Sentence, 'id'>>): Promise<void> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = doc(db, 'sentences', id);
        await updateDoc(docRef, updates);
        setLastFirestoreError(null);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore updateSentence failed:', err);
      setLastFirestoreError(`Update Sentence: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Sentence>(LOCAL_STORAGE_SENTENCES, INITIAL_SENTENCES);
  const updated = existing.map((s) => (s.id === id ? { ...s, ...updates } : s));
  setLocalData(LOCAL_STORAGE_SENTENCES, updated);
}

export async function deleteSentence(id: string): Promise<void> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = doc(db, 'sentences', id);
        await deleteDoc(docRef);
        setLastFirestoreError(null);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore deleteSentence failed:', err);
      setLastFirestoreError(`Delete Sentence: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Sentence>(LOCAL_STORAGE_SENTENCES, INITIAL_SENTENCES);
  const filtered = existing.filter((s) => s.id !== id);
  setLocalData(LOCAL_STORAGE_SENTENCES, filtered);
}

/* ==========================================================================
   ADJECTIVES CRUD
   ========================================================================== */

export async function fetchAdjectives(): Promise<Adjective[]> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const snapshot = await getDocs(collection(db, 'adjectives'));
        const list: Adjective[] = snapshot.docs.map((docSnap) => ({
          id: docSnap.id,
          ...(docSnap.data() as Omit<Adjective, 'id'>),
        }));
        list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
        setLastFirestoreError(null);
        return list;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore fetchAdjectives failed:', err);
      setLastFirestoreError(`Adjectives: ${msg}`);
      throw err;
    }
  }

  return getLocalData<Adjective>(LOCAL_STORAGE_ADJECTIVES, INITIAL_ADJECTIVES);
}

export async function createAdjective(adjective: Omit<Adjective, 'id' | 'createdAt'>): Promise<Adjective> {
  const newItem: Omit<Adjective, 'id'> = {
    ...adjective,
    createdAt: Date.now(),
  };

  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = await addDoc(collection(db, 'adjectives'), newItem);
        setLastFirestoreError(null);
        return { id: docRef.id, ...newItem };
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore createAdjective failed:', err);
      setLastFirestoreError(`Create Adjective: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Adjective>(LOCAL_STORAGE_ADJECTIVES, INITIAL_ADJECTIVES);
  const created: Adjective = {
    id: 'adj-' + Date.now() + '-' + Math.random().toString(36).substring(2, 7),
    ...newItem,
  };
  setLocalData(LOCAL_STORAGE_ADJECTIVES, [created, ...existing]);
  return created;
}

export async function updateAdjective(id: string, updates: Partial<Omit<Adjective, 'id'>>): Promise<void> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = doc(db, 'adjectives', id);
        await updateDoc(docRef, updates);
        setLastFirestoreError(null);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore updateAdjective failed:', err);
      setLastFirestoreError(`Update Adjective: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Adjective>(LOCAL_STORAGE_ADJECTIVES, INITIAL_ADJECTIVES);
  const updated = existing.map((a) => (a.id === id ? { ...a, ...updates } : a));
  setLocalData(LOCAL_STORAGE_ADJECTIVES, updated);
}

export async function deleteAdjective(id: string): Promise<void> {
  const mode = getCurrentStorageMode();
  if (mode === 'firestore') {
    try {
      const db = getFirestoreInstance();
      if (db) {
        const docRef = doc(db, 'adjectives', id);
        await deleteDoc(docRef);
        setLastFirestoreError(null);
        return;
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Firestore deleteAdjective failed:', err);
      setLastFirestoreError(`Delete Adjective: ${msg}`);
      throw err;
    }
  }

  const existing = getLocalData<Adjective>(LOCAL_STORAGE_ADJECTIVES, INITIAL_ADJECTIVES);
  const filtered = existing.filter((a) => a.id !== id);
  setLocalData(LOCAL_STORAGE_ADJECTIVES, filtered);
}

/* ==========================================================================
   AGGREGATE STATS & QUIZ HELPERS
   ========================================================================== */

export async function fetchVocabularyStats(): Promise<VocabularyStats> {
  const [nouns, verbs, adjectives, sentences] = await Promise.all([
    fetchNouns(),
    fetchVerbs(),
    fetchAdjectives(),
    fetchSentences(),
  ]);

  return {
    nounsCount: nouns.length,
    verbsCount: verbs.length,
    adjectivesCount: adjectives.length,
    sentencesCount: sentences.length,
    totalCount: nouns.length + verbs.length + adjectives.length + sentences.length,
  };
}

export async function fetchAllVocabularyItems(): Promise<VocabularyItem[]> {
  const [nouns, verbs, adjectives, sentences] = await Promise.all([
    fetchNouns(),
    fetchVerbs(),
    fetchAdjectives(),
    fetchSentences(),
  ]);

  const items: VocabularyItem[] = [
    ...nouns.map((n) => ({ ...n, itemType: 'noun' as const })),
    ...verbs.map((v) => ({ ...v, itemType: 'verb' as const })),
    ...adjectives.map((a) => ({ ...a, itemType: 'adjective' as const })),
    ...sentences.map((s) => ({ ...s, itemType: 'sentence' as const })),
  ];

  return items;
}

export function resetLocalStorageToDefaults(): void {
  localStorage.setItem(LOCAL_STORAGE_NOUNS, JSON.stringify(INITIAL_NOUNS));
  localStorage.setItem(LOCAL_STORAGE_VERBS, JSON.stringify(INITIAL_VERBS));
  localStorage.setItem(LOCAL_STORAGE_ADJECTIVES, JSON.stringify(INITIAL_ADJECTIVES));
  localStorage.setItem(LOCAL_STORAGE_SENTENCES, JSON.stringify(INITIAL_SENTENCES));
}
