// ============================================
// Interview Session Types (Admin - Kelola Sesi Wawancara)
// ============================================

export type InterviewSessionStatus = 'aktif' | 'nonaktif';

/**
 * Interview Session - data yang ditampilkan di tabel list
 */
export interface InterviewSession {
  id: string;
  namaInterviewer: string;
  emailInterviewer?: string;
  rubrikId: string;
  rubrikNama: string;
  jumlahPelamar: number;
  status: InterviewSessionStatus;
  accessPin: string;
  link: string;
  isActive: boolean;
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
  applicationIds: string[];
  status: InterviewSessionStatus;
  accessPin: string;
}

/**
 * Request untuk create interview session (dikirim ke API)
 */
export interface CreateInterviewSessionRequest {
  rubricId: string;
  interviewerName: string;
  interviewerEmail?: string;
  accessPin: string;
  applicationIds: string[];
  isActive: boolean;
}

/**
 * Request untuk update interview session (dikirim ke API)
 */
export interface UpdateInterviewSessionRequest {
  rubricId: string;
  interviewerName: string;
  interviewerEmail?: string;
  accessPin: string;
  applicationIds: string[];
  isActive: boolean;
}

/**
 * Detail session dari API (untuk edit mode di form modal)
 */
export interface ApiInterviewSessionDetail {
  id: string;
  interviewerName: string;
  interviewerEmail?: string;
  rubricId: string;
  accessPin: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
