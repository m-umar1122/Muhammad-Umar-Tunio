import React, { useState } from 'react';
import { motion, AnimatePresence } from '../utils/smoothMotion';
import {
  BookOpen,
  FileText,
  HelpCircle,
  ScrollText,
  Briefcase,
  ArrowRight,
  Calendar,
  Sparkles,
  Users,
  Lock,
  Eye,
  Search,
  MapPin,
  GraduationCap,
  Clock,
  ExternalLink,
  CheckCircle2,
  XCircle,
  RotateCcw,
  ChevronLeft,
  ChevronRight,
  Mail,
  MessageCircle,
  Radio,
  Instagram,
  Facebook,
  Youtube,
  Video,
  Send,
  AlertCircle,
} from 'lucide-react';
import {
  isJobExpired,
  type SiteSettings,
  type NoteItem,
  type StudyPdfItem,
  type QuizCollection,
  type PastPaperItem,
  type JobListing,
  type AnnouncementItem,
  type QuizSubmissionSummary,
} from '../utils/examoraLogic';
import type { NavRoute } from './NavbarAndFooter';
import type { ViewerTarget } from './InternalPdfViewer';

interface PlatformCounts {
  publishedNotesCount: number;
  publishedPdfsCount: number;
  publishedQuizzesCount: number;
  totalPublishedQuestionsCount: number;
  publishedPastPapersCount: number;
  publishedJobsCount: number;
  activeJobListingsCount: number;
  publishedAnnouncementsCount: number;
}

const EASE_SPRING = { type: 'spring' as const, stiffness: 380, damping: 30 };

// ============================================================================
// 1. HOME PAGE
// ============================================================================

interface HomePageProps {
  settings: SiteSettings;
  counts: PlatformCounts;
  announcements: AnnouncementItem[];
  onNavigate: (path: NavRoute) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  settings,
  counts,
  announcements,
  onNavigate,
}) => {
  const [heroLogoError, setHeroLogoError] = useState(false);

  const platforms: Array<{
    title: string;
    description: string;
    countLabel: string;
    path: NavRoute;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    {
      title: 'Notes',
      description: 'Short, exam-ready notes every day',
      countLabel: `${counts.publishedNotesCount} ${
        counts.publishedNotesCount === 1 ? 'note' : 'notes'
      }`,
      path: '/notes',
      icon: BookOpen,
    },
    {
      title: 'Quiz',
      description: 'Test yourself with daily MCQs',
      countLabel: `${counts.totalPublishedQuestionsCount} questions across ${counts.publishedQuizzesCount} quizzes`,
      path: '/quiz',
      icon: HelpCircle,
    },
    {
      title: 'PDFs & Study Material',
      description: 'Books & reference guides to read',
      countLabel: `${counts.publishedPdfsCount} ${
        counts.publishedPdfsCount === 1 ? 'PDF' : 'PDFs'
      }`,
      path: '/pdfs',
      icon: FileText,
    },
    {
      title: 'Jobs Updates',
      description: 'Latest govt & private job alerts',
      countLabel: `${counts.activeJobListingsCount} active ${
        counts.activeJobListingsCount === 1 ? 'job' : 'jobs'
      }`,
      path: '/jobs',
      icon: Briefcase,
    },
    {
      title: 'Past Papers',
      description: 'CSS, PMS, PPSC, FPSC, NTS & more',
      countLabel: `${counts.publishedPastPapersCount} ${
        counts.publishedPastPapersCount === 1 ? 'paper' : 'papers'
      }`,
      path: '/past-papers',
      icon: ScrollText,
    },
  ];

  return (
    <div className="space-y-10 sm:space-y-12">
      {/* HERO SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
        className="examora-hero-card p-6 sm:p-10 lg:p-12 text-[#FFFDFA] relative overflow-hidden"
      >
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Text & CTA Buttons */}
          <div className="lg:col-span-8 space-y-4 sm:space-y-5">
            <p className="text-xs sm:text-sm font-bold tracking-[0.14em] uppercase text-[#D5DFEE]">
              {settings.heroWelcomeLabel || 'WELCOME TO'}
            </p>
            <h1 className="font-serif-heading text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-[#FFFDFA] leading-[1.12]">
              {settings.heroTitle || 'EXAMORA PAKISTAN'}
            </h1>
            <p className="text-base sm:text-lg text-[#E4ECFA] leading-relaxed max-w-2xl">
              {settings.heroDescription ||
                'Your daily partner for exam preparation — notes, quizzes, past papers and job updates.'}
            </p>
            <div className="pt-2 flex flex-wrap items-center gap-3.5">
              <motion.button
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
                transition={EASE_SPRING}
                type="button"
                onClick={() => onNavigate('/notes')}
                className="examora-btn-gold px-6 py-3.5 rounded-full text-sm sm:text-base font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{settings.heroPrimaryBtnLabel || 'Explore Study Material'}</span>
                <ArrowRight className="w-4 h-4" />
              </motion.button>
              <motion.button
                whileHover={{ y: -2, scale: 1.015 }}
                whileTap={{ scale: 0.975 }}
                transition={EASE_SPRING}
                type="button"
                onClick={() => onNavigate('/quiz')}
                className="px-6 py-3.5 rounded-full text-sm sm:text-base font-semibold bg-white/12 hover:bg-white/20 text-[#FFFDFA] border border-white/25 transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <span>{settings.heroSecondaryBtnLabel || "Take Today's Quiz"}</span>
                <ArrowRight className="w-4 h-4 text-[#EAB52F]" />
              </motion.button>
            </div>
          </div>

          {/* Right Column: Official Academy Crest Logo */}
          <div className="lg:col-span-4 flex justify-center lg:justify-end">
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.08, ease: [0.16, 1, 0.3, 1] }}
              className="w-40 h-40 sm:w-48 sm:h-48 lg:w-56 lg:h-56 rounded-full p-1.5 bg-gradient-to-tr from-[#EAB52F] via-[#F7D774] to-[#EAB52F] shadow-[0_16px_40px_rgba(0,0,0,0.4)] shrink-0"
            >
              <div className="w-full h-full rounded-full overflow-hidden bg-[#FFFDFA] flex items-center justify-center">
                {!heroLogoError && settings.logoUrl ? (
                  <img
                    src={settings.logoUrl}
                    alt={settings.academyName || 'EXAMORA PAKISTAN'}
                    referrerPolicy="no-referrer"
                    onError={() => setHeroLogoError(true)}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-center p-4">
                    <span className="font-serif-heading text-4xl font-extrabold text-[#123675] block">
                      E
                    </span>
                    <span className="text-xs font-bold tracking-widest text-[#091D49]">
                      EXAMORA
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* ABOUT US SECTION */}
      <motion.section
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35, delay: 0.06, ease: [0.16, 1, 0.3, 1] }}
        className="examora-card p-6 sm:p-8 lg:p-10 space-y-6"
      >
        <div className="space-y-3">
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#17233B]">
            {settings.aboutHeading || 'About EXAMORA PAKISTAN'}
          </h2>
          <p className="text-sm sm:text-base text-[#687080] leading-relaxed max-w-4xl">
            {settings.aboutContent}
          </p>
        </div>

        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2"
        >
          {[
            {
              icon: Calendar,
              title: 'Updated daily',
              desc: 'Fresh exam notes, quizzes & recruitment updates',
            },
            {
              icon: Sparkles,
              title: 'Syllabus Focused',
              desc: 'Curated for CSS, PMS, FPSC, PPSC & NTS exams',
            },
            {
              icon: Users,
              title: 'For all students',
              desc: 'Accessible on Android, iOS, tablet & desktop',
            },
          ].map((feat, idx) => {
            const FeatIcon = feat.icon;
            return (
              <motion.div
                key={feat.title}
                layout
                initial={{ opacity: 0, y: 14, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 28,
                  delay: 0.08 + idx * 0.05,
                }}
                whileHover={{ y: -4, scale: 1.015 }}
                className="p-4 sm:p-5 rounded-2xl bg-[#FBF6EC] border border-[#E6E0D5] flex flex-col items-center text-center space-y-2 hover:border-[#EAB52F]/50 transition-all"
              >
                <FeatIcon className="w-6 h-6 text-[#123675]" />
                <p className="text-sm font-bold text-[#17233B]">{feat.title}</p>
                <p className="text-xs text-[#687080]">{feat.desc}</p>
              </motion.div>
            );
          })}
        </motion.div>
      </motion.section>

      {/* OUR PLATFORMS / EXPLORE GRID WITH SMOOTH STAGGERED OPTIONS */}
      <section className="space-y-5">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#17233B]">
              Our Platforms
            </h2>
            <p className="text-sm text-[#687080] mt-1">
              Dedicated preparation modules connected to live study records.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-5">
          {platforms.map((platform, idx) => {
            const Icon = platform.icon;
            return (
              <motion.button
                key={platform.path}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.3,
                  delay: idx * 0.045,
                  ease: [0.16, 1, 0.3, 1],
                }}
                whileHover={{ y: -5, scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                type="button"
                onClick={() => onNavigate(platform.path)}
                className="examora-card p-5 sm:p-6 text-left flex flex-col justify-between gap-4 cursor-pointer group"
              >
                <div className="space-y-3.5">
                  <div className="w-12 h-12 rounded-full bg-[#EBF1FA] text-[#123675] group-hover:bg-[#123675] group-hover:text-[#EAB52F] group-hover:scale-105 flex items-center justify-center transition-all duration-200">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5">
                    <h3 className="font-serif-heading text-lg sm:text-xl font-bold text-[#17233B] group-hover:text-[#123675] transition-colors">
                      {platform.title}
                    </h3>
                    <p className="text-xs sm:text-sm text-[#687080] leading-snug">
                      {platform.description}
                    </p>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs sm:text-sm font-bold text-[#123675] tabular-nums">
                  <span>{platform.countLabel}</span>
                  <ArrowRight className="w-4 h-4 opacity-70 group-hover:translate-x-1 transition-transform duration-200" />
                </div>
              </motion.button>
            );
          })}
        </div>
      </section>

      {/* LATEST UPDATES */}
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <h2 className="font-serif-heading text-2xl sm:text-3xl font-bold text-[#17233B]">
            Latest Updates
          </h2>
          <button
            type="button"
            onClick={() => onNavigate('/jobs')}
            className="text-xs sm:text-sm font-bold text-[#123675] hover:underline inline-flex items-center gap-1 cursor-pointer group"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </div>

        {announcements.length === 0 ? (
          <div className="examora-card p-8 text-center text-sm text-[#687080]">
            No announcements published yet.
          </div>
        ) : (
          <div className="examora-card divide-y divide-[#E6E0D5] overflow-hidden">
            {announcements.map((item) => {
              const isJob = item.typeBadge === 'Job';
              return (
                <motion.button
                  key={item.id}
                  whileHover={{ x: 4 }}
                  whileTap={{ scale: 0.995 }}
                  transition={EASE_SPRING}
                  type="button"
                  onClick={() =>
                    onNavigate((item.targetPage as NavRoute) || '/notes')
                  }
                  className="w-full px-5 sm:px-6 py-4 flex items-center justify-between gap-4 hover:bg-[#FBF6EC]/80 transition-colors text-left cursor-pointer"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <span
                      className={`text-xs font-bold px-3 py-1 rounded-lg shrink-0 ${
                        isJob
                          ? 'bg-[#FDF3D7] text-[#855B08]'
                          : 'bg-[#EBF1FA] text-[#123675]'
                      }`}
                    >
                      {item.typeBadge}
                    </span>
                    <span className="font-semibold text-sm sm:text-base text-[#17233B] truncate">
                      {item.title}
                    </span>
                  </div>
                  <span className="text-xs sm:text-sm text-[#687080] font-mono-num shrink-0">
                    {item.publicationDate}
                  </span>
                </motion.button>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
};

// ============================================================================
// 2. NOTES PAGE
// ============================================================================

interface NotesPageProps {
  notes: NoteItem[];
  onOpenFreeNote: (target: ViewerTarget) => void;
  onOpenPaidNote: (note: NoteItem) => void;
}

export const NotesPage: React.FC<NotesPageProps> = ({
  notes,
  onOpenFreeNote,
  onOpenPaidNote,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({});

  const categories = [
    'All',
    ...Array.from(new Set(notes.map((n) => n.category).filter(Boolean))),
  ];

  const filteredNotes = notes.filter((n) => {
    const matchesCategory =
      selectedCategory === 'All' || n.category === selectedCategory;
    const matchesSearch =
      !searchQuery.trim() ||
      n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.category.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#687080]">
            UPDATED DAILY
          </p>
          <h1 className="font-serif-heading text-3xl sm:text-4xl font-extrabold text-[#17233B]">
            Notes
          </h1>
          <p className="text-sm sm:text-base text-[#687080]">
            Quick, exam-focused notes. Tap a free note to read it in the internal viewer.
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#687080] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search notes by topic..."
            aria-label="Search notes by topic"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFDFA] border border-[#E6E0D5] text-sm text-[#17233B] focus:outline-none focus:border-[#123675]"
          />
        </div>
      </div>

      {/* Category Filter Options with Smooth Sliding Active Pill */}
      <div
        role="group"
        aria-label="Filter notes by subject"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {categories.map((cat) => {
          const active = selectedCategory === cat;
          return (
            <motion.button
              key={cat}
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.96 }}
              transition={EASE_SPRING}
              type="button"
              onClick={() => setSelectedCategory(cat)}
              className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'text-[#FFFDFA] border-[#123675]'
                  : 'bg-[#FFFDFA] text-[#17233B] border-[#E6E0D5] hover:border-[#123675]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="notes-category-active-pill"
                  transition={EASE_SPRING}
                  className="absolute inset-0 bg-[#123675] rounded-full shadow-xs -z-10"
                />
              )}
              <span>{cat}</span>
            </motion.button>
          );
        })}
      </div>

      {/* Notes Cover Card Grid */}
      {filteredNotes.length === 0 ? (
        <div className="examora-card p-10 text-center space-y-2">
          <BookOpen className="w-8 h-8 text-[#123675] mx-auto" />
          <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
            No Matching Notes Found
          </h2>
          <p className="text-sm text-[#687080]">
            Try selecting a different subject filter or clearing your search query.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredNotes.map((note, idx) => {
              const isPaid = note.accessType === 'paid';
              const hasBrokenCover = brokenCovers[note.id];

              return (
                <motion.article
                  layout
                  key={note.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.26,
                    delay: idx * 0.035,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="examora-card examora-card-interactive overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    {/* Cover Image */}
                    <div className="aspect-[3/2] w-full bg-gradient-to-br from-[#123675] to-[#091D49] relative overflow-hidden border-b border-[#E6E0D5]">
                      {!hasBrokenCover && note.coverUrl ? (
                        <img
                          src={note.coverUrl}
                          alt={note.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenCovers((prev) => ({
                              ...prev,
                              [note.id]: true,
                            }))
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full p-6 flex flex-col justify-between text-white">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#EAB52F]">
                            {note.category}
                          </span>
                          <p className="font-serif-heading text-xl font-bold leading-snug">
                            {note.title}
                          </p>
                          <span className="text-[11px] text-white/75">
                            EXAMORA PAKISTAN
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Card Details */}
                    <div className="p-5 space-y-2.5">
                      <div className="flex items-center justify-between gap-2 text-xs font-bold">
                        <span className="text-[#123675] uppercase tracking-wider">
                          {note.category}
                        </span>
                        <span
                          className={
                            isPaid
                              ? 'text-[#B45309] font-extrabold'
                              : 'text-emerald-700 font-extrabold'
                          }
                        >
                          {isPaid ? 'Paid Access' : 'Free Access'}
                        </span>
                      </div>

                      <h2 className="font-serif-heading text-lg sm:text-xl font-bold text-[#17233B] leading-snug">
                        {note.title}
                      </h2>
                    </div>
                  </div>

                  {/* Action Button */}
                  <div className="px-5 pb-5 pt-2">
                    {isPaid ? (
                      <motion.button
                        whileTap={{ scale: 0.975 }}
                        type="button"
                        onClick={() => onOpenPaidNote(note)}
                        className="w-full examora-btn-gold py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Unlock Paid Note</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.975 }}
                        type="button"
                        onClick={() =>
                          onOpenFreeNote({
                            collection: 'notes',
                            id: note.id,
                            title: note.title,
                          })
                        }
                        className="w-full examora-btn-navy py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-[#EAB52F]" />
                        <span>Read Note</span>
                      </motion.button>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// 3. PDFS & STUDY MATERIAL PAGE
// ============================================================================

interface PdfsPageProps {
  pdfs: StudyPdfItem[];
  onOpenFreePdf: (target: ViewerTarget) => void;
  onOpenPaidPdf: (pdf: StudyPdfItem) => void;
}

export const PdfsPage: React.FC<PdfsPageProps> = ({
  pdfs,
  onOpenFreePdf,
  onOpenPaidPdf,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({});

  const filteredPdfs = pdfs.filter(
    (p) =>
      !searchQuery.trim() ||
      p.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#687080]">
            READ ANYTIME
          </p>
          <h1 className="font-serif-heading text-3xl sm:text-4xl font-extrabold text-[#17233B]">
            PDFs & Study Material
          </h1>
          <p className="text-sm sm:text-base text-[#687080]">
            Comprehensive study books, subject compendiums, and examination manuals.
          </p>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-[#687080] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search study books..."
            aria-label="Search study books"
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFDFA] border border-[#E6E0D5] text-sm text-[#17233B] focus:outline-none focus:border-[#123675]"
          />
        </div>
      </div>

      {filteredPdfs.length === 0 ? (
        <div className="examora-card p-10 text-center space-y-2">
          <FileText className="w-8 h-8 text-[#123675] mx-auto" />
          <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
            No Study PDFs Available
          </h2>
          <p className="text-sm text-[#687080]">
            Try adjusting your search query or check back soon.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredPdfs.map((pdf, idx) => {
              const isPaid = pdf.accessType === 'paid';
              const hasBrokenCover = brokenCovers[pdf.id];

              return (
                <motion.article
                  layout
                  key={pdf.id}
                  initial={{ opacity: 0, y: 14, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  whileHover={{ y: -5, scale: 1.008 }}
                  transition={{
                    type: 'spring',
                    stiffness: 380,
                    damping: 30,
                    delay: idx * 0.04,
                  }}
                  className="examora-card examora-card-interactive overflow-hidden flex flex-col justify-between group"
                >
                <div>
                  <div className="aspect-[3/2] w-full bg-gradient-to-br from-[#123675] to-[#091D49] relative overflow-hidden border-b border-[#E6E0D5]">
                    {!hasBrokenCover && pdf.coverUrl ? (
                      <img
                        src={pdf.coverUrl}
                        alt={pdf.title}
                        loading="lazy"
                        referrerPolicy="no-referrer"
                        onError={() =>
                          setBrokenCovers((prev) => ({ ...prev, [pdf.id]: true }))
                        }
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full p-6 flex flex-col justify-between text-white">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#EAB52F]">
                          PDF · {pdf.category}
                        </span>
                        <p className="font-serif-heading text-xl font-bold leading-snug">
                          {pdf.title}
                        </p>
                        <span className="text-[11px] text-white/75">
                          EXAMORA PAKISTAN
                        </span>
                      </div>
                    )}
                  </div>

                  <div className="p-5 space-y-2">
                    <div className="flex items-center justify-between gap-2 text-xs font-semibold text-[#687080]">
                      <span>
                        {pdf.category} · PDF Document
                      </span>
                      <span className="font-mono-num">
                        {pdf.pageCount} {pdf.pageCount === 1 ? 'page' : 'pages'}
                      </span>
                    </div>

                    <h2 className="font-serif-heading text-lg sm:text-xl font-bold text-[#17233B] leading-snug">
                      {pdf.title}
                    </h2>
                  </div>
                </div>

                <div className="px-5 pb-5 pt-2">
                  {isPaid ? (
                    <motion.button
                      whileTap={{ scale: 0.975 }}
                      type="button"
                      onClick={() => onOpenPaidPdf(pdf)}
                      className="w-full examora-btn-gold py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Lock className="w-4 h-4" />
                      <span>Unlock Paid PDF</span>
                    </motion.button>
                  ) : (
                    <motion.button
                      whileTap={{ scale: 0.975 }}
                      type="button"
                      onClick={() =>
                        onOpenFreePdf({
                          collection: 'pdfs',
                          id: pdf.id,
                          title: pdf.title,
                        })
                      }
                      className="w-full examora-btn-navy py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <FileText className="w-4 h-4 text-[#EAB52F]" />
                      <span>View PDF</span>
                    </motion.button>
                  )}
                </div>
              </motion.article>
            );
          })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// 4. QUIZ PAGE (With Ultra-Smooth Option Selection & Question Transitions)
// ============================================================================

interface QuizPageProps {
  quizzes: QuizCollection[];
}

export const QuizPage: React.FC<QuizPageProps> = ({ quizzes }) => {
  const [selectedQuizId, setSelectedQuizId] = useState<string>(
    quizzes[0]?.id || ''
  );
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submissionSummary, setSubmissionSummary] =
    useState<QuizSubmissionSummary | null>(null);

  const activeQuiz =
    quizzes.find((q) => q.id === selectedQuizId) || quizzes[0] || null;

  const handleSelectQuiz = (quizId: string) => {
    setSelectedQuizId(quizId);
    setCurrentQuestionIndex(0);
    setSelectedAnswers({});
    setSubmissionSummary(null);
    setSubmissionError(null);
  };

  if (!activeQuiz || activeQuiz.questions.length === 0) {
    return (
      <div className="examora-card p-10 text-center space-y-3">
        <HelpCircle className="w-10 h-10 text-[#123675] mx-auto" />
        <h1 className="font-serif-heading text-2xl font-bold text-[#17233B]">
          No Active Quizzes Published
        </h1>
        <p className="text-sm text-[#687080]">
          Please check back shortly or publish a quiz from the Admin Dashboard.
        </p>
      </div>
    );
  }

  const totalQuestions = activeQuiz.questions.length;
  const answeredCount = Object.keys(selectedAnswers).filter((qId) =>
    activeQuiz.questions.some((q) => q.id === qId)
  ).length;
  const progressPercentage =
    totalQuestions > 0 ? Math.round((answeredCount / totalQuestions) * 100) : 0;

  const currentQuestion =
    activeQuiz.questions[currentQuestionIndex] || activeQuiz.questions[0];

  const handleSelectOption = (questionId: string, optionIndex: number) => {
    if (submissionSummary) return;
    setSelectedAnswers((prev) => ({
      ...prev,
      [questionId]: optionIndex,
    }));
  };

  const handleSubmitQuiz = async () => {
    if (submitting || submissionSummary) return;
    setSubmitting(true);
    setSubmissionError(null);

    try {
      const res = await fetch(`/api/public/quizzes/${activeQuiz.id}/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: selectedAnswers }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to grade quiz submission.');
      }
      setSubmissionSummary(data as QuizSubmissionSummary);
    } catch (err: unknown) {
      setSubmissionError(
        err instanceof Error ? err.message : 'Unable to submit quiz right now.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleRestartQuiz = () => {
    setSelectedAnswers({});
    setCurrentQuestionIndex(0);
    setSubmissionSummary(null);
    setSubmissionError(null);
  };

  const optionLetters = ['A', 'B', 'C', 'D'];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Quiz Selector Bar with Smooth Active Pill */}
      {quizzes.length > 1 && (
        <div
          role="group"
          aria-label="Select quiz collection"
          className="flex flex-wrap items-center gap-2"
        >
          {quizzes.map((qz) => {
            const isSelected = qz.id === activeQuiz.id;
            return (
              <motion.button
                key={qz.id}
                whileHover={{ y: -1.5 }}
                whileTap={{ scale: 0.97 }}
                transition={EASE_SPRING}
                type="button"
                onClick={() => handleSelectQuiz(qz.id)}
                className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-colors cursor-pointer ${
                  isSelected
                    ? 'text-[#FFFDFA] border-[#123675]'
                    : 'bg-[#FFFDFA] text-[#17233B] border-[#E6E0D5] hover:border-[#123675]'
                }`}
              >
                {isSelected && (
                  <motion.span
                    layoutId="quiz-collection-active-pill"
                    transition={EASE_SPRING}
                    className="absolute inset-0 bg-[#123675] rounded-full shadow-xs -z-10"
                  />
                )}
                <span>{qz.title}</span>
              </motion.button>
            );
          })}
        </div>
      )}

      {/* TOP NAVY SCORE & PROGRESS BAR CARD */}
      <div className="examora-hero-card p-5 sm:p-6 text-[#FFFDFA] space-y-3.5">
        <div className="flex items-center justify-between gap-4">
          <span className="text-sm sm:text-base font-semibold text-[#E4ECFA] tabular-nums">
            Answered {answeredCount}/{totalQuestions}
          </span>
          <span className="font-serif-heading text-xl sm:text-2xl font-extrabold text-[#FFFDFA] tabular-nums">
            Score {submissionSummary ? submissionSummary.score : 0}
          </span>
        </div>

        <div className="w-full h-2.5 bg-white/15 rounded-full overflow-hidden">
          <motion.div
            initial={false}
            animate={{ width: `${progressPercentage}%` }}
            transition={{ type: 'spring', stiffness: 260, damping: 28 }}
            className="h-full bg-[#EAB52F] rounded-full"
          />
        </div>
      </div>

      {submissionError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs sm:text-sm text-red-800 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{submissionError}</span>
        </div>
      )}

      {/* ACTIVE QUESTION CARD OR RESULTS SCREEN */}
      {!submissionSummary ? (
        <div className="examora-card p-6 sm:p-8 space-y-6 overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentQuestion.id}
              initial={{ opacity: 0, x: 14 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -14 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="space-y-6"
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-[#687080]">
                  <span>Question {currentQuestionIndex + 1}</span>
                  <span>
                    {currentQuestionIndex + 1} of {totalQuestions}
                  </span>
                </div>
                <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#17233B] leading-snug">
                  {currentQuestion.questionText}
                </h2>
              </div>

              {/* 4 Answer Options (A, B, C, D) with Smooth Staggered Spring Animations */}
              <div className="space-y-3">
                {currentQuestion.options.map((optText, idx) => {
                  const isSelected = selectedAnswers[currentQuestion.id] === idx;
                  return (
                    <motion.button
                      key={`${currentQuestion.id}-opt-${idx}`}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{
                        delay: idx * 0.04,
                        duration: 0.22,
                        ease: [0.16, 1, 0.3, 1],
                      }}
                      whileHover={{ x: 5, scale: 1.006 }}
                      whileTap={{ scale: 0.985 }}
                      type="button"
                      onClick={() => handleSelectOption(currentQuestion.id, idx)}
                      className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3.5 transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-[#EBF1FA] border-[#123675] shadow-[0_6px_18px_-4px_rgba(18,54,117,0.16)]'
                          : 'bg-[#FFFDFA] border-[#E6E0D5] hover:border-[#123675]/60 hover:bg-[#FBF6EC]/70'
                      }`}
                    >
                      <div className="flex items-center gap-3.5">
                        <motion.span
                          animate={{
                            scale: isSelected ? 1.08 : 1,
                            backgroundColor: isSelected ? '#123675' : '#FFFDFA',
                            color: isSelected ? '#FFFDFA' : '#17233B',
                            borderColor: isSelected
                              ? '#123675'
                              : 'rgba(23, 35, 59, 0.4)',
                          }}
                          transition={EASE_SPRING}
                          className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border shrink-0"
                        >
                          {optionLetters[idx]}
                        </motion.span>
                        <span
                          className={`text-sm sm:text-base transition-colors ${
                            isSelected
                              ? 'font-bold text-[#091D49]'
                              : 'font-medium text-[#17233B]'
                          }`}
                        >
                          {optText}
                        </span>
                      </div>

                      {isSelected && (
                        <motion.span
                          initial={{ scale: 0.5, opacity: 0 }}
                          animate={{ scale: 1, opacity: 1 }}
                          transition={EASE_SPRING}
                          className="text-[#123675] shrink-0"
                        >
                          <CheckCircle2 className="w-5 h-5" />
                        </motion.span>
                      )}
                    </motion.button>
                  );
                })}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Question Navigation & Submit Bar */}
          <div className="pt-4 border-t border-[#E6E0D5] flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={currentQuestionIndex === 0}
                onClick={() =>
                  setCurrentQuestionIndex((i) => Math.max(0, i - 1))
                }
                className="px-4 py-2.5 rounded-xl border border-[#E6E0D5] text-xs sm:text-sm font-bold text-[#17233B] hover:bg-[#FBF6EC] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1.5 cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous</span>
              </motion.button>
              <motion.button
                whileTap={{ scale: 0.96 }}
                type="button"
                disabled={currentQuestionIndex >= totalQuestions - 1}
                onClick={() =>
                  setCurrentQuestionIndex((i) =>
                    Math.min(totalQuestions - 1, i + 1)
                  )
                }
                className="px-4 py-2.5 rounded-xl border border-[#E6E0D5] text-xs sm:text-sm font-bold text-[#17233B] hover:bg-[#FBF6EC] disabled:opacity-40 disabled:pointer-events-none inline-flex items-center gap-1.5 cursor-pointer"
              >
                <span>Next</span>
                <ChevronRight className="w-4 h-4" />
              </motion.button>
            </div>

            <motion.button
              whileHover={{ y: -1.5, scale: 1.01 }}
              whileTap={{ scale: 0.97 }}
              type="button"
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="examora-btn-gold px-6 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
            >
              <span>{submitting ? 'Calculating Score...' : 'Submit Quiz'}</span>
              <CheckCircle2 className="w-4 h-4" />
            </motion.button>
          </div>
        </div>
      ) : (
        /* QUIZ RESULTS & ANSWER EXPLANATIONS SCREEN */
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-6"
        >
          <div className="examora-card p-6 sm:p-8 text-center space-y-4 border-2 border-[#EAB52F]">
            <p className="text-xs font-bold uppercase tracking-widest text-[#123675]">
              Quiz Completed · Official Score Report
            </p>
            <h2 className="font-serif-heading text-3xl sm:text-4xl font-extrabold text-[#17233B] tabular-nums">
              You Scored {submissionSummary.score} / {submissionSummary.totalQuestions} (
              {submissionSummary.percentage}%)
            </h2>
            <p className="text-sm text-[#687080]">
              Answered {submissionSummary.answeredCount} of{' '}
              {submissionSummary.totalQuestions} questions in{' '}
              <strong>{activeQuiz.title}</strong>.
            </p>
            <div className="pt-2">
              <motion.button
                whileTap={{ scale: 0.97 }}
                type="button"
                onClick={handleRestartQuiz}
                className="examora-btn-navy px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-4 h-4 text-[#EAB52F]" />
                <span>Restart Quiz</span>
              </motion.button>
            </div>
          </div>

          <div className="space-y-4">
            <h3 className="font-serif-heading text-xl font-bold text-[#17233B]">
              Detailed Answer Key & Explanations
            </h3>
            {submissionSummary.results.map((resItem, idx) => (
              <motion.div
                key={resItem.questionId}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: idx * 0.04, duration: 0.25 }}
                className="examora-card p-5 sm:p-6 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="font-serif-heading text-base sm:text-lg font-bold text-[#17233B]">
                    {idx + 1}. {resItem.questionText}
                  </h4>
                  {resItem.isCorrect ? (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 shrink-0">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Correct</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-bold text-red-700 shrink-0">
                      <XCircle className="w-4 h-4" />
                      <span>Incorrect</span>
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs sm:text-sm">
                  {resItem.options.map((opt, oIdx) => {
                    const isCorrectOption = oIdx === resItem.correctIndex;
                    const isUserSelected = oIdx === resItem.selectedIndex;
                    return (
                      <div
                        key={oIdx}
                        className={`p-3 rounded-xl border flex items-center gap-2.5 ${
                          isCorrectOption
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-950 font-bold'
                            : isUserSelected
                            ? 'bg-red-50 border-red-400 text-red-950 font-semibold'
                            : 'bg-[#FBF6EC]/60 border-[#E6E0D5] text-[#687080]'
                        }`}
                      >
                        <span className="font-mono-num font-bold">
                          {optionLetters[oIdx]}.
                        </span>
                        <span>{opt}</span>
                      </div>
                    );
                  })}
                </div>

                <div className="p-3.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-xs sm:text-sm text-[#17233B]">
                  <strong className="text-[#123675]">Explanation: </strong>
                  {resItem.explanation}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// 5. PAST PAPERS PAGE
// ============================================================================

interface PastPapersPageProps {
  pastPapers: PastPaperItem[];
  onOpenFreePaper: (target: ViewerTarget) => void;
  onOpenPaidPaper: (paper: PastPaperItem) => void;
}

export const PastPapersPage: React.FC<PastPapersPageProps> = ({
  pastPapers,
  onOpenFreePaper,
  onOpenPaidPaper,
}) => {
  const [selectedExam, setSelectedExam] = useState<string>('All');
  const [selectedYear, setSelectedYear] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [brokenCovers, setBrokenCovers] = useState<Record<string, boolean>>({});

  const examCategories = ['All', 'CSS', 'PMS', 'FPSC', 'PPSC', 'NTS'];
  const availableYears = [
    'All',
    ...Array.from(new Set(pastPapers.map((p) => String(p.year)))).sort(
      (a, b) => Number(b) - Number(a)
    ),
  ];

  const filteredPapers = pastPapers.filter((paper) => {
    const matchesExam =
      selectedExam === 'All' || paper.examName === selectedExam;
    const matchesYear =
      selectedYear === 'All' || String(paper.year) === selectedYear;
    const matchesSearch =
      !searchQuery.trim() ||
      paper.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.subject.toLowerCase().includes(searchQuery.toLowerCase()) ||
      paper.examName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesExam && matchesYear && matchesSearch;
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#687080]">
            EXAMINATION ARCHIVE
          </p>
          <h1 className="font-serif-heading text-3xl sm:text-4xl font-extrabold text-[#17233B]">
            Past Papers
          </h1>
          <p className="text-sm sm:text-base text-[#687080]">
            CSS, PMS, FPSC, PPSC, and NTS past examination papers organized by exam and year.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(e.target.value)}
            aria-label="Filter by examination year"
            className="px-3.5 py-2.5 rounded-xl bg-[#FFFDFA] border border-[#E6E0D5] text-sm font-semibold text-[#17233B] focus:outline-none focus:border-[#123675]"
          >
            {availableYears.map((yr) => (
              <option key={yr} value={yr}>
                {yr === 'All' ? 'All Years' : `Year ${yr}`}
              </option>
            ))}
          </select>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-[#687080] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search subject or paper..."
              aria-label="Search past papers"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-[#FFFDFA] border border-[#E6E0D5] text-sm text-[#17233B] focus:outline-none focus:border-[#123675]"
            />
          </div>
        </div>
      </div>

      {/* Examination Filter Buttons with Smooth Sliding Pill */}
      <div
        role="group"
        aria-label="Filter by examination category"
        className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1"
      >
        {examCategories.map((exam) => {
          const active = selectedExam === exam;
          return (
            <motion.button
              key={exam}
              whileHover={{ y: -1.5 }}
              whileTap={{ scale: 0.96 }}
              transition={EASE_SPRING}
              type="button"
              onClick={() => setSelectedExam(exam)}
              className={`relative px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                active
                  ? 'text-[#FFFDFA] border-[#123675]'
                  : 'bg-[#FFFDFA] text-[#17233B] border-[#E6E0D5] hover:border-[#123675]'
              }`}
            >
              {active && (
                <motion.span
                  layoutId="past-papers-exam-pill"
                  transition={EASE_SPRING}
                  className="absolute inset-0 bg-[#123675] rounded-full shadow-xs -z-10"
                />
              )}
              <span>{exam === 'All' ? 'All Examinations' : exam}</span>
            </motion.button>
          );
        })}
      </div>

      {filteredPapers.length === 0 ? (
        <div className="examora-card p-10 text-center space-y-2">
          <ScrollText className="w-8 h-8 text-[#123675] mx-auto" />
          <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
            No Past Papers Match Your Filter
          </h2>
          <p className="text-sm text-[#687080]">
            Try selecting All Examinations or All Years.
          </p>
        </div>
      ) : (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {filteredPapers.map((paper, idx) => {
              const isPaid = paper.accessType === 'paid';
              const hasBrokenCover = brokenCovers[paper.id];

              return (
                <motion.article
                  layout
                  key={paper.id}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.25,
                    delay: idx * 0.035,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="examora-card examora-card-interactive overflow-hidden flex flex-col justify-between group"
                >
                  <div>
                    <div className="aspect-[3/2] w-full bg-gradient-to-br from-[#123675] to-[#091D49] relative overflow-hidden border-b border-[#E6E0D5]">
                      {!hasBrokenCover && paper.coverUrl ? (
                        <img
                          src={paper.coverUrl}
                          alt={paper.title}
                          loading="lazy"
                          referrerPolicy="no-referrer"
                          onError={() =>
                            setBrokenCovers((prev) => ({
                              ...prev,
                              [paper.id]: true,
                            }))
                          }
                          className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full p-6 flex flex-col justify-between text-white">
                          <span className="text-xs font-bold uppercase tracking-wider text-[#EAB52F]">
                            {paper.examName} · {paper.year}
                          </span>
                          <p className="font-serif-heading text-xl font-bold leading-snug">
                            {paper.title}
                          </p>
                          <span className="text-[11px] text-white/75">
                            {paper.subject}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="p-5 space-y-2">
                      <div className="flex items-center justify-between text-xs font-bold text-[#123675]">
                        <span>
                          {paper.examName} · {paper.subject || 'General'}
                        </span>
                        <span className="font-mono-num text-[#687080]">
                          Year {paper.year}
                        </span>
                      </div>
                      <h2 className="font-serif-heading text-lg sm:text-xl font-bold text-[#17233B] leading-snug">
                        {paper.title}
                      </h2>
                    </div>
                  </div>

                  <div className="px-5 pb-5 pt-2">
                    {isPaid ? (
                      <motion.button
                        whileTap={{ scale: 0.975 }}
                        type="button"
                        onClick={() => onOpenPaidPaper(paper)}
                        className="w-full examora-btn-gold py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <Lock className="w-4 h-4" />
                        <span>Unlock Solved Paper</span>
                      </motion.button>
                    ) : (
                      <motion.button
                        whileTap={{ scale: 0.975 }}
                        type="button"
                        onClick={() =>
                          onOpenFreePaper({
                            collection: 'past-papers',
                            id: paper.id,
                            title: paper.title,
                          })
                        }
                        className="w-full examora-btn-navy py-2.5 px-4 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
                      >
                        <ScrollText className="w-4 h-4 text-[#EAB52F]" />
                        <span>View Paper</span>
                      </motion.button>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// 6. JOBS UPDATES PAGE
// ============================================================================

interface JobsPageProps {
  jobs: JobListing[];
}

export const JobsPage: React.FC<JobsPageProps> = ({ jobs }) => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <div className="space-y-1.5">
        <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#687080]">
          UPDATED DAILY
        </p>
        <h1 className="font-serif-heading text-3xl sm:text-4xl font-extrabold text-[#17233B]">
          Jobs Updates
        </h1>
        <p className="text-sm sm:text-base text-[#687080]">
          Latest government and competitive recruitment openings — apply before the last date.
        </p>
      </div>

      {jobs.length === 0 ? (
        <div className="examora-card p-10 text-center space-y-2">
          <Briefcase className="w-8 h-8 text-[#123675] mx-auto" />
          <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
            No Job Updates Published Yet
          </h2>
          <p className="text-sm text-[#687080]">
            New FPSC, PPSC, and provincial job advertisements will appear here once published.
          </p>
        </div>
      ) : (
        <motion.div layout className="space-y-5">
          {jobs.map((job, idx) => {
            const expired = isJobExpired(job.deadline);

            return (
              <motion.article
                layout
                key={job.id}
                initial={{ opacity: 0, y: 14, scale: 0.985 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                whileHover={{ y: -4, scale: 1.005 }}
                transition={{
                  type: 'spring',
                  stiffness: 380,
                  damping: 30,
                  delay: idx * 0.045,
                }}
                className="examora-card examora-card-interactive p-6 sm:p-7 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="space-y-1">
                    <p className="text-xs font-extrabold tracking-wider uppercase text-[#123675]">
                      {job.organization}
                    </p>
                    <h2 className="font-serif-heading text-xl sm:text-2xl font-bold text-[#17233B]">
                      {job.title}
                    </h2>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold font-mono-num px-3 py-1 rounded-lg bg-[#FBF6EC] border border-[#E6E0D5] text-[#17233B]">
                      Published: {job.publicationDate}
                    </span>
                    {expired && (
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-red-100 text-red-800">
                        Expired
                      </span>
                    )}
                  </div>
                </div>

                {/* Location, Qualification & Deadline Metadata */}
                <div className="space-y-1.5 text-sm text-[#687080]">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-[#123675] shrink-0" />
                    <span>{job.location}</span>
                  </div>
                  {job.qualification && (
                    <div className="flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-[#123675] shrink-0" />
                      <span>{job.qualification}</span>
                    </div>
                  )}
                  {job.deadline && (
                    <div
                      className={`flex items-center gap-2 font-semibold ${
                        expired ? 'text-red-700' : 'text-[#C2410C]'
                      }`}
                    >
                      <Clock className="w-4 h-4 shrink-0" />
                      <span className="font-mono-num">
                        Last date: {job.deadline}
                        {expired ? ' (Application Window Closed)' : ''}
                      </span>
                    </div>
                  )}
                </div>

                {job.summary && (
                  <p className="text-sm text-[#17233B] leading-relaxed">
                    {job.summary}
                  </p>
                )}

                <div className="pt-1">
                  {job.officialUrl ? (
                    <a
                      href={job.officialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 examora-btn-navy px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold"
                    >
                      <span>Official Application Portal</span>
                      <ExternalLink className="w-4 h-4 text-[#EAB52F]" />
                    </a>
                  ) : (
                    <span className="inline-block px-4 py-2 rounded-xl bg-[#F1ECE1] text-xs font-semibold text-[#687080]">
                      Official Portal Link Configurable in Admin
                    </span>
                  )}
                </div>
              </motion.article>
            );
          })}
        </motion.div>
      )}
    </div>
  );
};

// ============================================================================
// 7. CONTACT US PAGE
// ============================================================================

interface ContactPageProps {
  settings: SiteSettings;
}

export const ContactPage: React.FC<ContactPageProps> = ({ settings }) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);

  const whatsappDigits = (settings.whatsappNumber || '').replace(/[^\d]/g, '');
  const whatsappDirectUrl =
    whatsappDigits.length >= 10 ? `https://wa.me/${whatsappDigits}` : '';

  const contactChannels = [
    {
      label: 'Email Address',
      value: settings.emailAddress,
      href: settings.emailAddress ? `mailto:${settings.emailAddress}` : '',
      icon: Mail,
    },
    {
      label: 'WhatsApp Contact',
      value: settings.whatsappNumber,
      href: whatsappDirectUrl,
      icon: MessageCircle,
    },
    {
      label: 'WhatsApp Community',
      value: settings.whatsappCommunityUrl ? 'Join Aspirants Community' : '',
      href: settings.whatsappCommunityUrl,
      icon: Users,
    },
    {
      label: 'WhatsApp Channel',
      value: settings.whatsappChannelUrl ? 'Follow Daily Updates Channel' : '',
      href: settings.whatsappChannelUrl,
      icon: Radio,
    },
    {
      label: 'Instagram',
      value: settings.instagramUrl ? '@examorapakistan' : '',
      href: settings.instagramUrl,
      icon: Instagram,
    },
    {
      label: 'Facebook',
      value: settings.facebookUrl ? 'EXAMORA PAKISTAN Official' : '',
      href: settings.facebookUrl,
      icon: Facebook,
    },
    {
      label: 'YouTube',
      value: settings.youtubeUrl ? 'EXAMORA PAKISTAN Video Lectures' : '',
      href: settings.youtubeUrl,
      icon: Youtube,
    },
    {
      label: 'TikTok',
      value: settings.tiktokUrl ? 'EXAMORA Quick Revision Clips' : '',
      href: settings.tiktokUrl,
      icon: Video,
    },
  ].filter((ch) => Boolean(ch.href));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setFeedback(null);

    try {
      const res = await fetch('/api/public/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send message.');
      }
      setFeedback({
        type: 'success',
        text:
          data.message ||
          'Thank you! Your message has been recorded by EXAMORA PAKISTAN.',
      });
      setName('');
      setEmail('');
      setMessage('');
    } catch (err: unknown) {
      setFeedback({
        type: 'error',
        text:
          err instanceof Error
            ? err.message
            : 'Could not submit your message. Please try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <div className="space-y-1.5">
        <p className="text-xs font-bold tracking-[0.14em] uppercase text-[#687080]">
          GET IN TOUCH
        </p>
        <h1 className="font-serif-heading text-3xl sm:text-4xl font-extrabold text-[#17233B]">
          Contact Us
        </h1>
        <p className="text-sm sm:text-base text-[#687080]">
          Connect with EXAMORA PAKISTAN through our official communication channels or send us a direct inquiry.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Configured Social & Contact Links */}
        <div className="lg:col-span-7 space-y-4">
          <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
            Official Channels & Community Links
          </h2>

          {contactChannels.length === 0 ? (
            <div className="examora-card p-6 text-sm text-[#687080]">
              Contact channels can be configured in the Admin Dashboard under Contact & Social Links.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {contactChannels.map((channel, idx) => {
                const Icon = channel.icon;
                return (
                  <motion.a
                    key={channel.label}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      delay: idx * 0.035,
                      duration: 0.24,
                      ease: [0.16, 1, 0.3, 1],
                    }}
                    whileHover={{ y: -3, scale: 1.01 }}
                    whileTap={{ scale: 0.985 }}
                    href={channel.href}
                    target={
                      channel.href.startsWith('mailto:') ? undefined : '_blank'
                    }
                    rel={
                      channel.href.startsWith('mailto:')
                        ? undefined
                        : 'noopener noreferrer'
                    }
                    className="examora-card p-4 flex items-center gap-3.5 group"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[#EBF1FA] text-[#123675] group-hover:bg-[#123675] group-hover:text-[#EAB52F] flex items-center justify-center shrink-0 transition-colors">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-[#687080]">
                        {channel.label}
                      </p>
                      <p className="text-sm font-bold text-[#17233B] truncate">
                        {channel.value}
                      </p>
                    </div>
                  </motion.a>
                );
              })}
            </div>
          )}
        </div>

        {/* Right: Real Backend-Connected Contact Form */}
        <div className="lg:col-span-5">
          <form
            onSubmit={handleSubmit}
            className="examora-card p-6 sm:p-7 space-y-4"
          >
            <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
              Send an Academic Inquiry
            </h2>
            <p className="text-xs text-[#687080]">
              Have a question about study notes, paid PDFs, or test preparation? Send us a message directly.
            </p>

            {feedback && (
              <div
                className={`p-3.5 rounded-xl text-xs font-semibold flex items-start gap-2 ${
                  feedback.type === 'success'
                    ? 'bg-emerald-50 text-emerald-900 border border-emerald-200'
                    : 'bg-red-50 text-red-900 border border-red-200'
                }`}
              >
                {feedback.type === 'success' ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-700 shrink-0 mt-0.5" />
                )}
                <span>{feedback.text}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="contact-name"
                className="block text-xs font-bold text-[#17233B]"
              >
                Your Full Name
              </label>
              <input
                id="contact-name"
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Muhammad Ali"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm text-[#17233B] focus:outline-none focus:border-[#123675]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-email"
                className="block text-xs font-bold text-[#17233B]"
              >
                Email Address
              </label>
              <input
                id="contact-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm text-[#17233B] focus:outline-none focus:border-[#123675]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="contact-message"
                className="block text-xs font-bold text-[#17233B]"
              >
                Message
              </label>
              <textarea
                id="contact-message"
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Write your question or feedback..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm text-[#17233B] focus:outline-none focus:border-[#123675]"
              />
            </div>

            <motion.button
              whileHover={{ y: -1.5, scale: 1.01 }}
              whileTap={{ scale: 0.975 }}
              type="submit"
              disabled={submitting}
              className="w-full examora-btn-gold py-3 px-5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" />
              <span>{submitting ? 'Submitting Inquiry...' : 'Submit Message'}</span>
            </motion.button>
          </form>
        </div>
      </div>
    </div>
  );
};
