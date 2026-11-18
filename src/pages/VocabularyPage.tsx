import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Layers,
  Sparkles,
  Tag,
  MessageSquare,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  ChevronDown,
} from 'lucide-react';
import type { Noun, Verb, Adjective, Sentence, Article } from '../types/vocabulary';
import { SearchBar } from '../components/common/SearchBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';
import { Modal } from '../components/common/Modal';

export type VocabularyTypeFilter = 'all' | 'noun' | 'verb' | 'adjective' | 'sentence';

interface VocabularyPageProps {
  nouns: Noun[];
  verbs: Verb[];
  adjectives: Adjective[];
  sentences: Sentence[];
  typeFilter: VocabularyTypeFilter;
  onTypeFilterChange: (filter: VocabularyTypeFilter) => void;

  // Add handlers
  onAddNoun: () => void;
  onAddVerb: () => void;
  onAddAdjective: () => void;
  onAddSentence: () => void;

  // Edit handlers
  onEditNoun: (noun: Noun) => void;
  onEditVerb: (verb: Verb) => void;
  onEditAdjective: (adjective: Adjective) => void;
  onEditSentence: (sentence: Sentence) => void;

  // Delete handlers
  onDeleteNoun: (id: string) => Promise<void>;
  onDeleteVerb: (id: string) => Promise<void>;
  onDeleteAdjective: (id: string) => Promise<void>;
  onDeleteSentence: (id: string) => Promise<void>;
}

type DeleteTarget =
  | { type: 'noun'; item: Noun }
  | { type: 'verb'; item: Verb }
  | { type: 'adjective'; item: Adjective }
  | { type: 'sentence'; item: Sentence }
  | null;

export const VocabularyPage: React.FC<VocabularyPageProps> = ({
  nouns,
  verbs,
  adjectives,
  sentences,
  typeFilter,
  onTypeFilterChange,
  onAddNoun,
  onAddVerb,
  onAddAdjective,
  onAddSentence,
  onEditNoun,
  onEditVerb,
  onEditAdjective,
  onEditSentence,
  onDeleteNoun,
  onDeleteVerb,
  onDeleteAdjective,
  onDeleteSentence,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articleFilter, setArticleFilter] = useState<'all' | Article>('all');
  const [isAddMenuOpen, setIsAddMenuOpen] = useState(false);
  const addMenuRef = useRef<HTMLDivElement>(null);

  const [actionTarget, setActionTarget] = useState<DeleteTarget>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Close add dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (addMenuRef.current && !addMenuRef.current.contains(e.target as Node)) {
        setIsAddMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filtered Nouns
  const filteredNouns = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return nouns.filter((n) => {
      const matchesArticle = articleFilter === 'all' || n.article === articleFilter;
      if (!matchesArticle) return false;
      if (!q) return true;
      return (
        n.german.toLowerCase().includes(q) ||
        n.english.toLowerCase().includes(q) ||
        n.plural.toLowerCase().includes(q) ||
        n.article.toLowerCase().includes(q) ||
        (n.example && n.example.toLowerCase().includes(q))
      );
    });
  }, [nouns, searchQuery, articleFilter]);

  // Filtered Verbs
  const filteredVerbs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return verbs;
    return verbs.filter(
      (v) =>
        v.german.toLowerCase().includes(q) ||
        v.english.toLowerCase().includes(q) ||
        (v.conjugation && v.conjugation.toLowerCase().includes(q)) ||
        (v.example && v.example.toLowerCase().includes(q))
    );
  }, [verbs, searchQuery]);

  // Filtered Adjectives
  const filteredAdjectives = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return adjectives;
    return adjectives.filter(
      (a) =>
        a.german.toLowerCase().includes(q) ||
        a.english.toLowerCase().includes(q) ||
        (a.comparative && a.comparative.toLowerCase().includes(q)) ||
        (a.example && a.example.toLowerCase().includes(q))
    );
  }, [adjectives, searchQuery]);

  // Filtered Sentences
  const filteredSentences = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return sentences;
    return sentences.filter(
      (s) =>
        s.german.toLowerCase().includes(q) ||
        s.english.toLowerCase().includes(q) ||
        (s.remark && s.remark.toLowerCase().includes(q))
    );
  }, [sentences, searchQuery]);

  // Aggregate counts
  const totalItemsCount = nouns.length + verbs.length + adjectives.length + sentences.length;
  const filteredTotalCount =
    (typeFilter === 'all' || typeFilter === 'noun' ? filteredNouns.length : 0) +
    (typeFilter === 'all' || typeFilter === 'verb' ? filteredVerbs.length : 0) +
    (typeFilter === 'all' || typeFilter === 'adjective' ? filteredAdjectives.length : 0) +
    (typeFilter === 'all' || typeFilter === 'sentence' ? filteredSentences.length : 0);

  // Deletion execution
  const handleActionEdit = () => {
    if (!actionTarget) return;
    const target = actionTarget;
    setActionTarget(null);
    if (target.type === 'noun') onEditNoun(target.item);
    else if (target.type === 'verb') onEditVerb(target.item);
    else if (target.type === 'adjective') onEditAdjective(target.item);
    else if (target.type === 'sentence') onEditSentence(target.item);
  };

  const handleActionDelete = () => {
    if (!actionTarget) return;
    const target = actionTarget;
    setActionTarget(null);
    setDeleteTarget(target);
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      if (deleteTarget.type === 'noun') {
        await onDeleteNoun(deleteTarget.item.id);
      } else if (deleteTarget.type === 'verb') {
        await onDeleteVerb(deleteTarget.item.id);
      } else if (deleteTarget.type === 'adjective') {
        await onDeleteAdjective(deleteTarget.item.id);
      } else if (deleteTarget.type === 'sentence') {
        await onDeleteSentence(deleteTarget.item.id);
      }
      setDeleteTarget(null);
    } finally {
      setIsDeleting(false);
    }
  };

  const getDeleteModalInfo = () => {
    if (!deleteTarget) return { title: '', message: '' };
    switch (deleteTarget.type) {
      case 'noun':
        return {
          title: 'Delete Noun',
          message: `Are you sure you want to delete the noun "${deleteTarget.item.article} ${deleteTarget.item.german}"?`,
        };
      case 'verb':
        return {
          title: 'Delete Verb',
          message: `Are you sure you want to delete the verb "${deleteTarget.item.german}"?`,
        };
      case 'adjective':
        return {
          title: 'Delete Adjective',
          message: `Are you sure you want to delete the adjective "${deleteTarget.item.german}"?`,
        };
      case 'sentence':
        return {
          title: 'Delete Sentence',
          message: `Are you sure you want to delete this sentence: "${deleteTarget.item.german}"?`,
        };
    }
  };

  const deleteInfo = getDeleteModalInfo();

  return (
    <div className="space-y-5 sm:space-y-8 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              German Word Bank
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Browse and manage all your German vocabulary — Nouns, Verbs, Adjectives, and Sentences.
          </p>
        </div>

        {/* Quick Add Menu */}
        <div className="relative w-full sm:w-auto shrink-0" ref={addMenuRef}>
          <button
            onClick={() => setIsAddMenuOpen(!isAddMenuOpen)}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-xs hover:shadow-md cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Add New Entry</span>
            <ChevronDown className={`w-4 h-4 transition-transform ${isAddMenuOpen ? 'rotate-180' : ''}`} />
          </button>

          {isAddMenuOpen && (
            <div className="absolute left-0 sm:left-auto sm:right-0 mt-2 w-full sm:w-56 bg-white rounded-2xl shadow-xl border border-slate-200 py-1.5 z-30 animate-fade-in">
              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onAddNoun();
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-red-50 hover:text-red-700 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-red-100 text-red-700">
                  <Layers className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Add Noun</div>
                  <div className="text-[11px] text-slate-400 font-normal">der · die · das & plural</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onAddVerb();
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-amber-50 hover:text-amber-800 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-amber-100 text-amber-800">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Add Verb</div>
                  <div className="text-[11px] text-slate-400 font-normal">Infinitive & forms</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onAddAdjective();
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-emerald-50 hover:text-emerald-800 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800">
                  <Tag className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Add Adjective</div>
                  <div className="text-[11px] text-slate-400 font-normal">German & English</div>
                </div>
              </button>

              <button
                onClick={() => {
                  setIsAddMenuOpen(false);
                  onAddSentence();
                }}
                className="w-full px-4 py-2.5 text-left text-sm font-semibold text-slate-700 hover:bg-zinc-100 hover:text-zinc-900 flex items-center gap-2.5 cursor-pointer transition-colors"
              >
                <div className="p-1.5 rounded-lg bg-zinc-200 text-zinc-900">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <div className="font-bold">Add Sentence</div>
                  <div className="text-[11px] text-slate-400 font-normal">Everyday phrase & context</div>
                </div>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        {/* Category Type Dropdown */}
        <div className="relative w-full sm:w-auto">
          <select
            value={typeFilter}
            onChange={(e) => onTypeFilterChange(e.target.value as VocabularyTypeFilter)}
            className="w-full sm:w-56 appearance-none pl-3.5 pr-9 py-2.5 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm font-bold text-slate-800 shadow-xs hover:border-slate-300 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition-all cursor-pointer"
            aria-label="Filter by vocabulary category"
          >
            <option value="all">All Types ({totalItemsCount})</option>
            <option value="noun">Nouns ({nouns.length})</option>
            <option value="verb">Verbs ({verbs.length})</option>
            <option value="adjective">Adjectives ({adjectives.length})</option>
            <option value="sentence">Sentences ({sentences.length})</option>
          </select>
          <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Search Input & Article Filter (when viewing nouns or all) */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-3 flex-1">
          {(typeFilter === 'all' || typeFilter === 'noun') && (
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl border border-slate-200 w-full sm:w-auto shrink-0">
              {(['all', 'der', 'die', 'das'] as const).map((art) => {
                const isActive = articleFilter === art;
                return (
                  <button
                    key={art}
                    onClick={() => setArticleFilter(art)}
                    className={`flex-1 sm:flex-none px-2.5 py-1.5 sm:py-1 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                      isActive
                        ? 'bg-zinc-900 text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {art === 'all' ? 'All' : art}
                  </button>
                );
              })}
            </div>
          )}

          <div className="w-full sm:w-72 md:w-80">
            <SearchBar
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search in words, meanings, or notes..."
              resultCount={filteredTotalCount}
              totalCount={totalItemsCount}
            />
          </div>
        </div>
      </div>

      {/* SEPARATED SECTIONS BY TYPE */}
      {filteredTotalCount === 0 ? (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-slate-100 text-slate-500 flex items-center justify-center">
            <BookOpen className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? 'No matching entries found' : 'No vocabulary entries yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No words or sentences matched "${searchQuery}". Try a different search term or clear filters.`
              : 'Start adding German nouns, verbs, adjectives, or sentences to build your personal word bank.'}
          </p>
          {searchQuery || articleFilter !== 'all' || typeFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setArticleFilter('all');
                onTypeFilterChange('all');
              }}
              className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer border border-red-200"
            >
              Clear search & filters
            </button>
          ) : (
            <button
              onClick={() => setIsAddMenuOpen(true)}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              + Add First Entry
            </button>
          )}
        </div>
      ) : (
        <div
          role="region"
          aria-label="German vocabulary list"
          className="@container bg-white rounded-2xl border border-slate-200 overflow-clip shadow-xs"
        >
          <table className="w-full table-fixed border-separate border-spacing-0 text-left">
            <caption className="sr-only">German Word Bank vocabulary entries</caption>
            <thead>
              <tr className="bg-slate-50 text-[10px] @[600px]:text-[11px] font-bold text-slate-400 uppercase tracking-wider select-none">
                <th
                  scope="col"
                  className="w-[54px] @[600px]:w-[116px] py-2.5 pl-2.5 pr-1.5 @[600px]:pl-5 @[600px]:pr-3 border-b border-slate-200 font-bold"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="py-2.5 px-2 @[600px]:px-3 border-b border-slate-200 font-bold"
                >
                  German
                </th>
                <th
                  scope="col"
                  className="w-[36%] @[600px]:w-[38%] py-2.5 pl-2 pr-2.5 @[600px]:pl-3 @[600px]:pr-5 border-b border-slate-200 font-bold"
                >
                  English
                </th>
              </tr>
            </thead>
            {/* Nouns */}
            {(typeFilter === 'all' || typeFilter === 'noun') &&
              filteredNouns.map((noun) => {
                const hasExample = Boolean(noun.example?.trim());
                const rowPadBottom = hasExample ? 'pb-1.5 @[600px]:pb-2' : 'pb-3 @[600px]:pb-3.5';
                return (
                  <tbody
                    key={noun.id}
                    onClick={() => setActionTarget({ type: 'noun', item: noun })}
                    className="group cursor-pointer select-none [&_tr:last-child_td]:border-b [&_tr:last-child_td]:border-slate-100 last:[&_tr:last-child_td]:border-b-0"
                  >
                    <tr
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActionTarget({ type: 'noun', item: noun });
                        }
                      }}
                      className="focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:-outline-offset-2"
                    >
                      <td className={`align-top pt-3 ${rowPadBottom} pl-2.5 pr-1.5 @[600px]:pt-3.5 @[600px]:pl-5 @[600px]:pr-3 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        <span
                          title="Noun"
                          className="mt-0.5 block w-full text-center px-1 @[600px]:px-1.5 py-0.5 rounded-md text-[9px] @[600px]:text-[11px] font-bold uppercase tracking-tight @[600px]:tracking-wider bg-red-50 text-red-700 border border-red-200"
                        >
                          Noun
                        </span>
                      </td>
                      <td className={`align-top pt-3 ${rowPadBottom} px-2 @[600px]:pt-3.5 @[600px]:px-3 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                          <span className="font-bold text-slate-900 text-sm @[600px]:text-base leading-snug break-words">
                            {noun.article} {noun.german}
                          </span>
                          {noun.plural && (
                            <span className="min-w-0 text-xs text-slate-500 font-medium leading-snug break-words">
                              die {noun.plural}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`align-top pt-3 ${rowPadBottom} pl-2 pr-2.5 @[600px]:pt-3.5 @[600px]:pl-3 @[600px]:pr-5 font-bold text-slate-900 text-sm @[600px]:text-base leading-snug break-words group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        {noun.english}
                      </td>
                    </tr>
                    {hasExample && (
                      <tr>
                        <td
                          colSpan={3}
                          className="pt-0 pb-3 px-2.5 @[600px]:pb-3.5 @[600px]:pl-[128px] @[600px]:pr-5 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-baseline gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/90 group-hover:bg-white/90 border-l-2 border-red-300 text-xs @[600px]:text-[13px] leading-relaxed break-words transition-colors">
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Ex.
                            </span>
                            <span className="min-w-0 italic text-slate-600">{noun.example}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}

            {/* Verbs */}
            {(typeFilter === 'all' || typeFilter === 'verb') &&
              filteredVerbs.map((verb) => {
                const hasExample = Boolean(verb.example?.trim());
                const rowPadBottom = hasExample ? 'pb-1.5 @[600px]:pb-2' : 'pb-3 @[600px]:pb-3.5';
                return (
                  <tbody
                    key={verb.id}
                    onClick={() => setActionTarget({ type: 'verb', item: verb })}
                    className="group cursor-pointer select-none [&_tr:last-child_td]:border-b [&_tr:last-child_td]:border-slate-100 last:[&_tr:last-child_td]:border-b-0"
                  >
                    <tr
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActionTarget({ type: 'verb', item: verb });
                        }
                      }}
                      className="focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:-outline-offset-2"
                    >
                      <td className={`align-top pt-3 ${rowPadBottom} pl-2.5 pr-1.5 @[600px]:pt-3.5 @[600px]:pl-5 @[600px]:pr-3 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        <span
                          title="Verb"
                          className="mt-0.5 block w-full text-center px-1 @[600px]:px-1.5 py-0.5 rounded-md text-[9px] @[600px]:text-[11px] font-bold uppercase tracking-tight @[600px]:tracking-wider bg-amber-50 text-amber-800 border border-amber-200"
                        >
                          Verb
                        </span>
                      </td>
                      <td className={`align-top pt-3 ${rowPadBottom} px-2 @[600px]:pt-3.5 @[600px]:px-3 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-bold text-slate-900 text-sm @[600px]:text-base leading-snug break-words">
                            {verb.german}
                          </span>
                          {verb.conjugation ? (
                            <span className="min-w-0 max-w-full text-[11px] @[600px]:text-xs font-mono text-amber-900 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-100 leading-snug break-words">
                              {verb.conjugation}
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic leading-snug">
                              Infinitive
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`align-top pt-3 ${rowPadBottom} pl-2 pr-2.5 @[600px]:pt-3.5 @[600px]:pl-3 @[600px]:pr-5 font-bold text-slate-900 text-sm @[600px]:text-base leading-snug break-words group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        {verb.english}
                      </td>
                    </tr>
                    {hasExample && (
                      <tr>
                        <td
                          colSpan={3}
                          className="pt-0 pb-3 px-2.5 @[600px]:pb-3.5 @[600px]:pl-[128px] @[600px]:pr-5 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-baseline gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/90 group-hover:bg-white/90 border-l-2 border-amber-300 text-xs @[600px]:text-[13px] leading-relaxed break-words transition-colors">
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Ex.
                            </span>
                            <span className="min-w-0 italic text-slate-600">{verb.example}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}

            {/* Adjectives */}
            {(typeFilter === 'all' || typeFilter === 'adjective') &&
              filteredAdjectives.map((adj) => {
                const hasExample = Boolean(adj.example?.trim());
                const rowPadBottom = hasExample ? 'pb-1.5 @[600px]:pb-2' : 'pb-3 @[600px]:pb-3.5';
                return (
                  <tbody
                    key={adj.id}
                    onClick={() => setActionTarget({ type: 'adjective', item: adj })}
                    className="group cursor-pointer select-none [&_tr:last-child_td]:border-b [&_tr:last-child_td]:border-slate-100 last:[&_tr:last-child_td]:border-b-0"
                  >
                    <tr
                      tabIndex={0}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          setActionTarget({ type: 'adjective', item: adj });
                        }
                      }}
                      className="focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:-outline-offset-2"
                    >
                      <td className={`align-top pt-3 ${rowPadBottom} pl-2.5 pr-1.5 @[600px]:pt-3.5 @[600px]:pl-5 @[600px]:pr-3 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        <span
                          title="Adjective"
                          aria-label="Adjective"
                          className="mt-0.5 block w-full text-center px-1 @[600px]:px-1.5 py-0.5 rounded-md text-[9px] @[600px]:text-[11px] font-bold uppercase tracking-tight @[600px]:tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200"
                        >
                          <span className="@[600px]:hidden" aria-hidden="true">Adj</span>
                          <span className="hidden @[600px]:inline">Adjective</span>
                        </span>
                      </td>
                      <td className={`align-top pt-3 ${rowPadBottom} px-2 @[600px]:pt-3.5 @[600px]:px-3 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-1">
                          <span className="font-bold text-slate-900 text-sm @[600px]:text-base leading-snug break-words">
                            {adj.german}
                          </span>
                          {adj.comparative && (
                            <span className="min-w-0 max-w-full text-[11px] @[600px]:text-xs font-mono text-emerald-900 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200 leading-snug break-words">
                              {adj.comparative}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className={`align-top pt-3 ${rowPadBottom} pl-2 pr-2.5 @[600px]:pt-3.5 @[600px]:pl-3 @[600px]:pr-5 font-bold text-slate-900 text-sm @[600px]:text-base leading-snug break-words group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors`}>
                        {adj.english}
                      </td>
                    </tr>
                    {hasExample && (
                      <tr>
                        <td
                          colSpan={3}
                          className="pt-0 pb-3 px-2.5 @[600px]:pb-3.5 @[600px]:pl-[128px] @[600px]:pr-5 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors"
                        >
                          <div className="flex items-baseline gap-2 px-2.5 py-1.5 rounded-lg bg-slate-50/90 group-hover:bg-white/90 border-l-2 border-emerald-300 text-xs @[600px]:text-[13px] leading-relaxed break-words transition-colors">
                            <span className="shrink-0 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                              Ex.
                            </span>
                            <span className="min-w-0 italic text-slate-600">{adj.example}</span>
                          </div>
                        </td>
                      </tr>
                    )}
                  </tbody>
                );
              })}

            {/* Sentences */}
            {(typeFilter === 'all' || typeFilter === 'sentence') &&
              filteredSentences.map((sentence) => (
                <tbody
                  key={sentence.id}
                  onClick={() => setActionTarget({ type: 'sentence', item: sentence })}
                  className="group cursor-pointer select-none [&_tr:last-child_td]:border-b [&_tr:last-child_td]:border-slate-100 last:[&_tr:last-child_td]:border-b-0"
                >
                  <tr
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        setActionTarget({ type: 'sentence', item: sentence });
                      }
                    }}
                    className="focus-visible:outline-2 focus-visible:outline-red-500 focus-visible:-outline-offset-2"
                  >
                    <td className="align-top py-3 pl-2.5 pr-1.5 @[600px]:py-3.5 @[600px]:pl-5 @[600px]:pr-3 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors">
                      <span
                        title="Sentence"
                        aria-label="Sentence"
                        className="mt-0.5 block w-full text-center px-1 @[600px]:px-1.5 py-0.5 rounded-md text-[9px] @[600px]:text-[11px] font-bold uppercase tracking-tight @[600px]:tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200"
                      >
                        <span className="@[600px]:hidden" aria-hidden="true">Sent</span>
                        <span className="hidden @[600px]:inline">Sentence</span>
                      </span>
                    </td>
                    <td className="align-top py-3 px-2 @[600px]:py-3.5 @[600px]:px-3 group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors">
                      <div className="min-w-0 flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                        <span className="font-bold text-slate-900 text-sm @[600px]:text-base leading-snug break-words">
                          {sentence.german}
                        </span>
                        {sentence.remark && (
                          <span className="min-w-0 text-xs text-slate-500 font-normal leading-snug break-words">
                            ({sentence.remark})
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="align-top py-3 pl-2 pr-2.5 @[600px]:py-3.5 @[600px]:pl-3 @[600px]:pr-5 font-bold text-slate-900 text-sm @[600px]:text-base leading-snug break-words group-hover:bg-slate-50/80 group-active:bg-slate-100 transition-colors">
                      {sentence.english}
                    </td>
                  </tr>
                </tbody>
              ))}
          </table>
        </div>
      )}

      {/* Row Action Modal (Edit / Delete) */}
      <Modal
        isOpen={Boolean(actionTarget)}
        onClose={() => setActionTarget(null)}
        title="Manage Entry"
        maxWidth="sm"
      >
        {actionTarget && (
          <div className="space-y-4">
            <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                {actionTarget.type === 'noun' && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-red-50 text-red-700 border border-red-200">
                    Noun
                  </span>
                )}
                {actionTarget.type === 'verb' && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                    Verb
                  </span>
                )}
                {actionTarget.type === 'adjective' && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Adjective
                  </span>
                )}
                {actionTarget.type === 'sentence' && (
                  <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider bg-zinc-100 text-zinc-800 border border-zinc-200">
                    Sentence
                  </span>
                )}
              </div>
              <div className="font-bold text-slate-900 text-base">
                {actionTarget.type === 'noun' && (
                  <>
                    <span>{actionTarget.item.article} {actionTarget.item.german}</span>
                    <span className="ml-2 text-xs font-medium text-slate-500">die {actionTarget.item.plural}</span>
                  </>
                )}
                {actionTarget.type === 'verb' && (
                  <>
                    <span>{actionTarget.item.german}</span>
                    {actionTarget.item.conjugation && (
                      <span className="ml-2 text-xs font-mono text-amber-900 bg-amber-50/80 px-1.5 py-0.5 rounded border border-amber-100">
                        {actionTarget.item.conjugation}
                      </span>
                    )}
                  </>
                )}
                {actionTarget.type === 'adjective' && (
                  <>
                    <span>{actionTarget.item.german}</span>
                    {actionTarget.item.comparative && (
                      <span className="ml-2 text-xs font-mono text-emerald-900 bg-emerald-50/80 px-1.5 py-0.5 rounded border border-emerald-200">
                        {actionTarget.item.comparative}
                      </span>
                    )}
                  </>
                )}
                {actionTarget.type === 'sentence' && (
                  <>
                    <span>{actionTarget.item.german}</span>
                    {actionTarget.item.remark && (
                      <span className="ml-2 text-xs text-slate-500 font-normal">
                        ({actionTarget.item.remark})
                      </span>
                    )}
                  </>
                )}
              </div>
              <div className="font-bold text-slate-700 text-sm mt-1">
                {actionTarget.item.english}
              </div>
              {actionTarget.type !== 'sentence' && actionTarget.item.example && (
                <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-xs text-slate-600 italic leading-relaxed">
                  <span className="not-italic font-bold uppercase tracking-wider text-[10px] text-slate-400 mr-1.5">
                    Ex.
                  </span>
                  {actionTarget.item.example}
                </div>
              )}
            </div>

            <div className="flex items-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={handleActionEdit}
                className="flex-1 py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 active:bg-amber-500 text-zinc-950 font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-xs"
              >
                <Edit2 className="w-4 h-4" />
                <span>Edit</span>
              </button>

              <button
                type="button"
                onClick={handleActionDelete}
                className="flex-1 py-2.5 px-4 rounded-xl bg-red-50 hover:bg-red-100 active:bg-red-200 text-red-600 font-bold text-sm border border-red-200 flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(deleteTarget)}
        title={deleteInfo.title}
        message={deleteInfo.message}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
};
