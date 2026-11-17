import React, { useState, useMemo } from 'react';
import { Edit2, Trash2, Layers, BookOpen } from 'lucide-react';
import type { Noun, Article } from '../types/vocabulary';
import { SearchBar } from '../components/common/SearchBar';
import { ConfirmDialog } from '../components/common/ConfirmDialog';

interface NounsPageProps {
  nouns: Noun[];
  onAddNoun: () => void;
  onEditNoun: (noun: Noun) => void;
  onDeleteNoun: (id: string) => Promise<void>;
}

export const NounsPage: React.FC<NounsPageProps> = ({
  nouns,
  onAddNoun,
  onEditNoun,
  onDeleteNoun,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [articleFilter, setArticleFilter] = useState<'all' | Article>('all');
  const [nounToDelete, setNounToDelete] = useState<Noun | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Filtered nouns based on search and article
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
        n.article.toLowerCase().includes(q)
      );
    });
  }, [nouns, searchQuery, articleFilter]);

  const handleDeleteConfirm = async () => {
    if (!nounToDelete) return;
    setIsDeleting(true);
    try {
      await onDeleteNoun(nounToDelete.id);
      setNounToDelete(null);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              German Nouns
            </h1>
            <span className="text-xs font-extrabold px-2.5 py-0.5 rounded-full bg-red-100 text-red-800 border border-red-200">
              {nouns.length}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Learn German nouns with their grammatical gender (der, die, das) and plural forms.
          </p>
        </div>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="w-full md:max-w-md">
          <SearchBar
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search nouns, plurals, translations..."
            resultCount={filteredNouns.length}
            totalCount={nouns.length}
          />
        </div>

        {/* Article Filter Tabs */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-xl self-start md:self-auto border border-slate-200">
          {(['all', 'der', 'die', 'das'] as const).map((filter) => {
            const isActive = articleFilter === filter;
            return (
              <button
                key={filter}
                onClick={() => setArticleFilter(filter)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                  isActive
                    ? 'bg-zinc-900 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {filter === 'all' ? 'All Articles' : filter}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content / Nouns List */}
      {filteredNouns.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredNouns.map((noun) => (
            <div
              key={noun.id}
              className="bg-white rounded-xl border border-slate-200 p-3.5 sm:p-4 shadow-xs hover:shadow-md hover:border-red-200 transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs font-semibold text-slate-400">{noun.article}</span>
                      <span className="text-base font-bold text-slate-900">{noun.german}</span>
                      <span className="text-xs text-slate-500 font-medium">die {noun.plural}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={() => onEditNoun(noun)}
                      className="p-1.5 rounded-lg text-amber-600 bg-amber-50/80 hover:bg-amber-100 transition-colors cursor-pointer"
                      title="Edit noun"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setNounToDelete(noun)}
                      className="p-1.5 rounded-lg text-red-500 bg-red-50/80 hover:bg-red-100 transition-colors cursor-pointer"
                      title="Delete noun"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between">
                <span className="text-xs sm:text-sm font-medium text-slate-700 truncate">{noun.english}</span>
                <span className="text-[10px] uppercase font-bold text-red-600 tracking-wider shrink-0">
                  Noun
                </span>
              </div>
            </div>
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-16 px-4 bg-white rounded-3xl border border-dashed border-slate-200">
          <div className="w-12 h-12 mx-auto mb-3 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center">
            {searchQuery || articleFilter !== 'all' ? (
              <Layers className="w-6 h-6" />
            ) : (
              <BookOpen className="w-6 h-6" />
            )}
          </div>
          <h3 className="text-base font-bold text-slate-800">
            {searchQuery || articleFilter !== 'all'
              ? 'No matching nouns found'
              : 'No German nouns saved yet'}
          </h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchQuery || articleFilter !== 'all'
              ? `No nouns match your current search "${searchQuery}" or filter. Try clearing filters.`
              : 'Start building your German vocabulary by adding your first noun with its article and plural.'}
          </p>
          {searchQuery || articleFilter !== 'all' ? (
            <button
              onClick={() => {
                setSearchQuery('');
                setArticleFilter('all');
              }}
              className="px-4 py-2 text-xs font-bold text-red-700 bg-red-50 hover:bg-red-100 rounded-xl transition-colors cursor-pointer border border-red-200"
            >
              Clear filters
            </button>
          ) : (
            <button
              onClick={onAddNoun}
              className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors cursor-pointer shadow-xs"
            >
              + Add First Noun
            </button>
          )}
        </div>
      )}

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={Boolean(nounToDelete)}
        title="Delete Noun"
        message={`Are you sure you want to delete "${nounToDelete?.article} ${nounToDelete?.german}"? This action cannot be undone.`}
        confirmLabel={isDeleting ? 'Deleting...' : 'Delete'}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setNounToDelete(null)}
      />
    </div>
  );
};
