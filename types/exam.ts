// ============================================
// Exam Types for User Exam Taking
// ============================================

import type { OptionLabel } from './bank-soal';

// ============================================
// Exam Option and Question Display Types
// ============================================
export interface ExamOption {
  code: OptionLabel;
  text: string;
  imagePath?: string;
}

export interface ExamDisplaySoal {
  questionId: string;
  number: number;
  text: string;
  imagePath?: string;
  options: ExamOption[];
  categoryCode: string;
}

// ============================================
// Answer Status Types
// ============================================
export interface JawabanStatus {
  soalId: number;
  jawaban: string | null;
  ditandai: boolean;
}

export interface AnswerRecord {
  questionId: string;
  answerCode: string | null;
  notSure: boolean;
}

// ============================================
// Exam Category Types
// ============================================
export interface ExamCategory {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  isCompleted: boolean;
}

// ============================================
// Exam Attempt Types
// ============================================
export interface ExamAttempt {
  attemptId: string;
  sessionId: string;
  sessionName: string;
  participantId: string;
  participantName: string;
  categories: ExamCategory[];
  questions: ExamDisplaySoal[];
  answers: AnswerRecord[];
  durationSeconds: number;
  startedAt: string;
  endTime: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
}

// ============================================
// Exam Result Types
// ============================================
export interface ExamResult {
  totalSoal: number;
  soalDijawab: number;
  soalDitandai: number;
  soalBelum: number;
}

// ============================================
// Exam Stats Types
// ============================================
export interface ExamStats {
  total: number;
  answered: number;
  marked: number;
  unanswered: number;
}
