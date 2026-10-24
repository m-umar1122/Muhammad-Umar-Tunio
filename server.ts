import 'dotenv/config';
import express, { type Request, type Response, type NextFunction } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import {
  canAccessDocument,
  sanitizeQuizForPublic,
  gradeQuizSubmission,
  computePlatformCounts,
  type NoteItem,
  type StudyPdfItem,
  type QuizCollection,
  type PastPaperItem,
  type JobListing,
  type AnnouncementItem,
} from './src/utils/examoraLogic';
import {
  getInitialDatabase,
  createAcademicCoverSvgDataUrl,
  type ExamoraDatabase,
} from './src/server/seedData';
import { generateAcademicPdfBuffer } from './src/server/pdfBuilder';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DATA_DIR = path.join(__dirname, 'data');
const DB_FILE = path.join(DATA_DIR, 'examora-db.json');
const ADMIN_AUTH_FILE = path.join(DATA_DIR, 'admin-auth.json');

interface AdminAuthRecord {
  email: string;
  passwordSalt: string;
  passwordHash: string;
  role: 'admin';
  createdAt: string;
}

interface SessionRecord {
  token: string;
  email: string;
  role: 'admin';
  expiresAt: number;
}

const activeSessions = new Map<string, SessionRecord>();

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

function loadDatabase(): ExamoraDatabase {
  ensureDataDir();
  if (!fs.existsSync(DB_FILE)) {
    const initial = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
  try {
    const raw = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(raw) as ExamoraDatabase;
  } catch {
    const initial = getInitialDatabase();
    fs.writeFileSync(DB_FILE, JSON.stringify(initial, null, 2), 'utf8');
    return initial;
  }
}

function saveDatabase(db: ExamoraDatabase) {
  ensureDataDir();
  fs.writeFileSync(DB_FILE, JSON.stringify(db, null, 2), 'utf8');
}

function loadAdminAuth(): AdminAuthRecord | null {
  ensureDataDir();
  if (!fs.existsSync(ADMIN_AUTH_FILE)) {
    return null;
  }
  try {
    return JSON.parse(fs.readFileSync(ADMIN_AUTH_FILE, 'utf8')) as AdminAuthRecord;
  } catch {
    return null;
  }
}

function saveAdminAuth(record: AdminAuthRecord) {
  ensureDataDir();
  fs.writeFileSync(ADMIN_AUTH_FILE, JSON.stringify(record, null, 2), 'utf8');
}

function getSessionFromRequest(req: Request): SessionRecord | null {
  const authHeader = req.headers.authorization;
  const tokenFromHeader =
    authHeader && authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : '';
  const tokenFromQuery = typeof req.query.token === 'string' ? req.query.token.trim() : '';
  const token = tokenFromHeader || tokenFromQuery;

  if (!token) return null;
  const session = activeSessions.get(token);
  if (!session) return null;
  if (Date.now() > session.expiresAt) {
    activeSessions.delete(token);
    return null;
  }
  return session;
}

function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const session = getSessionFromRequest(req);
  if (!session || session.role !== 'admin') {
    res.status(401).json({ error: 'Unauthorized: Administrator authentication required.' });
    return;
  }
  next();
}

function sanitizeNoteForPublic(note: NoteItem): Omit<NoteItem, 'uploadedPdfBase64' | 'pages'> & {
  hasInternalDocument: boolean;
} {
  const { uploadedPdfBase64, pages, ...rest } = note;
  return {
    ...rest,
    hasInternalDocument: Boolean(
      (uploadedPdfBase64 && uploadedPdfBase64.length > 0) || (pages && pages.length > 0)
    ),
  };
}

function sanitizePdfForPublic(pdf: StudyPdfItem): Omit<StudyPdfItem, 'uploadedPdfBase64' | 'pages'> & {
  hasInternalDocument: boolean;
} {
  const { uploadedPdfBase64, pages, ...rest } = pdf;
  return {
    ...rest,
    hasInternalDocument: Boolean(
      (uploadedPdfBase64 && uploadedPdfBase64.length > 0) || (pages && pages.length > 0)
    ),
  };
}

function sanitizePastPaperForPublic(
  paper: PastPaperItem
): Omit<PastPaperItem, 'uploadedPdfBase64' | 'pages'> & {
  hasInternalDocument: boolean;
} {
  const { uploadedPdfBase64, pages, ...rest } = paper;
  return {
    ...rest,
    hasInternalDocument: Boolean(
      (uploadedPdfBase64 && uploadedPdfBase64.length > 0) || (pages && pages.length > 0)
    ),
  };
}

async function startServer() {
  const app = express();
  app.use(express.json({ limit: '25mb' }));

  // ============================================================================
  // PUBLIC API ROUTES
  // ============================================================================

  app.get('/api/public/bootstrap', (_req: Request, res: Response) => {
    const db = loadDatabase();
    const counts = computePlatformCounts(db);

    res.json({
      settings: db.settings,
      counts,
      notes: db.notes.filter((n) => n.published).map(sanitizeNoteForPublic),
      pdfs: db.pdfs.filter((p) => p.published).map(sanitizePdfForPublic),
      quizzes: db.quizzes.filter((q) => q.published).map(sanitizeQuizForPublic),
      pastPapers: db.pastPapers.filter((p) => p.published).map(sanitizePastPaperForPublic),
      jobs: db.jobs.filter((j) => j.published),
      announcements: db.announcements.filter((a) => a.published),
    });
  });

  // Grade Quiz Submission (Server-side answer key enforcement)
  app.post('/api/public/quizzes/:id/submit', (req: Request, res: Response) => {
    const db = loadDatabase();
    const quiz = db.quizzes.find((q) => q.id === req.params.id && q.published);
    if (!quiz) {
      res.status(404).json({ error: 'Quiz not found or not published.' });
      return;
    }

    const answers =
      req.body && typeof req.body.answers === 'object' && req.body.answers !== null
        ? (req.body.answers as Record<string, number>)
        : {};

    const summary = gradeQuizSubmission(quiz.id, quiz.questions, answers);
    res.json(summary);
  });

  // Protected Document Metadata + Pages Endpoint (Enforces Free vs Paid & Published on Backend)
  app.get('/api/documents/:collection/:id/content', (req: Request, res: Response) => {
    const { collection, id } = req.params;
    const db = loadDatabase();
    const session = getSessionFromRequest(req);
    const isAdmin = Boolean(session && session.role === 'admin');

    let doc: (NoteItem | StudyPdfItem | PastPaperItem) | undefined;
    let subtitle = '';

    if (collection === 'notes') {
      doc = db.notes.find((n) => n.id === id);
      if (doc) subtitle = `${(doc as NoteItem).category} • Study Note`;
    } else if (collection === 'pdfs') {
      doc = db.pdfs.find((p) => p.id === id);
      if (doc) subtitle = `${(doc as StudyPdfItem).category} • Study Material`;
    } else if (collection === 'past-papers') {
      doc = db.pastPapers.find((p) => p.id === id);
      if (doc) {
        const pp = doc as PastPaperItem;
        subtitle = `${pp.examName} (${pp.year}) • ${pp.subject || 'Past Paper'}`;
      }
    } else {
      res.status(400).json({ error: 'Invalid document collection.' });
      return;
    }

    const access = canAccessDocument(doc, isAdmin);
    if (!access.allowed || !doc) {
      if (access.reason === 'paid_restricted') {
        res.status(403).json({
          error:
            'This is a protected Paid document. Please contact EXAMORA PAKISTAN via WhatsApp to purchase access.',
          reason: 'paid_restricted',
        });
        return;
      }
      res.status(404).json({
        error: 'Document is unavailable or unpublished.',
        reason: access.reason || 'not_found',
      });
      return;
    }

    res.json({
      id: doc.id,
      title: doc.title,
      subtitle,
      accessType: doc.accessType,
      pageCount: doc.pages?.length || doc.pageCount || 1,
      pages: doc.pages || [
        {
          pageNumber: 1,
          heading: doc.title,
          subheading: subtitle,
          paragraphs: [
            'Official study document hosted on EXAMORA PAKISTAN internal reader.',
          ],
        },
      ],
      hasUploadedPdfBinary: Boolean(doc.uploadedPdfBase64),
      pdfStreamUrl: `/api/documents/${collection}/${doc.id}/pdf`,
    });
  });

  // Protected Raw PDF Binary Stream (for PDF.js canvas rendering)
  app.get('/api/documents/:collection/:id/pdf', (req: Request, res: Response) => {
    const { collection, id } = req.params;
    const db = loadDatabase();
    const session = getSessionFromRequest(req);
    const isAdmin = Boolean(session && session.role === 'admin');

    let doc: (NoteItem | StudyPdfItem | PastPaperItem) | undefined;
    let subtitle = '';

    if (collection === 'notes') {
      doc = db.notes.find((n) => n.id === id);
      if (doc) subtitle = `${(doc as NoteItem).category} - Study Note`;
    } else if (collection === 'pdfs') {
      doc = db.pdfs.find((p) => p.id === id);
      if (doc) subtitle = `${(doc as StudyPdfItem).category} - Study Material`;
    } else if (collection === 'past-papers') {
      doc = db.pastPapers.find((p) => p.id === id);
      if (doc) {
        const pp = doc as PastPaperItem;
        subtitle = `${pp.examName} (${pp.year}) - ${pp.subject || 'Past Paper'}`;
      }
    }

    const access = canAccessDocument(doc, isAdmin);
    if (!access.allowed || !doc) {
      res.status(access.reason === 'paid_restricted' ? 403 : 404).json({
        error:
          access.reason === 'paid_restricted'
            ? 'Access denied: Protected paid document.'
            : 'Document not found.',
      });
      return;
    }

    // If admin uploaded a custom PDF binary (base64 data URL or raw base64), decode and stream it
    if (doc.uploadedPdfBase64) {
      const cleaned = doc.uploadedPdfBase64.replace(/^data:application\/pdf;base64,/, '');
      const pdfBuffer = Buffer.from(cleaned, 'base64');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline; filename="examora-document.pdf"');
      res.setHeader('Cache-Control', 'private, no-store');
      res.send(pdfBuffer);
      return;
    }

    // Otherwise generate a valid multi-page academic PDF binary on the fly
    const pdfBuffer = generateAcademicPdfBuffer(doc.title, subtitle, doc.pages || []);
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'inline; filename="examora-study-material.pdf"');
    res.setHeader('Cache-Control', 'private, no-store');
    res.send(pdfBuffer);
  });

  // Contact Form Submission Endpoint
  app.post('/api/public/contact', (req: Request, res: Response) => {
    const { name, email, message } = req.body || {};
    if (
      typeof name !== 'string' ||
      name.trim().length < 2 ||
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof message !== 'string' ||
      message.trim().length < 5
    ) {
      res.status(400).json({
        error: 'Please provide your full name, a valid email address, and a message (at least 5 characters).',
      });
      return;
    }

    const db = loadDatabase();
    const newSubmission = {
      id: `msg-${Date.now()}`,
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      createdAt: new Date().toISOString(),
    };
    db.contactSubmissions.unshift(newSubmission);
    saveDatabase(db);

    res.status(201).json({
      success: true,
      submissionId: newSubmission.id,
      message: 'Your inquiry has been received by the EXAMORA PAKISTAN team.',
    });
  });

  // ============================================================================
  // AUTHENTICATION ROUTES (No Public Registration; Secure Provider Setup)
  // ============================================================================

  app.get('/api/auth/status', (req: Request, res: Response) => {
    const adminRecord = loadAdminAuth();
    const session = getSessionFromRequest(req);
    res.json({
      initialized: Boolean(adminRecord),
      authenticated: Boolean(session),
      adminEmail: session ? session.email : undefined,
    });
  });

  // Initial Administrator Setup or Reset for New Email & Password
  app.post('/api/auth/setup-initial-admin', (req: Request, res: Response) => {
    const { email, password } = req.body || {};
    if (
      typeof email !== 'string' ||
      !email.includes('@') ||
      typeof password !== 'string' ||
      password.length < 6
    ) {
      res.status(400).json({
        error: 'Please provide a valid administrator email and a password of at least 6 characters.',
      });
      return;
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    const record: AdminAuthRecord = {
      email: email.trim().toLowerCase(),
      passwordSalt: salt,
      passwordHash: hash,
      role: 'admin',
      createdAt: new Date().toISOString(),
    };
    saveAdminAuth(record);

    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, {
      token,
      email: record.email,
      role: 'admin',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      token,
      email: record.email,
      role: 'admin',
    });
  });

  // Reset Administrator Credentials to allow setting a new email & password
  app.post('/api/auth/reset-admin', (_req: Request, res: Response) => {
    try {
      if (fs.existsSync(ADMIN_AUTH_FILE)) {
        fs.unlinkSync(ADMIN_AUTH_FILE);
      }
      activeSessions.clear();
      res.json({
        success: true,
        initialized: false,
        message: 'Administrator email and password have been reset. You can now set a new email and password.',
      });
    } catch {
      res.status(500).json({ error: 'Failed to reset administrator credentials.' });
    }
  });

  app.post('/api/auth/login', (req: Request, res: Response) => {
    const adminRecord = loadAdminAuth();
    if (!adminRecord) {
      res.status(400).json({
        error: 'Initial administrator has not been configured yet. Complete initial setup first.',
      });
      return;
    }

    const { email, password } = req.body || {};
    if (typeof email !== 'string' || typeof password !== 'string') {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();
    const computedHash = crypto
      .scryptSync(password, adminRecord.passwordSalt, 64)
      .toString('hex');

    const emailMatches = normalizedEmail === adminRecord.email;
    const hashBufferA = Buffer.from(computedHash, 'hex');
    const hashBufferB = Buffer.from(adminRecord.passwordHash, 'hex');
    const passwordMatches =
      hashBufferA.length === hashBufferB.length &&
      crypto.timingSafeEqual(hashBufferA, hashBufferB);

    if (!emailMatches || !passwordMatches) {
      res.status(401).json({
        error:
          'Invalid administrator email or password. Use "Reset Email & Password" below to register a new email and password.',
      });
      return;
    }

    const token = crypto.randomBytes(32).toString('hex');
    activeSessions.set(token, {
      token,
      email: adminRecord.email,
      role: 'admin',
      expiresAt: Date.now() + 24 * 60 * 60 * 1000,
    });

    res.json({
      token,
      email: adminRecord.email,
      role: 'admin',
    });
  });

  app.post('/api/auth/logout', (req: Request, res: Response) => {
    const session = getSessionFromRequest(req);
    if (session) {
      activeSessions.delete(session.token);
    }
    res.json({ success: true });
  });

  // ============================================================================
  // PROTECTED ADMIN DASHBOARD CRUD ROUTES
  // ============================================================================

  app.get('/api/admin/bootstrap', requireAdmin, (_req: Request, res: Response) => {
    const db = loadDatabase();
    const counts = computePlatformCounts(db);
    res.json({
      ...db,
      counts,
    });
  });

  app.put('/api/admin/settings', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const updates = req.body || {};
    db.settings = {
      ...db.settings,
      ...updates,
      updatedAt: new Date().toISOString(),
    };
    saveDatabase(db);
    res.json(db.settings);
  });

  // Notes CRUD
  app.post('/api/admin/notes', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const {
      title,
      category,
      coverUrl,
      accessType,
      published,
      summary,
      bodyText,
      uploadedPdfBase64,
    } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Note title is required.' });
      return;
    }

    const cleanCategory = (category || 'General Studies').trim();
    const cleanTitle = title.trim();
    const now = new Date().toISOString();

    const paragraphs =
      typeof bodyText === 'string' && bodyText.trim().length > 0
        ? bodyText
            .trim()
            .split(/\n+/)
            .map((p: string) => p.trim())
            .filter(Boolean)
        : [
            summary ||
              `Comprehensive study note on ${cleanTitle} prepared for Pakistani competitive examination candidates.`,
          ];

    const newNote: NoteItem = {
      id: `note-${Date.now()}`,
      title: cleanTitle,
      category: cleanCategory,
      coverUrl:
        coverUrl && coverUrl.trim()
          ? coverUrl.trim()
          : createAcademicCoverSvgDataUrl(
              cleanCategory,
              cleanTitle,
              accessType === 'paid' ? 'Premium Study Note' : 'Verified Exam Note',
              accessType === 'paid' ? 'gold' : 'navy'
            ),
      accessType: accessType === 'paid' ? 'paid' : 'free',
      published: Boolean(published),
      summary: (summary || paragraphs[0] || '').slice(0, 260),
      pageCount: 1,
      pages: [
        {
          pageNumber: 1,
          heading: cleanTitle,
          subheading: `${cleanCategory} • EXAMORA PAKISTAN Study Note`,
          paragraphs,
          keyPoints: ['Review key dates, constitutional articles, and core definitions.'],
        },
      ],
      uploadedPdfBase64: uploadedPdfBase64 || undefined,
      createdAt: now,
      updatedAt: now,
    };

    db.notes.unshift(newNote);
    saveDatabase(db);
    res.status(201).json(newNote);
  });

  app.put('/api/admin/notes/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const idx = db.notes.findIndex((n) => n.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Note not found.' });
      return;
    }

    const existing = db.notes[idx];
    const updates = req.body || {};
    const updatedTitle =
      typeof updates.title === 'string' && updates.title.trim()
        ? updates.title.trim()
        : existing.title;
    const updatedCategory =
      typeof updates.category === 'string' && updates.category.trim()
        ? updates.category.trim()
        : existing.category;

    let updatedPages = existing.pages;
    if (typeof updates.bodyText === 'string' && updates.bodyText.trim().length > 0) {
      const paragraphs = updates.bodyText
        .trim()
        .split(/\n+/)
        .map((p: string) => p.trim())
        .filter(Boolean);
      updatedPages = [
        {
          pageNumber: 1,
          heading: updatedTitle,
          subheading: `${updatedCategory} • EXAMORA PAKISTAN Study Note`,
          paragraphs,
          keyPoints: existing.pages?.[0]?.keyPoints || [],
        },
        ...(existing.pages ? existing.pages.slice(1) : []),
      ];
    }

    const updatedNote: NoteItem = {
      ...existing,
      title: updatedTitle,
      category: updatedCategory,
      coverUrl:
        typeof updates.coverUrl === 'string' && updates.coverUrl.trim()
          ? updates.coverUrl.trim()
          : existing.coverUrl,
      accessType:
        updates.accessType === 'paid' || updates.accessType === 'free'
          ? updates.accessType
          : existing.accessType,
      published:
        typeof updates.published === 'boolean' ? updates.published : existing.published,
      summary:
        typeof updates.summary === 'string' ? updates.summary.trim() : existing.summary,
      pages: updatedPages,
      uploadedPdfBase64:
        updates.uploadedPdfBase64 !== undefined
          ? updates.uploadedPdfBase64
          : existing.uploadedPdfBase64,
      updatedAt: new Date().toISOString(),
    };

    db.notes[idx] = updatedNote;
    saveDatabase(db);
    res.json(updatedNote);
  });

  app.delete('/api/admin/notes/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    db.notes = db.notes.filter((n) => n.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Study PDFs CRUD
  app.post('/api/admin/pdfs', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const {
      title,
      category,
      authorOrSource,
      coverUrl,
      accessType,
      published,
      pageCount,
      bodyText,
      uploadedPdfBase64,
    } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Document title is required.' });
      return;
    }

    const cleanTitle = title.trim();
    const cleanCategory = (category || 'CSS / PMS').trim();
    const now = new Date().toISOString();
    const paragraphs =
      typeof bodyText === 'string' && bodyText.trim()
        ? bodyText
            .trim()
            .split(/\n+/)
            .map((p: string) => p.trim())
            .filter(Boolean)
        : [`Full-length study resource: ${cleanTitle} (${cleanCategory}).`];

    const newPdf: StudyPdfItem = {
      id: `pdf-${Date.now()}`,
      title: cleanTitle,
      category: cleanCategory,
      authorOrSource: (authorOrSource || 'EXAMORA Academic Board').trim(),
      coverUrl:
        coverUrl && coverUrl.trim()
          ? coverUrl.trim()
          : createAcademicCoverSvgDataUrl(
              cleanCategory,
              cleanTitle,
              'EXAMORA Study Material PDF',
              'emerald'
            ),
      accessType: accessType === 'paid' ? 'paid' : 'free',
      published: Boolean(published),
      pageCount: Number(pageCount) > 0 ? Number(pageCount) : 1,
      pages: [
        {
          pageNumber: 1,
          heading: cleanTitle,
          subheading: `${cleanCategory} • ${authorOrSource || 'EXAMORA Academic Board'}`,
          paragraphs,
        },
      ],
      uploadedPdfBase64: uploadedPdfBase64 || undefined,
      createdAt: now,
      updatedAt: now,
    };

    db.pdfs.unshift(newPdf);
    saveDatabase(db);
    res.status(201).json(newPdf);
  });

  app.put('/api/admin/pdfs/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const idx = db.pdfs.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'PDF record not found.' });
      return;
    }
    const existing = db.pdfs[idx];
    const updates = req.body || {};

    const updatedPdf: StudyPdfItem = {
      ...existing,
      title:
        typeof updates.title === 'string' && updates.title.trim()
          ? updates.title.trim()
          : existing.title,
      category:
        typeof updates.category === 'string' && updates.category.trim()
          ? updates.category.trim()
          : existing.category,
      authorOrSource:
        typeof updates.authorOrSource === 'string'
          ? updates.authorOrSource.trim()
          : existing.authorOrSource,
      coverUrl:
        typeof updates.coverUrl === 'string' && updates.coverUrl.trim()
          ? updates.coverUrl.trim()
          : existing.coverUrl,
      accessType:
        updates.accessType === 'paid' || updates.accessType === 'free'
          ? updates.accessType
          : existing.accessType,
      published:
        typeof updates.published === 'boolean' ? updates.published : existing.published,
      pageCount:
        Number(updates.pageCount) > 0 ? Number(updates.pageCount) : existing.pageCount,
      uploadedPdfBase64:
        updates.uploadedPdfBase64 !== undefined
          ? updates.uploadedPdfBase64
          : existing.uploadedPdfBase64,
      updatedAt: new Date().toISOString(),
    };

    db.pdfs[idx] = updatedPdf;
    saveDatabase(db);
    res.json(updatedPdf);
  });

  app.delete('/api/admin/pdfs/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    db.pdfs = db.pdfs.filter((p) => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Quizzes CRUD
  app.post('/api/admin/quizzes', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const { title, category, instructions, published, questions } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Quiz title is required.' });
      return;
    }
    const now = new Date().toISOString();
    const newQuiz: QuizCollection = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      category: (category || 'General Knowledge').trim(),
      instructions:
        (instructions || 'Select the correct option for each question.').trim(),
      published: Boolean(published),
      questions: Array.isArray(questions) ? questions : [],
      createdAt: now,
      updatedAt: now,
    };
    db.quizzes.unshift(newQuiz);
    saveDatabase(db);
    res.status(201).json(newQuiz);
  });

  app.put('/api/admin/quizzes/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const idx = db.quizzes.findIndex((q) => q.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Quiz not found.' });
      return;
    }
    const existing = db.quizzes[idx];
    const updates = req.body || {};

    const updatedQuiz: QuizCollection = {
      ...existing,
      title:
        typeof updates.title === 'string' && updates.title.trim()
          ? updates.title.trim()
          : existing.title,
      category:
        typeof updates.category === 'string' && updates.category.trim()
          ? updates.category.trim()
          : existing.category,
      instructions:
        typeof updates.instructions === 'string'
          ? updates.instructions.trim()
          : existing.instructions,
      published:
        typeof updates.published === 'boolean' ? updates.published : existing.published,
      questions: Array.isArray(updates.questions) ? updates.questions : existing.questions,
      updatedAt: new Date().toISOString(),
    };

    db.quizzes[idx] = updatedQuiz;
    saveDatabase(db);
    res.json(updatedQuiz);
  });

  app.delete('/api/admin/quizzes/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    db.quizzes = db.quizzes.filter((q) => q.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Past Papers CRUD
  app.post('/api/admin/past-papers', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const {
      title,
      examName,
      year,
      subject,
      coverUrl,
      accessType,
      published,
      bodyText,
      uploadedPdfBase64,
    } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Past paper title is required.' });
      return;
    }

    const cleanTitle = title.trim();
    const cleanExam = (['CSS', 'PMS', 'FPSC', 'PPSC', 'NTS', 'Other'].includes(examName)
      ? examName
      : 'CSS') as PastPaperItem['examName'];
    const cleanYear = Number(year) || 2025;
    const cleanSubject = (subject || 'General Paper').trim();
    const now = new Date().toISOString();

    const paragraphs =
      typeof bodyText === 'string' && bodyText.trim()
        ? bodyText
            .trim()
            .split(/\n+/)
            .map((p: string) => p.trim())
            .filter(Boolean)
        : [`Past examination paper for ${cleanExam} (${cleanYear}) — ${cleanSubject}.`];

    const newPaper: PastPaperItem = {
      id: `paper-${Date.now()}`,
      title: cleanTitle,
      examName: cleanExam,
      year: cleanYear,
      subject: cleanSubject,
      coverUrl:
        coverUrl && coverUrl.trim()
          ? coverUrl.trim()
          : createAcademicCoverSvgDataUrl(
              `${cleanExam} Past Paper`,
              cleanTitle,
              `${cleanExam} ${cleanYear} • ${cleanSubject}`,
              'royal'
            ),
      accessType: accessType === 'paid' ? 'paid' : 'free',
      published: Boolean(published),
      pageCount: 1,
      pages: [
        {
          pageNumber: 1,
          heading: cleanTitle,
          subheading: `${cleanExam} Competitive Examination (${cleanYear}) • ${cleanSubject}`,
          paragraphs,
        },
      ],
      uploadedPdfBase64: uploadedPdfBase64 || undefined,
      createdAt: now,
      updatedAt: now,
    };

    db.pastPapers.unshift(newPaper);
    saveDatabase(db);
    res.status(201).json(newPaper);
  });

  app.put('/api/admin/past-papers/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const idx = db.pastPapers.findIndex((p) => p.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Past paper not found.' });
      return;
    }
    const existing = db.pastPapers[idx];
    const updates = req.body || {};

    const updatedPaper: PastPaperItem = {
      ...existing,
      title:
        typeof updates.title === 'string' && updates.title.trim()
          ? updates.title.trim()
          : existing.title,
      examName: updates.examName || existing.examName,
      year: Number(updates.year) || existing.year,
      subject:
        typeof updates.subject === 'string' ? updates.subject.trim() : existing.subject,
      coverUrl:
        typeof updates.coverUrl === 'string' && updates.coverUrl.trim()
          ? updates.coverUrl.trim()
          : existing.coverUrl,
      accessType:
        updates.accessType === 'paid' || updates.accessType === 'free'
          ? updates.accessType
          : existing.accessType,
      published:
        typeof updates.published === 'boolean' ? updates.published : existing.published,
      uploadedPdfBase64:
        updates.uploadedPdfBase64 !== undefined
          ? updates.uploadedPdfBase64
          : existing.uploadedPdfBase64,
      updatedAt: new Date().toISOString(),
    };

    db.pastPapers[idx] = updatedPaper;
    saveDatabase(db);
    res.json(updatedPaper);
  });

  app.delete('/api/admin/past-papers/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    db.pastPapers = db.pastPapers.filter((p) => p.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Jobs CRUD
  app.post('/api/admin/jobs', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const {
      title,
      organization,
      location,
      qualification,
      publicationDate,
      deadline,
      summary,
      officialUrl,
      published,
    } = req.body || {};

    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Job title is required.' });
      return;
    }
    const now = new Date().toISOString();
    const newJob: JobListing = {
      id: `job-${Date.now()}`,
      title: title.trim(),
      organization: (organization || 'Public Service Commission').trim(),
      location: (location || 'Pakistan').trim(),
      qualification: (qualification || 'BS / Master (16 Years)').trim(),
      publicationDate: publicationDate || now.slice(0, 10),
      deadline: deadline ? deadline.trim() : '',
      summary: (summary || '').trim(),
      officialUrl: (officialUrl || '').trim(),
      published: Boolean(published),
      createdAt: now,
      updatedAt: now,
    };

    db.jobs.unshift(newJob);
    saveDatabase(db);
    res.status(201).json(newJob);
  });

  app.put('/api/admin/jobs/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const idx = db.jobs.findIndex((j) => j.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Job listing not found.' });
      return;
    }
    const existing = db.jobs[idx];
    const updates = req.body || {};

    const updatedJob: JobListing = {
      ...existing,
      title:
        typeof updates.title === 'string' && updates.title.trim()
          ? updates.title.trim()
          : existing.title,
      organization:
        typeof updates.organization === 'string' && updates.organization.trim()
          ? updates.organization.trim()
          : existing.organization,
      location:
        typeof updates.location === 'string' ? updates.location.trim() : existing.location,
      qualification:
        typeof updates.qualification === 'string'
          ? updates.qualification.trim()
          : existing.qualification,
      publicationDate:
        typeof updates.publicationDate === 'string'
          ? updates.publicationDate
          : existing.publicationDate,
      deadline:
        typeof updates.deadline === 'string' ? updates.deadline.trim() : existing.deadline,
      summary:
        typeof updates.summary === 'string' ? updates.summary.trim() : existing.summary,
      officialUrl:
        typeof updates.officialUrl === 'string'
          ? updates.officialUrl.trim()
          : existing.officialUrl,
      published:
        typeof updates.published === 'boolean' ? updates.published : existing.published,
      updatedAt: new Date().toISOString(),
    };

    db.jobs[idx] = updatedJob;
    saveDatabase(db);
    res.json(updatedJob);
  });

  app.delete('/api/admin/jobs/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    db.jobs = db.jobs.filter((j) => j.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Announcements CRUD
  app.post('/api/admin/announcements', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const { typeBadge, title, publicationDate, targetPage, published } = req.body || {};
    if (!title || typeof title !== 'string' || !title.trim()) {
      res.status(400).json({ error: 'Announcement title is required.' });
      return;
    }
    const now = new Date().toISOString();
    const newAnn: AnnouncementItem = {
      id: `ann-${Date.now()}`,
      typeBadge: typeBadge || 'Note',
      title: title.trim(),
      publicationDate: publicationDate || '23 Oct 2026',
      targetPage: targetPage || '/notes',
      published: Boolean(published),
      createdAt: now,
      updatedAt: now,
    };
    db.announcements.unshift(newAnn);
    saveDatabase(db);
    res.status(201).json(newAnn);
  });

  app.put('/api/admin/announcements/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    const idx = db.announcements.findIndex((a) => a.id === req.params.id);
    if (idx === -1) {
      res.status(404).json({ error: 'Announcement not found.' });
      return;
    }
    const existing = db.announcements[idx];
    const updates = req.body || {};
    const updatedAnn: AnnouncementItem = {
      ...existing,
      typeBadge: updates.typeBadge || existing.typeBadge,
      title:
        typeof updates.title === 'string' && updates.title.trim()
          ? updates.title.trim()
          : existing.title,
      publicationDate:
        typeof updates.publicationDate === 'string'
          ? updates.publicationDate
          : existing.publicationDate,
      targetPage:
        typeof updates.targetPage === 'string' ? updates.targetPage : existing.targetPage,
      published:
        typeof updates.published === 'boolean' ? updates.published : existing.published,
      updatedAt: new Date().toISOString(),
    };
    db.announcements[idx] = updatedAnn;
    saveDatabase(db);
    res.json(updatedAnn);
  });

  app.delete('/api/admin/announcements/:id', requireAdmin, (req: Request, res: Response) => {
    const db = loadDatabase();
    db.announcements = db.announcements.filter((a) => a.id !== req.params.id);
    saveDatabase(db);
    res.json({ success: true });
  });

  // Vite Middleware (Development) or Static Asset Serving (Production)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const PORT = Number(process.env.PORT) || 3000;
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`EXAMORA PAKISTAN server listening on http://0.0.0.0:${PORT}`);
  });
}

startServer();
