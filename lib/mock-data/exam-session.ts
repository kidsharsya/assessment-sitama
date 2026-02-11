import type { ExamSession, SessionCategory, ExamSessionFormInput } from '@/types/exam-session';
import { mockCategories } from './bank-soal';

// ============================================
// Helper Functions
// ============================================

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

function createSessionCategories(categoryIds: string[]): SessionCategory[] {
  return categoryIds
    .map((id, index) => {
      const category = mockCategories.find((c) => c.id === id);
      if (!category) return null;
      return {
        categoryId: category.id,
        categoryCode: category.code,
        categoryName: category.name,
        orderIndex: index + 1,
      };
    })
    .filter((c): c is SessionCategory => c !== null);
}

// ============================================
// Mock Exam Sessions - Demo Majelis Tabligh Muhammadiyah
// ============================================

let mockSessions: ExamSession[] = [
  {
    id: 'session-1',
    name: 'Sesi Sertifikasi Mubaligh 1',
    categories: createSessionCategories(['cat-aik', 'cat-tbq']),
    date: '2026-02-01',
    startTime: '2026-02-01T08:00:00',
    endTime: '2026-02-01T10:00:00',
    duration: 120,
    accessToken: 'CERT01',
    isRandomPacket: true,
    isRandomQuestions: true,
    isRandomAnswers: true,
    createdAt: '2026-01-20T10:00:00Z',
    updatedAt: '2026-01-20T10:00:00Z',
  },
  {
    id: 'session-2',
    name: 'Sesi Sertifikasi Mubaligh 2',
    categories: createSessionCategories(['cat-aik', 'cat-tbq']),
    date: '2026-02-15',
    startTime: '2026-02-15T08:00:00',
    endTime: '2026-02-15T10:00:00',
    duration: 120,
    accessToken: 'CERT02',
    isRandomPacket: true,
    isRandomQuestions: true,
    isRandomAnswers: false,
    createdAt: '2026-01-25T10:00:00Z',
    updatedAt: '2026-01-25T10:00:00Z',
  },
];

// ============================================
// CRUD Functions
// ============================================

export function getSessions(): ExamSession[] {
  return [...mockSessions].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
}

export function getSessionById(id: string): ExamSession | undefined {
  return mockSessions.find((s) => s.id === id);
}

export function createSession(input: ExamSessionFormInput): ExamSession {
  const now = new Date().toISOString();
  const newSession: ExamSession = {
    id: `session-${Date.now()}`,
    name: input.name,
    categories: createSessionCategories(input.categoryIds),
    date: input.date,
    startTime: `${input.date}T${input.startTime}:00`,
    endTime: `${input.date}T${input.endTime}:00`,
    duration: input.duration,
    accessToken: generateToken(),
    isRandomPacket: input.isRandomPacket,
    isRandomQuestions: input.isRandomQuestions,
    isRandomAnswers: input.isRandomAnswers,
    createdAt: now,
    updatedAt: now,
  };
  mockSessions.push(newSession);
  return newSession;
}

export function updateSession(id: string, input: ExamSessionFormInput): ExamSession | undefined {
  const index = mockSessions.findIndex((s) => s.id === id);
  if (index === -1) return undefined;

  const updated: ExamSession = {
    ...mockSessions[index],
    name: input.name,
    categories: createSessionCategories(input.categoryIds),
    date: input.date,
    startTime: `${input.date}T${input.startTime}:00`,
    endTime: `${input.date}T${input.endTime}:00`,
    duration: input.duration,
    isRandomPacket: input.isRandomPacket,
    isRandomQuestions: input.isRandomQuestions,
    isRandomAnswers: input.isRandomAnswers,
    updatedAt: new Date().toISOString(),
  };
  mockSessions[index] = updated;
  return updated;
}

export function deleteSession(id: string): boolean {
  const index = mockSessions.findIndex((s) => s.id === id);
  if (index === -1) return false;
  mockSessions.splice(index, 1);
  return true;
}

export function regenerateToken(id: string): ExamSession | undefined {
  const index = mockSessions.findIndex((s) => s.id === id);
  if (index === -1) return undefined;

  mockSessions[index] = {
    ...mockSessions[index],
    accessToken: generateToken(),
    updatedAt: new Date().toISOString(),
  };
  return mockSessions[index];
}

export function resetMockSessions(): void {
  mockSessions = [
    {
      id: 'session-1',
      name: 'Sesi Sertifikasi Mubaligh 1',
      categories: createSessionCategories(['cat-aik', 'cat-tbq']),
      date: '2026-02-01',
      startTime: '2026-02-01T08:00:00',
      endTime: '2026-02-01T10:00:00',
      duration: 120,
      accessToken: 'CERT01',
      isRandomPacket: true,
      isRandomQuestions: true,
      isRandomAnswers: true,
      createdAt: '2026-01-20T10:00:00Z',
      updatedAt: '2026-01-20T10:00:00Z',
    },
    {
      id: 'session-2',
      name: 'Sesi Sertifikasi Mubaligh 2',
      categories: createSessionCategories(['cat-aik', 'cat-tbq']),
      date: '2026-02-15',
      startTime: '2026-02-15T08:00:00',
      endTime: '2026-02-15T10:00:00',
      duration: 120,
      accessToken: 'CERT02',
      isRandomPacket: true,
      isRandomQuestions: true,
      isRandomAnswers: false,
      createdAt: '2026-01-25T10:00:00Z',
      updatedAt: '2026-01-25T10:00:00Z',
    },
  ];
}

// Export categories for use in forms
export function getAvailableCategories() {
  return mockCategories.filter((c) => c.isActive);
}
