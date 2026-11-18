import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Article, Noun } from '../../types/vocabulary';

interface NounFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (noun: Omit<Noun, 'id' | 'createdAt'>) => Promise<void>;
  initialNoun?: Noun | null;
}

export const NounFormModal: React.FC<NounFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialNoun,
}) => {
  const [article, setArticle] = useState<Article>(initialNoun?.article || 'der');
  const [german, setGerman] = useState(initialNoun?.german || '');
  const [plural, setPlural] = useState(initialNoun?.plural || '');
  const [english, setEnglish] = useState(initialNoun?.english || '');
  const [example, setExample] = useState(initialNoun?.example || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!german.trim()) errs.german = 'German noun is required';
    if (!plural.trim()) errs.plural = 'Plural form is required (e.g. Äpfel, Eier)';
    if (!english.trim()) errs.english = 'English meaning is required';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        article,
        german: german.trim(),
        plural: plural.trim(),
        english: english.trim(),
        example: example.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to save noun. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialNoun ? 'Edit Noun' : 'Add New Noun'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
            {errors.submit}
          </div>
        )}

        {/* Article Selector */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
            Article / Gender <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['der', 'die', 'das'] as Article[]).map((art) => {
              const isSelected = article === art;
              return (
                <button
                  key={art}
                  type="button"
                  onClick={() => setArticle(art)}
                  className={`py-2 px-3 rounded-xl border text-sm font-bold transition-all text-center cursor-pointer ${
                    isSelected
                      ? 'bg-zinc-900 text-white border-zinc-900 shadow-xs'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {art}
                </button>
              );
            })}
          </div>
        </div>

        {/* German Noun */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            German Noun (Singular) <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-xl shadow-xs overflow-hidden border border-slate-200 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20">
            <span className="inline-flex items-center px-3 bg-slate-50 text-slate-600 text-sm font-bold border-r border-slate-200">
              {article}
            </span>
            <input
              type="text"
              value={german}
              onChange={(e) => setGerman(e.target.value)}
              placeholder="e.g. Apfel, Ei, Katze"
              className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-none"
            />
          </div>
          {errors.german && <p className="text-xs text-red-500 mt-1">{errors.german}</p>}
        </div>

        {/* Plural */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Plural Form <span className="text-red-500">*</span>
          </label>
          <div className="flex rounded-xl shadow-xs overflow-hidden border border-slate-200 focus-within:border-red-600 focus-within:ring-2 focus-within:ring-red-600/20">
            <span className="inline-flex items-center px-3 bg-slate-50 text-slate-600 text-sm font-bold border-r border-slate-200">
              die
            </span>
            <input
              type="text"
              value={plural}
              onChange={(e) => setPlural(e.target.value)}
              placeholder="e.g. Äpfel, Eier, Katzen"
              className="flex-1 px-3 py-2 text-sm text-slate-900 focus:outline-none"
            />
          </div>
          {errors.plural && <p className="text-xs text-red-500 mt-1">{errors.plural}</p>}
        </div>

        {/* English Meaning */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            English Meaning <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="e.g. Apple, Egg, Cat"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
          />
          {errors.english && <p className="text-xs text-red-500 mt-1">{errors.english}</p>}
        </div>

        {/* Example Sentence */}
        <div>
          <label
            htmlFor="noun-example"
            className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1"
          >
            German Example <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <textarea
            id="noun-example"
            rows={2}
            value={example}
            onChange={(e) => setExample(e.target.value)}
            placeholder="e.g. Der Apfel ist rot und süß."
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
          />
          <p className="text-xs text-slate-400 mt-1">
            A short, simple German sentence using this noun.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-sm font-bold text-zinc-950 bg-amber-400 hover:bg-amber-300 active:bg-amber-500 disabled:opacity-50 rounded-xl transition-colors shadow-xs cursor-pointer"
          >
            {isSubmitting ? 'Saving...' : initialNoun ? 'Update Noun' : 'Save Noun'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
