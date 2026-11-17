import React, { useState, useEffect } from 'react';
import logoUrl from '../../assets/logo.png';
import {
  LayoutDashboard,
  BookOpen,
  Layers,
  Menu,
  X,
} from 'lucide-react';

export type NavTab = 'dashboard' | 'vocabulary' | 'quiz' | 'nouns' | 'verbs' | 'adjectives' | 'sentences';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  stats?: {
    nounsCount: number;
    verbsCount: number;
    adjectivesCount: number;
    sentencesCount: number;
    totalCount: number;
  };
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  stats,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 15);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isVocabularyActive = ['vocabulary', 'nouns', 'verbs', 'adjectives', 'sentences'].includes(activeTab);

  const navItems: {
    id: NavTab;
    label: string;
    icon: React.FC<{ className?: string }>;
    count?: number;
    isActive: boolean;
  }[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, isActive: activeTab === 'dashboard' },
    {
      id: 'vocabulary',
      label: 'Word Bank',
      icon: BookOpen,
      count: stats?.totalCount,
      isActive: isVocabularyActive,
    },
    { id: 'quiz', label: 'FlashCard', icon: Layers, isActive: activeTab === 'quiz' },
  ];

  const handleNavClick = (tab: NavTab) => {
    onSelectTab(tab);
    setMobileMenuOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 transition-all duration-200 shadow-2xs">
      {/* German Flag Tricolor Strip (Schwarz - Rot - Gold) - Slimmer on scroll */}
      <div className={`w-full flex transition-all duration-200 ${isScrolled ? 'h-0.5' : 'h-1'}`}>
        <div className="flex-1 bg-zinc-950" title="Schwarz" />
        <div className="flex-1 bg-red-600" title="Rot" />
        <div className="flex-1 bg-amber-400" title="Gold" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className={`flex items-center justify-between transition-all duration-200 ${isScrolled ? 'h-11 sm:h-12' : 'h-13 sm:h-14'}`}>
          {/* Logo with German flag emblem gradient */}
          <div
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group"
            onClick={() => handleNavClick('dashboard')}
          >
            <div className={`rounded-lg bg-linear-to-tr from-zinc-950 via-red-600 to-amber-400 p-0.5 shadow-xs group-hover:scale-105 transition-all duration-200 ${
              isScrolled ? 'w-7 h-7 sm:w-8 sm:h-8' : 'w-8 h-8 sm:w-9 sm:h-9'
            }`}>
              <div className="w-full h-full bg-white rounded-[7px] overflow-hidden flex items-center justify-center p-0.5">
                <img src={logoUrl} alt="German Word Bank logo" className="w-full h-full object-contain" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-bold text-slate-900 tracking-tight transition-all duration-200 ${
                  isScrolled ? 'text-sm sm:text-base' : 'text-base sm:text-lg'
                }`}>
                  German Word Bank
                </span>
                <span className="text-[9px] sm:text-[10px] uppercase font-extrabold tracking-wider px-1.5 py-0.5 rounded bg-zinc-900 text-amber-300 border border-zinc-800">
                  A1
                </span>
              </div>
              {!isScrolled && (
                <p className="text-[11px] text-slate-500 hidden sm:block leading-none mt-0.5">
                  Learn & Practise Vocabulary
                </p>
              )}
            </div>
          </div>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center h-full gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.isActive;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id)}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs sm:text-sm font-medium transition-colors cursor-pointer ${
                    isActive
                      ? 'text-red-600 font-bold'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                  {typeof item.count === 'number' && (
                    <span
                      className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-bold ${
                        isActive
                          ? 'bg-red-50 text-red-700'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                  {/* Active bottom bar only */}
                  {isActive && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-red-600 rounded-t-full" />
                  )}
                </button>
              );
            })}
          </nav>

          {/* Mobile menu trigger */}
          <div className="flex items-center md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-4 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.isActive;
            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`relative w-full flex items-center justify-between px-3.5 py-2.5 text-sm font-medium transition-colors cursor-pointer ${
                  isActive
                    ? 'text-red-600 font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-red-600' : 'text-slate-400'}`} />
                  <span>{item.label}</span>
                </div>
                {typeof item.count === 'number' && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                      isActive ? 'bg-red-50 text-red-700 font-bold' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.count}
                  </span>
                )}
                {/* Active bar only (left vertical bar on mobile) */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-red-600 rounded-r-full" />
                )}
              </button>
            );
          })}
        </div>
      )}
    </header>
  );
};
