import { useState, useEffect, useCallback, useMemo } from 'react';
import { Navbar } from './components/layouts/Navbar';
import type { NavTab } from './components/layouts/Navbar';
import { DashboardPage } from './pages/DashboardPage';
import { VocabularyPage } from './pages/VocabularyPage';
import type { VocabularyTypeFilter } from './pages/VocabularyPage';
import { FlashCardPage } from './pages/FlashCardPage';

import { NounFormModal } from './components/forms/NounFormModal';
import { VerbFormModal } from './components/forms/VerbFormModal';
import { AdjectiveFormModal } from './components/forms/AdjectiveFormModal';
import { SentenceFormModal } from './components/forms/SentenceFormModal';

import type { Noun, Verb, Adjective, Sentence, VocabularyItem } from './types/vocabulary';
import {
  fetchNouns,
  createNoun,
  updateNoun,
  deleteNoun,
  fetchVerbs,
  createVerb,
  updateVerb,
  deleteVerb,
  fetchAdjectives,
  createAdjective,
  updateAdjective,
  deleteAdjective,
  fetchSentences,
  createSentence,
  updateSentence,
  deleteSentence,
} from './services/vocabularyService';
import { CheckCircle2, AlertCircle, Loader2, CloudOff, RefreshCw } from 'lucide-react';

interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export function App() {
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Data states
  const [nouns, setNouns] = useState<Noun[]>([]);
  const [verbs, setVerbs] = useState<Verb[]>([]);
  const [adjectives, setAdjectives] = useState<Adjective[]>([]);
  const [sentences, setSentences] = useState<Sentence[]>([]);

  // Modals state
  const [isNounModalOpen, setIsNounModalOpen] = useState(false);
  const [editingNoun, setEditingNoun] = useState<Noun | null>(null);

  const [isVerbModalOpen, setIsVerbModalOpen] = useState(false);
  const [editingVerb, setEditingVerb] = useState<Verb | null>(null);

  const [isAdjectiveModalOpen, setIsAdjectiveModalOpen] = useState(false);
  const [editingAdjective, setEditingAdjective] = useState<Adjective | null>(null);

  const [isSentenceModalOpen, setIsSentenceModalOpen] = useState(false);
  const [editingSentence, setEditingSentence] = useState<Sentence | null>(null);

  // Show toast notification
  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast((current) => (current?.message === message ? null : current));
    }, 3500);
  }, []);

  // Sync URL hash with activeTab
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#/', '').replace('#', '') as NavTab;
      if (['dashboard', 'vocabulary', 'nouns', 'verbs', 'adjectives', 'sentences', 'quiz'].includes(hash)) {
        setActiveTab(hash);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleSelectTab = (tab: NavTab) => {
    setActiveTab(tab);
    window.location.hash = `#/${tab}`;
  };

  // Load all data from Firestore
  const loadAllData = useCallback(async (showSpinner = false) => {
    if (showSpinner) {
      setIsLoading(true);
    }
    try {
      const [n, v, a, s] = await Promise.all([
        fetchNouns(),
        fetchVerbs(),
        fetchAdjectives(),
        fetchSentences(),
      ]);
      setNouns(n);
      setVerbs(v);
      setAdjectives(a);
      setSentences(s);
      setLoadError(null);
    } catch (err) {
      console.error('Error loading vocabulary from Firestore:', err);
      setLoadError(
        "We couldn't reach your vocabulary database right now. Please check your internet connection or try again in a moment."
      );
      showToast('Unable to reach vocabulary database', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    let isSubscribed = true;
    (async () => {
      try {
        const [n, v, a, s] = await Promise.all([
          fetchNouns(),
          fetchVerbs(),
          fetchAdjectives(),
          fetchSentences(),
        ]);
        if (isSubscribed) {
          setNouns(n);
          setVerbs(v);
          setAdjectives(a);
          setSentences(s);
          setLoadError(null);
        }
      } catch (err) {
        console.error('Error loading vocabulary on mount:', err);
        if (isSubscribed) {
          setLoadError(
            "We couldn't reach your vocabulary database right now. Please check your internet connection or try again in a moment."
          );
        }
      } finally {
        if (isSubscribed) {
          setIsLoading(false);
        }
      }
    })();

    return () => {
      isSubscribed = false;
    };
  }, []);

  // Aggregate stats
  const stats = useMemo(() => {
    return {
      nounsCount: nouns.length,
      verbsCount: verbs.length,
      adjectivesCount: adjectives.length,
      sentencesCount: sentences.length,
      totalCount: nouns.length + verbs.length + adjectives.length + sentences.length,
    };
  }, [nouns, verbs, adjectives, sentences]);

  // All items formatted for quiz
  const allVocabularyItems = useMemo<VocabularyItem[]>(() => {
    return [
      ...nouns.map((n) => ({ ...n, itemType: 'noun' as const })),
      ...verbs.map((v) => ({ ...v, itemType: 'verb' as const })),
      ...adjectives.map((a) => ({ ...a, itemType: 'adjective' as const })),
      ...sentences.map((s) => ({ ...s, itemType: 'sentence' as const })),
    ];
  }, [nouns, verbs, adjectives, sentences]);

  /* ========================================================================
     NOUN HANDLERS
     ======================================================================== */
  const handleOpenAddNoun = () => {
    setEditingNoun(null);
    setIsNounModalOpen(true);
  };

  const handleOpenEditNoun = (noun: Noun) => {
    setEditingNoun(noun);
    setIsNounModalOpen(true);
  };

  const handleSaveNoun = async (nounData: Omit<Noun, 'id' | 'createdAt'>) => {
    try {
      if (editingNoun) {
        await updateNoun(editingNoun.id, nounData);
        showToast(`Updated "${nounData.article} ${nounData.german}"`);
      } else {
        await createNoun(nounData);
        showToast(`Added "${nounData.article} ${nounData.german}" to nouns`);
      }
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Save error: ${msg}`, 'error');
    }
  };

  const handleDeleteNoun = async (id: string) => {
    try {
      await deleteNoun(id);
      showToast('Noun deleted', 'info');
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Delete error: ${msg}`, 'error');
    }
  };

  /* ========================================================================
     VERB HANDLERS
     ======================================================================== */
  const handleOpenAddVerb = () => {
    setEditingVerb(null);
    setIsVerbModalOpen(true);
  };

  const handleOpenEditVerb = (verb: Verb) => {
    setEditingVerb(verb);
    setIsVerbModalOpen(true);
  };

  const handleSaveVerb = async (verbData: Omit<Verb, 'id' | 'createdAt'>) => {
    try {
      if (editingVerb) {
        await updateVerb(editingVerb.id, verbData);
        showToast(`Updated verb "${verbData.german}"`);
      } else {
        await createVerb(verbData);
        showToast(`Added verb "${verbData.german}"`);
      }
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Save error: ${msg}`, 'error');
    }
  };

  const handleDeleteVerb = async (id: string) => {
    try {
      await deleteVerb(id);
      showToast('Verb deleted', 'info');
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Delete error: ${msg}`, 'error');
    }
  };

  /* ========================================================================
     ADJECTIVE HANDLERS
     ======================================================================== */
  const handleOpenAddAdjective = () => {
    setEditingAdjective(null);
    setIsAdjectiveModalOpen(true);
  };

  const handleOpenEditAdjective = (adjective: Adjective) => {
    setEditingAdjective(adjective);
    setIsAdjectiveModalOpen(true);
  };

  const handleSaveAdjective = async (adjectiveData: Omit<Adjective, 'id' | 'createdAt'>) => {
    try {
      if (editingAdjective) {
        await updateAdjective(editingAdjective.id, adjectiveData);
        showToast(`Updated adjective "${adjectiveData.german}"`);
      } else {
        await createAdjective(adjectiveData);
        showToast(`Added adjective "${adjectiveData.german}"`);
      }
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Save error: ${msg}`, 'error');
    }
  };

  const handleDeleteAdjective = async (id: string) => {
    try {
      await deleteAdjective(id);
      showToast('Adjective deleted', 'info');
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Delete error: ${msg}`, 'error');
    }
  };

  /* ========================================================================
     SENTENCE HANDLERS
     ======================================================================== */
  const handleOpenAddSentence = () => {
    setEditingSentence(null);
    setIsSentenceModalOpen(true);
  };

  const handleOpenEditSentence = (sentence: Sentence) => {
    setEditingSentence(sentence);
    setIsSentenceModalOpen(true);
  };

  const handleSaveSentence = async (sentenceData: Omit<Sentence, 'id' | 'createdAt'>) => {
    try {
      if (editingSentence) {
        await updateSentence(editingSentence.id, sentenceData);
        showToast('Updated sentence');
      } else {
        await createSentence(sentenceData);
        showToast('Added new German sentence');
      }
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Save error: ${msg}`, 'error');
    }
  };

  const handleDeleteSentence = async (id: string) => {
    try {
      await deleteSentence(id);
      showToast('Sentence deleted', 'info');
      await loadAllData();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      showToast(`Delete error: ${msg}`, 'error');
    }
  };

  // Determine vocabulary type filter from hash/tab
  const currentVocabularyFilter: VocabularyTypeFilter = useMemo(() => {
    if (activeTab === 'nouns') return 'noun';
    if (activeTab === 'verbs') return 'verb';
    if (activeTab === 'adjectives') return 'adjective';
    if (activeTab === 'sentences') return 'sentence';
    return 'all';
  }, [activeTab]);

  const handleVocabularyFilterChange = (filter: VocabularyTypeFilter) => {
    const tabMap: Record<VocabularyTypeFilter, NavTab> = {
      all: 'vocabulary',
      noun: 'nouns',
      verb: 'verbs',
      adjective: 'adjectives',
      sentence: 'sentences',
    };
    handleSelectTab(tabMap[filter]);
  };

  const isVocabularyTab = ['vocabulary', 'nouns', 'verbs', 'adjectives', 'sentences'].includes(activeTab);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans text-slate-800 antialiased selection:bg-amber-400 selection:text-zinc-950">
      {/* Toast Notification Banner */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 animate-bounce-once">
          <div
            className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl shadow-xl text-xs font-bold border ${
              toast.type === 'success'
                ? 'bg-zinc-950 text-white border-zinc-800'
                : toast.type === 'error'
                ? 'bg-red-600 text-white border-red-700'
                : 'bg-zinc-900 text-amber-300 border-zinc-800'
            }`}
          >
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-300 shrink-0" />
            )}
            <span>{toast.message}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={handleSelectTab}
        stats={stats}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-3">
            <Loader2 className="w-8 h-8 text-red-600 animate-spin" />
            <span className="text-sm font-semibold text-slate-500">Loading German Word Bank...</span>
          </div>
        ) : loadError ? (
          <div className="flex items-center justify-center min-h-[55vh] py-8">
            <div
              role="alert"
              className="max-w-md w-full bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 text-center space-y-5"
            >
              <div className="w-14 h-14 mx-auto rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center">
                <CloudOff className="w-7 h-7" />
              </div>
              <div className="space-y-2">
                <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Unable to Connect
                </h1>
                <p className="text-sm text-slate-600 leading-relaxed">{loadError}</p>
              </div>
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => loadAllData(true)}
                  className="inline-flex items-center justify-center gap-2 w-full sm:w-auto px-6 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-bold text-sm transition-colors shadow-xs cursor-pointer"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Try Again</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {activeTab === 'dashboard' && (
              <DashboardPage
                stats={stats}
                onNavigate={handleSelectTab}
                recentNouns={nouns}
                recentVerbs={verbs}
                recentAdjectives={adjectives}
                recentSentences={sentences}
              />
            )}

            {isVocabularyTab && (
              <VocabularyPage
                nouns={nouns}
                verbs={verbs}
                adjectives={adjectives}
                sentences={sentences}
                typeFilter={currentVocabularyFilter}
                onTypeFilterChange={handleVocabularyFilterChange}
                onAddNoun={handleOpenAddNoun}
                onAddVerb={handleOpenAddVerb}
                onAddAdjective={handleOpenAddAdjective}
                onAddSentence={handleOpenAddSentence}
                onEditNoun={handleOpenEditNoun}
                onEditVerb={handleOpenEditVerb}
                onEditAdjective={handleOpenEditAdjective}
                onEditSentence={handleOpenEditSentence}
                onDeleteNoun={handleDeleteNoun}
                onDeleteVerb={handleDeleteVerb}
                onDeleteAdjective={handleDeleteAdjective}
                onDeleteSentence={handleDeleteSentence}
              />
            )}

            {activeTab === 'quiz' && (
              <FlashCardPage
                vocabularyItems={allVocabularyItems}
                onNavigateToVocabulary={() => handleSelectTab('vocabulary')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-200 bg-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <div className="h-3 w-5 rounded-xs flex overflow-hidden shadow-2xs border border-slate-200">
              <div className="flex-1 bg-zinc-950" />
              <div className="flex-1 bg-red-600" />
              <div className="flex-1 bg-amber-400" />
            </div>
            <span>
              <strong className="text-slate-800">German Word Bank</strong> — Personal Vocabulary & Practice.
            </span>
          </div>
          <div className="flex items-center gap-4">
            <span className="font-semibold text-slate-700">Target Level: A1</span>
          </div>
        </div>
      </footer>

      {/* Modals with key so state resets properly on new or edit */}
      <NounFormModal
        key={editingNoun ? `noun-${editingNoun.id}` : 'new-noun'}
        isOpen={isNounModalOpen}
        onClose={() => setIsNounModalOpen(false)}
        onSubmit={handleSaveNoun}
        initialNoun={editingNoun}
      />

      <VerbFormModal
        key={editingVerb ? `verb-${editingVerb.id}` : 'new-verb'}
        isOpen={isVerbModalOpen}
        onClose={() => setIsVerbModalOpen(false)}
        onSubmit={handleSaveVerb}
        initialVerb={editingVerb}
      />

      <AdjectiveFormModal
        key={editingAdjective ? `adj-${editingAdjective.id}` : 'new-adj'}
        isOpen={isAdjectiveModalOpen}
        onClose={() => setIsAdjectiveModalOpen(false)}
        onSubmit={handleSaveAdjective}
        initialAdjective={editingAdjective}
      />

      <SentenceFormModal
        key={editingSentence ? `sentence-${editingSentence.id}` : 'new-sentence'}
        isOpen={isSentenceModalOpen}
        onClose={() => setIsSentenceModalOpen(false)}
        onSubmit={handleSaveSentence}
        initialSentence={editingSentence}
      />
    </div>
  );
}

export default App;
