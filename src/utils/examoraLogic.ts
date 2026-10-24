export type AccessType = 'free' | 'paid';

export interface SiteSettings {
  academyName: string;
  logoUrl: string;
  heroWelcomeLabel: string;
  heroTitle: string;
  heroDescription: string;
  heroPrimaryBtnLabel: string;
  heroSecondaryBtnLabel: string;
  aboutHeading: string;
  aboutContent: string;
  footerDescription: string;
  emailAddress: string;
  whatsappNumber: string;
  whatsappCommunityUrl: string;
  whatsappChannelUrl: string;
  instagramUrl: string;
  facebookUrl: string;
  youtubeUrl: string;
  tiktokUrl: string;
  updatedAt: string;
}

export interface DocumentPageContent {
  pageNumber: number;
  heading: string;
  subheading?: string;
  paragraphs: string[];
  keyPoints?: string[];
  footerNote?: string;
}

export interface NoteItem {
  id: string;
  title: string;
  category: string;
  coverUrl: string;
  accessType: AccessType;
  published: boolean;
  summary: string;
  pageCount: number;
  pages?: DocumentPageContent[];
  uploadedPdfBase64?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StudyPdfItem {
  id: string;
  title: string;
  category: string;
  authorOrSource: string;
  coverUrl: string;
  accessType: AccessType;
  published: boolean;
  pageCount: number;
  pages?: DocumentPageContent[];
  uploadedPdfBase64?: string;
  createdAt: string;
  updatedAt: string;
}

export interface QuizQuestion {
  id: string;
  questionText: string;
  options: [string, string, string, string];
  correctIndex?: number; // Stripped on public unsubmitted fetch, kept on server & admin
  explanation?: string;  // Stripped on public unsubmitted fetch, returned after submission
}

export interface QuizCollection {
  id: string;
  title: string;
  category: string;
  instructions: string;
  published: boolean;
  questions: QuizQuestion[];
  createdAt: string;
  updatedAt: string;
}

export interface PastPaperItem {
  id: string;
  title: string;
  examName: 'CSS' | 'PMS' | 'FPSC' | 'PPSC' | 'NTS' | 'Other';
  year: number;
  subject: string;
  coverUrl: string;
  accessType: AccessType;
  published: boolean;
  pageCount: number;
  pages?: DocumentPageContent[];
  uploadedPdfBase64?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobListing {
  id: string;
  title: string;
  organization: string;
  location: string;
  qualification: string;
  publicationDate: string;
  deadline: string; // Empty string if no deadline
  summary: string;
  officialUrl: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface AnnouncementItem {
  id: string;
  typeBadge: 'Note' | 'Job' | 'Exam Alert' | 'Quiz' | 'PDF';
  title: string;
  publicationDate: string;
  targetPage: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}

export interface QuizQuestionResult {
  questionId: string;
  questionText: string;
  options: [string, string, string, string];
  selectedIndex: number | null;
  correctIndex: number;
  isCorrect: boolean;
  explanation: string;
}

export interface QuizSubmissionSummary {
  quizId: string;
  score: number;
  totalQuestions: number;
  answeredCount: number;
  percentage: number;
  results: QuizQuestionResult[];
}

/**
 * Evaluates whether a document (Note, Study PDF, or Past Paper) can be opened
 * in the internal PDF viewer by the current requester.
 */
export function canAccessDocument(
  doc: { published: boolean; accessType: AccessType } | null | undefined,
  isAdmin: boolean
): { allowed: boolean; reason?: 'not_found' | 'unpublished' | 'paid_restricted' } {
  if (!doc) {
    return { allowed: false, reason: 'not_found' };
  }
  if (isAdmin) {
    return { allowed: true };
  }
  if (!doc.published) {
    return { allowed: false, reason: 'unpublished' };
  }
  if (doc.accessType === 'paid') {
    return { allowed: false, reason: 'paid_restricted' };
  }
  return { allowed: true };
}

/**
 * Strips private answer keys and explanations from quiz collections before sending to public visitors.
 */
export function sanitizeQuizForPublic(quiz: QuizCollection): QuizCollection {
  return {
    ...quiz,
    questions: quiz.questions.map((q) => ({
      id: q.id,
      questionText: q.questionText,
      options: [...q.options] as [string, string, string, string],
    })),
  };
}

/**
 * Grades a quiz submission deterministically without allowing duplicate question scoring.
 */
export function gradeQuizSubmission(
  quizId: string,
  questions: Array<{
    id: string;
    questionText: string;
    options: [string, string, string, string];
    correctIndex?: number;
    explanation?: string;
  }>,
  answers: Record<string, number | null | undefined>
): QuizSubmissionSummary {
  const seenQuestionIds = new Set<string>();
  let score = 0;
  let answeredCount = 0;
  const results: QuizQuestionResult[] = [];

  for (const q of questions) {
    if (seenQuestionIds.has(q.id)) {
      continue;
    }
    seenQuestionIds.add(q.id);

    const rawSelection = answers[q.id];
    const selectedIndex =
      typeof rawSelection === 'number' &&
      Number.isInteger(rawSelection) &&
      rawSelection >= 0 &&
      rawSelection < 4
        ? rawSelection
        : null;

    if (selectedIndex !== null) {
      answeredCount += 1;
    }

    const correctIndex = typeof q.correctIndex === 'number' ? q.correctIndex : 0;
    const isCorrect = selectedIndex !== null && selectedIndex === correctIndex;
    if (isCorrect) {
      score += 1;
    }

    results.push({
      questionId: q.id,
      questionText: q.questionText,
      options: q.options,
      selectedIndex,
      correctIndex,
      isCorrect,
      explanation: q.explanation || 'Review standard reference material for this concept.',
    });
  }

  const totalQuestions = results.length;
  const percentage = totalQuestions > 0 ? Math.round((score / totalQuestions) * 100) : 0;

  return {
    quizId,
    score,
    totalQuestions,
    answeredCount,
    percentage,
    results,
  };
}

/**
 * Generates a WhatsApp purchase request URL with a polite prefilled message including the title.
 */
export function buildWhatsAppPurchaseLink(
  whatsappNumber: string | undefined | null,
  itemTitle: string,
  itemType: string = 'Note'
): { valid: boolean; url: string; fallbackMessage: string } {
  const digits = (whatsappNumber || '').replace(/[^\d]/g, '');
  const cleanTitle = itemTitle.trim() || 'Study Material';
  const prefilledText = `Assalam-o-Alaikum EXAMORA PAKISTAN Team, I would like to request access / purchase the ${itemType}: "${cleanTitle}". Please share the payment and access details. Thank you!`;

  if (!digits || digits.length < 10) {
    return {
      valid: false,
      url: '',
      fallbackMessage:
        'WhatsApp purchase contact is currently being updated by the administrator. Please check the Contact Us page for alternative channels.',
    };
  }

  const normalizedDigits = digits.startsWith('03') && digits.length === 11
    ? `92${digits.slice(1)}`
    : digits;

  return {
    valid: true,
    url: `https://wa.me/${normalizedDigits}?text=${encodeURIComponent(prefilledText)}`,
    fallbackMessage: prefilledText,
  };
}

/**
 * Checks if a job listing deadline has passed relative to a reference date.
 * Returns false if no deadline is set.
 */
export function isJobExpired(deadline: string | undefined | null, referenceIsoDate?: string): boolean {
  if (!deadline || !deadline.trim()) {
    return false;
  }
  const parsedDeadline = new Date(deadline);
  if (Number.isNaN(parsedDeadline.getTime())) {
    return false;
  }
  // Treat deadline day as inclusive until 23:59:59.999 UTC
  const deadlineEnd = new Date(parsedDeadline);
  deadlineEnd.setUTCHours(23, 59, 59, 999);

  const now = referenceIsoDate ? new Date(referenceIsoDate) : new Date();
  return now.getTime() > deadlineEnd.getTime();
}

/**
 * Calculates real platform counts from database collections for the Home & Admin Overview pages.
 */
export function computePlatformCounts(
  data: {
    notes: NoteItem[];
    pdfs: StudyPdfItem[];
    quizzes: QuizCollection[];
    pastPapers: PastPaperItem[];
    jobs: JobListing[];
    announcements: AnnouncementItem[];
  },
  referenceIsoDate?: string
) {
  const publishedNotes = data.notes.filter((n) => n.published);
  const publishedPdfs = data.pdfs.filter((p) => p.published);
  const publishedQuizzes = data.quizzes.filter((q) => q.published);
  const totalPublishedQuestions = publishedQuizzes.reduce(
    (sum, q) => sum + q.questions.length,
    0
  );
  const publishedPastPapers = data.pastPapers.filter((p) => p.published);
  const publishedJobs = data.jobs.filter((j) => j.published);
  const activeJobListings = publishedJobs.filter(
    (j) => !isJobExpired(j.deadline, referenceIsoDate)
  );
  const publishedAnnouncements = data.announcements.filter((a) => a.published);

  return {
    publishedNotesCount: publishedNotes.length,
    publishedPdfsCount: publishedPdfs.length,
    publishedQuizzesCount: publishedQuizzes.length,
    totalPublishedQuestionsCount: totalPublishedQuestions,
    publishedPastPapersCount: publishedPastPapers.length,
    publishedJobsCount: publishedJobs.length,
    activeJobListingsCount: activeJobListings.length,
    publishedAnnouncementsCount: publishedAnnouncements.length,
  };
}
