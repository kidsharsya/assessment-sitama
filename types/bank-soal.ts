// ============================================
// Bank Soal Types
// ============================================

// Label untuk pilihan jawaban
export type OptionLabel = 'A' | 'B' | 'C' | 'D' | 'E';

// ============================================
// Question (Soal) Types
// ============================================
export interface QuestionOption {
  id: string;
  label: OptionLabel;
  text: string;
  imagePath?: string;
}

export interface Question {
  id: string;
  packetId: string;
  questionText: string;
  imagePath?: string;
  options: QuestionOption[];
  correctAnswer: OptionLabel;
  score: number;
  order: number;
  createdAt: string;
  updatedAt: string;
}

// ============================================
// Packet (Paket Soal) Types
// ============================================
export interface Packet {
  id: string;
  categoryId: string;
  name: string;
  code: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PacketWithQuestions extends Packet {
  questions: Question[];
  totalQuestions: number;
  totalScore: number;
}

// ============================================
// Category (Kategori Soal) Types
// ============================================
export interface Category {
  id: string;
  name: string;
  code: string;
  description: string;
  passingGrade: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryWithPackets extends Category {
  packets: PacketWithQuestions[];
  totalPackets: number;
  totalQuestions: number;
  totalScore: number;
}

// ============================================
// Form Input Types
// ============================================
export interface CategoryFormInput {
  name: string;
  code: string;
  description: string;
  passingGrade: number;
  isActive: boolean;
}

export interface PacketFormInput {
  name: string;
  code: string;
  isActive: boolean;
}

export interface QuestionOptionInput {
  text: string;
  imagePath?: string | null;
}

export interface QuestionFormInput {
  questionText: string;
  imagePath: File | string | null;
  options: Record<OptionLabel, QuestionOptionInput>;
  correctAnswer: OptionLabel;
  score: number;
}

// ============================================
// View Level Type
// ============================================
export type ViewLevel = 'category' | 'packet' | 'question';

// ============================================
// Delete Modal State
// ============================================
export interface DeleteModalState {
  isOpen: boolean;
  type: 'category' | 'packet' | 'question';
  id: string;
  title: string;
  message: string;
}
