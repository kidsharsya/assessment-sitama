// ============================================
// Hasil Ujian (Exam Result) Types
// ============================================

// ============================================
// Status Types
// ============================================
export type ExamResultStatus = 'LULUS' | 'TIDAK LULUS';

// ============================================
// Category Score Types (dari API leaderboard)
// ============================================
export interface CategoryScore {
  categoryCode: string;
  categoryName: string;
  score: number;
  maxScore: number;
  passingGrade: number;
  isPassed: boolean;
  status: ExamResultStatus;
}

// ============================================
// Leaderboard API Response Types
// ============================================
export interface LeaderboardParticipant {
  rank: number;
  id: string;
  name: string;
  categories: CategoryScore[];
}

export interface LeaderboardPagination {
  currentPage: number;
  totalPages: number;
  totalElements: number;
  size: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface LeaderboardApiResponse {
  success: boolean;
  code: number;
  data: {
    success: boolean;
    message: string;
    data: {
      participants: LeaderboardParticipant[];
      pagination: LeaderboardPagination;
    };
  };
}

// ============================================
// Statistics Types (dihitung di client)
// ============================================
export interface ExamResultStats {
  total: number;
  lulus: number;
  tidakLulus: number;
  persentaseKelulusan: number;
}
