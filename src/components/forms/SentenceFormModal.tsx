import React, { useState } from 'react';
import { Modal } from '../common/Modal';
import type { Sentence } from '../../types/vocabulary';

interface SentenceFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (sentence: Omit<Sentence, 'id' | 'createdAt'>) => Promise<void>;
  initialSentence?: Sentence | null;
}

export const SentenceFormModal: React.FC<SentenceFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialSentence,
}) => {
  const [german, setGerman] = useState(initialSentence?.german || '');
  const [english, setEnglish] = useState(initialSentence?.english || '');
  const [remark, setRemark] = useState(initialSentence?.remark || '');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!german.trim()) errs.german = 'German sentence is required';
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
        german: german.trim(),
        english: english.trim(),
        remark: remark.trim() || undefined,
      });
      onClose();
    } catch (err) {
      console.error(err);
      setErrors({ submit: 'Failed to save sentence. Please try again.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={initialSentence ? 'Edit Sentence' : 'Add New Sentence'}
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {errors.submit && (
          <div className="p-3 text-xs bg-red-50 text-red-600 rounded-lg border border-red-200">
            {errors.submit}
          </div>
        )}

        {/* German Sentence */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            German Sentence <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={german}
            onChange={(e) => setGerman(e.target.value)}
            placeholder="e.g. Guten Morgen! / Wie geht es Ihnen?"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
          />
          {errors.german && <p className="text-xs text-red-500 mt-1">{errors.german}</p>}
        </div>

        {/* English Meaning */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            English Translation <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={2}
            value={english}
            onChange={(e) => setEnglish(e.target.value)}
            placeholder="e.g. Good morning! / How are you?"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
          />
          {errors.english && <p className="text-xs text-red-500 mt-1">{errors.english}</p>}
        </div>

        {/* Remark */}
        <div>
          <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1">
            Remark / Context <span className="text-slate-400 font-normal">(Optional)</span>
          </label>
          <input
            type="text"
            value={remark}
            onChange={(e) => setRemark(e.target.value)}
            placeholder="e.g. Used before 10 AM, formal greeting, restaurant situation"
            className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm text-slate-900 shadow-xs focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-600"
          />
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
            {isSubmitting ? 'Saving...' : initialSentence ? 'Update Sentence' : 'Save Sentence'}
          </button>
        </div>
      </form>
    </Modal>
  );
};
