import React from 'react';
import type { Article } from '../../types/vocabulary';

interface ArticleBadgeProps {
  article: Article;
  className?: string;
}

export const ArticleBadge: React.FC<ArticleBadgeProps> = ({ article, className = '' }) => {
  const styles: Record<Article, string> = {
    der: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/40 dark:text-blue-300 dark:border-blue-700',
    die: 'bg-red-100 text-red-800 border-red-200 dark:bg-red-900/40 dark:text-red-300 dark:border-red-700',
    das: 'bg-amber-100 text-amber-900 border-amber-300 dark:bg-amber-900/40 dark:text-amber-300 dark:border-amber-700 font-bold',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider border ${styles[article]} ${className}`}
    >
      {article}
    </span>
  );
};

interface CategoryBadgeProps {
  category: 'noun' | 'verb' | 'adjective' | 'sentence';
  className?: string;
}

export const CategoryBadge: React.FC<CategoryBadgeProps> = ({ category, className = '' }) => {
  const styles = {
    noun: 'bg-red-50 text-red-800 border-red-200 font-bold',
    verb: 'bg-amber-50 text-amber-900 border-amber-200 font-bold',
    adjective: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
    sentence: 'bg-zinc-100 text-zinc-900 border-zinc-200 font-bold',
  };

  const labels = {
    noun: 'Noun',
    verb: 'Verb',
    adjective: 'Adjective',
    sentence: 'Sentence',
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-md text-xs border ${styles[category]} ${className}`}
    >
      {labels[category]}
    </span>
  );
};
