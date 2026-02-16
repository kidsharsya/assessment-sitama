import apiAssessment from '@/lib/apiAssessment';
import type { LeaderboardApiResponse } from '@/types/hasil-ujian';

// =============================================================================
// TYPES - Assessment REST API Response Types
// =============================================================================

/** Response dari POST /exam-sessions/start */
export interface StartExamResponse {
  success: boolean;
  code: number;
  data: {
    message: string;
    attemptId: string;
    status: 'IN_PROGRESS' | 'SUBMITTED' | 'EXPIRED';
    startTime: string;
    endTime: string;
    durationMinutes: number;
  };
}

/** Response dari GET /exam-attempts/:attemptId/manifest */
export interface ExamManifestResponse {
  success: boolean;
  code: number;
  data: {
    message: string;
    categories: ManifestCategory[];
  };
}

export interface ManifestCategory {
  categoryId: string;
  categoryCode: string;
  categoryName: string;
  passingGrade: number;
  questions: ManifestQuestion[];
}

export interface ManifestQuestion {
  number: number;
  questionId: string;
  optionShuffleOrder: number[];
}

/** Response dari GET /exam-attempts/:attemptId/answers/status */
export interface AnswerStatusResponse {
  success: boolean;
  code: number;
  data: {
    message: string;
    statuses: AnswerStatusItem[];
  };
}

export interface AnswerStatusItem {
  questionId: string;
  number: number;
  answerCode: string | null;
  notSure: boolean;
}

/** Response dari GET /exam-attempts/questions/:questionId */
export interface QuestionContentResponse {
  success: boolean;
  code: number;
  data: {
    message: string;
    questionId: string;
    text: string;
    imagePath: string | null;
    options: QuestionOptionItem[];
  };
}

export interface QuestionOptionItem {
  text: string;
  label: string;
  imagePath?: string | null;
}

/** Request body untuk save answer */
export interface SaveAnswerRequest {
  attemptId: string;
  questionId: string;
  answerCode: string | null;
  notSure: boolean;
}

/** Response dari POST /exam-attempts/answers */
export interface SaveAnswerResponse {
  success: boolean;
  code: number;
  data: {
    message: string;
  };
}

/** Response dari POST /exam-attempts/:attemptId/finish */
export interface FinishExamResponse {
  success: boolean;
  code: number;
  data: {
    message: string;
    attemptId: string;
    status: 'SUBMITTED';
    submittedAt?: string;
    totalQuestions?: number;
    answeredQuestions?: number;
  };
}

// =============================================================================
// API BASE PATH
// =============================================================================

const BASE_PATH = '/api/v1/assessment';

// =============================================================================
// ASSESSMENT SERVICE
// =============================================================================

export const AssessmentService = {
  /**
   * Start exam session dengan access token
   * POST /api/v1/assessment/exam-sessions/start
   */
  startExam: async (accessToken: string): Promise<StartExamResponse> => {
    const response = await apiAssessment.post<StartExamResponse>(`${BASE_PATH}/exam-sessions/start`, {
      accessToken,
    });
    return response.data;
  },

  /**
   * Get exam manifest (kategori + daftar questionId + optionShuffleOrder)
   * GET /api/v1/assessment/exam-attempts/:attemptId/manifest
   */
  getExamManifest: async (attemptId: string): Promise<ExamManifestResponse> => {
    const response = await apiAssessment.get<ExamManifestResponse>(`${BASE_PATH}/exam-attempts/${attemptId}/manifest`);
    return response.data;
  },

  /**
   * Get answer statuses for navigation sidebar
   * GET /api/v1/assessment/exam-attempts/:attemptId/answers/status
   */
  getAnswerStatuses: async (attemptId: string): Promise<AnswerStatusResponse> => {
    const response = await apiAssessment.get<AnswerStatusResponse>(`${BASE_PATH}/exam-attempts/${attemptId}/answers/status`);
    return response.data;
  },

  /**
   * Get single question content by questionId
   * GET /api/v1/assessment/exam-attempts/questions/:questionId
   */
  getQuestionContent: async (questionId: string): Promise<QuestionContentResponse> => {
    const response = await apiAssessment.get<QuestionContentResponse>(`${BASE_PATH}/exam-attempts/questions/${questionId}`);
    return response.data;
  },

  /**
   * Save answer for a question
   * POST /api/v1/assessment/exam-attempts/answers
   */
  saveAnswer: async (payload: SaveAnswerRequest): Promise<SaveAnswerResponse> => {
    const response = await apiAssessment.post<SaveAnswerResponse>(`${BASE_PATH}/exam-attempts/answers`, payload);
    return response.data;
  },

  /**
   * Finish/submit exam
   * POST /api/v1/assessment/exam-attempts/:attemptId/finish
   */
  finishExam: async (attemptId: string): Promise<FinishExamResponse> => {
    const response = await apiAssessment.post<FinishExamResponse>(`${BASE_PATH}/exam-attempts/${attemptId}/finish`);
    return response.data;
  },

  /**
   * Get leaderboard for a session
   * GET /api/v1/assessment/exam-sessions/:sessionId/leaderboard?page=0&size=10
   */
  getLeaderboard: async (sessionId: string, page = 0, size = 10): Promise<LeaderboardApiResponse> => {
    const response = await apiAssessment.get<LeaderboardApiResponse>(`${BASE_PATH}/exam-sessions/${sessionId}/leaderboard`, {
      params: { page, size },
    });
    return response.data;
  },
};

export default AssessmentService;
