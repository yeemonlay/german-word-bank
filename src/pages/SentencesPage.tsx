import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, MessageSquare, BookOpen, Info } from 'lucide-react';
import type { Sentence } from '../types/vocabulary';
import { SearchBar } from '../components/common/SearchBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface SentencesPageProps {
  sentences: Sentence[];
  onAddSentence: () => void;
  onEditSentence: (sentence: Sentence) => void;
  onDeleteSentence: (id: string) => Promise<void>;
}

export const SentencesPage: React.FC<SentencesPageProps> = ({
  sentences,
  onAddSentence,
  onEditSentence,
  onDeleteSentence,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sentenceToDelete, setSentenceToDelete] = useState<Sentence | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const handleDeleteConfirm = async () => {
    if (!sentenceToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteSentence(sentenceToDelete.id);
      setSentenceToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              German Sentences
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-zinc-900 text-amber-300 border border-zinc-800">
              {sentences.length}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Collect everyday useful phrases, idioms, and sentences with context notes and remarks.
          </p>
        </div>

        <button
          onClick={onAddSentence}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Sentence
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full md:max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search sentences, remarks, translations..."
          resultCount={filteredSentences.length}
          totalCount={sentences.length}
        />
      </div>

      {/* Sentences List */}
      {filteredSentences.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredSentences.map((sentence) => (
            <div
              key={sentence.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-zinc-100 text-zinc-800 border border-zinc-200">
                    Sentence
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => onEditSentence(sentence)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Edit sentence"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setSentenceToDelete(sentence)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete sentence"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 leading-snug">
                    {sentence.german}
                  </h3>
                  <p className="text-sm text-slate-600 font-normal">{sentence.english}</p>
                </div>
              </div>

              {sentence.remark && (
                <div className="mt-4 pt-3 border-t border-slate-100 flex items-start gap-1.5 text-xs text-amber-900/90 bg-amber-50/60 p-2 rounded-lg border border-amber-100/60">
                  <Info className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                  <span className="italic font-medium">{sentence.remark}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-zinc-100 text-zinc-800 flex items-center justify-center">
            {searchQuery ? <MessageSquare className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? 'No matching sentences found' : 'No German sentences saved yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No sentences match "${searchQuery}". Check your keywords or clear search.`
              : 'Add German phrases and sentences with optional remarks for context.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-xs font-bold text-zinc-900 bg-zinc-100 hover:bg-zinc-200 rounded-xl transition-colors cursor-pointer border border-zinc-200"
            >
              Clear search
            </button>
          ) : (
            <button
              onClick={onAddSentence}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              + Add First Sentence
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(sentenceToDelete)}
        title="Delete Sentence"
        message={`Are you sure you want to delete this sentence: "${sentenceToDelete?.german}"?`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setSentenceToDelete(null)}
      />
    </div>
  );
};
