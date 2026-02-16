// ============================================
// Exam Types for User Exam Taking
// ============================================

// ============================================
// Exam Option and Question Display Types
// ============================================
export interface ExamOption {
  code: string;
  text: string;
  imagePath?: string | null;
}

export interface ExamDisplaySoal {
  questionId: string;
  number: number;
  text: string;
  imagePath?: string | null;
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
  number: number;
  answerCode: string | null;
  notSure: boolean;
}

// ============================================
// Exam Category Types (from Manifest)
// ============================================
export interface ExamCategory {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  passingGrade: number;
  questionIds: string[]; // ordered list of questionIds in this category
}

// ============================================
// Manifest Question Entry (lightweight, no content)
// ============================================
export interface ManifestQuestionEntry {
  number: number;
  questionId: string;
  categoryCode: string;
  optionShuffleOrder: number[];
}

// ============================================
// Exam Session State (built from start + manifest + answer status)
// ============================================
export interface ExamSession {
  attemptId: string;
  status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
  startTime: string;
  endTime: string;
  durationMinutes: number;
  categories: ExamCategory[];
  /** Flat ordered list of all questions (from manifest) */
  questions: ManifestQuestionEntry[];
  /** Answer statuses indexed by questionId */
  answers: Map<string, AnswerRecord>;
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
