import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  Layers,
  RotateCcw,
  CheckCircle2,
  XCircle,
  ArrowRight,
  ArrowLeft,
  Shuffle,
  Trophy,
  HelpCircle,
  ChevronDown,
  Eye,
  Send,
} from 'lucide-react';
import type { VocabularyItem } from '../types/vocabulary';
import { normalizeText } from '../services/quizService';

interface FlashCardPageProps {
  vocabularyItems: VocabularyItem[];
  onNavigateToVocabulary?: () => void;
}

type FlashCardFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'sentence';

interface AnswerResult {
  status: 'correct' | 'incorrect' | 'revealed';
  userAnswer: string;
  feedbackNote?: string;
}

const GERMAN_SPECIAL_CHARS = ['ä', 'ö', 'ü', 'ß', 'Ä', 'Ö', 'Ü'];

function getExpectedGerman(item: VocabularyItem): string {
  if (item.itemType === 'noun') {
    return `${item.article} ${item.german}`;
  }
  return item.german;
}

function getInputPlaceholder(item: VocabularyItem): string {
  switch (item.itemType) {
    case 'noun':
      return 'Type article + German noun (e.g. der Apfel)...';
    case 'verb':
      return 'Type German verb infinitive...';
    case 'adjective':
      return 'Type German adjective...';
    case 'sentence':
      return 'Type German sentence...';
  }
}

export const FlashCardPage: React.FC<FlashCardPageProps> = ({
  vocabularyItems,
  onNavigateToVocabulary,
}) => {
  const [filterType, setFilterType] = useState<FlashCardFilter>('all');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userInput, setUserInput] = useState('');
  const [result, setResult] = useState<AnswerResult | null>(null);

  // Deck items (shuffled, filtered, or missed subset)
  const [customDeck, setCustomDeck] = useState<VocabularyItem[] | null>(null);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [learningIds, setLearningIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  const inputRef = useRef<HTMLInputElement>(null);

  const deck = useMemo(() => {
    if (customDeck !== null) return customDeck;
    if (filterType === 'all') return vocabularyItems;
    return vocabularyItems.filter((item) => item.itemType === filterType);
  }, [vocabularyItems, filterType, customDeck]);

  const currentCard = deck[currentIndex];
  const totalCards = deck.length;

  // Focus input automatically when a new unanswered card appears
  useEffect(() => {
    if (!result && !isCompleted && currentCard) {
      inputRef.current?.focus();
    }
  }, [currentIndex, result, isCompleted, currentCard]);

  const resetSession = (nextCustomDeck: VocabularyItem[] | null = null) => {
    setCustomDeck(nextCustomDeck);
    setCurrentIndex(0);
    setUserInput('');
    setResult(null);
    setMasteredIds(new Set());
    setLearningIds(new Set());
    setIsCompleted(false);
  };

  const handleSelectFilter = (type: FlashCardFilter) => {
    setFilterType(type);
    resetSession(null);
  };

  const handleNext = useCallback(() => {
    if (currentIndex + 1 < totalCards) {
      setCurrentIndex((prev) => prev + 1);
      setUserInput('');
      setResult(null);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, totalCards]);

  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setUserInput('');
      setResult(null);
    }
  }, [currentIndex]);

  const recordOutcome = useCallback((cardId: string, isCorrect: boolean) => {
    if (isCorrect) {
      setMasteredIds((prev) => new Set(prev).add(cardId));
      setLearningIds((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    } else {
      setLearningIds((prev) => new Set(prev).add(cardId));
      setMasteredIds((prev) => {
        const next = new Set(prev);
        next.delete(cardId);
        return next;
      });
    }
  }, []);

  const handleCheckAnswer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentCard || !userInput.trim() || result) return;

    const normalizedUser = normalizeText(userInput);
    const expected = getExpectedGerman(currentCard);
    const normalizedExpected = normalizeText(expected);
    const isCorrect = normalizedUser === normalizedExpected;

    let feedbackNote: string | undefined;
    if (!isCorrect && currentCard.itemType === 'noun') {
      const normalizedNounOnly = normalizeText(currentCard.german);
      if (normalizedUser === normalizedNounOnly) {
        feedbackNote = `Remember to include the article: "${currentCard.article} ${currentCard.german}".`;
      } else if (
        normalizedUser.endsWith(` ${normalizedNounOnly}`) &&
        ['der', 'die', 'das'].some((art) => normalizedUser.startsWith(`${art} `))
      ) {
        feedbackNote = `Right noun, wrong article — it uses "${currentCard.article}".`;
      }
    }

    recordOutcome(currentCard.id, isCorrect);
    setResult({
      status: isCorrect ? 'correct' : 'incorrect',
      userAnswer: userInput.trim(),
      feedbackNote,
    });
  };

  const handleRevealAnswer = () => {
    if (!currentCard || result) return;
    recordOutcome(currentCard.id, false);
    setResult({
      status: 'revealed',
      userAnswer: userInput.trim(),
    });
  };

  const handleInsertChar = (char: string) => {
    const input = inputRef.current;
    if (!input) {
      setUserInput((prev) => prev + char);
      return;
    }

    const start = input.selectionStart ?? userInput.length;
    const end = input.selectionEnd ?? userInput.length;
    const nextValue = userInput.slice(0, start) + char + userInput.slice(end);
    setUserInput(nextValue);

    requestAnimationFrame(() => {
      input.focus();
      input.setSelectionRange(start + char.length, start + char.length);
    });
  };

  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    resetSession(shuffled);
  };

  const handleRestart = () => {
    resetSession(null);
  };

  const handlePracticeLearning = () => {
    const missed = deck.filter((item) => learningIds.has(item.id));
    if (missed.length === 0) return;
    resetSession(missed);
  };

  // Keyboard shortcuts when answer is already shown
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;
      if (isCompleted || !currentCard) return;

      if (result && (e.code === 'Enter' || e.code === 'ArrowRight')) {
        e.preventDefault();
        handleNext();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        handlePrevious();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [result, isCompleted, currentCard, handleNext, handlePrevious]);

  const categoryCounts = useMemo(() => {
    return {
      all: vocabularyItems.length,
      noun: vocabularyItems.filter((i) => i.itemType === 'noun').length,
      verb: vocabularyItems.filter((i) => i.itemType === 'verb').length,
      adjective: vocabularyItems.filter((i) => i.itemType === 'adjective').length,
      sentence: vocabularyItems.filter((i) => i.itemType === 'sentence').length,
    };
  }, [vocabularyItems]);

  const renderBadge = (type: VocabularyItem['itemType']) => {
    switch (type) {
      case 'noun':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
            Noun
          </span>
        );
      case 'verb':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
            Verb
          </span>
        );
      case 'adjective':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
            Adjective
          </span>
        );
      case 'sentence':
        return (
          <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200">
            Sentence
          </span>
        );
    }
  };

  const masteryPercent = totalCards > 0 ? Math.round((masteredIds.size / totalCards) * 100) : 0;

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in py-2">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-zinc-950 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Vocabulary Practice
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Read the English meaning and enter the German word or phrase to practice.
          </p>
        </div>

        {/* Fixed Direction Indicator (English -> German) */}
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white text-xs font-bold text-slate-700 shadow-2xs self-start sm:self-auto shrink-0">
          <span>EN</span>
          <ArrowRight className="w-3.5 h-3.5 text-red-600" />
          <span>DE</span>
        </div>
      </div>

      {/* Category Filter: Dropdown on mobile, pills on tablet & desktop */}
      <div className="block sm:hidden">
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => handleSelectFilter(e.target.value as FlashCardFilter)}
            className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            aria-label="Filter practice cards by category"
          >
            <option value="all">All Cards ({categoryCounts.all})</option>
            <option value="noun">Nouns ({categoryCounts.noun})</option>
            <option value="verb">Verbs ({categoryCounts.verb})</option>
            <option value="adjective">Adjectives ({categoryCounts.adjective})</option>
            <option value="sentence">Sentences ({categoryCounts.sentence})</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
        {[
          { id: 'all', label: 'All Cards', count: categoryCounts.all },
          { id: 'noun', label: 'Nouns', count: categoryCounts.noun },
          { id: 'verb', label: 'Verbs', count: categoryCounts.verb },
          { id: 'adjective', label: 'Adjectives', count: categoryCounts.adjective },
          { id: 'sentence', label: 'Sentences', count: categoryCounts.sentence },
        ].map((tab) => {
          const isActive = filterType === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => handleSelectFilter(tab.id as FlashCardFilter)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                isActive
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  isActive ? 'bg-zinc-800 text-amber-300' : 'bg-slate-100 text-slate-500'
                }`}
              >
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Empty State */}
      {totalCards === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            <Layers className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">No cards in this category</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            Add words in your Word Bank to practice translating English into German.
          </p>
          {onNavigateToVocabulary && (
            <button
              type="button"
              onClick={onNavigateToVocabulary}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              + Go to Word Bank
            </button>
          )}
        </div>
      ) : isCompleted ? (
        /* Summary / Completion Screen */
        <div className="bg-white rounded-3xl border border-slate-200 p-6 sm:p-8 shadow-xs text-center space-y-6 animate-fade-in">
          <div className="w-16 h-16 mx-auto rounded-3xl bg-amber-400 text-zinc-950 flex items-center justify-center shadow-md">
            <Trophy className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Practice Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              You practiced all {totalCards} cards in this session.
            </p>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {masteredIds.size}
              </div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mt-1">
                Correct
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <div className="text-2xl sm:text-3xl font-black text-rose-700">
                {learningIds.size}
              </div>
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wider mt-1">
                Needs Practice
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Overall Accuracy:{' '}
            <strong className="text-slate-900 font-bold">{masteryPercent}%</strong>
          </div>

          {/* Completion Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            {learningIds.size > 0 && (
              <button
                type="button"
                onClick={handlePracticeLearning}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Missed ({learningIds.size})</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleRestart}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart All Cards</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active Practice Card Area */
        <div className="space-y-4">
          {/* Progress Header & Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="font-bold text-slate-700">
                Card {currentIndex + 1} of {totalCards}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-bold flex items-center gap-1" title="Correct">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{masteredIds.size}</span>
                </span>
                <span className="text-rose-600 font-bold flex items-center gap-1" title="Needs practice">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{learningIds.size}</span>
                </span>
                <button
                  type="button"
                  onClick={handleShuffle}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Shuffle deck"
                  aria-label="Shuffle deck"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* German Flag Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-linear-to-r from-zinc-950 via-red-600 to-amber-400 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentIndex + 1) / totalCards) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* Practice Card */}
          <div
            className={`w-full rounded-3xl border-2 p-5 sm:p-8 shadow-sm transition-colors space-y-6 ${
              !result
                ? 'bg-white border-slate-200/90'
                : result.status === 'correct'
                ? 'bg-linear-to-b from-white to-emerald-50/50 border-emerald-300'
                : 'bg-linear-to-b from-white to-rose-50/40 border-rose-300'
            }`}
          >
            {/* Card Top Strip */}
            <div className="flex items-center justify-between gap-2">
              {renderBadge(currentCard.itemType)}
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                {result ? 'German Answer' : 'English Meaning'}
              </span>
            </div>

            {/* English Prompt */}
            <div className="text-center py-2 space-y-2">
              <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug break-words">
                {currentCard.english}
              </div>

              {!result && (
                <div className="inline-flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                  <span>
                    {currentCard.itemType === 'noun' &&
                      'Include the article (der, die, or das)'}
                    {currentCard.itemType === 'verb' && 'Enter the German infinitive'}
                    {currentCard.itemType === 'adjective' && 'Enter the German adjective'}
                    {currentCard.itemType === 'sentence' &&
                      (currentCard.remark
                        ? `Context: ${currentCard.remark}`
                        : 'Enter the German sentence')}
                  </span>
                </div>
              )}
            </div>

            {/* Answer Entry Form OR Result Feedback */}
            {!result ? (
              <form onSubmit={handleCheckAnswer} className="space-y-3">
                <div>
                  <label htmlFor="german-practice-input" className="sr-only">
                    Enter German translation
                  </label>
                  <input
                    id="german-practice-input"
                    ref={inputRef}
                    type="text"
                    lang="de"
                    autoComplete="off"
                    autoCorrect="off"
                    autoCapitalize="off"
                    spellCheck={false}
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    placeholder={getInputPlaceholder(currentCard)}
                    className="w-full px-4 py-3.5 rounded-2xl border-2 border-slate-200 bg-slate-50/60 focus:bg-white text-base sm:text-lg font-semibold text-slate-900 placeholder:text-slate-400 placeholder:font-normal focus:outline-none focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 transition-all"
                  />
                </div>

                {/* German Special Characters Helper */}
                <div className="flex items-center justify-center flex-wrap gap-1.5">
                  {GERMAN_SPECIAL_CHARS.map((char) => (
                    <button
                      key={char}
                      type="button"
                      onClick={() => handleInsertChar(char)}
                      className="min-w-9 h-9 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 active:bg-slate-300 text-slate-800 font-bold text-sm border border-slate-200 transition-colors cursor-pointer"
                      title={`Insert "${char}"`}
                    >
                      {char}
                    </button>
                  ))}
                </div>

                {/* Submit & Reveal Buttons */}
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 pt-2">
                  <button
                    type="submit"
                    disabled={!userInput.trim()}
                    className="flex-1 py-3.5 px-5 rounded-2xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-40 text-zinc-950 font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:cursor-not-allowed"
                  >
                    <Send className="w-4 h-4" />
                    <span>Check Answer</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleRevealAnswer}
                    className="py-3.5 px-4 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                    <span>Show Answer</span>
                  </button>
                </div>
              </form>
            ) : (
              <div className="space-y-4 pt-2 border-t border-slate-200/80 animate-fade-in">
                {/* Result Status Badge */}
                <div className="flex flex-col items-center gap-1.5 text-center">
                  {result.status === 'correct' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-extrabold uppercase tracking-wider">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>Correct!</span>
                    </span>
                  ) : result.status === 'incorrect' ? (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-100 text-rose-800 text-xs font-extrabold uppercase tracking-wider">
                      <XCircle className="w-4 h-4 text-rose-600" />
                      <span>Not Quite</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-extrabold uppercase tracking-wider">
                      <Eye className="w-4 h-4 text-slate-500" />
                      <span>Answer Revealed</span>
                    </span>
                  )}

                  {result.status === 'incorrect' && (
                    <div className="text-xs sm:text-sm text-rose-700 font-medium">
                      Your answer:{' '}
                      <span className="font-bold line-through decoration-rose-400">
                        {result.userAnswer}
                      </span>
                    </div>
                  )}

                  {result.feedbackNote && (
                    <p className="text-xs font-semibold text-amber-800 bg-amber-50 border border-amber-200 px-3 py-1 rounded-lg">
                      {result.feedbackNote}
                    </p>
                  )}
                </div>

                {/* Expected German Answer */}
                <div className="text-center space-y-2.5">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug break-words">
                    {currentCard.itemType === 'noun' ? (
                      <>
                        <span className="text-red-600 mr-2">{currentCard.article}</span>
                        <span>{currentCard.german}</span>
                      </>
                    ) : (
                      currentCard.german
                    )}
                  </div>

                  {/* Grammatical Extra Details */}
                  <div className="flex items-center justify-center flex-wrap gap-2">
                    {currentCard.itemType === 'noun' && (
                      <span className="text-xs font-medium text-slate-700 bg-slate-100 px-3 py-1 rounded-lg border border-slate-200">
                        Plural: <strong className="font-bold">die {currentCard.plural}</strong>
                      </span>
                    )}

                    {currentCard.itemType === 'verb' && currentCard.conjugation && (
                      <span className="text-xs font-mono text-amber-900 bg-amber-100/70 px-3 py-1 rounded-lg border border-amber-200">
                        {currentCard.conjugation}
                      </span>
                    )}

                    {currentCard.itemType === 'adjective' && currentCard.comparative && (
                      <span className="text-xs font-mono text-emerald-900 bg-emerald-50 px-3 py-1 rounded-lg border border-emerald-200">
                        {currentCard.comparative}
                      </span>
                    )}

                    {currentCard.itemType === 'sentence' && currentCard.remark && (
                      <span className="text-xs text-slate-600 italic bg-white px-3 py-1 rounded-lg border border-slate-200">
                        &ldquo;{currentCard.remark}&rdquo;
                      </span>
                    )}
                  </div>

                  {/* Saved German Example */}
                  {currentCard.itemType !== 'sentence' && currentCard.example && (
                    <div className="mt-2 max-w-md mx-auto px-3.5 py-2 rounded-xl bg-white/90 border border-slate-200 text-xs sm:text-sm text-slate-600 italic leading-relaxed">
                      <span className="not-italic font-bold uppercase tracking-wider text-[10px] text-slate-400 mr-1.5">
                        Ex.
                      </span>
                      {currentCard.example}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Navigation Bar */}
          <div className="flex items-center justify-between gap-3 pt-1">
            <button
              type="button"
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Previous</span>
            </button>

            {result ? (
              <button
                type="button"
                onClick={handleNext}
                className="flex-1 py-3.5 px-6 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>{currentIndex + 1 < totalCards ? 'Next Card' : 'Finish Session'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleNext}
                className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              >
                <span>Skip</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
