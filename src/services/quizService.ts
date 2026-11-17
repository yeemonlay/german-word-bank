import type {
  VocabularyItem,
  QuizQuestion,
  QuizAnswerRecord,
  Noun,
  Verb,
  Adjective,
  Sentence,
} from '../types/vocabulary';

function shuffle<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

// Clean and normalize strings: remove leading/trailing spaces, multiple spaces, and trailing punctuation
export function normalizeText(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[.,/#!$%^&*;:{}=\-_`~()?'"“”]/g, '')
    .replace(/\s+/g, ' ');
}

// Extract alternate meanings if slash or comma or semicolon separated
function getAlternativeMeanings(meaning: string): string[] {
  const parts = meaning
    .split(/[/,;]/)
    .map((s) => s.trim())
    .filter((s) => s.length > 0);

  const cleanList = new Set<string>();
  cleanList.add(normalizeText(meaning));

  for (const part of parts) {
    cleanList.add(normalizeText(part));
    // Also handle English "to verb" vs "verb"
    if (part.toLowerCase().startsWith('to ')) {
      cleanList.add(normalizeText(part.slice(3)));
    }
  }

  return Array.from(cleanList);
}

export function generateQuiz(items: VocabularyItem[], count: number = 5): QuizQuestion[] {
  if (items.length === 0) return [];

  // Group items by type to ensure a mixture whenever available
  const nouns = items.filter((i) => i.itemType === 'noun');
  const verbs = items.filter((i) => i.itemType === 'verb');
  const adjectives = items.filter((i) => i.itemType === 'adjective');
  const sentences = items.filter((i) => i.itemType === 'sentence');

  const selectedItems: VocabularyItem[] = [];
  const targetCount = Math.min(count, items.length);

  // If we have items from multiple categories, distribute them
  const categories = [shuffle(nouns), shuffle(verbs), shuffle(adjectives), shuffle(sentences)].filter(
    (cat) => cat.length > 0
  );

  let catIdx = 0;
  while (selectedItems.length < targetCount && categories.some((c) => c.length > 0)) {
    const currentCat = categories[catIdx % categories.length];
    if (currentCat.length > 0) {
      selectedItems.push(currentCat.pop()!);
    }
    catIdx++;
  }

  // Shuffle selected items so categories are interleaved
  const finalItems = shuffle(selectedItems);

  // Build QuizQuestions
  return finalItems.map((item, index) => {
    const direction = Math.random() < 0.5 ? 'de-to-en' : 'en-to-de';
    const id = `q-${index + 1}-${item.id}`;

    if (item.itemType === 'noun') {
      const noun = item as Noun;
      if (direction === 'de-to-en') {
        const acceptable = getAlternativeMeanings(noun.english);
        return {
          id,
          itemType: 'noun',
          direction,
          prompt: `${noun.article} ${noun.german}`,
          expectedAnswer: noun.english,
          acceptableAnswers: acceptable,
          referenceItem: noun,
          hint: `Plural: die ${noun.plural}`,
        };
      } else {
        // en-to-de: validate both article and noun
        const fullAnswer = `${noun.article} ${noun.german}`;
        const acceptable = [
          normalizeText(fullAnswer),
        ];
        return {
          id,
          itemType: 'noun',
          direction,
          prompt: noun.english,
          expectedAnswer: fullAnswer,
          acceptableAnswers: acceptable,
          referenceItem: noun,
          hint: `Noun: Include article (der, die, or das)`,
        };
      }
    } else if (item.itemType === 'verb') {
      const verb = item as Verb;
      if (direction === 'de-to-en') {
        const acceptable = getAlternativeMeanings(verb.english);
        return {
          id,
          itemType: 'verb',
          direction,
          prompt: verb.german,
          expectedAnswer: verb.english,
          acceptableAnswers: acceptable,
          referenceItem: verb,
          hint: verb.conjugation ? `Forms: ${verb.conjugation}` : 'Verb infinitive',
        };
      } else {
        const acceptable = [normalizeText(verb.german)];
        return {
          id,
          itemType: 'verb',
          direction,
          prompt: verb.english,
          expectedAnswer: verb.german,
          acceptableAnswers: acceptable,
          referenceItem: verb,
          hint: 'German infinitive',
        };
      }
    } else if (item.itemType === 'adjective') {
      const adj = item as Adjective;
      if (direction === 'de-to-en') {
        const acceptable = getAlternativeMeanings(adj.english);
        return {
          id,
          itemType: 'adjective',
          direction,
          prompt: adj.german,
          expectedAnswer: adj.english,
          acceptableAnswers: acceptable,
          referenceItem: adj,
          hint: adj.comparative ? `Forms: ${adj.comparative}` : 'Adjective',
        };
      } else {
        const acceptable = [normalizeText(adj.german)];
        return {
          id,
          itemType: 'adjective',
          direction,
          prompt: adj.english,
          expectedAnswer: adj.german,
          acceptableAnswers: acceptable,
          referenceItem: adj,
          hint: 'German adjective',
        };
      }
    } else {
      const sentence = item as Sentence;
      if (direction === 'de-to-en') {
        const acceptable = getAlternativeMeanings(sentence.english);
        return {
          id,
          itemType: 'sentence',
          direction,
          prompt: sentence.german,
          expectedAnswer: sentence.english,
          acceptableAnswers: acceptable,
          referenceItem: sentence,
          hint: sentence.remark ? `Context: ${sentence.remark}` : 'Sentence',
        };
      } else {
        const acceptable = [normalizeText(sentence.german)];
        return {
          id,
          itemType: 'sentence',
          direction,
          prompt: sentence.english,
          expectedAnswer: sentence.german,
          acceptableAnswers: acceptable,
          referenceItem: sentence,
          hint: sentence.remark ? `Context: ${sentence.remark}` : 'Sentence',
        };
      }
    }
  });
}

export function validateAnswer(question: QuizQuestion, rawAnswer: string): boolean {
  const normalizedUser = normalizeText(rawAnswer);
  if (!normalizedUser) return false;

  // Direct check against acceptable normalized answers
  if (question.acceptableAnswers.includes(normalizedUser)) {
    return true;
  }

  // Check normalized expected answer
  if (normalizedUser === normalizeText(question.expectedAnswer)) {
    return true;
  }

  // For nouns in English -> German, check if user provided "article + german" or just "german"
  if (question.itemType === 'noun' && question.direction === 'en-to-de') {
    const noun = question.referenceItem as Noun;
    const strictFull = normalizeText(`${noun.article} ${noun.german}`);
    if (normalizedUser === strictFull) {
      return true;
    }
  }

  // For verbs in German -> English, check if answer matches with or without "to"
  if (question.itemType === 'verb' && question.direction === 'de-to-en') {
    const withoutTo = normalizedUser.startsWith('to ') ? normalizedUser.slice(3) : normalizedUser;
    if (question.acceptableAnswers.includes(withoutTo)) {
      return true;
    }
  }

  return false;
}

export function calculateSummary(records: QuizAnswerRecord[]) {
  const total = records.length;
  const correct = records.filter((r) => r.isCorrect).length;
  const incorrect = total - correct;
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return {
    total,
    correct,
    incorrect,
    percentage,
    records,
  };
}
