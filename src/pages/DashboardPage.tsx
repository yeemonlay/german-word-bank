import React from 'react';
import {
  Layers,
  Sparkles,
  Tag,
  MessageSquare,
  ArrowRight,
  BookOpen,
  GraduationCap,
} from 'lucide-react';
import type { NavTab } from '../components/layouts/Navbar';
import type { VocabularyStats, Noun, Verb, Adjective, Sentence } from '../types/vocabulary';

interface DashboardPageProps {
  stats: VocabularyStats;
  onNavigate: (tab: NavTab) => void;
  recentNouns: Noun[];
  recentVerbs: Verb[];
  recentAdjectives: Adjective[];
  recentSentences: Sentence[];
}

export const DashboardPage: React.FC<DashboardPageProps> = ({
  stats,
  onNavigate,
}) => {
  return (
    <div className="space-y-8 animate-fade-in">
      {/* Welcome Banner - German Flag Themed (Schwarz - Rot - Gold) */}
      <div className="relative overflow-hidden rounded-3xl bg-linear-to-r from-zinc-950 via-zinc-900 to-neutral-900 text-white p-6 sm:p-8 shadow-2xl border border-zinc-800">
        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800/80 backdrop-blur-md border border-amber-400/30 text-xs font-bold uppercase tracking-wider text-amber-300">
            <GraduationCap className="w-4 h-4 text-amber-400" />
            <span>Personal German Vocabulary Bank</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
            Willkommen!
          </h1>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
            Ready to expand your German vocabulary?
          </h2>
          <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
            Manage your nouns with articles, verbs with forms, adjectives, and everyday useful sentences all in one place.
            Test your recall with interactive flashcards.
          </p>

          <div className="flex flex-wrap items-center gap-3 pt-2">
            <button
              onClick={() => onNavigate('quiz')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-sm transition-all shadow-md hover:shadow-lg cursor-pointer"
            >
              <Layers className="w-4 h-4 text-zinc-950" />
              Study with FlashCards
            </button>
            <button
              onClick={() => onNavigate('vocabulary')}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-bold text-sm transition-all border border-zinc-700 cursor-pointer shadow-xs"
            >
              <BookOpen className="w-4 h-4 text-amber-400" />
              View Word Bank
            </button>
          </div>
        </div>

        {/* Ambient German Flag Color Accents in the Background */}
        <div className="absolute -right-12 -bottom-12 w-80 h-80 bg-red-600/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute right-24 top-0 w-64 h-64 bg-amber-400/20 rounded-full blur-2xl pointer-events-none" />
      </div>

      {/* Stats Cards Grid - Compact Small Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
        {/* Nouns Card */}
        <div
          onClick={() => onNavigate('nouns')}
          className="group p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-red-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-red-50 text-red-600 group-hover:scale-105 transition-transform shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {stats.nounsCount}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
                German Nouns
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="truncate">der · die · das</span>
            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* Verbs Card */}
        <div
          onClick={() => onNavigate('verbs')}
          className="group p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-amber-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-amber-50 text-amber-700 group-hover:scale-105 transition-transform shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {stats.verbsCount}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
                German Verbs
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="truncate">Infinitive & forms</span>
            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-amber-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* Adjectives Card */}
        <div
          onClick={() => onNavigate('adjectives')}
          className="group p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-emerald-300 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-700 group-hover:scale-105 transition-transform shrink-0">
              <Tag className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {stats.adjectivesCount}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
                Adjectives
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="truncate">DE & EN meanings</span>
            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* Sentences Card */}
        <div
          onClick={() => onNavigate('sentences')}
          className="group p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-zinc-400 transition-all cursor-pointer flex flex-col justify-between"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-zinc-100 text-zinc-900 group-hover:scale-105 transition-transform shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {stats.sentencesCount}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
                Useful Sentences
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="truncate">Everyday phrases</span>
            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-zinc-900 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>

        {/* Total Bank Card */}
        <div
          onClick={() => onNavigate('vocabulary')}
          className="group p-3.5 sm:p-4 bg-white rounded-2xl border border-slate-200 shadow-xs hover:shadow-md hover:border-zinc-400 transition-all cursor-pointer flex flex-col justify-between col-span-2 sm:col-span-1"
        >
          <div className="flex items-center gap-2.5 sm:gap-3">
            <div className="p-2 rounded-xl bg-red-600 text-white shadow-xs group-hover:scale-105 transition-transform shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xl sm:text-2xl font-black text-slate-900 leading-none">
                {stats.totalCount}
              </div>
              <div className="text-xs font-semibold text-slate-500 mt-1 truncate">
                Total Saved
              </div>
            </div>
          </div>
          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-400 font-medium">
            <span className="truncate">Combined Bank</span>
            <ArrowRight className="w-3 h-3 text-slate-300 group-hover:text-red-600 group-hover:translate-x-0.5 transition-all shrink-0" />
          </div>
        </div>
      </div>
    </div>
  );
};
