import type { ParticipantResult, LeaderboardData, LeaderboardRow, ExamResultStats, ExamResultStatus, CategoryScore } from '@/types/hasil-ujian';
import { getSessionById } from './exam-session';

// ============================================
// Helper Functions
// ============================================

function generateId(prefix: string): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function generateRegistrationNumber(index: number): string {
  return `MBL-2026-${String(index + 1).padStart(4, '0')}`;
}

// Generate random score with bias towards passing
function generateScore(maxScore: number, passingGrade: number): { score: number; isPassed: boolean } {
  // 70% chance to pass
  const shouldPass = Math.random() < 0.7;
  let score: number;

  if (shouldPass) {
    // Score between passing grade and max score
    score = Math.floor(Math.random() * (maxScore - passingGrade + 1)) + passingGrade;
  } else {
    // Score between 0 and passing grade - 1
    score = Math.floor(Math.random() * passingGrade);
  }

  return { score, isPassed: score >= passingGrade };
}

// Sample names for Muhammadiyah context
const sampleNames = [
  'Ahmad Fauzi Rahman',
  'Muhammad Rizki Hidayat',
  'Abdul Malik Hakim',
  'Syamsul Arifin',
  'Muhammad Iqbal',
  'Ahmad Syauqi',
  'Fajar Sidiq',
  'Muhammad Hasan',
  'Umar Farouq',
  'Zainuddin Hamid',
  'Ahmad Dahlan Putra',
  'Muhammad Yusuf',
  'Abdurrahman Wahid',
  'Hasan Basri',
  'Muhammad Natsir',
  "Ahmad Rifa'i",
  'Sulaiman Ahmad',
  'Ibrahim Musa',
  'Ismail Hakim',
  'Muhammad Arsyad',
  'Ahmad Khatib',
  'Zainal Abidin',
  'Muhammad Nur',
  'Abdullah Sungkar',
  'Ahmad Sanusi',
  'Muhammad Amin',
  'Hamzah Fansuri',
  'Ahmad Soebardjo',
  'Muhammad Husni',
  'Moh. Roem',
];

// ============================================
// Mock Participant Results by Session
// ============================================

interface SessionResults {
  sessionId: string;
  isPublished: boolean;
  results: ParticipantResult[];
}

// Category configs for AIK and TBQ
const categoryConfigs: Record<string, { code: string; name: string; maxScore: number; passingGrade: number }> = {
  'cat-aik': { code: 'AIK', name: 'Al Islam Kemuhammadiyahan', maxScore: 100, passingGrade: 65 },
  'cat-tbq': { code: 'TBQ', name: 'Baca Tulis Quran', maxScore: 100, passingGrade: 70 },
};

// Generate results for a session
function generateSessionResults(sessionId: string, categoryIds: string[], participantCount: number): ParticipantResult[] {
  const results: ParticipantResult[] = [];
  const now = new Date().toISOString();

  for (let i = 0; i < participantCount; i++) {
    const participantId = generateId('participant');
    const categoryScores: Record<string, CategoryScore> = {};
    let totalScore = 0;
    let maxTotalScore = 0;
    let allPassed = true;

    // Generate category scores
    categoryIds.forEach((catId) => {
      const config = categoryConfigs[catId];
      if (config) {
        const { score, isPassed } = generateScore(config.maxScore, config.passingGrade);
        categoryScores[config.code] = {
          categoryCode: config.code,
          categoryName: config.name,
          score,
          maxScore: config.maxScore,
          passingGrade: config.passingGrade,
          isPassed,
        };
        totalScore += score;
        maxTotalScore += config.maxScore;
        if (!isPassed) allPassed = false;
      }
    });

    // Determine status based on whether all categories passed
    const status: ExamResultStatus = allPassed ? 'LULUS' : 'TIDAK LULUS';

    results.push({
      id: generateId('result'),
      sessionId,
      participantId,
      participantName: sampleNames[i % sampleNames.length],
      registrationNumber: generateRegistrationNumber(i),
      categoryScores,
      totalScore,
      maxScore: maxTotalScore,
      status,
      submittedAt: now,
      createdAt: now,
      updatedAt: now,
    });
  }

  // Sort by total score descending
  return results.sort((a, b) => b.totalScore - a.totalScore);
}

// Initialize mock results - Only session-1 has results (sudah selesai)
let mockSessionResults: SessionResults[] = [
  {
    sessionId: 'session-1',
    isPublished: true,
    results: generateSessionResults('session-1', ['cat-aik', 'cat-tbq'], 25),
  },
  // session-2 belum ada hasil (belum dilaksanakan)
];

// ============================================
// CRUD Functions
// ============================================

/**
 * Get leaderboard data for a session with pagination
 */
export function getLeaderboard(sessionId: string, page: number = 0, size: number = 10): LeaderboardData | null {
  const session = getSessionById(sessionId);
  if (!session) return null;

  const sessionResults = mockSessionResults.find((sr) => sr.sessionId === sessionId);
  if (!sessionResults) {
    // Return empty leaderboard for sessions without results
    return {
      sessionId,
      sessionName: session.name,
      dynamicColumns: session.categories.map((c) => c.categoryCode),
      rows: [],
      totalElements: 0,
      totalPages: 0,
      page,
      size,
    };
  }

  const { results } = sessionResults;
  const start = page * size;
  const end = start + size;
  const paginatedResults = results.slice(start, end);

  // Get dynamic columns from session categories
  const dynamicColumns = session.categories.map((c) => c.categoryCode);

  // Convert to leaderboard rows with rankings
  const rows: LeaderboardRow[] = paginatedResults.map((result, index) => ({
    ranking: start + index + 1,
    participantId: result.participantId,
    participantName: result.participantName,
    registrationNumber: result.registrationNumber,
    categoryScores: result.categoryScores,
    totalScore: result.totalScore,
    maxScore: result.maxScore,
    status: result.status,
  }));

  return {
    sessionId,
    sessionName: session.name,
    dynamicColumns,
    rows,
    totalElements: results.length,
    totalPages: Math.ceil(results.length / size),
    page,
    size,
  };
}

/**
 * Get statistics for a session
 */
export function getExamResultStats(sessionId: string): ExamResultStats | null {
  const sessionResults = mockSessionResults.find((sr) => sr.sessionId === sessionId);
  if (!sessionResults) {
    // Return empty stats for sessions without results
    return {
      total: 0,
      lulus: 0,
      tidakLulus: 0,
      persentaseKelulusan: 0,
    };
  }

  const { results } = sessionResults;
  const total = results.length;
  const lulus = results.filter((r) => r.status === 'LULUS').length;
  const tidakLulus = results.filter((r) => r.status === 'TIDAK LULUS').length;
  const persentaseKelulusan = total > 0 ? Math.round((lulus / total) * 100) : 0;

  return {
    total,
    lulus,
    tidakLulus,
    persentaseKelulusan,
  };
}

/**
 * Check if session results are published
 */
export function isSessionPublished(sessionId: string): boolean {
  const sessionResults = mockSessionResults.find((sr) => sr.sessionId === sessionId);
  return sessionResults?.isPublished ?? false;
}

/**
 * Publish session results
 */
export function publishSessionResults(sessionId: string): boolean {
  const index = mockSessionResults.findIndex((sr) => sr.sessionId === sessionId);
  if (index === -1) return false;

  mockSessionResults[index] = {
    ...mockSessionResults[index],
    isPublished: true,
  };
  return true;
}

/**
 * Get participant result by ID
 */
export function getParticipantResult(sessionId: string, participantId: string): ParticipantResult | null {
  const sessionResults = mockSessionResults.find((sr) => sr.sessionId === sessionId);
  if (!sessionResults) return null;

  return sessionResults.results.find((r) => r.participantId === participantId) || null;
}

/**
 * Get all results for a session (for export)
 */
export function getAllSessionResults(sessionId: string): ParticipantResult[] {
  const sessionResults = mockSessionResults.find((sr) => sr.sessionId === sessionId);
  return sessionResults?.results || [];
}

/**
 * Reset mock data
 */
export function resetMockResults(): void {
  mockSessionResults = [
    {
      sessionId: 'session-1',
      isPublished: true,
      results: generateSessionResults('session-1', ['cat-aik', 'cat-tbq'], 25),
    },
  ];
}
