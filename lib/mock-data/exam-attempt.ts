import type { ExamAttempt, ExamDisplaySoal, AnswerRecord, ExamCategory } from '@/types/exam';
import type { Question, OptionLabel } from '@/types/bank-soal';
import { getPacketsByCategoryId } from './bank-soal';

// ============================================
// Current Exam Attempt State
// ============================================

let currentAttempt: ExamAttempt | null = null;

// ============================================
// Session Token to Session Mapping
// ============================================

interface SessionConfig {
  id: string;
  name: string;
  categoryIds: string[];
  duration: number; // minutes
}

// Pre-configured sessions - Demo Majelis Tabligh Muhammadiyah
const sessionConfigs: Record<string, SessionConfig> = {
  CERT01: {
    id: 'session-1',
    name: 'Sesi Sertifikasi Mubaligh 1',
    categoryIds: ['cat-aik', 'cat-tbq'],
    duration: 120,
  },
  CERT02: {
    id: 'session-2',
    name: 'Sesi Sertifikasi Mubaligh 2',
    categoryIds: ['cat-aik', 'cat-tbq'],
    duration: 120,
  },
  // Demo token for testing
  DEMO01: {
    id: 'session-demo',
    name: 'Demo Sertifikasi Mubaligh',
    categoryIds: ['cat-aik', 'cat-tbq'],
    duration: 30,
  },
};

// Category code mapping
const categoryCodeMap: Record<string, { code: string; name: string }> = {
  'cat-aik': { code: 'AIK', name: 'Al Islam Kemuhammadiyahan' },
  'cat-tbq': { code: 'TBQ', name: 'Baca Tulis Quran' },
};

// ============================================
// Helper Functions
// ============================================

function generateAttemptId(): string {
  return `attempt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function convertQuestionToDisplay(question: Question, number: number, categoryCode: string): ExamDisplaySoal {
  return {
    questionId: question.id,
    number,
    text: question.questionText,
    imagePath: question.imagePath,
    options: question.options.map((opt) => ({
      code: opt.label as OptionLabel,
      text: opt.text,
      imagePath: opt.imagePath,
    })),
    categoryCode,
  };
}

// ============================================
// Exam Functions
// ============================================

/**
 * Validate token and start exam session
 */
export function validateTokenAndStartExam(token: string): ExamAttempt | null {
  const upperToken = token.toUpperCase().trim();
  const sessionConfig = sessionConfigs[upperToken];

  if (!sessionConfig) {
    return null;
  }

  // Build questions from all categories
  const allQuestions: ExamDisplaySoal[] = [];
  const categories: ExamCategory[] = [];
  let questionNumber = 1;

  for (const categoryId of sessionConfig.categoryIds) {
    const catInfo = categoryCodeMap[categoryId];
    if (!catInfo) continue;

    categories.push({
      categoryId,
      categoryCode: catInfo.code,
      categoryName: catInfo.name,
      isCompleted: false,
    });

    // Get packets for this category
    const packets = getPacketsByCategoryId(categoryId);

    // Get questions from first active packet
    const activePacket = packets.find((p) => p.isActive && p.questions.length > 0);
    if (activePacket) {
      for (const question of activePacket.questions) {
        allQuestions.push(convertQuestionToDisplay(question, questionNumber, catInfo.code));
        questionNumber++;
      }
    }
  }

  // If no questions found, return null
  if (allQuestions.length === 0) {
    return null;
  }

  const now = new Date();
  const endTime = new Date(now.getTime() + sessionConfig.duration * 60 * 1000);

  // Create attempt
  const attempt: ExamAttempt = {
    attemptId: generateAttemptId(),
    sessionId: sessionConfig.id,
    sessionName: sessionConfig.name,
    participantId: 'participant-1',
    participantName: 'Muhammad Rizki',
    categories,
    questions: allQuestions,
    answers: allQuestions.map((q) => ({
      questionId: q.questionId,
      answerCode: null,
      notSure: false,
    })),
    durationSeconds: sessionConfig.duration * 60,
    startedAt: now.toISOString(),
    endTime: endTime.toISOString(),
    status: 'IN_PROGRESS',
  };

  // Store current attempt
  currentAttempt = attempt;

  return attempt;
}

/**
 * Get current exam attempt
 */
export function getCurrentAttempt(): ExamAttempt | null {
  return currentAttempt;
}

/**
 * Get question by index
 */
export function getQuestionByIndex(index: number): ExamDisplaySoal | null {
  if (!currentAttempt || index < 0 || index >= currentAttempt.questions.length) {
    return null;
  }
  return currentAttempt.questions[index];
}

/**
 * Get answer for a question
 */
export function getAnswer(questionId: string): AnswerRecord | null {
  if (!currentAttempt) return null;
  return currentAttempt.answers.find((a) => a.questionId === questionId) || null;
}

/**
 * Submit answer for a question
 */
export function submitAnswer(questionId: string, answerCode: string, notSure: boolean): boolean {
  if (!currentAttempt) return false;

  const index = currentAttempt.answers.findIndex((a) => a.questionId === questionId);
  if (index === -1) return false;

  currentAttempt.answers[index] = {
    questionId,
    answerCode,
    notSure,
  };

  return true;
}

/**
 * Toggle not sure flag for a question
 */
export function toggleNotSure(questionId: string): boolean {
  if (!currentAttempt) return false;

  const index = currentAttempt.answers.findIndex((a) => a.questionId === questionId);
  if (index === -1) return false;

  currentAttempt.answers[index] = {
    ...currentAttempt.answers[index],
    notSure: !currentAttempt.answers[index].notSure,
  };

  return true;
}

/**
 * Get category index for a question index
 */
export function getCategoryIndex(questionIndex: number): number {
  if (!currentAttempt || questionIndex < 0 || questionIndex >= currentAttempt.questions.length) {
    return 0;
  }

  const question = currentAttempt.questions[questionIndex];
  return currentAttempt.categories.findIndex((c) => c.categoryCode === question.categoryCode);
}

/**
 * Get exam statistics
 */
export function getExamStats(): { total: number; answered: number; marked: number; unanswered: number } {
  if (!currentAttempt) {
    return { total: 0, answered: 0, marked: 0, unanswered: 0 };
  }

  const total = currentAttempt.answers.length;
  const answered = currentAttempt.answers.filter((a) => a.answerCode !== null).length;
  const marked = currentAttempt.answers.filter((a) => a.notSure).length;
  const unanswered = total - answered;

  return { total, answered, marked, unanswered };
}

/**
 * Submit exam
 */
export function submitExam(): boolean {
  if (!currentAttempt) return false;

  currentAttempt.status = 'SUBMITTED';
  return true;
}

/**
 * Clear current attempt
 */
export function clearAttempt(): void {
  currentAttempt = null;
}

/**
 * Check if token is valid
 */
export function isTokenValid(token: string): boolean {
  const upperToken = token.toUpperCase().trim();
  return upperToken in sessionConfigs;
}
