import axios from 'axios';
import { API_ENDPOINTS } from '@/lib/constants';
import type { InterviewSessionInfo, InterviewDashboard, DashboardParticipant, ParticipantAssessmentForm, SubmitScoreRequest, ScoreRange, ExistingAssessmentDetail, InterviewDecision } from '@/types/interview-process';

// ============================================
// Interview Process Service
// Interviewer REST API (Bearer token dari PIN verification)
// ============================================

const BASE_URL = API_ENDPOINTS.ASSESSMENT_API;

const SESSION_STORAGE_KEY = 'interviewer_token';

// Module-level token storage for interviewer session
let interviewerToken: string | null = null;

// Restore token from sessionStorage on init (browser only)
if (typeof window !== 'undefined') {
  interviewerToken = sessionStorage.getItem(SESSION_STORAGE_KEY);
}

export function setInterviewerToken(token: string) {
  interviewerToken = token;
  if (typeof window !== 'undefined') {
    sessionStorage.setItem(SESSION_STORAGE_KEY, token);
  }
}

export function getInterviewerToken(): string | null {
  return interviewerToken;
}

export function clearInterviewerToken() {
  interviewerToken = null;
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
  }
}

// Axios instance khusus interviewer (tanpa cookie auth)
function createAuthHeaders() {
  if (!interviewerToken) {
    throw new Error('Interviewer token not set. Please verify PIN first.');
  }
  return {
    Authorization: `Bearer ${interviewerToken}`,
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };
}

// ============================================
// API Response Types (internal)
// ============================================

interface ApiResponse<T> {
  success: boolean;
  code: number;
  data: {
    success: boolean;
    message: string;
    data: T;
  };
}

interface ApiSessionInfo {
  interviewerName: string;
  rubricName: string;
  sessionId: string;
}

// Verify response: data.data.data is the token string directly

interface ApiDashboardParticipant {
  participantId: string;
  participantReference: string;
  name: string;
  email: string;
  status: string;
  finalScore: number | null;
  decision?: string | null;
}

interface ApiDashboard {
  sessionInfo: {
    sessionId: string;
    interviewerName: string;
    interviewerEmail: string;
    rubricName: string;
  };
  participants: ApiDashboardParticipant[];
}

interface ApiScoreRange {
  category: string;
  min_score: number;
  max_score: number;
}

interface ApiCriteria {
  id: string;
  name: string;
  description: string;
  weight: number;
  scoreRanges: ApiScoreRange[];
}

interface ApiExistingAssessment {
  notes: string;
  decision: string | null;
  finalScore: number | null;
  details: Array<{
    criteriaId: string;
    score: number;
    note: string;
  }>;
}

interface ApiParticipantForm {
  participant: {
    participantId: string;
    participantReference: string;
    name: string;
    email: string;
    status: string;
  };
  rubric: {
    name: string;
    description: string;
    criteria: ApiCriteria[];
  };
  existingAssessment: ApiExistingAssessment | null;
}

// ============================================
// Mappers
// ============================================

function mapScoreRange(apiRange: ApiScoreRange): ScoreRange {
  return {
    label: apiRange.category,
    min: apiRange.min_score,
    max: apiRange.max_score,
  };
}

function mapParticipant(p: ApiDashboardParticipant): DashboardParticipant {
  return {
    participantId: p.participantId,
    applicantName: p.name,
    participantReference: p.participantReference,
    status: p.status as DashboardParticipant['status'],
    finalScore: p.finalScore,
    decision: (p.decision as InterviewDecision) || null,
  };
}

function mapExistingDetail(d: { criteriaId: string; score: number; note: string }): ExistingAssessmentDetail {
  return {
    criteriaId: d.criteriaId,
    score: d.score,
    note: d.note || undefined,
  };
}

// ============================================
// Service Methods
// ============================================

export const InterviewProcessService = {
  /**
   * 1. Get Session Info (no auth required)
   * GET /api/v1/assessment/interview-access/{sessionToken}/info
   */
  async getSessionInfo(sessionToken: string): Promise<InterviewSessionInfo> {
    const response = await axios.get<ApiResponse<ApiSessionInfo>>(`${BASE_URL}/api/v1/assessment/interview-access/${encodeURIComponent(sessionToken)}/info`, {
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    });

    const data = response.data.data.data;
    return {
      isValid: true,
      interviewerName: data.interviewerName,
      rubricName: data.rubricName,
      sessionId: data.sessionId,
    };
  },

  /**
   * 2. Verify PIN
   * POST /api/v1/assessment/interview-access/verify
   * Returns JWT token to be used for subsequent calls
   */
  async verifyPin(sessionToken: string, accessPin: string): Promise<string> {
    const response = await axios.post<ApiResponse<string>>(
      `${BASE_URL}/api/v1/assessment/interview-access/verify`,
      { sessionToken, accessPin },
      {
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      },
    );

    const token = response.data.data.data;
    setInterviewerToken(token);
    return token;
  },

  /**
   * 3. Get Dashboard (requires Bearer token)
   * GET /api/v1/assessment/interview-process/dashboard
   */
  async getDashboard(): Promise<InterviewDashboard> {
    const response = await axios.get<ApiResponse<ApiDashboard>>(`${BASE_URL}/api/v1/assessment/interview-process/dashboard`, { headers: createAuthHeaders() });

    const data = response.data.data.data;
    return {
      sessionInfo: {
        sessionId: data.sessionInfo.sessionId,
        interviewerName: data.sessionInfo.interviewerName,
        interviewerEmail: data.sessionInfo.interviewerEmail,
        rubricName: data.sessionInfo.rubricName,
      },
      participants: data.participants.map(mapParticipant),
    };
  },

  /**
   * 4. Get Participant Form (requires Bearer token)
   * GET /api/v1/assessment/interview-process/participant/{participantId}/form
   */
  async getParticipantForm(participantId: string): Promise<ParticipantAssessmentForm> {
    const response = await axios.get<ApiResponse<ApiParticipantForm>>(`${BASE_URL}/api/v1/assessment/interview-process/participant/${encodeURIComponent(participantId)}/form`, { headers: createAuthHeaders() });

    const data = response.data.data.data;
    return {
      applicant: {
        name: data.participant.name,
        email: data.participant.email,
      },
      rubric: {
        name: data.rubric.name,
        description: data.rubric.description,
        criteria: data.rubric.criteria.map((c) => ({
          id: c.id,
          name: c.name,
          description: c.description,
          weight: c.weight,
          scoreRanges: c.scoreRanges.map(mapScoreRange),
        })),
      },
      existingAssessment: data.existingAssessment
        ? {
            details: data.existingAssessment.details.map(mapExistingDetail),
            notes: data.existingAssessment.notes || '',
            decision: (data.existingAssessment.decision as InterviewDecision) || null,
            finalScore: data.existingAssessment.finalScore,
            submittedAt: '', // API doesn't return submittedAt
          }
        : null,
    };
  },

  /**
   * 5. Submit Score (requires Bearer token)
   * PUT /api/v1/assessment/interview-process/participant/{participantId}/score
   */
  async submitScore(participantId: string, data: SubmitScoreRequest): Promise<void> {
    await axios.put(
      `${BASE_URL}/api/v1/assessment/interview-process/participant/${encodeURIComponent(participantId)}/score`,
      {
        notes: data.notes,
        decision: data.decision,
        details: data.details.map((d) => ({
          criteriaId: d.criteriaId,
          score: d.score,
          note: d.note || '',
        })),
      },
      { headers: createAuthHeaders() },
    );
  },
};
