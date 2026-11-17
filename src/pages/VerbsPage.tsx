import React, { useState, useMemo } from 'react';
import { Plus, Edit2, Trash2, Sparkles, BookOpen } from 'lucide-react';
import type { Verb } from '../types/vocabulary';
import { SearchBar } from '../components/common/SearchBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface VerbsPageProps {
  verbs: Verb[];
  onAddVerb: () => void;
  onEditVerb: (verb: Verb) => void;
  onDeleteVerb: (id: string) => Promise<void>;
}

export const VerbsPage: React.FC<VerbsPageProps> = ({
  verbs,
  onAddVerb,
  onEditVerb,
  onDeleteVerb,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [verbToDelete, setVerbToDelete] = useState<Verb | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredVerbs = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return verbs;

    return verbs.filter(
      (v) =>
        v.german.toLowerCase().includes(q) ||
        v.english.toLowerCase().includes(q) ||
        (v.conjugation && v.conjugation.toLowerCase().includes(q))
    );
  }, [verbs, searchQuery]);

  const handleDeleteConfirm = async () => {
    if (!verbToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteVerb(verbToDelete.id);
      setVerbToDelete(null);
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
              German Verbs
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 border border-amber-200">
              {verbs.length}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Store German verb infinitives, English meanings, and principal conjugation forms.
          </p>
        </div>

        <button
          onClick={onAddVerb}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm transition-all shadow-xs hover:shadow-md cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          Add Verb
        </button>
      </div>

      {/* Search Bar */}
      <div className="w-full md:max-w-md">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search verbs, conjugations, meanings..."
          resultCount={filteredVerbs.length}
          totalCount={verbs.length}
        />
      </div>

      {/* Content / Verbs List */}
      {filteredVerbs.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredVerbs.map((verb) => (
            <div
              key={verb.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md hover:border-amber-300 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wide uppercase bg-amber-50 text-amber-800 border border-amber-200">
                    Verb
                  </span>
                  <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                    <button
                      onClick={() => onEditVerb(verb)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                      title="Edit verb"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setVerbToDelete(verb)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                      title="Delete verb"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="text-xl font-bold text-slate-900">{verb.german}</div>
                  {verb.conjugation ? (
                    <div className="text-xs text-amber-900 font-mono bg-amber-50/80 px-2 py-1 rounded-md inline-block border border-amber-100">
                      {verb.conjugation}
                    </div>
                  ) : (
                    <div className="text-xs text-slate-400 italic">No conjugation notes</div>
                  )}
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                <span className="text-sm font-medium text-slate-700">{verb.english}</span>
                <span className="text-xs font-semibold text-slate-400">Infinitive</span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
            {searchQuery ? <Sparkles className="w-6 h-6" /> : <BookOpen className="w-6 h-6" />}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery ? 'No matching verbs found' : 'No German verbs saved yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery
              ? `No verbs match "${searchQuery}". Check your spelling or clear search.`
              : 'Add German verbs with their English meaning and conjugations to practise them.'}
          </p>
          {searchQuery ? (
            <button
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 text-xs font-bold text-amber-800 bg-amber-50 hover:bg-amber-100 rounded-xl transition-colors cursor-pointer border border-amber-200"
            >
              Clear search
            </button>
          ) : (
            <button
              onClick={onAddVerb}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              + Add First Verb
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(verbToDelete)}
        title="Delete Verb"
        message={`Are you sure you want to delete the verb "${verbToDelete?.german}"?`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setVerbToDelete(null)}
      />
    </div>
  );
};
