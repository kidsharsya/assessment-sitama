// ============================================
// Exam Session Types
// ============================================

import type { Category } from './bank-soal';

// ============================================
// Session Category (referensi ke kategori soal)
// ============================================
export interface SessionCategory {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  orderIndex: number;
}

// ============================================
// Exam Session Types
// ============================================
export type SessionStatus = 'upcoming' | 'ongoing' | 'completed';

export interface ExamSession {
  id: string;
  name: string;
  categories: SessionCategory[];
  date: string; // YYYY-MM-DD
  startTime: string; // ISO datetime
  endTime: string; // ISO datetime
  duration: number; // minutes
  accessToken: string;
  isRandomPacket: boolean;
  isRandomQuestions: boolean;
  isRandomAnswers: boolean;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Form Input Types
// ============================================
export interface ExamSessionFormInput {
  name: string;
  categoryIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isRandomPacket: boolean;
  isRandomQuestions: boolean;
  isRandomAnswers: boolean;
}

// ============================================
// Delete Modal State
// ============================================
export interface SessionDeleteModalState {
  isOpen: boolean;
  session: ExamSession | null;
}
