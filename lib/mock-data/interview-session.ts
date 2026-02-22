import type { InterviewSession, ApiInterviewSessionDetail } from '@/types/interview-session';
import type { InterviewSessionInfo, InterviewDashboard, ParticipantAssessmentForm } from '@/types/interview-process';

// ============================================
// Mock Data - Interview Sessions (Admin)
// ============================================

export const mockInterviewSessions: InterviewSession[] = [
  {
    id: 'session-1',
    namaInterviewer: 'Dr. Siti Aminah',
    emailInterviewer: 'siti.aminah@university.ac.id',
    rubrikId: 'rubrik-1',
    rubrikNama: 'Rubrik Wawancara Umum',
    jumlahPelamar: 3,
    status: 'aktif',
    accessPin: 'ABC123',
    link: '/wawancara/link-session-1',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  {
    id: 'session-2',
    namaInterviewer: 'Prof. Budi Santoso',
    emailInterviewer: 'budi.santoso@university.ac.id',
    rubrikId: 'rubrik-2',
    rubrikNama: 'Rubrik Teknis',
    jumlahPelamar: 2,
    status: 'aktif',
    accessPin: 'XYZ789',
    link: '/wawancara/link-session-2',
    isActive: true,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  {
    id: 'session-3',
    namaInterviewer: 'Dr. Rina Wulandari',
    emailInterviewer: 'rina.w@university.ac.id',
    rubrikId: 'rubrik-1',
    rubrikNama: 'Rubrik Wawancara Umum',
    jumlahPelamar: 4,
    status: 'nonaktif',
    accessPin: 'DEF456',
    link: '/wawancara/link-session-3',
    isActive: false,
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z',
  },
];

export const mockSessionDetails: Record<string, ApiInterviewSessionDetail> = {
  'session-1': {
    id: 'session-1',
    interviewerName: 'Dr. Siti Aminah',
    interviewerEmail: 'siti.aminah@university.ac.id',
    rubricId: 'rubrik-1',
    accessPin: 'ABC123',
    isActive: true,
    createdAt: '2024-01-15T10:00:00Z',
    updatedAt: '2024-01-15T10:00:00Z',
  },
  'session-2': {
    id: 'session-2',
    interviewerName: 'Prof. Budi Santoso',
    interviewerEmail: 'budi.santoso@university.ac.id',
    rubricId: 'rubrik-2',
    accessPin: 'XYZ789',
    isActive: true,
    createdAt: '2024-01-16T09:00:00Z',
    updatedAt: '2024-01-16T09:00:00Z',
  },
  'session-3': {
    id: 'session-3',
    interviewerName: 'Dr. Rina Wulandari',
    interviewerEmail: 'rina.w@university.ac.id',
    rubricId: 'rubrik-1',
    accessPin: 'DEF456',
    isActive: false,
    createdAt: '2024-01-17T14:00:00Z',
    updatedAt: '2024-01-17T14:00:00Z',
  },
};

export const mockParticipantIds: Record<string, string[]> = {
  'session-1': ['app-1', 'app-2', 'app-3'],
  'session-2': ['app-4', 'app-5'],
  'session-3': ['app-1', 'app-3', 'app-5', 'app-6'],
};

// ============================================
// Mock Data - Applicants for Selection
// ============================================

export interface MockApplicant {
  applicationId: string;
  fullName: string;
  email: string;
}

export const mockApplicants: MockApplicant[] = [
  {
    applicationId: 'app-1',
    fullName: 'Ahmad Rizky Pratama',
    email: 'ahmad.rizky@mubaligh.id',
  },
  {
    applicationId: 'app-2',
    fullName: 'Dewi Putri Lestari',
    email: 'dewi.putri@mubaligh.id',
  },
  {
    applicationId: 'app-3',
    fullName: 'Fajar Nugroho',
    email: 'fajar.nugroho@mubaligh.id',
  },
  {
    applicationId: 'app-4',
    fullName: 'Sari Indah Permata',
    email: 'sari.indah@mubaligh.id',
  },
  {
    applicationId: 'app-5',
    fullName: 'Bima Aditya Putra',
    email: 'bima.aditya@mubaligh.id',
  },
  {
    applicationId: 'app-6',
    fullName: 'Citra Maharani',
    email: 'citra.maharani@mubaligh.id',
  },
];

// ============================================
// Mock Data - Interviewer Dashboard
// ============================================

export const mockSessionInfo: InterviewSessionInfo = {
  isValid: true,
  interviewerName: 'Dr. Siti Aminah',
  rubricName: 'Rubrik Wawancara Umum',
  sessionId: 'session-1',
};

export const mockInterviewDashboard: InterviewDashboard = {
  sessionInfo: {
    interviewerName: 'Dr. Siti Aminah',
    rubricName: 'Rubrik Wawancara Umum',
  },
  participants: [
    {
      participantId: 'participant-1',
      applicantName: 'Ahmad Rizky Pratama',
      status: 'COMPLETED',
      finalScore: 82,
    },
    {
      participantId: 'participant-2',
      applicantName: 'Dewi Putri Lestari',
      status: 'PENDING',
      finalScore: null,
    },
    {
      participantId: 'participant-3',
      applicantName: 'Fajar Nugroho',
      status: 'PENDING',
      finalScore: null,
    },
  ],
};

export const mockParticipantForm: ParticipantAssessmentForm = {
  applicant: {
    name: 'Ahmad Rizky Pratama',
    email: 'ahmad.rizky@mubaligh.id',
  },
  rubric: {
    name: 'Rubrik Wawancara Umum',
    description: 'Rubrik penilaian wawancara untuk sertifikasi mubaligh.',
    criteria: [
      {
        id: 'criteria-1',
        name: 'Komunikasi',
        description: 'Kemampuan berkomunikasi secara efektif dan jelas.',
        weight: 30,
        scoreRanges: [
          { min: 0, max: 25, label: 'Kurang', description: 'Tidak mampu menyampaikan ide dengan jelas' },
          { min: 26, max: 50, label: 'Cukup', description: 'Mampu menyampaikan ide namun kurang terstruktur' },
          { min: 51, max: 75, label: 'Baik', description: 'Mampu menyampaikan ide dengan jelas dan terstruktur' },
          { min: 76, max: 100, label: 'Sangat Baik', description: 'Komunikasi sangat efektif, artikulatif, dan persuasif' },
        ],
      },
      {
        id: 'criteria-2',
        name: 'Pengetahuan Teknis',
        description: 'Pemahaman dan penguasaan materi terkait posisi yang dilamar.',
        weight: 40,
        scoreRanges: [
          { min: 0, max: 25, label: 'Kurang', description: 'Pemahaman sangat terbatas' },
          { min: 26, max: 50, label: 'Cukup', description: 'Pemahaman dasar namun perlu bimbingan' },
          { min: 51, max: 75, label: 'Baik', description: 'Pemahaman baik dan mampu menjelaskan' },
          { min: 76, max: 100, label: 'Sangat Baik', description: 'Pemahaman mendalam dan mampu memberikan contoh' },
        ],
      },
      {
        id: 'criteria-3',
        name: 'Motivasi & Komitmen',
        description: 'Motivasi untuk berkontribusi dan berkomitmen terhadap tugas.',
        weight: 30,
        scoreRanges: [
          { min: 0, max: 25, label: 'Kurang', description: 'Motivasi rendah, tidak menunjukkan antusiasme' },
          { min: 26, max: 50, label: 'Cukup', description: 'Ada motivasi namun kurang meyakinkan' },
          { min: 51, max: 75, label: 'Baik', description: 'Motivasi jelas dan menunjukkan komitmen' },
          { min: 76, max: 100, label: 'Sangat Baik', description: 'Sangat termotivasi dan berkomitmen tinggi' },
        ],
      },
    ],
  },
  existingAssessment: null,
};

// Form with existing assessment pre-filled
export const mockParticipantFormWithAssessment: ParticipantAssessmentForm = {
  ...mockParticipantForm,
  existingAssessment: {
    details: [
      { criteriaId: 'criteria-1', score: 80 },
      { criteriaId: 'criteria-2', score: 85 },
      { criteriaId: 'criteria-3', score: 78 },
    ],
    notes: 'Kandidat menunjukkan potensi yang baik dalam komunikasi dan penguasaan materi.',
    submittedAt: '2024-01-20T14:30:00Z',
  },
};
