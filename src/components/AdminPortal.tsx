import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from '../utils/smoothMotion';
import {
  ShieldCheck,
  LayoutDashboard,
  Settings,
  BookOpen,
  FileText,
  HelpCircle,
  ScrollText,
  Briefcase,
  Bell,
  Share2,
  LogOut,
  Plus,
  Trash2,
  Edit3,
  Eye,
  CheckCircle2,
  AlertCircle,
  Upload,
  Lock,
  Save,
} from 'lucide-react';
import type {
  SiteSettings,
  NoteItem,
  StudyPdfItem,
  QuizCollection,
  QuizQuestion,
  PastPaperItem,
  JobListing,
  AnnouncementItem,
  ContactSubmission,
  AccessType,
} from '../utils/examoraLogic';
import type { ViewerTarget } from './InternalPdfViewer';

type AdminTab =
  | 'overview'
  | 'settings'
  | 'notes'
  | 'pdfs'
  | 'quizzes'
  | 'past-papers'
  | 'jobs'
  | 'announcements'
  | 'contact';

interface AdminPortalProps {
  token: string | null;
  onTokenChange: (newToken: string | null) => void;
  onPublicDataChanged: () => void;
  onPreviewDocument: (target: ViewerTarget) => void;
}

interface AdminBootstrapPayload {
  settings: SiteSettings;
  notes: NoteItem[];
  pdfs: StudyPdfItem[];
  quizzes: QuizCollection[];
  pastPapers: PastPaperItem[];
  jobs: JobListing[];
  announcements: AnnouncementItem[];
  contactSubmissions: ContactSubmission[];
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
}

function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read uploaded file.'));
    reader.readAsDataURL(file);
  });
}

export const AdminPortal: React.FC<AdminPortalProps> = ({
  token,
  onTokenChange,
  onPublicDataChanged,
  onPreviewDocument,
}) => {
  const [authInitialized, setAuthInitialized] = useState<boolean | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authLoading, setAuthLoading] = useState(false);

  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [adminData, setAdminData] = useState<AdminBootstrapPayload | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [statusBanner, setStatusBanner] = useState<{
    type: 'success' | 'error';
    text: string;
  } | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Form states for Note Upload/Edit
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [noteTitle, setNoteTitle] = useState('');
  const [noteCategory, setNoteCategory] = useState('Pakistan Studies');
  const [noteAccessType, setNoteAccessType] = useState<AccessType>('free');
  const [notePublished, setNotePublished] = useState(true);
  const [noteSummary, setNoteSummary] = useState('');
  const [noteBodyText, setNoteBodyText] = useState('');
  const [noteCoverUrl, setNoteCoverUrl] = useState('');
  const [notePdfBase64, setNotePdfBase64] = useState<string | undefined>(undefined);

  // Form states for Study PDF Upload/Edit
  const [editingPdfId, setEditingPdfId] = useState<string | null>(null);
  const [pdfTitle, setPdfTitle] = useState('');
  const [pdfCategory, setPdfCategory] = useState('CSS / PMS');
  const [pdfPageCount, setPdfPageCount] = useState(10);
  const [pdfAccessType, setPdfAccessType] = useState<AccessType>('free');
  const [pdfPublished, setPdfPublished] = useState(true);
  const [pdfBodyText, setPdfBodyText] = useState('');
  const [pdfCoverUrl, setPdfCoverUrl] = useState('');
  const [pdfUploadedBase64, setPdfUploadedBase64] = useState<string | undefined>(
    undefined
  );

  // Form states for Quiz Management
  const [selectedAdminQuizId, setSelectedAdminQuizId] = useState<string>('');
  const [newQuizTitle, setNewQuizTitle] = useState('');
  const [newQuizCategory, setNewQuizCategory] = useState('General Knowledge');
  const [newQuizInstructions, setNewQuizInstructions] = useState(
    'Select the single best answer for each question.'
  );
  const [qText, setQText] = useState('');
  const [qOptA, setQOptA] = useState('');
  const [qOptB, setQOptB] = useState('');
  const [qOptC, setQOptC] = useState('');
  const [qOptD, setQOptD] = useState('');
  const [qCorrectIdx, setQCorrectIdx] = useState<number>(0);
  const [qExplanation, setQExplanation] = useState('');

  // Form states for Past Papers
  const [editingPaperId, setEditingPaperId] = useState<string | null>(null);
  const [paperTitle, setPaperTitle] = useState('');
  const [paperExamName, setPaperExamName] =
    useState<PastPaperItem['examName']>('CSS');
  const [paperYear, setPaperYear] = useState<number>(2025);
  const [paperSubject, setPaperSubject] = useState('');
  const [paperAccessType, setPaperAccessType] = useState<AccessType>('free');
  const [paperPublished, setPaperPublished] = useState(true);
  const [paperCoverUrl, setPaperCoverUrl] = useState('');
  const [paperBodyText, setPaperBodyText] = useState('');
  const [paperPdfBase64, setPaperPdfBase64] = useState<string | undefined>(
    undefined
  );

  // Form states for Jobs Updates
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [jobOrg, setJobOrg] = useState('PUNJAB PUBLIC SERVICE COMMISSION');
  const [jobLocation, setJobLocation] = useState('Punjab');
  const [jobQualification, setJobQualification] = useState("Master's / BS (16 years)");
  const [jobPubDate, setJobPubDate] = useState('2026-10-23');
  const [jobDeadline, setJobDeadline] = useState('2026-11-30');
  const [jobSummary, setJobSummary] = useState('');
  const [jobOfficialUrl, setJobOfficialUrl] = useState('');
  const [jobPublished, setJobPublished] = useState(true);

  // Form states for Announcements
  const [annBadge, setAnnBadge] = useState<AnnouncementItem['typeBadge']>('Note');
  const [annTitle, setAnnTitle] = useState('');
  const [annDate, setAnnDate] = useState('23 Oct 2026');
  const [annTarget, setAnnTarget] = useState('/notes');
  const [annPublished, setAnnPublished] = useState(true);

  // Form state for Site Settings
  const [settingsForm, setSettingsForm] = useState<SiteSettings | null>(null);

  const showMessage = (type: 'success' | 'error', text: string) => {
    setStatusBanner({ type, text });
    setTimeout(() => {
      setStatusBanner((prev) => (prev?.text === text ? null : prev));
    }, 4500);
  };

  // Check server auth initialization status
  useEffect(() => {
    async function checkAuthStatus() {
      try {
        const headers: Record<string, string> = {};
        if (token) headers.Authorization = `Bearer ${token}`;
        const res = await fetch('/api/auth/status', { headers });
        const data = await res.json();
        setAuthInitialized(Boolean(data.initialized));
        if (token && !data.authenticated) {
          onTokenChange(null);
        }
      } catch {
        setAuthInitialized(false);
      }
    }
    checkAuthStatus();
  }, [token, onTokenChange]);

  const fetchAdminData = useCallback(async () => {
    if (!token) return;
    setLoadingData(true);
    try {
      const res = await fetch('/api/admin/bootstrap', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 401) {
        onTokenChange(null);
        return;
      }
      const data = (await res.json()) as AdminBootstrapPayload;
      setAdminData(data);
      setSettingsForm(data.settings);
      if (!selectedAdminQuizId && data.quizzes.length > 0) {
        setSelectedAdminQuizId(data.quizzes[0].id);
      }
    } catch {
      showMessage('error', 'Failed to load administrative records.');
    } finally {
      setLoadingData(false);
    }
  }, [token, onTokenChange, selectedAdminQuizId]);

  useEffect(() => {
    if (token) {
      fetchAdminData();
    }
  }, [token, fetchAdminData]);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError(null);

    const endpoint = authInitialized
      ? '/api/auth/login'
      : '/api/auth/setup-initial-admin';

    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Authentication failed.');
      }
      setAuthInitialized(true);
      onTokenChange(data.token);
      setPassword('');
    } catch (err: unknown) {
      setAuthError(
        err instanceof Error ? err.message : 'Unable to authenticate.'
      );
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    if (token) {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
      }).catch(() => {});
    }
    onTokenChange(null);
    setAdminData(null);
  };

  const handleResetAdminCredentials = async () => {
    setAuthLoading(true);
    setAuthError(null);
    try {
      const res = await fetch('/api/auth/reset-admin', { method: 'POST' });
      if (res.ok) {
        setAuthInitialized(false);
        setEmail('');
        setPassword('');
        onTokenChange(null);
      }
    } catch {
      setAuthError('Failed to reset administrator credentials.');
    } finally {
      setAuthLoading(false);
    }
  };

  // ============================================================================
  // RENDER LOGIN / ONE-TIME INITIAL SETUP SCREEN WHEN NOT AUTHENTICATED
  // ============================================================================
  if (!token) {
    return (
      <div className="max-w-md mx-auto my-8">
        <div className="examora-card overflow-hidden border-2 border-[#123675]">
          <div className="bg-gradient-to-r from-[#123675] to-[#091D49] p-6 text-[#FFFDFA] space-y-2">
            <div className="flex items-center gap-2.5 text-[#EAB52F]">
              <ShieldCheck className="w-6 h-6" />
              <span className="text-xs font-bold uppercase tracking-widest">
                EXAMORA PAKISTAN Security
              </span>
            </div>
            <h1 className="font-serif-heading text-2xl font-extrabold">
              {authInitialized === false
                ? 'Set New Admin Email & Password'
                : 'Administrator Sign In'}
            </h1>
            <p className="text-xs text-[#D5DFEE] leading-relaxed">
              {authInitialized === false
                ? 'Enter your new administrator email and create a password (at least 6 characters) to access the EXAMORA PAKISTAN Admin Dashboard.'
                : 'Sign in with your authorized administrator credentials to manage notes, PDFs, quizzes, past papers, and site settings.'}
            </p>
          </div>

          <form onSubmit={handleAuthSubmit} className="p-6 space-y-4 bg-[#FFFDFA]">
            {authError && (
              <div className="p-3.5 rounded-xl bg-red-500/15 border border-red-500/40 text-xs font-semibold text-red-400 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{authError}</span>
              </div>
            )}

            <div className="space-y-1.5">
              <label
                htmlFor="admin-email"
                className="block text-xs font-bold text-[#17233B]"
              >
                {authInitialized === false
                  ? 'New Administrator Email'
                  : 'Administrator Email'}
              </label>
              <input
                id="admin-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm text-[#17233B] focus:outline-none focus:border-[#123675]"
              />
            </div>

            <div className="space-y-1.5">
              <label
                htmlFor="admin-password"
                className="block text-xs font-bold text-[#17233B]"
              >
                {authInitialized === false
                  ? 'New Password (min 6 characters)'
                  : 'Password'}
              </label>
              <input
                id="admin-password"
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm text-[#17233B] focus:outline-none focus:border-[#123675]"
              />
            </div>

            <button
              type="submit"
              disabled={authLoading}
              className="w-full examora-btn-gold py-3 px-5 rounded-xl text-sm font-bold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>
                {authLoading
                  ? 'Verifying...'
                  : authInitialized === false
                  ? 'Save New Email & Password & Enter Dashboard'
                  : 'Sign In to Admin Dashboard'}
              </span>
            </button>

            {authInitialized !== false && (
              <div className="pt-2 border-t border-[#E6E0D5] text-center">
                <button
                  type="button"
                  onClick={handleResetAdminCredentials}
                  className="text-xs font-bold text-[#EAB52F] hover:underline cursor-pointer"
                >
                  Reset Email & Password for a New Email Account
                </button>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  // ============================================================================
  // ADMIN CRUD HANDLERS
  // ============================================================================

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!settingsForm) return;
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(settingsForm),
      });
      if (!res.ok) throw new Error('Failed to save settings.');
      await fetchAdminData();
      onPublicDataChanged();
      showMessage('success', 'Website & Contact settings saved and published.');
    } catch {
      showMessage('error', 'Could not save settings.');
    }
  };

  const handleSaveNote = async (e: React.FormEvent, publishStatus: boolean) => {
    e.preventDefault();
    if (!noteTitle.trim()) {
      showMessage('error', 'Please enter a Note title.');
      return;
    }
    try {
      const url = editingNoteId
        ? `/api/admin/notes/${editingNoteId}`
        : '/api/admin/notes';
      const method = editingNoteId ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: noteTitle,
          category: noteCategory,
          accessType: noteAccessType,
          published: publishStatus,
          summary: noteSummary,
          bodyText: noteBodyText,
          coverUrl: noteCoverUrl,
          uploadedPdfBase64: notePdfBase64,
        }),
      });
      if (!res.ok) throw new Error('Failed to save note.');
      setEditingNoteId(null);
      setNoteTitle('');
      setNoteSummary('');
      setNoteBodyText('');
      setNoteCoverUrl('');
      setNotePdfBase64(undefined);
      await fetchAdminData();
      onPublicDataChanged();
      showMessage(
        'success',
        publishStatus ? 'Note published to website!' : 'Note saved as draft.'
      );
    } catch {
      showMessage('error', 'Failed to save note.');
    }
  };

  const handleToggleNotePublish = async (note: NoteItem) => {
    await fetch(`/api/admin/notes/${note.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ published: !note.published }),
    });
    await fetchAdminData();
    onPublicDataChanged();
    showMessage(
      'success',
      `Note "${note.title}" is now ${!note.published ? 'Published' : 'Unpublished'}.`
    );
  };

  const handleToggleNoteAccess = async (note: NoteItem) => {
    const nextAccess: AccessType = note.accessType === 'free' ? 'paid' : 'free';
    await fetch(`/api/admin/notes/${note.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ accessType: nextAccess }),
    });
    await fetchAdminData();
    onPublicDataChanged();
    showMessage(
      'success',
      `Updated "${note.title}" access type to ${nextAccess.toUpperCase()}.`
    );
  };

  const handleDeleteRecord = async (
    collection:
      | 'notes'
      | 'pdfs'
      | 'quizzes'
      | 'past-papers'
      | 'jobs'
      | 'announcements',
    id: string
  ) => {
    await fetch(`/api/admin/${collection}/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    });
    setConfirmDeleteId(null);
    await fetchAdminData();
    onPublicDataChanged();
    showMessage('success', 'Record permanently deleted.');
  };

  const handleSavePdf = async (e: React.FormEvent, publishStatus: boolean) => {
    e.preventDefault();
    if (!pdfTitle.trim()) return;
    const url = editingPdfId
      ? `/api/admin/pdfs/${editingPdfId}`
      : '/api/admin/pdfs';
    const method = editingPdfId ? 'PUT' : 'POST';
    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: pdfTitle,
        category: pdfCategory,
        pageCount: pdfPageCount,
        accessType: pdfAccessType,
        published: publishStatus,
        bodyText: pdfBodyText,
        coverUrl: pdfCoverUrl,
        uploadedPdfBase64: pdfUploadedBase64,
      }),
    });
    setEditingPdfId(null);
    setPdfTitle('');
    setPdfBodyText('');
    setPdfCoverUrl('');
    setPdfUploadedBase64(undefined);
    await fetchAdminData();
    onPublicDataChanged();
    showMessage('success', 'Study PDF saved successfully.');
  };

  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newQuizTitle.trim()) return;
    const res = await fetch('/api/admin/quizzes', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: newQuizTitle,
        category: newQuizCategory,
        instructions: newQuizInstructions,
        published: true,
        questions: [],
      }),
    });
    if (res.ok) {
      const created = (await res.json()) as QuizCollection;
      setNewQuizTitle('');
      await fetchAdminData();
      setSelectedAdminQuizId(created.id);
      onPublicDataChanged();
      showMessage('success', 'New quiz created. Add questions below.');
    }
  };

  const handleAddQuestionToQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!adminData) return;
    const targetQuiz = adminData.quizzes.find(
      (q) => q.id === selectedAdminQuizId
    );
    if (!targetQuiz || !qText.trim()) return;

    const newQ: QuizQuestion = {
      id: `q-${Date.now()}`,
      questionText: qText.trim(),
      options: [
        qOptA.trim() || 'Option A',
        qOptB.trim() || 'Option B',
        qOptC.trim() || 'Option C',
        qOptD.trim() || 'Option D',
      ],
      correctIndex: qCorrectIdx,
      explanation: qExplanation.trim() || 'Verified answer key.',
    };

    const updatedQuestions = [...targetQuiz.questions, newQ];
    await fetch(`/api/admin/quizzes/${targetQuiz.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questions: updatedQuestions }),
    });

    setQText('');
    setQOptA('');
    setQOptB('');
    setQOptC('');
    setQOptD('');
    setQExplanation('');
    await fetchAdminData();
    onPublicDataChanged();
    showMessage('success', 'Question added to quiz.');
  };

  const handleDeleteQuizQuestion = async (
    quiz: QuizCollection,
    questionId: string
  ) => {
    const updatedQuestions = quiz.questions.filter((q) => q.id !== questionId);
    await fetch(`/api/admin/quizzes/${quiz.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ questions: updatedQuestions }),
    });
    await fetchAdminData();
    onPublicDataChanged();
    showMessage('success', 'Question removed from quiz.');
  };

  const handleSavePastPaper = async (
    e: React.FormEvent,
    publishStatus: boolean
  ) => {
    e.preventDefault();
    if (!paperTitle.trim()) return;
    const url = editingPaperId
      ? `/api/admin/past-papers/${editingPaperId}`
      : '/api/admin/past-papers';
    const method = editingPaperId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: paperTitle,
        examName: paperExamName,
        year: paperYear,
        subject: paperSubject,
        accessType: paperAccessType,
        published: publishStatus,
        coverUrl: paperCoverUrl,
        bodyText: paperBodyText,
        uploadedPdfBase64: paperPdfBase64,
      }),
    });

    setEditingPaperId(null);
    setPaperTitle('');
    setPaperSubject('');
    setPaperBodyText('');
    setPaperCoverUrl('');
    setPaperPdfBase64(undefined);
    await fetchAdminData();
    onPublicDataChanged();
    showMessage('success', 'Past paper record saved.');
  };

  const handleSaveJob = async (e: React.FormEvent, publishStatus: boolean) => {
    e.preventDefault();
    if (!jobTitle.trim()) return;
    const url = editingJobId
      ? `/api/admin/jobs/${editingJobId}`
      : '/api/admin/jobs';
    const method = editingJobId ? 'PUT' : 'POST';

    await fetch(url, {
      method,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        title: jobTitle,
        organization: jobOrg,
        location: jobLocation,
        qualification: jobQualification,
        publicationDate: jobPubDate,
        deadline: jobDeadline,
        summary: jobSummary,
        officialUrl: jobOfficialUrl,
        published: publishStatus,
      }),
    });

    setEditingJobId(null);
    setJobTitle('');
    setJobSummary('');
    setJobOfficialUrl('');
    await fetchAdminData();
    onPublicDataChanged();
    showMessage('success', 'Job listing saved.');
  };

  const handleCreateAnnouncement = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!annTitle.trim()) return;
    await fetch('/api/admin/announcements', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        typeBadge: annBadge,
        title: annTitle,
        publicationDate: annDate,
        targetPage: annTarget,
        published: annPublished,
      }),
    });
    setAnnTitle('');
    await fetchAdminData();
    onPublicDataChanged();
    showMessage('success', 'Announcement published to Home page.');
  };

  const sidebarItems: Array<{
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { id: 'overview', label: '1. Overview', icon: LayoutDashboard },
    { id: 'settings', label: '2. Website Settings', icon: Settings },
    { id: 'notes', label: '3. Notes Library', icon: BookOpen },
    { id: 'pdfs', label: '4. PDFs & Study Material', icon: FileText },
    { id: 'quizzes', label: '5. Quiz Management', icon: HelpCircle },
    { id: 'past-papers', label: '6. Past Papers', icon: ScrollText },
    { id: 'jobs', label: '7. Jobs Updates', icon: Briefcase },
    { id: 'announcements', label: '8. Announcements', icon: Bell },
    { id: 'contact', label: '9. Contact & Social Links', icon: Share2 },
  ];

  const activeAdminQuiz =
    adminData?.quizzes.find((q) => q.id === selectedAdminQuizId) ||
    adminData?.quizzes[0] ||
    null;

  return (
    <div className="space-y-6">
      {/* Top Admin Header Banner */}
      <div className="examora-hero-card p-5 sm:p-6 text-[#FFFDFA] flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-[#EAB52F] text-xs font-bold uppercase tracking-wider">
            <ShieldCheck className="w-4 h-4" />
            <span>Authenticated Administrator Console</span>
          </div>
          <h1 className="font-serif-heading text-2xl sm:text-3xl font-extrabold">
            EXAMORA PAKISTAN Admin Dashboard
          </h1>
        </div>
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={handleResetAdminCredentials}
            className="px-4 py-2.5 rounded-xl bg-[#EAB52F]/20 hover:bg-[#EAB52F] text-[#EAB52F] hover:text-[#091D49] border border-[#EAB52F]/40 text-xs sm:text-sm font-bold transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Reset Email & Password</span>
          </button>
          <button
            type="button"
            onClick={handleLogout}
            className="px-4 py-2.5 rounded-xl bg-white/15 hover:bg-red-600 text-xs sm:text-sm font-bold text-white transition-colors inline-flex items-center gap-2 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>

      {statusBanner && (
        <div
          className={`p-4 rounded-xl text-sm font-semibold flex items-center gap-2.5 ${
            statusBanner.type === 'success'
              ? 'bg-emerald-50 text-emerald-950 border border-emerald-300'
              : 'bg-red-50 text-red-950 border border-red-300'
          }`}
        >
          {statusBanner.type === 'success' ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-700 shrink-0" />
          )}
          <span>{statusBanner.text}</span>
        </div>
      )}

      {/* Main Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Navigation Sidebar */}
        <aside className="lg:col-span-3">
          <nav
            aria-label="Admin Dashboard Sections"
            className="examora-card p-2.5 flex lg:flex-col gap-1 overflow-x-auto no-scrollbar"
          >
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isSelected = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-colors whitespace-nowrap text-left cursor-pointer ${
                    isSelected
                      ? 'text-[#FFFDFA]'
                      : 'text-[#17233B] hover:bg-[#FBF6EC]'
                  }`}
                >
                  {isSelected && (
                    <motion.span
                      layoutId="admin-sidebar-active-pill"
                      transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-[#123675] shadow-xs"
                    />
                  )}
                  <Icon
                    className={`relative z-10 w-4 h-4 shrink-0 transition-colors ${
                      isSelected ? 'text-[#EAB52F]' : 'text-[#123675]'
                    }`}
                  />
                  <span className="relative z-10">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </aside>

        {/* Right Section Workspace */}
        <div className="lg:col-span-9 space-y-6">
          {loadingData || !adminData ? (
            <div className="examora-card p-10 text-center text-sm text-[#687080]">
              Loading live database records...
            </div>
          ) : (
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.24, ease: [0.22, 1, 0.36, 1] }}
                className="space-y-6"
              >
              {/* 1. OVERVIEW TAB */}
              {activeTab === 'overview' && (
                <div className="space-y-6">
                  <div className="examora-card p-6 space-y-4">
                    <h2 className="font-serif-heading text-2xl font-bold text-[#17233B]">
                      Database Overview (Live Published Counts)
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                      {[
                        {
                          label: 'Published Notes',
                          val: adminData.counts.publishedNotesCount,
                          tab: 'notes' as AdminTab,
                        },
                        {
                          label: 'Published PDFs',
                          val: adminData.counts.publishedPdfsCount,
                          tab: 'pdfs' as AdminTab,
                        },
                        {
                          label: 'Published Quizzes',
                          val: adminData.counts.publishedQuizzesCount,
                          tab: 'quizzes' as AdminTab,
                        },
                        {
                          label: 'Past Papers',
                          val: adminData.counts.publishedPastPapersCount,
                          tab: 'past-papers' as AdminTab,
                        },
                        {
                          label: 'Active Job Listings',
                          val: adminData.counts.activeJobListingsCount,
                          tab: 'jobs' as AdminTab,
                        },
                        {
                          label: 'Announcements',
                          val: adminData.counts.publishedAnnouncementsCount,
                          tab: 'announcements' as AdminTab,
                        },
                      ].map((stat) => (
                        <button
                          key={stat.label}
                          type="button"
                          onClick={() => setActiveTab(stat.tab)}
                          className="p-5 rounded-2xl bg-[#FBF6EC] border border-[#E6E0D5] hover:border-[#123675] text-left transition-all cursor-pointer"
                        >
                          <p className="text-xs font-bold text-[#687080]">
                            {stat.label}
                          </p>
                          <p className="font-serif-heading text-3xl font-extrabold text-[#123675] font-mono-num mt-1">
                            {stat.val}
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. WEBSITE SETTINGS TAB */}
              {activeTab === 'settings' && settingsForm && (
                <form
                  onSubmit={handleSaveSettings}
                  className="examora-card p-6 sm:p-8 space-y-5"
                >
                  <h2 className="font-serif-heading text-2xl font-bold text-[#17233B]">
                    Home Page & Brand Settings
                  </h2>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17233B]">
                        Academy Brand Name
                      </label>
                      <input
                        type="text"
                        value={settingsForm.academyName}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            academyName: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17233B]">
                        Upload Custom Logo Image
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            const dataUrl = await readFileAsDataUrl(file);
                            setSettingsForm({ ...settingsForm, logoUrl: dataUrl });
                          }
                        }}
                        className="w-full text-xs text-[#687080] file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-[#123675] file:text-white file:font-bold"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17233B]">
                        Hero Heading Title
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroTitle}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            heroTitle: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17233B]">
                        Primary CTA Button Label
                      </label>
                      <input
                        type="text"
                        value={settingsForm.heroPrimaryBtnLabel}
                        onChange={(e) =>
                          setSettingsForm({
                            ...settingsForm,
                            heroPrimaryBtnLabel: e.target.value,
                          })
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#17233B]">
                      Hero Description
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.heroDescription}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          heroDescription: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#17233B]">
                      About Us Content
                    </label>
                    <textarea
                      rows={4}
                      value={settingsForm.aboutContent}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          aboutContent: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="block text-xs font-bold text-[#17233B]">
                      Footer Description
                    </label>
                    <textarea
                      rows={2}
                      value={settingsForm.footerDescription}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          footerDescription: e.target.value,
                        })
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                    />
                  </div>

                  <button
                    type="submit"
                    className="examora-btn-gold px-6 py-3 rounded-xl text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Website Settings</span>
                  </button>
                </form>
              )}

              {/* 3. NOTES MANAGEMENT TAB */}
              {activeTab === 'notes' && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSaveNote(e, notePublished)}
                    className="examora-card p-6 space-y-4"
                  >
                    <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
                      {editingNoteId ? 'Edit Study Note' : 'Upload New Study Note'}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          1. Note Title
                        </label>
                        <input
                          type="text"
                          required
                          value={noteTitle}
                          onChange={(e) => setNoteTitle(e.target.value)}
                          placeholder="e.g., Objective Resolution 1949 Complete Notes"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          Subject Category
                        </label>
                        <input
                          type="text"
                          value={noteCategory}
                          onChange={(e) => setNoteCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          2. Cover Image Upload
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) setNoteCoverUrl(await readFileAsDataUrl(f));
                          }}
                          className="w-full text-xs text-[#687080] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#123675] file:text-white file:font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          3. PDF Document Upload
                        </label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) setNotePdfBase64(await readFileAsDataUrl(f));
                          }}
                          className="w-full text-xs text-[#687080] file:mr-2 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:bg-[#123675] file:text-white file:font-bold"
                        />
                      </div>

                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          4. Access Type (Free or Paid)
                        </label>
                        <select
                          value={noteAccessType}
                          onChange={(e) =>
                            setNoteAccessType(e.target.value as AccessType)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm font-bold"
                        >
                          <option value="free">Free (Opens in Internal PDF Viewer)</option>
                          <option value="paid">Paid (Protected WhatsApp Purchase)</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17233B]">
                        Study Note Full Content (Rendered on Internal PDF Sheets)
                      </label>
                      <textarea
                        rows={4}
                        value={noteBodyText}
                        onChange={(e) => setNoteBodyText(e.target.value)}
                        placeholder="Enter paragraphs separated by new lines..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-2">
                      <button
                        type="submit"
                        onClick={() => setNotePublished(true)}
                        className="examora-btn-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                      >
                        <Upload className="w-4 h-4" />
                        <span>Publish Note</span>
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleSaveNote(e, false)}
                        className="examora-btn-navy px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold cursor-pointer"
                      >
                        Save as Draft
                      </button>
                      {editingNoteId && (
                        <button
                          type="button"
                          onClick={() => {
                            setEditingNoteId(null);
                            setNoteTitle('');
                            setNoteBodyText('');
                          }}
                          className="px-4 py-2.5 rounded-xl border border-[#E6E0D5] text-xs font-bold text-[#687080]"
                        >
                          Cancel Edit
                        </button>
                      )}
                    </div>
                  </form>

                  {/* Existing Notes List */}
                  <div className="examora-card divide-y divide-[#E6E0D5]">
                    {adminData.notes.map((note) => (
                      <div
                        key={note.id}
                        className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div className="space-y-1 min-w-0">
                          <div className="flex items-center gap-2 text-xs font-bold">
                            <span className="text-[#123675]">{note.category}</span>
                            <span>·</span>
                            <span
                              className={
                                note.accessType === 'paid'
                                  ? 'text-amber-700'
                                  : 'text-emerald-700'
                              }
                            >
                              {note.accessType.toUpperCase()}
                            </span>
                            <span>·</span>
                            <span
                              className={
                                note.published
                                  ? 'text-emerald-700'
                                  : 'text-slate-500'
                              }
                            >
                              {note.published ? 'Published' : 'Draft'}
                            </span>
                          </div>
                          <h3 className="font-serif-heading text-base font-bold text-[#17233B]">
                            {note.title}
                          </h3>
                        </div>

                        <div className="flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewDocument({
                                collection: 'notes',
                                id: note.id,
                                title: note.title,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#FBF6EC] border border-[#E6E0D5] text-xs font-bold text-[#123675] inline-flex items-center gap-1 cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Preview</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleNoteAccess(note)}
                            className="px-3 py-1.5 rounded-lg bg-[#FBF6EC] border border-[#E6E0D5] text-xs font-bold text-[#17233B] cursor-pointer"
                          >
                            Switch to {note.accessType === 'free' ? 'Paid' : 'Free'}
                          </button>
                          <button
                            type="button"
                            onClick={() => handleToggleNotePublish(note)}
                            className="px-3 py-1.5 rounded-lg bg-[#FBF6EC] border border-[#E6E0D5] text-xs font-bold text-[#17233B] cursor-pointer"
                          >
                            {note.published ? 'Unpublish' : 'Publish'}
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              setEditingNoteId(note.id);
                              setNoteTitle(note.title);
                              setNoteCategory(note.category);
                              setNoteAccessType(note.accessType);
                              setNoteSummary(note.summary);
                              setNoteBodyText(
                                note.pages?.[0]?.paragraphs?.join('\n\n') || ''
                              );
                            }}
                            className="p-2 rounded-lg bg-[#FBF6EC] border border-[#E6E0D5] text-[#123675] cursor-pointer"
                            aria-label={`Edit ${note.title}`}
                          >
                            <Edit3 className="w-4 h-4" />
                          </button>
                          {confirmDeleteId === note.id ? (
                            <button
                              type="button"
                              onClick={() => handleDeleteRecord('notes', note.id)}
                              className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold cursor-pointer"
                            >
                              Confirm Delete
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteId(note.id)}
                              className="p-2 rounded-lg bg-red-50 text-red-700 cursor-pointer"
                              aria-label={`Delete ${note.title}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. PDFS & STUDY MATERIAL TAB */}
              {activeTab === 'pdfs' && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSavePdf(e, pdfPublished)}
                    className="examora-card p-6 space-y-4"
                  >
                    <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
                      {editingPdfId
                        ? 'Edit Study PDF'
                        : 'Upload New Study Material PDF'}
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          Document Title
                        </label>
                        <input
                          type="text"
                          required
                          value={pdfTitle}
                          onChange={(e) => setPdfTitle(e.target.value)}
                          placeholder="e.g., International Relations Complete CSS Guide"
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          Category
                        </label>
                        <input
                          type="text"
                          value={pdfCategory}
                          onChange={(e) => setPdfCategory(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          Cover Image Upload
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) setPdfCoverUrl(await readFileAsDataUrl(f));
                          }}
                          className="w-full text-xs text-[#687080]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          PDF File Upload
                        </label>
                        <input
                          type="file"
                          accept="application/pdf"
                          onChange={async (e) => {
                            const f = e.target.files?.[0];
                            if (f) setPdfUploadedBase64(await readFileAsDataUrl(f));
                          }}
                          className="w-full text-xs text-[#687080]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-xs font-bold text-[#17233B]">
                          Access Policy
                        </label>
                        <select
                          value={pdfAccessType}
                          onChange={(e) =>
                            setPdfAccessType(e.target.value as AccessType)
                          }
                          className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm font-bold"
                        >
                          <option value="free">Free</option>
                          <option value="paid">Paid</option>
                        </select>
                      </div>
                    </div>

                    <div className="space-y-1.5">
                      <label className="block text-xs font-bold text-[#17233B]">
                        Document Text / Summary Chapters
                      </label>
                      <textarea
                        rows={3}
                        value={pdfBodyText}
                        onChange={(e) => setPdfBodyText(e.target.value)}
                        placeholder="Enter study guide text..."
                        className="w-full px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                    </div>

                    <button
                      type="submit"
                      className="examora-btn-gold px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Save & Publish PDF</span>
                    </button>
                  </form>

                  <div className="examora-card divide-y divide-[#E6E0D5]">
                    {adminData.pdfs.map((pdf) => (
                      <div
                        key={pdf.id}
                        className="p-4 sm:p-5 flex flex-wrap items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#123675]">
                            {pdf.category} · {pdf.accessType.toUpperCase()} ·{' '}
                            {pdf.published ? 'Published' : 'Draft'}
                          </p>
                          <h3 className="font-serif-heading text-base font-bold text-[#17233B]">
                            {pdf.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              onPreviewDocument({
                                collection: 'pdfs',
                                id: pdf.id,
                                title: pdf.title,
                              })
                            }
                            className="px-3 py-1.5 rounded-lg bg-[#FBF6EC] border border-[#E6E0D5] text-xs font-bold text-[#123675] cursor-pointer"
                          >
                            Preview
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDeleteRecord('pdfs', pdf.id)}
                            className="p-2 rounded-lg bg-red-50 text-red-700 cursor-pointer"
                            aria-label={`Delete ${pdf.title}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. QUIZ MANAGEMENT TAB */}
              {activeTab === 'quizzes' && (
                <div className="space-y-6">
                  {/* Create Quiz Collection */}
                  <form
                    onSubmit={handleCreateQuiz}
                    className="examora-card p-6 space-y-4"
                  >
                    <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
                      Create New Quiz Collection
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        value={newQuizTitle}
                        onChange={(e) => setNewQuizTitle(e.target.value)}
                        placeholder="Quiz Title (e.g., Daily Current Affairs Quiz)"
                        className="px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                      <input
                        type="text"
                        value={newQuizCategory}
                        onChange={(e) => setNewQuizCategory(e.target.value)}
                        placeholder="Category"
                        className="px-3.5 py-2.5 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="examora-btn-navy px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold inline-flex items-center gap-2 cursor-pointer"
                    >
                      <Plus className="w-4 h-4 text-[#EAB52F]" />
                      <span>Create Quiz</span>
                    </button>
                  </form>

                  {/* Manage Questions in Selected Quiz */}
                  {activeAdminQuiz && (
                    <div className="examora-card p-6 space-y-5">
                      <div className="flex flex-wrap items-center justify-between gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-[#687080]">
                            Select Quiz to Manage Questions:
                          </label>
                          <select
                            value={activeAdminQuiz.id}
                            onChange={(e) => setSelectedAdminQuizId(e.target.value)}
                            className="px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm font-bold text-[#123675]"
                          >
                            {adminData.quizzes.map((q) => (
                              <option key={q.id} value={q.id}>
                                {q.title} ({q.questions.length} MCQs)
                              </option>
                            ))}
                          </select>
                        </div>

                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteRecord('quizzes', activeAdminQuiz.id)
                          }
                          className="px-3 py-2 rounded-xl bg-red-50 text-red-700 text-xs font-bold cursor-pointer"
                        >
                          Delete Entire Quiz
                        </button>
                      </div>

                      <form
                        onSubmit={handleAddQuestionToQuiz}
                        className="p-4 rounded-2xl bg-[#FBF6EC] border border-[#E6E0D5] space-y-3"
                      >
                        <h3 className="font-serif-heading text-base font-bold text-[#17233B]">
                          Add 4-Option MCQ to &ldquo;{activeAdminQuiz.title}&rdquo;
                        </h3>
                        <input
                          type="text"
                          required
                          value={qText}
                          onChange={(e) => setQText(e.target.value)}
                          placeholder="Question text..."
                          className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E6E0D5] text-sm"
                        />
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          <input
                            type="text"
                            required
                            value={qOptA}
                            onChange={(e) => setQOptA(e.target.value)}
                            placeholder="Option A"
                            className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E0D5] text-sm"
                          />
                          <input
                            type="text"
                            required
                            value={qOptB}
                            onChange={(e) => setQOptB(e.target.value)}
                            placeholder="Option B"
                            className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E0D5] text-sm"
                          />
                          <input
                            type="text"
                            required
                            value={qOptC}
                            onChange={(e) => setQOptC(e.target.value)}
                            placeholder="Option C"
                            className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E0D5] text-sm"
                          />
                          <input
                            type="text"
                            required
                            value={qOptD}
                            onChange={(e) => setQOptD(e.target.value)}
                            placeholder="Option D"
                            className="px-3.5 py-2 rounded-xl bg-white border border-[#E6E0D5] text-sm"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-xs font-bold text-[#17233B] mb-1">
                              Correct Option
                            </label>
                            <select
                              value={qCorrectIdx}
                              onChange={(e) =>
                                setQCorrectIdx(Number(e.target.value))
                              }
                              className="w-full px-3 py-2 rounded-xl bg-white border border-[#E6E0D5] text-sm font-bold"
                            >
                              <option value={0}>Option A</option>
                              <option value={1}>Option B</option>
                              <option value={2}>Option C</option>
                              <option value={3}>Option D</option>
                            </select>
                          </div>
                          <div className="sm:col-span-2">
                            <label className="block text-xs font-bold text-[#17233B] mb-1">
                              Answer Explanation
                            </label>
                            <input
                              type="text"
                              value={qExplanation}
                              onChange={(e) => setQExplanation(e.target.value)}
                              placeholder="Why is this option correct?"
                              className="w-full px-3.5 py-2 rounded-xl bg-white border border-[#E6E0D5] text-sm"
                            />
                          </div>
                        </div>
                        <button
                          type="submit"
                          className="examora-btn-gold px-5 py-2 rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Add Question to Quiz
                        </button>
                      </form>

                      <div className="divide-y divide-[#E6E0D5]">
                        {activeAdminQuiz.questions.map((q, idx) => (
                          <div
                            key={q.id}
                            className="py-3.5 flex items-start justify-between gap-4"
                          >
                            <div className="space-y-1 text-xs sm:text-sm">
                              <p className="font-bold text-[#17233B]">
                                {idx + 1}. {q.questionText}
                              </p>
                              <p className="text-xs text-emerald-800 font-semibold">
                                Correct Answer: {q.options[q.correctIndex || 0]}
                              </p>
                            </div>
                            <button
                              type="button"
                              onClick={() =>
                                handleDeleteQuizQuestion(activeAdminQuiz, q.id)
                              }
                              className="p-1.5 rounded-lg bg-red-50 text-red-700 shrink-0 cursor-pointer"
                              aria-label={`Delete question ${idx + 1}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 6. PAST PAPERS TAB */}
              {activeTab === 'past-papers' && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSavePastPaper(e, paperPublished)}
                    className="examora-card p-6 space-y-4"
                  >
                    <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
                      Upload Past Examination Paper
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          Paper Title
                        </label>
                        <input
                          type="text"
                          required
                          value={paperTitle}
                          onChange={(e) => setPaperTitle(e.target.value)}
                          placeholder="e.g., CSS International Relations Paper"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          Examination
                        </label>
                        <select
                          value={paperExamName}
                          onChange={(e) =>
                            setPaperExamName(
                              e.target.value as PastPaperItem['examName']
                            )
                          }
                          className="w-full px-3 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm font-bold"
                        >
                          <option value="CSS">CSS</option>
                          <option value="PMS">PMS</option>
                          <option value="FPSC">FPSC</option>
                          <option value="PPSC">PPSC</option>
                          <option value="NTS">NTS</option>
                        </select>
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          Year
                        </label>
                        <input
                          type="number"
                          value={paperYear}
                          onChange={(e) => setPaperYear(Number(e.target.value))}
                          className="w-full px-3 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <input
                        type="text"
                        value={paperSubject}
                        onChange={(e) => setPaperSubject(e.target.value)}
                        placeholder="Optional Subject (e.g., Pakistan Affairs)"
                        className="px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                      <input
                        type="file"
                        accept="application/pdf"
                        onChange={async (e) => {
                          const f = e.target.files?.[0];
                          if (f) setPaperPdfBase64(await readFileAsDataUrl(f));
                        }}
                        className="text-xs text-[#687080]"
                      />
                      <select
                        value={paperAccessType}
                        onChange={(e) =>
                          setPaperAccessType(e.target.value as AccessType)
                        }
                        className="px-3 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm font-bold"
                      >
                        <option value="free">Free Public Paper</option>
                        <option value="paid">Paid Solved Paper</option>
                      </select>
                    </div>

                    <button
                      type="submit"
                      className="examora-btn-gold px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save & Publish Past Paper
                    </button>
                  </form>

                  <div className="examora-card divide-y divide-[#E6E0D5]">
                    {adminData.pastPapers.map((pp) => (
                      <div
                        key={pp.id}
                        className="p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#123675]">
                            {pp.examName} ({pp.year}) · {pp.subject}
                          </p>
                          <h3 className="font-serif-heading text-base font-bold text-[#17233B]">
                            {pp.title}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteRecord('past-papers', pp.id)
                          }
                          className="p-2 rounded-lg bg-red-50 text-red-700 cursor-pointer"
                          aria-label={`Delete ${pp.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 7. JOBS UPDATES TAB */}
              {activeTab === 'jobs' && (
                <div className="space-y-6">
                  <form
                    onSubmit={(e) => handleSaveJob(e, jobPublished)}
                    className="examora-card p-6 space-y-4"
                  >
                    <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
                      Add or Update Job Opportunity
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <input
                        type="text"
                        required
                        value={jobTitle}
                        onChange={(e) => setJobTitle(e.target.value)}
                        placeholder="Job Title (e.g., Tehsildar BS-16)"
                        className="px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                      <input
                        type="text"
                        required
                        value={jobOrg}
                        onChange={(e) => setJobOrg(e.target.value)}
                        placeholder="Organization (e.g., PPSC / FPSC)"
                        className="px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                      <input
                        type="text"
                        value={jobLocation}
                        onChange={(e) => setJobLocation(e.target.value)}
                        placeholder="Location (e.g., Punjab / Nationwide)"
                        className="px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                      <input
                        type="date"
                        value={jobDeadline}
                        onChange={(e) => setJobDeadline(e.target.value)}
                        aria-label="Application Deadline"
                        className="px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                    </div>
                    <textarea
                      rows={2}
                      value={jobSummary}
                      onChange={(e) => setJobSummary(e.target.value)}
                      placeholder="Short job summary & eligibility..."
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                    />
                    <input
                      type="url"
                      value={jobOfficialUrl}
                      onChange={(e) => setJobOfficialUrl(e.target.value)}
                      placeholder="Official Application URL (optional)"
                      className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                    />
                    <button
                      type="submit"
                      className="examora-btn-gold px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Publish Job Listing
                    </button>
                  </form>

                  <div className="examora-card divide-y divide-[#E6E0D5]">
                    {adminData.jobs.map((jb) => (
                      <div
                        key={jb.id}
                        className="p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <p className="text-xs font-bold text-[#123675]">
                            {jb.organization} · Last Date: {jb.deadline || 'Open'}
                          </p>
                          <h3 className="font-serif-heading text-base font-bold text-[#17233B]">
                            {jb.title}
                          </h3>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleDeleteRecord('jobs', jb.id)}
                          className="p-2 rounded-lg bg-red-50 text-red-700 cursor-pointer"
                          aria-label={`Delete ${jb.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 8. ANNOUNCEMENTS TAB */}
              {activeTab === 'announcements' && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleCreateAnnouncement}
                    className="examora-card p-6 space-y-4"
                  >
                    <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
                      Publish Home Page Update / Announcement
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <select
                        value={annBadge}
                        onChange={(e) =>
                          setAnnBadge(
                            e.target.value as AnnouncementItem['typeBadge']
                          )
                        }
                        className="px-3 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm font-bold"
                      >
                        <option value="Note">Note</option>
                        <option value="Job">Job</option>
                        <option value="Exam Alert">Exam Alert</option>
                        <option value="Quiz">Quiz</option>
                        <option value="PDF">PDF</option>
                      </select>
                      <input
                        type="text"
                        required
                        value={annTitle}
                        onChange={(e) => setAnnTitle(e.target.value)}
                        placeholder="Announcement headline..."
                        className="sm:col-span-2 px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                      />
                    </div>
                    <button
                      type="submit"
                      className="examora-btn-gold px-5 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Add Announcement
                    </button>
                  </form>

                  <div className="examora-card divide-y divide-[#E6E0D5]">
                    {adminData.announcements.map((ann) => (
                      <div
                        key={ann.id}
                        className="p-4 flex items-center justify-between gap-4"
                      >
                        <div>
                          <span className="text-xs font-bold text-[#123675]">
                            [{ann.typeBadge}] {ann.publicationDate}
                          </span>
                          <p className="font-semibold text-sm text-[#17233B]">
                            {ann.title}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            handleDeleteRecord('announcements', ann.id)
                          }
                          className="p-2 rounded-lg bg-red-50 text-red-700 cursor-pointer"
                          aria-label={`Delete ${ann.title}`}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 9. CONTACT & SOCIAL LINKS TAB */}
              {activeTab === 'contact' && settingsForm && (
                <div className="space-y-6">
                  <form
                    onSubmit={handleSaveSettings}
                    className="examora-card p-6 space-y-4"
                  >
                    <h2 className="font-serif-heading text-xl font-bold text-[#17233B]">
                      Contact & Social Links (Including Paid Note WhatsApp Number)
                    </h2>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          Official Email Address
                        </label>
                        <input
                          type="email"
                          value={settingsForm.emailAddress}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              emailAddress: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          WhatsApp Number (Used for Paid Note Purchase Requests)
                        </label>
                        <input
                          type="text"
                          value={settingsForm.whatsappNumber}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              whatsappNumber: e.target.value,
                            })
                          }
                          placeholder="+923001234567"
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          WhatsApp Community Link
                        </label>
                        <input
                          type="url"
                          value={settingsForm.whatsappCommunityUrl}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              whatsappCommunityUrl: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          WhatsApp Channel Link
                        </label>
                        <input
                          type="url"
                          value={settingsForm.whatsappChannelUrl}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              whatsappChannelUrl: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          Instagram URL
                        </label>
                        <input
                          type="url"
                          value={settingsForm.instagramUrl}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              instagramUrl: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          Facebook URL
                        </label>
                        <input
                          type="url"
                          value={settingsForm.facebookUrl}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              facebookUrl: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          YouTube URL
                        </label>
                        <input
                          type="url"
                          value={settingsForm.youtubeUrl}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              youtubeUrl: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-[#17233B]">
                          TikTok URL
                        </label>
                        <input
                          type="url"
                          value={settingsForm.tiktokUrl}
                          onChange={(e) =>
                            setSettingsForm({
                              ...settingsForm,
                              tiktokUrl: e.target.value,
                            })
                          }
                          className="w-full px-3.5 py-2 rounded-xl bg-[#FBF6EC] border border-[#E6E0D5] text-sm"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="examora-btn-gold px-6 py-2.5 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Save Contact & Social Links
                    </button>
                  </form>

                  {/* Received Contact Inquiries */}
                  <div className="examora-card p-6 space-y-3">
                    <h3 className="font-serif-heading text-lg font-bold text-[#17233B]">
                      Received Contact Form Submissions ({adminData.contactSubmissions.length})
                    </h3>
                    {adminData.contactSubmissions.length === 0 ? (
                      <p className="text-xs text-[#687080]">
                        No visitor messages submitted yet.
                      </p>
                    ) : (
                      <div className="divide-y divide-[#E6E0D5]">
                        {adminData.contactSubmissions.map((msg) => (
                          <div key={msg.id} className="py-3 space-y-1">
                            <p className="text-xs font-bold text-[#123675]">
                              {msg.name} ({msg.email}) ·{' '}
                              {new Date(msg.createdAt).toLocaleString()}
                            </p>
                            <p className="text-sm text-[#17233B]">{msg.message}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </div>
  );
};
