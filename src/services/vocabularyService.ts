import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  deleteField,
  doc,
} from 'firebase/firestore';
import type {
  Noun,
  Verb,
  Sentence,
  Adjective,
  VocabularyItem,
  VocabularyStats,
} from '../types/vocabulary';
import { getFirestoreDb } from './firebase';

// Firestore rejects `undefined` values: omit them on create, delete them on update.
function stripUndefined<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      result[key] = value;
    }
  }
  return result;
}

function toFirestoreUpdate<T extends Record<string, unknown>>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[key] = value === undefined ? deleteField() : value;
  }
  return result;
}

/* ==========================================================================
   NOUNS CRUD
   ========================================================================== */

export async function fetchNouns(): Promise<Noun[]> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, 'nouns'));
  const list: Noun[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<Noun, 'id'>;
    return {
      id: docSnap.id,
      article: data.article,
      german: data.german,
      plural: data.plural,
      english: data.english,
      example: typeof data.example === 'string' ? data.example : undefined,
      createdAt: data.createdAt,
    };
  });
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

export async function createNoun(noun: Omit<Noun, 'id' | 'createdAt'>): Promise<Noun> {
  const db = getFirestoreDb();
  const newItem: Omit<Noun, 'id'> = {
    ...noun,
    createdAt: Date.now(),
  };
  const docRef = await addDoc(collection(db, 'nouns'), stripUndefined(newItem));
  return { id: docRef.id, ...newItem };
}

export async function updateNoun(id: string, updates: Partial<Omit<Noun, 'id'>>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, 'nouns', id);
  await updateDoc(docRef, toFirestoreUpdate(updates));
}

export async function deleteNoun(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, 'nouns', id);
  await deleteDoc(docRef);
}

/* ==========================================================================
   VERBS CRUD
   ========================================================================== */

export async function fetchVerbs(): Promise<Verb[]> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, 'verbs'));
  const list: Verb[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<Verb, 'id'>;
    return {
      id: docSnap.id,
      german: data.german,
      english: data.english,
      conjugation: data.conjugation,
      example: typeof data.example === 'string' ? data.example : undefined,
      createdAt: data.createdAt,
    };
  });
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

export async function createVerb(verb: Omit<Verb, 'id' | 'createdAt'>): Promise<Verb> {
  const db = getFirestoreDb();
  const newItem: Omit<Verb, 'id'> = {
    ...verb,
    createdAt: Date.now(),
  };
  const docRef = await addDoc(collection(db, 'verbs'), stripUndefined(newItem));
  return { id: docRef.id, ...newItem };
}

export async function updateVerb(id: string, updates: Partial<Omit<Verb, 'id'>>): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, 'verbs', id);
  await updateDoc(docRef, toFirestoreUpdate(updates));
}

export async function deleteVerb(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, 'verbs', id);
  await deleteDoc(docRef);
}

/* ==========================================================================
   ADJECTIVES CRUD
   ========================================================================== */

export async function fetchAdjectives(): Promise<Adjective[]> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, 'adjectives'));
  const list: Adjective[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<Adjective, 'id'>;
    return {
      id: docSnap.id,
      german: data.german,
      english: data.english,
      comparative: data.comparative,
      example: typeof data.example === 'string' ? data.example : undefined,
      createdAt: data.createdAt,
    };
  });
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

export async function createAdjective(
  adjective: Omit<Adjective, 'id' | 'createdAt'>
): Promise<Adjective> {
  const db = getFirestoreDb();
  const newItem: Omit<Adjective, 'id'> = {
    ...adjective,
    createdAt: Date.now(),
  };
  const docRef = await addDoc(collection(db, 'adjectives'), stripUndefined(newItem));
  return { id: docRef.id, ...newItem };
}

export async function updateAdjective(
  id: string,
  updates: Partial<Omit<Adjective, 'id'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, 'adjectives', id);
  await updateDoc(docRef, toFirestoreUpdate(updates));
}

export async function deleteAdjective(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, 'adjectives', id);
  await deleteDoc(docRef);
}

/* ==========================================================================
   SENTENCES CRUD
   ========================================================================== */

export async function fetchSentences(): Promise<Sentence[]> {
  const db = getFirestoreDb();
  const snapshot = await getDocs(collection(db, 'sentences'));
  const list: Sentence[] = snapshot.docs.map((docSnap) => {
    const data = docSnap.data() as Omit<Sentence, 'id'>;
    return {
      id: docSnap.id,
      german: data.german,
      english: data.english,
      remark: data.remark,
      createdAt: data.createdAt,
    };
  });
  list.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
  return list;
}

export async function createSentence(
  sentence: Omit<Sentence, 'id' | 'createdAt'>
): Promise<Sentence> {
  const db = getFirestoreDb();
  const newItem: Omit<Sentence, 'id'> = {
    ...sentence,
    createdAt: Date.now(),
  };
  const docRef = await addDoc(collection(db, 'sentences'), stripUndefined(newItem));
  return { id: docRef.id, ...newItem };
}

export async function updateSentence(
  id: string,
  updates: Partial<Omit<Sentence, 'id'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, 'sentences', id);
  await updateDoc(docRef, toFirestoreUpdate(updates));
}

export async function deleteSentence(id: string): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(db, 'sentences', id);
  await deleteDoc(docRef);
}

/* ==========================================================================
   AGGREGATE STATS & HELPERS
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

  return [
    ...nouns.map((n) => ({ ...n, itemType: 'noun' as const })),
    ...verbs.map((v) => ({ ...v, itemType: 'verb' as const })),
    ...adjectives.map((a) => ({ ...a, itemType: 'adjective' as const })),
    ...sentences.map((s) => ({ ...s, itemType: 'sentence' as const })),
  ];
}
