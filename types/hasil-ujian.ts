// ============================================
// Hasil Ujian (Exam Result) Types
// ============================================

// ============================================
// Status Types
// ============================================
export type ExamResultStatus = 'LULUS' | 'TIDAK LULUS';

// ============================================
// Category Score Types
// ============================================
export interface CategoryScore {
  categoryCode: string;
  categoryName: string;
  score: number;
  maxScore: number;
  passingGrade: number;
  isPassed: boolean;
}

// ============================================
// Participant Result Types
// ============================================
export interface ParticipantResult {
  id: string;
  sessionId: string;
  participantId: string;
  participantName: string;
  registrationNumber: string;
  categoryScores: Record<string, CategoryScore>;
  totalScore: number;
  maxScore: number;
  status: ExamResultStatus;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Leaderboard Types
// ============================================
export interface LeaderboardRow {
  ranking: number;
  participantId: string;
  participantName: string;
  registrationNumber: string;
  categoryScores: Record<string, CategoryScore>;
  totalScore: number;
  maxScore: number;
  status: ExamResultStatus;
}

export interface LeaderboardData {
  sessionId: string;
  sessionName: string;
  dynamicColumns: string[]; // Category codes for dynamic columns
  rows: LeaderboardRow[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ============================================
// Statistics Types
// ============================================
export interface ExamResultStats {
  total: number;
  lulus: number;
  tidakLulus: number;
  persentaseKelulusan: number;
}

// ============================================
// Session with Results
// ============================================
export interface SessionWithResults {
  sessionId: string;
  sessionName: string;
  sessionDate: string;
  isPublished: boolean;
  stats: ExamResultStats;
}
