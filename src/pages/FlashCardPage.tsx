import React, { useState, useEffect, useMemo, useCallback } from 'react';
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
} from 'lucide-react';
import type { VocabularyItem } from '../types/vocabulary';

interface FlashCardPageProps {
  vocabularyItems: VocabularyItem[];
  onNavigateToVocabulary?: () => void;
}

type FlashCardFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'sentence';
type StudyDirection = 'de-to-en' | 'en-to-de';

export const FlashCardPage: React.FC<FlashCardPageProps> = ({
  vocabularyItems,
  onNavigateToVocabulary,
}) => {
  const [filterType, setFilterType] = useState<FlashCardFilter>('all');
  const [direction, setDirection] = useState<StudyDirection>('de-to-en');
  const [isFlipped, setIsFlipped] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Deck items (shuffled, filtered, or subset)
  const [customDeck, setCustomDeck] = useState<VocabularyItem[] | null>(null);
  const [masteredIds, setMasteredIds] = useState<Set<string>>(new Set());
  const [learningIds, setLearningIds] = useState<Set<string>>(new Set());
  const [isCompleted, setIsCompleted] = useState(false);

  // Deck derived without setting state inside an effect
  const deck = useMemo(() => {
    if (customDeck !== null) return customDeck;
    if (filterType === 'all') return vocabularyItems;
    return vocabularyItems.filter((item) => item.itemType === filterType);
  }, [vocabularyItems, filterType, customDeck]);

  const handleSelectFilter = (type: FlashCardFilter) => {
    setFilterType(type);
    setCustomDeck(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setLearningIds(new Set());
    setIsCompleted(false);
  };

  const currentCard = deck[currentIndex];
  const totalCards = deck.length;

  // Flip card
  const handleFlip = useCallback(() => {
    if (!currentCard) return;
    setIsFlipped((prev) => !prev);
  }, [currentCard]);

  // Navigate to next card
  const handleNext = useCallback(() => {
    if (currentIndex + 1 < totalCards) {
      setCurrentIndex((prev) => prev + 1);
      setIsFlipped(false);
    } else {
      setIsCompleted(true);
    }
  }, [currentIndex, totalCards]);

  // Navigate to previous card
  const handlePrevious = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex((prev) => prev - 1);
      setIsFlipped(false);
    }
  }, [currentIndex]);

  // Mark as Mastered
  const handleMarkMastered = useCallback(() => {
    if (!currentCard) return;
    setMasteredIds((prev) => new Set(prev).add(currentCard.id));
    setLearningIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  }, [currentCard, handleNext]);

  // Mark as Still Learning
  const handleMarkLearning = useCallback(() => {
    if (!currentCard) return;
    setLearningIds((prev) => new Set(prev).add(currentCard.id));
    setMasteredIds((prev) => {
      const next = new Set(prev);
      next.delete(currentCard.id);
      return next;
    });
    handleNext();
  }, [currentCard, handleNext]);

  // Shuffle deck
  const handleShuffle = () => {
    const shuffled = [...deck].sort(() => Math.random() - 0.5);
    setCustomDeck(shuffled);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setLearningIds(new Set());
    setIsCompleted(false);
  };

  // Restart all
  const handleRestart = () => {
    setCustomDeck(null);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setLearningIds(new Set());
    setIsCompleted(false);
  };

  // Practice only missed cards
  const handlePracticeLearning = () => {
    const missed = deck.filter((item) => learningIds.has(item.id));
    if (missed.length === 0) return;
    setCustomDeck(missed);
    setCurrentIndex(0);
    setIsFlipped(false);
    setMasteredIds(new Set());
    setLearningIds(new Set());
    setIsCompleted(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement).tagName)) return;

      if (e.code === 'Space' || e.code === 'Enter') {
        e.preventDefault();
        handleFlip();
      } else if (e.code === 'ArrowLeft') {
        e.preventDefault();
        if (isFlipped) {
          handleMarkLearning();
        } else {
          handlePrevious();
        }
      } else if (e.code === 'ArrowRight') {
        e.preventDefault();
        if (isFlipped) {
          handleMarkMastered();
        } else {
          handleNext();
        }
      } else if (e.key === '1' && isFlipped) {
        e.preventDefault();
        handleMarkLearning();
      } else if (e.key === '2' && isFlipped) {
        e.preventDefault();
        handleMarkMastered();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleFlip, handleNext, handlePrevious, handleMarkLearning, handleMarkMastered, isFlipped]);

  // Counts by category
  const categoryCounts = useMemo(() => {
    return {
      all: vocabularyItems.length,
      noun: vocabularyItems.filter((i) => i.itemType === 'noun').length,
      verb: vocabularyItems.filter((i) => i.itemType === 'verb').length,
      adjective: vocabularyItems.filter((i) => i.itemType === 'adjective').length,
      sentence: vocabularyItems.filter((i) => i.itemType === 'sentence').length,
    };
  }, [vocabularyItems]);

  // Badge rendering helper
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
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-400 text-zinc-950 shadow-xs">
              <Layers className="w-5 h-5" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              Vocabulary FlashCards
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Flip cards to review German words, articles, and phrases. Tap or press Space to flip.
          </p>
        </div>

        {/* Direction Switcher */}
        <button
          onClick={() => {
            setDirection((prev) => (prev === 'de-to-en' ? 'en-to-de' : 'de-to-en'));
            setIsFlipped(false);
          }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 shadow-2xs transition-colors cursor-pointer self-start sm:self-auto shrink-0"
          title="Toggle Front / Back Language"
        >
          {direction === 'de-to-en' ? (
            <>
              <span>🇩🇪 DE</span>
              <ArrowRight className="w-3.5 h-3.5 text-red-600" />
              <span>🇬🇧 EN</span>
            </>
          ) : (
            <>
              <span>🇬🇧 EN</span>
              <ArrowRight className="w-3.5 h-3.5 text-amber-500" />
              <span>🇩🇪 DE</span>
            </>
          )}
        </button>
      </div>

      {/* Category Filter: Dropdown on mobile, pills on tablet & desktop */}
      <div className="block sm:hidden">
        <div className="relative">
          <select
            value={filterType}
            onChange={(e) => handleSelectFilter(e.target.value as FlashCardFilter)}
            className="w-full appearance-none pl-3.5 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-800 shadow-xs focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer"
            aria-label="Filter flashcards by category"
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
            Add words in your Word Bank to populate flashcards for study and review.
          </p>
          {onNavigateToVocabulary && (
            <button
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
              Deck Completed!
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              You reviewed all {totalCards} cards in this session.
            </p>
          </div>

          {/* Mastery Score Card */}
          <div className="grid grid-cols-2 gap-3 max-w-md mx-auto">
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-center">
              <div className="text-2xl sm:text-3xl font-black text-emerald-700">
                {masteredIds.size}
              </div>
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider mt-1">
                ✓ Mastered
              </div>
            </div>
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-center">
              <div className="text-2xl sm:text-3xl font-black text-rose-700">
                {learningIds.size}
              </div>
              <div className="text-xs font-bold text-rose-800 uppercase tracking-wider mt-1">
                ⟳ Needs Practice
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 font-semibold">
            Overall Recall Score:{' '}
            <strong className="text-slate-900 font-bold">{masteryPercent}%</strong>
          </div>

          {/* Completion Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2 max-w-md mx-auto">
            {learningIds.size > 0 && (
              <button
                onClick={handlePracticeLearning}
                className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <RotateCcw className="w-4 h-4" />
                <span>Practice Missed ({learningIds.size})</span>
              </button>
            )}

            <button
              onClick={handleRestart}
              className="w-full sm:w-auto flex-1 py-3 px-4 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Restart All Cards</span>
            </button>
          </div>
        </div>
      ) : (
        /* Active FlashCard Area */
        <div className="space-y-4">
          {/* Progress Header & Stats */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-500">
              <span className="font-bold text-slate-700">
                Card {currentIndex + 1} of {totalCards}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-emerald-600 font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>{masteredIds.size}</span>
                </span>
                <span className="text-rose-600 font-bold flex items-center gap-1">
                  <XCircle className="w-3.5 h-3.5" />
                  <span>{learningIds.size}</span>
                </span>
                <button
                  onClick={handleShuffle}
                  className="p-1 text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
                  title="Shuffle deck"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* German Flag Progress Bar */}
            <div className="w-full h-2 bg-slate-200 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full bg-gradient-to-r from-zinc-950 via-red-600 to-amber-400 transition-all duration-300 rounded-full"
                style={{
                  width: `${((currentIndex + 1) / totalCards) * 100}%`,
                }}
              />
            </div>
          </div>

          {/* 3D Flip Card Container */}
          <div
            className="w-full min-h-[300px] sm:min-h-[340px] cursor-pointer select-none"
            style={{ perspective: '1000px' }}
            onClick={handleFlip}
          >
            <div
              className="relative w-full h-full min-h-[300px] sm:min-h-[340px] transition-transform duration-500 rounded-3xl"
              style={{
                transformStyle: 'preserve-3d',
                transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
              }}
            >
              {/* FRONT FACE */}
              <div
                className="absolute inset-0 w-full h-full bg-white rounded-3xl border-2 border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 p-6 sm:p-8 flex flex-col justify-between"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                }}
              >
                {/* Front Top Strip */}
                <div className="flex items-center justify-between">
                  {renderBadge(currentCard.itemType)}
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    {direction === 'de-to-en' ? '🇩🇪 German' : '🇬🇧 English'}
                  </span>
                </div>

                {/* Front Center Prompt */}
                <div className="text-center py-6 space-y-2">
                  <div className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight leading-snug">
                    {direction === 'de-to-en' ? (
                      currentCard.itemType === 'noun' ? (
                        <>
                          <span className="text-red-600 mr-2">{currentCard.article}</span>
                          <span>{currentCard.german}</span>
                        </>
                      ) : (
                        currentCard.german
                      )
                    ) : (
                      currentCard.english
                    )}
                  </div>
                  {direction === 'de-to-en' && currentCard.itemType === 'sentence' && currentCard.remark && (
                    <div className="inline-flex items-center gap-1 text-xs text-slate-500 font-normal">
                      <HelpCircle className="w-3.5 h-3.5 text-amber-500" />
                      <span>{currentCard.remark}</span>
                    </div>
                  )}
                </div>

                {/* Front Bottom Prompt */}
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tap or press Space to flip</span>
                </div>
              </div>

              {/* BACK FACE */}
              <div
                className="absolute inset-0 w-full h-full bg-gradient-to-b from-white to-amber-50/40 rounded-3xl border-2 border-amber-300 shadow-sm hover:shadow-md p-6 sm:p-8 flex flex-col justify-between"
                style={{
                  backfaceVisibility: 'hidden',
                  WebkitBackfaceVisibility: 'hidden',
                  transform: 'rotateY(180deg)',
                }}
              >
                {/* Back Top Strip */}
                <div className="flex items-center justify-between">
                  {renderBadge(currentCard.itemType)}
                  <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
                    {direction === 'de-to-en' ? '🇬🇧 English Meaning' : '🇩🇪 German Translation'}
                  </span>
                </div>

                {/* Back Center Answer & Extra Details */}
                <div className="text-center py-4 space-y-3">
                  <div className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-snug">
                    {direction === 'de-to-en' ? (
                      currentCard.english
                    ) : currentCard.itemType === 'noun' ? (
                      <>
                        <span className="text-red-600 mr-2">{currentCard.article}</span>
                        <span>{currentCard.german}</span>
                      </>
                    ) : (
                      currentCard.german
                    )}
                  </div>

                  {/* Original Prompt Subtitle */}
                  <div className="text-xs sm:text-sm font-semibold text-slate-500">
                    {direction === 'de-to-en' ? (
                      currentCard.itemType === 'noun' ? (
                        `${currentCard.article} ${currentCard.german}`
                      ) : (
                        currentCard.german
                      )
                    ) : (
                      currentCard.english
                    )}
                  </div>

                  {/* Grammatical Extra Details Pill */}
                  <div className="pt-1 flex items-center justify-center flex-wrap gap-2">
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
                        "{currentCard.remark}"
                      </span>
                    )}
                  </div>
                </div>

                {/* Back Bottom Prompt */}
                <div className="flex items-center justify-center gap-1.5 text-xs font-semibold text-slate-400">
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>Tap to flip back</span>
                </div>
              </div>
            </div>
          </div>

          {/* Action Bar Below Card */}
          <div className="pt-2">
            {!isFlipped ? (
              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={handlePrevious}
                  disabled={currentIndex === 0}
                  className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 disabled:opacity-40 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer disabled:cursor-not-allowed shadow-2xs"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="hidden sm:inline">Previous</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlip}
                  className="flex-1 py-3.5 px-6 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-sm transition-all shadow-sm hover:shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Flip Card (Space)</span>
                </button>

                <button
                  type="button"
                  onClick={handleNext}
                  className="px-4 py-3 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-bold text-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
                >
                  <span className="hidden sm:inline">Next</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2.5 animate-fade-in">
                <button
                  type="button"
                  onClick={handleMarkLearning}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 active:bg-rose-200 border border-rose-200 text-rose-700 font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-2xs"
                >
                  <XCircle className="w-4 h-4" />
                  <span>Still Learning (1)</span>
                </button>

                <button
                  type="button"
                  onClick={handleFlip}
                  className="p-3.5 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-600 transition-colors cursor-pointer shrink-0"
                  title="Flip back to question"
                >
                  <RotateCcw className="w-4 h-4" />
                </button>

                <button
                  type="button"
                  onClick={handleMarkMastered}
                  className="flex-1 py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold text-xs sm:text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-sm hover:shadow-md"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Mastered (2)</span>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
