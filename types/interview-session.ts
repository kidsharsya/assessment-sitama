// ============================================
// Interview Session Types (Admin - Kelola Sesi Wawancara)
// ============================================

export type InterviewSessionStatus = 'aktif' | 'nonaktif';

/**
 * Interview Session - data yang ditampilkan di tabel list
 */
export interface InterviewSession {
  id: string;
  examSessionId: string;
  namaInterviewer: string;
  emailInterviewer?: string;
  rubrikId: string;
  rubrikNama: string;
  jumlahPeserta: number;
  status: InterviewSessionStatus;
  accessPin: string;
  link: string;
  sessionToken: string;
  isActive: boolean;
  scheduledStartAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Form input untuk create/edit interview session
 */
export interface InterviewSessionFormInput {
  namaInterviewer: string;
  emailInterviewer: string;
  rubrikId: string;
  participantUserIds: string[];
  status: InterviewSessionStatus;
  accessPin: string;
  scheduledStartAt: string;
}

/**
 * Request untuk create interview session (dikirim ke API)
 */
export interface CreateInterviewSessionRequest {
  examSessionId: string;
  rubricId: string;
  interviewerName: string;
  interviewerEmail?: string;
  accessPin: string;
  participantUserIds: string[];
  isActive: boolean;
  scheduledStartAt?: string;
}

/**
 * Request untuk update interview session (dikirim ke API)
 */
export interface UpdateInterviewSessionRequest {
  rubricId: string;
  interviewerName: string;
  interviewerEmail?: string;
  accessPin: string;
  participantUserIds: string[];
  isActive: boolean;
  scheduledStartAt?: string;
}

/**
 * Detail session dari API (untuk edit mode di form modal)
 */
export interface ApiInterviewSessionDetail {
  id: string;
  examSessionId: string;
  interviewerName: string;
  interviewerEmail?: string;
  rubricId: string;
  accessPin: string;
  sessionToken: string;
  isActive: boolean;
  scheduledStartAt?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Peserta yang eligible untuk wawancara (dari exam_session_participants)
 */
export interface ExamSessionUser {
  userId: string;
  displayName: string;
  email: string;
  avatarUrl?: string;
}

/**
 * Participant dalam interview session (dari interview_participants)
 */
export interface InterviewParticipant {
  id: string;
  sessionId: string;
  participantReference: string; // userId
  status: string;
  finalScore: number | null;
  interviewerNotes?: string;
  scoreDetails?: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
}
