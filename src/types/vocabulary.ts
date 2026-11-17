export type Article = 'der' | 'die' | 'das';

export interface Noun {
  id: string;
  article: Article;
  german: string;
  plural: string;
  english: string;
  createdAt?: number;
}

export interface Verb {
  id: string;
  german: string; // Infinitive
  english: string;
  conjugation?: string; // Optional conjugations / forms, e.g. "nennt, nannte, hat genannt"
  createdAt?: number;
}

export interface Sentence {
  id: string;
  german: string;
  english: string;
  remark?: string; // e.g. "Before 10 AM", "Formal greeting"
  createdAt?: number;
}

export interface Adjective {
  id: string;
  german: string;
  english: string;
  comparative?: string; // e.g. "schneller, am schnellsten" (optional)
  createdAt?: number;
}

export type VocabularyCategory = 'nouns' | 'verbs' | 'adjectives' | 'sentences';

export type VocabularyItem =
  | ({ itemType: 'noun' } & Noun)
  | ({ itemType: 'verb' } & Verb)
  | ({ itemType: 'adjective' } & Adjective)
  | ({ itemType: 'sentence' } & Sentence);

export type QuizDirection = 'de-to-en' | 'en-to-de';

export interface QuizQuestion {
  id: string;
  itemType: 'noun' | 'verb' | 'adjective' | 'sentence';
  direction: QuizDirection;
  prompt: string;
  expectedAnswer: string;
  acceptableAnswers: string[];
  referenceItem: Noun | Verb | Adjective | Sentence;
  hint?: string;
}

export interface QuizAnswerRecord {
  question: QuizQuestion;
  userAnswer: string;
  isCorrect: boolean;
}

export interface QuizSummary {
  total: number;
  correct: number;
  incorrect: number;
  percentage: number;
  records: QuizAnswerRecord[];
}

export type StorageMode = 'local' | 'firestore';

export interface VocabularyStats {
  nounsCount: number;
  verbsCount: number;
  adjectivesCount: number;
  sentencesCount: number;
  totalCount: number;
}
