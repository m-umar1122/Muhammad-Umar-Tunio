import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from './utils/smoothMotion';
import {
  Header,
  Footer,
  type NavRoute,
} from './components/NavbarAndFooter';
import {
  HomePage,
  NotesPage,
  PdfsPage,
  QuizPage,
  PastPapersPage,
  JobsPage,
  ContactPage,
} from './components/PublicPages';
import {
  InternalPdfViewer,
  type ViewerTarget,
} from './components/InternalPdfViewer';
import { PaidAccessModal } from './components/PaidAccessModal';
import { AdminPortal } from './components/AdminPortal';
import type {
  SiteSettings,
  NoteItem,
  StudyPdfItem,
  QuizCollection,
  PastPaperItem,
  JobListing,
  AnnouncementItem,
} from './utils/examoraLogic';

interface PublicBootstrapData {
  settings: SiteSettings;
  counts: {
    publishedNotesCount: number;
    publishedPdfsCount: number;
    publishedQuizzesCount: number;
    totalPublishedQuestionsCount: number;
    publishedPastPapersCount: number;
    publishedJobsCount: number;
    activeJobListingsCount: number;
    publishedAnnouncementsCount: number;
  };
  notes: NoteItem[];
  pdfs: StudyPdfItem[];
  quizzes: QuizCollection[];
  pastPapers: PastPaperItem[];
  jobs: JobListing[];
  announcements: AnnouncementItem[];
}

const VALID_ROUTES: NavRoute[] = [
  '/',
  '/notes',
  '/pdfs',
  '/quiz',
  '/past-papers',
  '/jobs',
  '/contact',
  '/admin',
];

function normalizeRoute(pathname: string): NavRoute {
  const clean = pathname.replace(/\/+$/, '') || '/';
  if (VALID_ROUTES.includes(clean as NavRoute)) {
    return clean as NavRoute;
  }
  return '/';
}

const ROUTE_TITLES: Record<NavRoute, string> = {
  '/': 'EXAMORA PAKISTAN — Competitive Exam Preparation Platform',
  '/notes': 'Study Notes — EXAMORA PAKISTAN',
  '/pdfs': 'PDFs & Study Material — EXAMORA PAKISTAN',
  '/quiz': 'Daily Competitive Exam Quiz — EXAMORA PAKISTAN',
  '/past-papers': 'CSS, PMS, FPSC, PPSC & NTS Past Papers — EXAMORA PAKISTAN',
  '/jobs': 'Jobs Updates & Recruitment Alerts — EXAMORA PAKISTAN',
  '/contact': 'Contact Us & Community Channels — EXAMORA PAKISTAN',
  '/admin': 'Admin Dashboard — EXAMORA PAKISTAN',
};

const DEFAULT_SETTINGS: SiteSettings = {
  academyName: 'EXAMORA PAKISTAN',
  logoUrl: '/assets/aistudio/WhatsApp_Image_2026-10-23_at_8.21.26_PM_5ce025df.jpeg',
  heroWelcomeLabel: 'WELCOME TO',
  heroTitle: 'EXAMORA PAKISTAN',
  heroDescription:
    'Your daily partner for exam preparation — notes, quizzes, past papers and job updates.',
  heroPrimaryBtnLabel: 'Explore Study Material',
  heroSecondaryBtnLabel: "Take Today's Quiz",
  aboutHeading: 'About EXAMORA PAKISTAN',
  aboutContent:
    'EXAMORA PAKISTAN helps Pakistani candidates prepare for competitive examinations through study notes, PDFs, quizzes, past papers, and job updates.',
  footerDescription:
    'Empowering CSS, PMS, FPSC, PPSC, and NTS aspirants across Pakistan.',
  emailAddress: 'support@examorapakistan.edu.pk',
  whatsappNumber: '+923001234567',
  whatsappCommunityUrl: '',
  whatsappChannelUrl: '',
  instagramUrl: '',
  facebookUrl: '',
  youtubeUrl: '',
  tiktokUrl: '',
  updatedAt: '',
};

export default function App() {
  const [currentRoute, setCurrentRoute] = useState<NavRoute>(() =>
    typeof window !== 'undefined'
      ? normalizeRoute(window.location.pathname)
      : '/'
  );
  const [publicData, setPublicData] = useState<PublicBootstrapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [viewerTarget, setViewerTarget] = useState<ViewerTarget | null>(null);
  const [paidModalItem, setPaidModalItem] = useState<{
    title: string;
    category: string;
    type: 'Paid Note' | 'Paid Study PDF' | 'Paid Past Paper';
  } | null>(null);
  const [adminToken, setAdminToken] = useState<string | null>(() => {
    try {
      return localStorage.getItem('examora_admin_token');
    } catch {
      return null;
    }
  });
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    try {
      const saved = localStorage.getItem('examora_theme');
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try {
      localStorage.setItem('examora_theme', theme);
    } catch {
      // Ignore storage errors
    }
  }, [theme]);

  const handleToggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  const handleAdminTokenChange = useCallback((newToken: string | null) => {
    setAdminToken(newToken);
    try {
      if (newToken) {
        localStorage.setItem('examora_admin_token', newToken);
      } else {
        localStorage.removeItem('examora_admin_token');
      }
    } catch {
      // Ignore storage errors
    }
  }, []);

  const fetchPublicBootstrap = useCallback(async () => {
    try {
      const res = await fetch('/api/public/bootstrap');
      if (res.ok) {
        const data = (await res.json()) as PublicBootstrapData;
        setPublicData(data);
      }
    } catch {
      // Keep existing state if offline
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPublicBootstrap();
  }, [fetchPublicBootstrap]);

  useEffect(() => {
    const onPopState = () => {
      setCurrentRoute(normalizeRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  useEffect(() => {
    document.title = ROUTE_TITLES[currentRoute] || ROUTE_TITLES['/'];
  }, [currentRoute]);

  const handleNavigate = (path: NavRoute) => {
    if (path !== currentRoute) {
      window.history.pushState({}, '', path);
      setCurrentRoute(path);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const settings = publicData?.settings || DEFAULT_SETTINGS;
  const counts = publicData?.counts || {
    publishedNotesCount: 0,
    publishedPdfsCount: 0,
    publishedQuizzesCount: 0,
    totalPublishedQuestionsCount: 0,
    publishedPastPapersCount: 0,
    publishedJobsCount: 0,
    activeJobListingsCount: 0,
    publishedAnnouncementsCount: 0,
  };

  return (
    <div
      className={`min-h-screen flex flex-col relative overflow-x-hidden transition-colors duration-500 ${
        theme === 'dark'
          ? 'bg-[#050811] text-[#F8FAFC]'
          : 'bg-[#FBF6EC] text-[#17233B]'
      }`}
    >
      {/* Professional Ambient Lighting, Glow & Blur Backdrop */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden z-0"
      >
        <div
          className={`examora-ambient-orb absolute -top-28 left-1/4 w-[480px] h-[480px] rounded-full blur-[120px] transition-opacity duration-700 ${
            theme === 'dark'
              ? 'bg-[#1D4ED8]/22 opacity-100'
              : 'bg-[#123675]/8 opacity-60'
          }`}
        />
        <div
          className={`examora-ambient-orb absolute top-16 right-8 w-[360px] h-[360px] rounded-full blur-[110px] transition-opacity duration-700 ${
            theme === 'dark'
              ? 'bg-[#EAB52F]/14 opacity-100'
              : 'bg-[#EAB52F]/12 opacity-50'
          }`}
        />
        <div
          className={`examora-ambient-orb absolute bottom-12 left-10 w-[420px] h-[420px] rounded-full blur-[130px] transition-opacity duration-700 ${
            theme === 'dark'
              ? 'bg-[#123675]/28 opacity-95'
              : 'bg-[#123675]/6 opacity-40'
          }`}
        />
      </div>

      <Header
        currentPath={currentRoute}
        onNavigate={handleNavigate}
        settings={settings}
        isAdminAuthenticated={Boolean(adminToken)}
        theme={theme}
        onToggleTheme={handleToggleTheme}
        catalog={{
          notes: publicData?.notes || [],
          pdfs: publicData?.pdfs || [],
          quizzes: publicData?.quizzes || [],
          pastPapers: publicData?.pastPapers || [],
          jobs: publicData?.jobs || [],
        }}
        onOpenFreeDocument={(target) => setViewerTarget(target)}
        onOpenPaidItem={(item) => setPaidModalItem(item)}
      />

      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 md:py-10">
        {loading && !publicData ? (
          <div className="space-y-6 animate-pulse">
            <div className="h-64 rounded-3xl bg-[#123675]/20" />
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="h-36 rounded-2xl bg-white/80" />
              <div className="h-36 rounded-2xl bg-white/80" />
              <div className="h-36 rounded-2xl bg-white/80" />
            </div>
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={currentRoute}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.26, ease: [0.22, 1, 0.36, 1] }}
            >
            {currentRoute === '/' && (
              <HomePage
                settings={settings}
                counts={counts}
                announcements={publicData?.announcements || []}
                onNavigate={handleNavigate}
              />
            )}

            {currentRoute === '/notes' && (
              <NotesPage
                notes={publicData?.notes || []}
                onOpenFreeNote={(target) => setViewerTarget(target)}
                onOpenPaidNote={(note) =>
                  setPaidModalItem({
                    title: note.title,
                    category: note.category,
                    type: 'Paid Note',
                  })
                }
              />
            )}

            {currentRoute === '/pdfs' && (
              <PdfsPage
                pdfs={publicData?.pdfs || []}
                onOpenFreePdf={(target) => setViewerTarget(target)}
                onOpenPaidPdf={(pdf) =>
                  setPaidModalItem({
                    title: pdf.title,
                    category: pdf.category,
                    type: 'Paid Study PDF',
                  })
                }
              />
            )}

            {currentRoute === '/quiz' && (
              <QuizPage quizzes={publicData?.quizzes || []} />
            )}

            {currentRoute === '/past-papers' && (
              <PastPapersPage
                pastPapers={publicData?.pastPapers || []}
                onOpenFreePaper={(target) => setViewerTarget(target)}
                onOpenPaidPaper={(paper) =>
                  setPaidModalItem({
                    title: paper.title,
                    category: `${paper.examName} (${paper.year})`,
                    type: 'Paid Past Paper',
                  })
                }
              />
            )}

            {currentRoute === '/jobs' && (
              <JobsPage jobs={publicData?.jobs || []} />
            )}

            {currentRoute === '/contact' && (
              <ContactPage settings={settings} />
            )}

            {currentRoute === '/admin' && (
              <AdminPortal
                token={adminToken}
                onTokenChange={handleAdminTokenChange}
                onPublicDataChanged={fetchPublicBootstrap}
                onPreviewDocument={(target) => setViewerTarget(target)}
              />
            )}
            </motion.div>
          </AnimatePresence>
        )}
      </main>

      <Footer settings={settings} onNavigate={handleNavigate} />

      {/* Internal PDF Viewer Modal */}
      <InternalPdfViewer
        target={viewerTarget}
        onClose={() => setViewerTarget(null)}
        adminToken={adminToken}
      />

      {/* Paid Access WhatsApp Modal */}
      <PaidAccessModal
        isOpen={Boolean(paidModalItem)}
        onClose={() => setPaidModalItem(null)}
        itemTitle={paidModalItem?.title || ''}
        itemCategory={paidModalItem?.category || ''}
        itemType={paidModalItem?.type}
        whatsappNumber={settings.whatsappNumber}
      />
    </div>
  );
}
