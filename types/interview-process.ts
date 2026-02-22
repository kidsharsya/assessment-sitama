// ============================================
// Interview Process Types (Interviewer - Form Penilaian)
// ============================================

/**
 * Status peserta wawancara
 */
export type ParticipantStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED';

/**
 * Info sesi wawancara (untuk validasi link)
 */
export interface InterviewSessionInfo {
  isValid: boolean;
  interviewerName: string;
  rubricName?: string;
  sessionId?: string;
}

/**
 * Peserta di dashboard interviewer
 */
export interface DashboardParticipant {
  participantId: string;
  applicantName: string;
  status: ParticipantStatus;
  finalScore: number | null;
}

/**
 * Info sesi di dashboard
 */
export interface DashboardSessionInfo {
  interviewerName: string;
  rubricName: string;
}

/**
 * Dashboard data untuk interviewer
 */
export interface InterviewDashboard {
  sessionInfo: DashboardSessionInfo;
  participants: DashboardParticipant[];
}

/**
 * Range skor untuk kriteria
 */
export interface ScoreRange {
  min: number;
  max: number;
  label: string;
  description?: string;
}

/**
 * Kriteria di form penilaian
 */
export interface FormCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoreRanges: ScoreRange[];
}

/**
 * Rubrik di form penilaian
 */
export interface FormRubric {
  name: string;
  description: string;
  criteria: FormCriteria[];
}

/**
 * Info pelamar di form penilaian
 */
export interface FormApplicant {
  name: string;
  email: string;
}

/**
 * Detail penilaian yang sudah ada
 */
export interface ExistingAssessmentDetail {
  criteriaId: string;
  score: number;
  notes?: string;
}

/**
 * Penilaian yang sudah ada
 */
export interface ExistingAssessment {
  details: ExistingAssessmentDetail[];
  notes: string;
  submittedAt: string;
}

/**
 * Data form penilaian peserta
 */
export interface ParticipantAssessmentForm {
  applicant: FormApplicant;
  rubric: FormRubric;
  existingAssessment: ExistingAssessment | null;
}

/**
 * Request untuk submit nilai
 */
export interface SubmitScoreRequest {
  notes: string;
  details: Array<{
    criteriaId: string;
    score: number;
    notes?: string;
  }>;
}
