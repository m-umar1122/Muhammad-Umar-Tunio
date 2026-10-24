import test from 'node:test';
import assert from 'node:assert/strict';
import {
  canAccessDocument,
  sanitizeQuizForPublic,
  gradeQuizSubmission,
  buildWhatsAppPurchaseLink,
  isJobExpired,
  computePlatformCounts,
  type QuizCollection,
} from './examoraLogic';

test('canAccessDocument enforces free vs paid and published vs draft policies', () => {
  assert.deepEqual(canAccessDocument(null, false), {
    allowed: false,
    reason: 'not_found',
  });

  // Unpublished note is blocked for public visitors, allowed for admin
  assert.deepEqual(
    canAccessDocument({ published: false, accessType: 'free' }, false),
    { allowed: false, reason: 'unpublished' }
  );
  assert.deepEqual(
    canAccessDocument({ published: false, accessType: 'free' }, true),
    { allowed: true }
  );

  // Paid published note is blocked for public visitors, allowed for admin
  assert.deepEqual(
    canAccessDocument({ published: true, accessType: 'paid' }, false),
    { allowed: false, reason: 'paid_restricted' }
  );
  assert.deepEqual(
    canAccessDocument({ published: true, accessType: 'paid' }, true),
    { allowed: true }
  );

  // Free published note is allowed for public visitors
  assert.deepEqual(
    canAccessDocument({ published: true, accessType: 'free' }, false),
    { allowed: true }
  );
});

test('sanitizeQuizForPublic strips correctIndex and explanation from questions', () => {
  const rawQuiz: QuizCollection = {
    id: 'q-1',
    title: 'Daily CSS GK Quiz',
    category: 'General Knowledge',
    instructions: 'Select the best option.',
    published: true,
    createdAt: '2026-10-20T00:00:00Z',
    updatedAt: '2026-10-20T00:00:00Z',
    questions: [
      {
        id: 'q1',
        questionText: "Who is known as the 'Poet of the East'?",
        options: ['Faiz Ahmed Faiz', 'Allama Muhammad Iqbal', 'Mirza Ghalib', 'Hafeez Jalandhari'],
        correctIndex: 1,
        explanation: 'Allama Muhammad Iqbal is revered as Shaykh-ul-Mashriq (Poet of the East).',
      },
    ],
  };

  const publicQuiz = sanitizeQuizForPublic(rawQuiz);
  assert.equal(publicQuiz.questions[0].correctIndex, undefined);
  assert.equal(publicQuiz.questions[0].explanation, undefined);
  assert.equal(publicQuiz.questions[0].questionText, "Who is known as the 'Poet of the East'?");
});

test('gradeQuizSubmission calculates accurate scores and prevents duplicate scoring', () => {
  const questions = [
    {
      id: 'q1',
      questionText: "Who is known as the 'Poet of the East'?",
      options: ['Faiz Ahmed Faiz', 'Allama Muhammad Iqbal', 'Mirza Ghalib', 'Hafeez Jalandhari'] as [string, string, string, string],
      correctIndex: 1,
      explanation: 'Allama Iqbal is known as the Poet of the East.',
    },
    {
      id: 'q1', // Duplicate ID should be ignored
      questionText: "Who is known as the 'Poet of the East'?",
      options: ['Faiz Ahmed Faiz', 'Allama Muhammad Iqbal', 'Mirza Ghalib', 'Hafeez Jalandhari'] as [string, string, string, string],
      correctIndex: 1,
      explanation: 'Duplicate entry.',
    },
    {
      id: 'q2',
      questionText: 'When was the Lahore Resolution passed?',
      options: ['14 August 1947', '23 March 1940', '3 June 1947', '11 August 1947'] as [string, string, string, string],
      correctIndex: 1,
      explanation: 'Passed on 23 March 1940 at Minto Park, Lahore.',
    },
  ];

  const summary = gradeQuizSubmission('quiz-pak', questions, {
    q1: 1,
    q2: 0,
  });

  assert.equal(summary.totalQuestions, 2);
  assert.equal(summary.answeredCount, 2);
  assert.equal(summary.score, 1);
  assert.equal(summary.percentage, 50);
  assert.equal(summary.results[0].isCorrect, true);
  assert.equal(summary.results[1].isCorrect, false);
  assert.equal(summary.results[1].correctIndex, 1);
});

test('buildWhatsAppPurchaseLink normalizes Pakistani numbers and prefills note title', () => {
  const validResult = buildWhatsAppPurchaseLink(
    '0300-1234567',
    'CSS Constitutional History Master Notes',
    'Paid Note'
  );
  assert.equal(validResult.valid, true);
  assert.ok(validResult.url.startsWith('https://wa.me/923001234567?text='));
  assert.ok(
    decodeURIComponent(validResult.url).includes('CSS Constitutional History Master Notes')
  );

  const missingResult = buildWhatsAppPurchaseLink('', 'Sample Paid Note');
  assert.equal(missingResult.valid, false);
  assert.equal(missingResult.url, '');
});

test('isJobExpired accurately checks deadline dates and handles open-ended jobs', () => {
  assert.equal(isJobExpired('', '2026-10-23T12:00:00Z'), false);
  assert.equal(isJobExpired('2026-11-05', '2026-10-23T12:00:00Z'), false);
  assert.equal(isJobExpired('2026-10-15', '2026-10-23T12:00:00Z'), true);
});

test('computePlatformCounts aggregates only published and active items', () => {
  const counts = computePlatformCounts(
    {
      notes: [
        {
          id: 'n1',
          title: 'Note 1',
          category: 'Pakistan Studies',
          coverUrl: '',
          accessType: 'free',
          published: true,
          summary: '',
          pageCount: 4,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'n2',
          title: 'Draft Note',
          category: 'Science',
          coverUrl: '',
          accessType: 'paid',
          published: false,
          summary: '',
          pageCount: 6,
          createdAt: '',
          updatedAt: '',
        },
      ],
      pdfs: [],
      quizzes: [
        {
          id: 'qz1',
          title: 'Daily Quiz',
          category: 'GK',
          instructions: '',
          published: true,
          createdAt: '',
          updatedAt: '',
          questions: [
            {
              id: 'q1',
              questionText: 'Q1?',
              options: ['A', 'B', 'C', 'D'],
              correctIndex: 0,
            },
          ],
        },
      ],
      pastPapers: [],
      jobs: [
        {
          id: 'j1',
          title: 'Active Job',
          organization: 'PPSC',
          location: 'Punjab',
          qualification: 'BS',
          publicationDate: '2026-10-20',
          deadline: '2026-11-05',
          summary: '',
          officialUrl: '',
          published: true,
          createdAt: '',
          updatedAt: '',
        },
        {
          id: 'j2',
          title: 'Expired Job',
          organization: 'FPSC',
          location: 'Islamabad',
          qualification: 'BS',
          publicationDate: '2026-09-01',
          deadline: '2026-10-01',
          summary: '',
          officialUrl: '',
          published: true,
          createdAt: '',
          updatedAt: '',
        },
      ],
      announcements: [],
    },
    '2026-10-23T12:00:00Z'
  );

  assert.equal(counts.publishedNotesCount, 1);
  assert.equal(counts.publishedQuizzesCount, 1);
  assert.equal(counts.totalPublishedQuestionsCount, 1);
  assert.equal(counts.publishedJobsCount, 2);
  assert.equal(counts.activeJobListingsCount, 1);
});
