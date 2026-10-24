import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from '../utils/smoothMotion';
import {
  Home,
  BookOpen,
  FileText,
  HelpCircle,
  ScrollText,
  Briefcase,
  Mail,
  ShieldCheck,
  ArrowUp,
  MessageCircle,
  Users,
  Radio,
  Instagram,
  Facebook,
  Youtube,
  Video,
  Sun,
  Moon,
  Search,
  X,
  ArrowRight,
  Lock,
  Eye,
} from 'lucide-react';
import type {
  SiteSettings,
  NoteItem,
  StudyPdfItem,
  QuizCollection,
  PastPaperItem,
  JobListing,
} from '../utils/examoraLogic';
import type { ViewerTarget } from './InternalPdfViewer';

export type NavRoute =
  | '/'
  | '/notes'
  | '/pdfs'
  | '/quiz'
  | '/past-papers'
  | '/jobs'
  | '/contact'
  | '/admin';

export type SearchFilterType =
  | 'all'
  | 'notes'
  | 'pdfs'
  | 'quizzes'
  | 'past-papers'
  | 'jobs';

export interface SearchableCatalog {
  notes: NoteItem[];
  pdfs: StudyPdfItem[];
  quizzes: QuizCollection[];
  pastPapers: PastPaperItem[];
  jobs: JobListing[];
}

interface NavbarProps {
  currentPath: NavRoute;
  onNavigate: (path: NavRoute) => void;
  settings: SiteSettings;
  isAdminAuthenticated: boolean;
  theme?: 'dark' | 'light';
  onToggleTheme?: () => void;
  catalog?: SearchableCatalog;
  onOpenFreeDocument?: (target: ViewerTarget) => void;
  onOpenPaidItem?: (item: {
    title: string;
    category: string;
    type: 'Paid Note' | 'Paid Study PDF' | 'Paid Past Paper';
  }) => void;
}

const PRIMARY_NAV_ITEMS: Array<{
  path: NavRoute;
  label: string;
  shortLabel: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { path: '/', label: 'Home', shortLabel: 'Home', icon: Home },
  { path: '/notes', label: 'Notes', shortLabel: 'Notes', icon: BookOpen },
  { path: '/quiz', label: 'Quiz', shortLabel: 'Quiz', icon: HelpCircle },
  { path: '/pdfs', label: 'PDFs & Study Material', shortLabel: 'PDFs', icon: FileText },
  { path: '/past-papers', label: 'Past Papers', shortLabel: 'Past Papers', icon: ScrollText },
  { path: '/jobs', label: 'Jobs Updates', shortLabel: 'Jobs', icon: Briefcase },
  { path: '/contact', label: 'Contact Us', shortLabel: 'Contact', icon: Mail },
];

const SEARCH_FILTER_OPTIONS: Array<{
  id: SearchFilterType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
}> = [
  { id: 'all', label: 'All Resources', icon: Search },
  { id: 'notes', label: 'Notes', icon: BookOpen },
  { id: 'pdfs', label: 'PDFs & Books', icon: FileText },
  { id: 'quizzes', label: 'Quizzes', icon: HelpCircle },
  { id: 'past-papers', label: 'Past Papers', icon: ScrollText },
  { id: 'jobs', label: 'Jobs Updates', icon: Briefcase },
];

const QUICK_SEARCH_TOPICS = [
  '1973 Constitution',
  'Lahore Resolution',
  'CSS',
  'PMS',
  'FPSC',
  'PPSC',
  'Current Affairs',
  'General Science',
];

interface UnifiedSearchResult {
  id: string;
  type: SearchFilterType;
  typeLabel: string;
  title: string;
  subtitle: string;
  accessLabel: string;
  isPaid?: boolean;
  onSelect: () => void;
}

export const Header: React.FC<NavbarProps> = ({
  currentPath,
  onNavigate,
  settings,
  isAdminAuthenticated,
  theme = 'dark',
  onToggleTheme,
  catalog,
  onOpenFreeDocument,
  onOpenPaidItem,
}) => {
  const [logoError, setLogoError] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchFilter, setSearchFilter] = useState<SearchFilterType>('all');
  const searchInputRef = useRef<HTMLInputElement | null>(null);

  const isDark = theme === 'dark';

  const nameParts = (settings.academyName || 'EXAMORA PAKISTAN').trim().split(/\s+/);
  const firstWord = nameParts[0] || 'EXAMORA';
  const restWords = nameParts.slice(1).join(' ') || 'PAKISTAN';

  useEffect(() => {
    if (isSearchOpen) {
      const timer = setTimeout(() => {
        searchInputRef.current?.focus();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      } else if (e.key === 'Escape' && isSearchOpen) {
        setIsSearchOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSearchOpen]);

  const closeSearch = () => {
    setIsSearchOpen(false);
  };

  const searchResults = useMemo<UnifiedSearchResult[]>(() => {
    if (!catalog) return [];
    const q = searchQuery.toLowerCase().trim();
    const list: UnifiedSearchResult[] = [];

    if (searchFilter === 'all' || searchFilter === 'notes') {
      for (const note of catalog.notes) {
        if (
          !q ||
          note.title.toLowerCase().includes(q) ||
          note.category.toLowerCase().includes(q) ||
          note.summary.toLowerCase().includes(q)
        ) {
          const isPaid = note.accessType === 'paid';
          list.push({
            id: `note-${note.id}`,
            type: 'notes',
            typeLabel: 'Note',
            title: note.title,
            subtitle: `${note.category} · Study Note`,
            accessLabel: isPaid ? 'Paid Access' : 'Free Access',
            isPaid,
            onSelect: () => {
              closeSearch();
              if (isPaid) {
                onOpenPaidItem?.({
                  title: note.title,
                  category: note.category,
                  type: 'Paid Note',
                });
              } else {
                onOpenFreeDocument?.({
                  collection: 'notes',
                  id: note.id,
                  title: note.title,
                });
              }
            },
          });
        }
      }
    }

    if (searchFilter === 'all' || searchFilter === 'pdfs') {
      for (const pdf of catalog.pdfs) {
        if (
          !q ||
          pdf.title.toLowerCase().includes(q) ||
          pdf.category.toLowerCase().includes(q)
        ) {
          const isPaid = pdf.accessType === 'paid';
          list.push({
            id: `pdf-${pdf.id}`,
            type: 'pdfs',
            typeLabel: 'Study PDF',
            title: pdf.title,
            subtitle: `${pdf.category} · ${pdf.pageCount} pages`,
            accessLabel: isPaid ? 'Paid PDF' : 'Free PDF',
            isPaid,
            onSelect: () => {
              closeSearch();
              if (isPaid) {
                onOpenPaidItem?.({
                  title: pdf.title,
                  category: pdf.category,
                  type: 'Paid Study PDF',
                });
              } else {
                onOpenFreeDocument?.({
                  collection: 'pdfs',
                  id: pdf.id,
                  title: pdf.title,
                });
              }
            },
          });
        }
      }
    }

    if (searchFilter === 'all' || searchFilter === 'quizzes') {
      for (const quiz of catalog.quizzes) {
        if (
          !q ||
          quiz.title.toLowerCase().includes(q) ||
          quiz.category.toLowerCase().includes(q)
        ) {
          list.push({
            id: `quiz-${quiz.id}`,
            type: 'quizzes',
            typeLabel: 'Quiz',
            title: quiz.title,
            subtitle: `${quiz.category} · ${quiz.questions.length} MCQs`,
            accessLabel: 'Interactive Quiz',
            onSelect: () => {
              closeSearch();
              onNavigate('/quiz');
            },
          });
        }
      }
    }

    if (searchFilter === 'all' || searchFilter === 'past-papers') {
      for (const paper of catalog.pastPapers) {
        if (
          !q ||
          paper.title.toLowerCase().includes(q) ||
          paper.examName.toLowerCase().includes(q) ||
          paper.subject.toLowerCase().includes(q) ||
          String(paper.year).includes(q)
        ) {
          const isPaid = paper.accessType === 'paid';
          list.push({
            id: `paper-${paper.id}`,
            type: 'past-papers',
            typeLabel: 'Past Paper',
            title: paper.title,
            subtitle: `${paper.examName} (${paper.year}) · ${paper.subject}`,
            accessLabel: isPaid ? 'Paid Solved' : 'Free Paper',
            isPaid,
            onSelect: () => {
              closeSearch();
              if (isPaid) {
                onOpenPaidItem?.({
                  title: paper.title,
                  category: `${paper.examName} (${paper.year})`,
                  type: 'Paid Past Paper',
                });
              } else {
                onOpenFreeDocument?.({
                  collection: 'past-papers',
                  id: paper.id,
                  title: paper.title,
                });
              }
            },
          });
        }
      }
    }

    if (searchFilter === 'all' || searchFilter === 'jobs') {
      for (const job of catalog.jobs) {
        if (
          !q ||
          job.title.toLowerCase().includes(q) ||
          job.organization.toLowerCase().includes(q) ||
          job.location.toLowerCase().includes(q) ||
          job.qualification.toLowerCase().includes(q)
        ) {
          list.push({
            id: `job-${job.id}`,
            type: 'jobs',
            typeLabel: 'Job Alert',
            title: job.title,
            subtitle: `${job.organization} · ${job.location}`,
            accessLabel: job.deadline ? `Due ${job.deadline}` : 'Active',
            onSelect: () => {
              closeSearch();
              onNavigate('/jobs');
            },
          });
        }
      }
    }

    return list.slice(0, 12);
  }, [
    catalog,
    searchQuery,
    searchFilter,
    onNavigate,
    onOpenFreeDocument,
    onOpenPaidItem,
  ]);

  return (
    <header className="sticky top-0 z-40 bg-[#FFFDFA]/95 backdrop-blur-xl border-b border-[#E6E0D5] shadow-[0_4px_24px_rgba(9,29,73,0.08)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Row: Brand Lockup + Desktop Nav + Animated Search Icon-to-Bar + Theme + Admin */}
        <div className="flex items-center justify-between gap-3 py-2.5 md:py-3.5">
          <a
            href="/"
            onClick={(e) => {
              e.preventDefault();
              onNavigate('/');
            }}
            className="flex items-center gap-3 group focus:outline-none shrink-0"
          >
            <div className="w-10 h-10 md:w-11 md:h-11 rounded-full overflow-hidden border-2 border-[#EAB52F] bg-[#091D49] flex items-center justify-center shadow-sm shrink-0 group-hover:scale-105 transition-transform duration-200">
              {!logoError && settings.logoUrl ? (
                <img
                  src={settings.logoUrl}
                  alt=""
                  referrerPolicy="no-referrer"
                  onError={() => setLogoError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <span className="font-serif-heading font-extrabold text-lg text-[#EAB52F]">
                  E
                </span>
              )}
            </div>
            <span className="font-serif-heading font-extrabold text-lg sm:text-xl md:text-2xl tracking-tight whitespace-nowrap">
              <span className="text-[#123675]">{firstWord}</span>{' '}
              <span className="text-[#EAB52F]">{restWords}</span>
            </span>
          </a>

          {/* Desktop Horizontal Navigation with Smooth Sliding Active Pill */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-1"
          >
            {PRIMARY_NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = currentPath === item.path;
              return (
                <a
                  key={item.path}
                  href={item.path}
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate(item.path);
                  }}
                  aria-current={isActive ? 'page' : undefined}
                  className={`relative flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                    isActive
                      ? 'text-[#FFFDFA]'
                      : 'text-[#17233B] hover:bg-[#FBF6EC] hover:text-[#123675]'
                  }`}
                >
                  {isActive && (
                    <motion.span
                      layoutId="desktop-nav-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 bg-[#123675] rounded-xl shadow-sm -z-10"
                    />
                  )}
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.shortLabel}</span>
                </a>
              );
            })}
          </nav>

          {/* Top-Corner Controls: Icon-to-Bar Search Trigger + Theme Switcher + Admin */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Animated Search Icon-to-Bar Button */}
            <motion.button
              type="button"
              layout
              whileHover={{ y: -1.5, scale: 1.03 }}
              whileTap={{ scale: 0.94 }}
              onClick={() => setIsSearchOpen((prev) => !prev)}
              aria-label={isSearchOpen ? 'Close Search Bar' : 'Open Search Bar'}
              aria-expanded={isSearchOpen}
              className={`relative flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-xs md:text-sm font-bold border backdrop-blur-xl cursor-pointer overflow-hidden transition-all ${
                isSearchOpen
                  ? 'bg-[#123675] text-[#FFFDFA] border-[#EAB52F] shadow-[0_0_26px_-2px_rgba(234,181,47,0.5)]'
                  : isDark
                  ? 'bg-[#0B1326]/90 text-[#F8FAFC] border-[#3B82F6]/40 shadow-[0_0_20px_-4px_rgba(59,130,246,0.35)]'
                  : 'bg-[#FFFDFA]/90 text-[#091D49] border-[#123675]/25 shadow-[0_6px_18px_-4px_rgba(18,54,117,0.18)]'
              }`}
            >
              <span
                aria-hidden="true"
                className={`absolute -inset-1 rounded-xl blur-md transition-opacity duration-300 pointer-events-none ${
                  isSearchOpen
                    ? 'bg-gradient-to-r from-[#EAB52F]/35 via-[#3B82F6]/30 to-[#EAB52F]/35 opacity-100'
                    : 'bg-gradient-to-r from-[#3B82F6]/20 via-[#EAB52F]/20 to-[#3B82F6]/20 opacity-85'
                }`}
              />
              <motion.span
                key={isSearchOpen ? 'close-icon' : 'search-icon'}
                initial={{ opacity: 0, rotate: -45, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                className="relative z-10 flex items-center justify-center w-5 h-5 rounded-lg bg-[#EAB52F]/20 text-[#EAB52F]"
              >
                {isSearchOpen ? (
                  <X className="w-3.5 h-3.5 text-[#EAB52F]" />
                ) : (
                  <Search className="w-3.5 h-3.5 text-[#EAB52F]" />
                )}
              </motion.span>
              <span className="relative z-10 tracking-tight hidden sm:inline">
                {isSearchOpen ? 'Close Search' : 'Search'}
              </span>
            </motion.button>

            {/* Black / Light Theme Toggle Button */}
            {onToggleTheme && (
              <motion.button
                type="button"
                whileHover={{ y: -1.5, scale: 1.03 }}
                whileTap={{ scale: 0.94 }}
                onClick={onToggleTheme}
                aria-label={
                  isDark ? 'Switch to Light Theme' : 'Switch to Black Theme'
                }
                title={
                  isDark ? 'Switch to Light Theme' : 'Switch to Black Theme'
                }
                className={`relative flex items-center gap-2 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-xs md:text-sm font-bold border backdrop-blur-xl cursor-pointer overflow-hidden ${
                  isDark
                    ? 'bg-[#0B1326]/90 text-[#F8FAFC] border-[#EAB52F]/45 shadow-[0_0_22px_-3px_rgba(234,181,47,0.35)]'
                    : 'bg-[#FFFDFA]/90 text-[#091D49] border-[#123675]/25 shadow-[0_6px_18px_-4px_rgba(18,54,117,0.2)]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`absolute -inset-1 rounded-xl blur-md transition-opacity duration-300 pointer-events-none ${
                    isDark
                      ? 'bg-gradient-to-r from-[#EAB52F]/25 via-[#3B82F6]/20 to-[#EAB52F]/25 opacity-100'
                      : 'bg-gradient-to-r from-[#123675]/10 via-[#EAB52F]/20 to-[#123675]/10 opacity-80'
                  }`}
                />
                <motion.span
                  key={theme}
                  initial={{ opacity: 0, rotate: -35, scale: 0.75 }}
                  animate={{ opacity: 1, rotate: 0, scale: 1 }}
                  transition={{ type: 'spring', stiffness: 420, damping: 26 }}
                  className="relative z-10 flex items-center justify-center w-5 h-5 rounded-lg bg-[#EAB52F]/20 text-[#EAB52F]"
                >
                  {isDark ? (
                    <Moon className="w-3.5 h-3.5 text-[#EAB52F]" />
                  ) : (
                    <Sun className="w-3.5 h-3.5 text-[#B45309]" />
                  )}
                </motion.span>
                <span className="relative z-10 tracking-tight">
                  {isDark ? 'Black' : 'Light'}
                </span>
              </motion.button>
            )}

            <a
              href="/admin"
              onClick={(e) => {
                e.preventDefault();
                onNavigate('/admin');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 md:px-3.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold border transition-all whitespace-nowrap shrink-0 ${
                currentPath === '/admin'
                  ? 'bg-[#091D49] text-[#EAB52F] border-[#EAB52F]/50'
                  : 'bg-[#FBF6EC] text-[#123675] border-[#E6E0D5] hover:border-[#123675] hover:-translate-y-0.5'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-[#EAB52F] shrink-0" />
              <span>{isAdminAuthenticated ? 'Admin Panel' : 'Admin'}</span>
            </a>
          </div>
        </div>

        {/* Mobile & Tablet Touch-Friendly Horizontal Navigation Bar */}
        <nav
          aria-label="Mobile Navigation"
          className="flex lg:hidden items-center gap-1.5 overflow-x-auto no-scrollbar pb-2.5 pt-0.5 -mx-1 px-1"
        >
          {PRIMARY_NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = currentPath === item.path;
            return (
              <a
                key={item.path}
                href={item.path}
                onClick={(e) => {
                  e.preventDefault();
                  onNavigate(item.path);
                }}
                aria-current={isActive ? 'page' : undefined}
                className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap shrink-0 ${
                  isActive
                    ? 'text-[#FFFDFA]'
                    : 'text-[#687080] hover:text-[#17233B] hover:bg-[#FBF6EC]'
                }`}
              >
                {isActive && (
                  <motion.span
                    layoutId="mobile-nav-active-pill"
                    transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                    className="absolute inset-0 bg-[#123675] rounded-full shadow-sm -z-10"
                  />
                )}
                <Icon className="w-3.5 h-3.5 shrink-0" />
                <span>{item.shortLabel}</span>
              </a>
            );
          })}
        </nav>

        {/* TOP-DOWN ILLUMINATED SEARCH BAR & OPTIONS DRAWER (ICON-TO-BAR EXPANSION) */}
        <AnimatePresence>
          {isSearchOpen && (
            <motion.div
              key="top-down-search-drawer"
              initial={{ opacity: 0, y: -16, scale: 0.98, filter: 'blur(8px)' }}
              animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
              exit={{ opacity: 0, y: -12, scale: 0.98, filter: 'blur(6px)' }}
              transition={{ type: 'spring', stiffness: 400, damping: 30 }}
              className="pb-4 pt-1"
            >
              <div
                className={`relative rounded-3xl p-4 sm:p-6 border backdrop-blur-2xl overflow-hidden ${
                  isDark
                    ? 'bg-[#080E1E]/95 border-[#EAB52F]/40 shadow-[0_24px_60px_-10px_rgba(0,0,0,0.9),0_0_40px_-6px_rgba(234,181,47,0.25),0_0_28px_-4px_rgba(59,130,246,0.3)]'
                    : 'bg-[#FFFDFA]/98 border-[#123675]/25 shadow-[0_24px_50px_-12px_rgba(9,29,73,0.22),0_0_32px_-6px_rgba(234,181,47,0.28)]'
                }`}
              >
                {/* Ambient Spotlight Glow Orbs inside Top-Down Search Panel */}
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -top-20 left-1/3 w-72 h-72 rounded-full bg-[#EAB52F]/20 blur-3xl"
                />
                <div
                  aria-hidden="true"
                  className="pointer-events-none absolute -bottom-20 right-1/4 w-72 h-72 rounded-full bg-[#3B82F6]/20 blur-3xl"
                />

                <div className="relative z-10 space-y-4">
                  {/* Illuminated Search Input Row */}
                  <div className="relative flex items-center">
                    <Search className="w-5 h-5 text-[#EAB52F] absolute left-4 pointer-events-none" />
                    <input
                      ref={searchInputRef}
                      type="search"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search study notes, PDFs, daily quizzes, past papers, or job updates..."
                      aria-label="Global Search Input"
                      className="w-full pl-12 pr-24 py-3.5 rounded-2xl bg-[#FBF6EC] border border-[#EAB52F]/40 text-sm sm:text-base font-semibold text-[#17233B] shadow-[0_0_24px_-6px_rgba(234,181,47,0.25)] focus:outline-none focus:border-[#EAB52F]"
                    />
                    <div className="absolute right-3 flex items-center gap-1.5">
                      {searchQuery && (
                        <button
                          type="button"
                          onClick={() => setSearchQuery('')}
                          className="px-2.5 py-1 rounded-lg bg-[#123675]/15 hover:bg-[#123675]/25 text-xs font-bold text-[#17233B] cursor-pointer"
                        >
                          Clear
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={closeSearch}
                        aria-label="Close Search Panel"
                        className="p-1.5 rounded-xl bg-[#123675] text-[#EAB52F] hover:opacity-90 cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Search Category Filter Options with Sliding Pill */}
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div
                      role="group"
                      aria-label="Search Module Filters"
                      className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5"
                    >
                      {SEARCH_FILTER_OPTIONS.map((opt) => {
                        const Icon = opt.icon;
                        const active = searchFilter === opt.id;
                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            whileHover={{ y: -1 }}
                            whileTap={{ scale: 0.96 }}
                            onClick={() => setSearchFilter(opt.id)}
                            className={`relative flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold border transition-colors whitespace-nowrap cursor-pointer ${
                              active
                                ? 'text-[#FFFDFA] border-[#EAB52F]/60 shadow-[0_0_16px_-3px_rgba(234,181,47,0.4)]'
                                : 'bg-[#FBF6EC] text-[#17233B] border-[#E6E0D5] hover:border-[#EAB52F]/50'
                            }`}
                          >
                            {active && (
                              <motion.span
                                layoutId="top-search-category-pill"
                                transition={{
                                  type: 'spring',
                                  stiffness: 420,
                                  damping: 30,
                                }}
                                className="absolute inset-0 bg-[#123675] rounded-full -z-10"
                              />
                            )}
                            <Icon
                              className={`w-3.5 h-3.5 shrink-0 ${
                                active ? 'text-[#EAB52F]' : 'text-[#123675]'
                              }`}
                            />
                            <span>{opt.label}</span>
                          </motion.button>
                        );
                      })}
                    </div>

                    {/* Quick Topic Options */}
                    <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                      <span className="text-[11px] font-bold uppercase tracking-wider text-[#687080] mr-1 shrink-0">
                        Quick Topics:
                      </span>
                      {QUICK_SEARCH_TOPICS.map((topic) => (
                        <button
                          key={topic}
                          type="button"
                          onClick={() => setSearchQuery(topic)}
                          className={`px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all whitespace-nowrap cursor-pointer ${
                            searchQuery.toLowerCase() === topic.toLowerCase()
                              ? 'bg-[#EAB52F] text-[#091D49] border-[#EAB52F] font-bold shadow-[0_0_14px_rgba(234,181,47,0.45)]'
                              : 'bg-[#FBF6EC] text-[#687080] hover:text-[#17233B] border-[#E6E0D5] hover:border-[#EAB52F]/50'
                          }`}
                        >
                          {topic}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Live Search Results Grid */}
                  <div className="max-h-[340px] overflow-y-auto pr-1 space-y-2">
                    {searchResults.length === 0 ? (
                      <div className="py-8 text-center space-y-1.5">
                        <p className="text-sm font-bold text-[#17233B]">
                          No matching study resources found for &ldquo;{searchQuery}&rdquo;
                        </p>
                        <p className="text-xs text-[#687080]">
                          Try selecting &ldquo;All Resources&rdquo; or tapping one of the Quick Topics above.
                        </p>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {searchResults.map((item, idx) => (
                          <motion.button
                            key={item.id}
                            type="button"
                            initial={{ opacity: 0, y: 8 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{
                              type: 'spring',
                              stiffness: 380,
                              damping: 28,
                              delay: idx * 0.025,
                            }}
                            whileHover={{ y: -2, scale: 1.006 }}
                            whileTap={{ scale: 0.985 }}
                            onClick={item.onSelect}
                            className="p-3.5 rounded-2xl bg-[#FBF6EC] border border-[#E6E0D5] hover:border-[#EAB52F]/60 text-left flex items-center justify-between gap-3 group cursor-pointer transition-all"
                          >
                            <div className="min-w-0 space-y-0.5">
                              <div className="flex items-center gap-2 text-[11px] font-bold">
                                <span className="text-[#123675] uppercase tracking-wider">
                                  {item.typeLabel}
                                </span>
                                <span aria-hidden="true" className="text-[#687080]">
                                  ·
                                </span>
                                <span
                                  className={
                                    item.isPaid
                                      ? 'text-[#B45309]'
                                      : 'text-emerald-600'
                                  }
                                >
                                  {item.accessLabel}
                                </span>
                              </div>
                              <p className="font-serif-heading text-sm font-bold text-[#17233B] truncate group-hover:text-[#EAB52F] transition-colors">
                                {item.title}
                              </p>
                              <p className="text-xs text-[#687080] truncate">
                                {item.subtitle}
                              </p>
                            </div>
                            <span className="w-8 h-8 rounded-xl bg-[#123675]/12 group-hover:bg-[#EAB52F] text-[#123675] group-hover:text-[#091D49] flex items-center justify-center shrink-0 transition-colors">
                              {item.isPaid ? (
                                <Lock className="w-4 h-4" />
                              ) : item.type === 'notes' ||
                                item.type === 'pdfs' ||
                                item.type === 'past-papers' ? (
                                <Eye className="w-4 h-4" />
                              ) : (
                                <ArrowRight className="w-4 h-4" />
                              )}
                            </span>
                          </motion.button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
};

interface FooterProps {
  settings: SiteSettings;
  onNavigate: (path: NavRoute) => void;
}

export const Footer: React.FC<FooterProps> = ({ settings, onNavigate }) => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const whatsappDigits = (settings.whatsappNumber || '').replace(/[^\d]/g, '');
  const whatsappHref =
    whatsappDigits.length >= 10 ? `https://wa.me/${whatsappDigits}` : '';

  return (
    <footer className="bg-[#091D49] text-[#FFFDFA] border-t-4 border-[#EAB52F] mt-16 relative overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-10 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 pb-10 border-b border-white/15">
          {/* Column 1: Brand Identity & Mission */}
          <div className="md:col-span-5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-[#EAB52F] bg-[#123675] flex items-center justify-center shrink-0">
                {settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt=""
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-serif-heading font-bold text-[#EAB52F]">
                    E
                  </span>
                )}
              </div>
              <span className="font-serif-heading font-extrabold text-xl tracking-tight">
                <span className="text-[#FFFDFA]">EXAMORA</span>{' '}
                <span className="text-[#EAB52F]">PAKISTAN</span>
              </span>
            </div>
            <p className="text-sm text-[#D5DFEE] leading-relaxed max-w-md">
              {settings.footerDescription ||
                'Empowering CSS, PMS, FPSC, PPSC, and NTS aspirants across Pakistan with structured notes, full-length PDFs, daily quizzes, past papers, and verified job updates.'}
            </p>
          </div>

          {/* Column 2: Quick Navigation */}
          <div className="md:col-span-4 space-y-3">
            <h3 className="font-serif-heading text-base font-bold text-[#EAB52F] tracking-wide">
              Quick Navigation
            </h3>
            <ul className="grid grid-cols-2 gap-2 text-sm text-[#D5DFEE]">
              {PRIMARY_NAV_ITEMS.map((item) => (
                <li key={item.path}>
                  <a
                    href={item.path}
                    onClick={(e) => {
                      e.preventDefault();
                      onNavigate(item.path);
                    }}
                    className="hover:text-[#EAB52F] transition-colors inline-flex items-center gap-1.5"
                  >
                    <span>{item.label}</span>
                  </a>
                </li>
              ))}
              <li>
                <a
                  href="/admin"
                  onClick={(e) => {
                    e.preventDefault();
                    onNavigate('/admin');
                  }}
                  className="hover:text-[#EAB52F] transition-colors inline-flex items-center gap-1.5"
                >
                  <span>Admin Dashboard</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Column 3: Official Contact & Social Channels */}
          <div className="md:col-span-3 space-y-3">
            <h3 className="font-serif-heading text-base font-bold text-[#EAB52F] tracking-wide">
              Connect With Us
            </h3>
            <div className="space-y-2 text-sm text-[#D5DFEE]">
              {settings.emailAddress && (
                <a
                  href={`mailto:${settings.emailAddress}`}
                  className="flex items-center gap-2 hover:text-[#EAB52F] transition-colors break-all"
                >
                  <Mail className="w-4 h-4 text-[#EAB52F] shrink-0" />
                  <span>{settings.emailAddress}</span>
                </a>
              )}
              {whatsappHref && (
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 hover:text-[#EAB52F] transition-colors"
                >
                  <MessageCircle className="w-4 h-4 text-[#EAB52F] shrink-0" />
                  <span>WhatsApp: {settings.whatsappNumber}</span>
                </a>
              )}
            </div>

            {/* Social Icons Row */}
            <div className="flex flex-wrap items-center gap-2 pt-2">
              {settings.whatsappCommunityUrl && (
                <a
                  href={settings.whatsappCommunityUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Community"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#EAB52F] hover:text-[#091D49] flex items-center justify-center transition-colors"
                >
                  <Users className="w-4 h-4" />
                </a>
              )}
              {settings.whatsappChannelUrl && (
                <a
                  href={settings.whatsappChannelUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="WhatsApp Channel"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#EAB52F] hover:text-[#091D49] flex items-center justify-center transition-colors"
                >
                  <Radio className="w-4 h-4" />
                </a>
              )}
              {settings.instagramUrl && (
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#EAB52F] hover:text-[#091D49] flex items-center justify-center transition-colors"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {settings.facebookUrl && (
                <a
                  href={settings.facebookUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#EAB52F] hover:text-[#091D49] flex items-center justify-center transition-colors"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {settings.youtubeUrl && (
                <a
                  href={settings.youtubeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#EAB52F] hover:text-[#091D49] flex items-center justify-center transition-colors"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {settings.tiktokUrl && (
                <a
                  href={settings.tiktokUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="TikTok"
                  className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#EAB52F] hover:text-[#091D49] flex items-center justify-center transition-colors"
                >
                  <Video className="w-4 h-4" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom Copyright & Back to Top */}
        <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#B3C3DC]">
          <p>
            © {new Date().getFullYear()} {settings.academyName || 'EXAMORA PAKISTAN'}. All rights reserved.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-[#EAB52F] hover:text-[#091D49] font-semibold text-white transition-colors cursor-pointer"
          >
            <span>Back to top</span>
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </footer>
  );
};
