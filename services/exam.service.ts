import { GraphQLService } from './graphql.service';

// =============================================================================
// TYPES
// =============================================================================

export interface Exam {
  id: string;
  title: string;
  description?: string;
  duration_minutes: number;
  passing_score: number;
  status: 'draft' | 'published' | 'archived';
  access_token?: string;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
  questions?: Question[];
}

export interface Question {
  id: string;
  exam_id: string;
  question_text: string;
  question_type: 'multiple_choice' | 'true_false' | 'essay';
  points: number;
  options?: string[];
  correct_answer?: string;
  order: number;
}

export interface ExamSession {
  id: string;
  exam_id: string;
  user_id: string;
  started_at: string;
  ended_at?: string;
  score?: number;
  status: 'in_progress' | 'completed' | 'expired';
}

// =============================================================================
// QUERIES
// =============================================================================

const GET_EXAMS = `
  query GetExams($limit: Int = 10, $offset: Int = 0) {
    exams(
      limit: $limit, 
      offset: $offset, 
      order_by: {created_at: desc}
    ) {
      id
      title
      description
      duration_minutes
      passing_score
      status
      start_date
      end_date
      created_at
      updated_at
    }
    exams_aggregate {
      aggregate {
        count
      }
    }
  }
`;

const GET_EXAM_BY_ID = `
  query GetExamById($id: uuid!) {
    exams_by_pk(id: $id) {
      id
      title
      description
      duration_minutes
      passing_score
      status
      access_token
      start_date
      end_date
      created_at
      updated_at
      questions(order_by: {order: asc}) {
        id
        question_text
        question_type
        points
        options
        correct_answer
        order
      }
    }
  }
`;

const GET_EXAM_BY_TOKEN = `
  query GetExamByToken($token: String!) {
    exams(where: {access_token: {_eq: $token}, status: {_eq: "published"}}) {
      id
      title
      description
      duration_minutes
      passing_score
      start_date
      end_date
    }
  }
`;

// =============================================================================
// MUTATIONS
// =============================================================================

const CREATE_EXAM = `
  mutation CreateExam($input: exams_insert_input!) {
    insert_exams_one(object: $input) {
      id
      title
      created_at
    }
  }
`;

const UPDATE_EXAM = `
  mutation UpdateExam($id: uuid!, $input: exams_set_input!) {
    update_exams_by_pk(pk_columns: {id: $id}, _set: $input) {
      id
      title
      updated_at
    }
  }
`;

const DELETE_EXAM = `
  mutation DeleteExam($id: uuid!) {
    delete_exams_by_pk(id: $id) {
      id
    }
  }
`;

const START_EXAM_SESSION = `
  mutation StartExamSession($exam_id: uuid!, $user_id: uuid!) {
    insert_exam_sessions_one(object: {
      exam_id: $exam_id,
      user_id: $user_id,
      status: "in_progress"
    }) {
      id
      started_at
    }
  }
`;

const SUBMIT_EXAM = `
  mutation SubmitExam($session_id: uuid!, $score: Int!) {
    update_exam_sessions_by_pk(
      pk_columns: {id: $session_id},
      _set: {
        status: "completed",
        ended_at: "now()",
        score: $score
      }
    ) {
      id
      score
      ended_at
    }
  }
`;

// =============================================================================
// SERVICE CLASS
// =============================================================================

export class ExamService {
  /**
   * Get list of exams with pagination
   */
  static async getExams(limit = 10, offset = 0) {
    return GraphQLService.query<{
      exams: Exam[];
      exams_aggregate: { aggregate: { count: number } };
    }>(GET_EXAMS, { limit, offset });
  }

  /**
   * Get exam by ID with questions
   */
  static async getExamById(id: string) {
    return GraphQLService.query<{ exams_by_pk: Exam }>(GET_EXAM_BY_ID, { id });
  }

  /**
   * Get exam by access token (for user exam entry)
   */
  static async getExamByToken(token: string) {
    return GraphQLService.query<{ exams: Exam[] }>(GET_EXAM_BY_TOKEN, { token });
  }

  /**
   * Create new exam
   */
  static async createExam(input: Partial<Exam>) {
    return GraphQLService.mutate<{ insert_exams_one: Exam }>(CREATE_EXAM, { input });
  }

  /**
   * Update exam
   */
  static async updateExam(id: string, input: Partial<Exam>) {
    return GraphQLService.mutate<{ update_exams_by_pk: Exam }>(UPDATE_EXAM, { id, input });
  }

  /**
   * Delete exam
   */
  static async deleteExam(id: string) {
    return GraphQLService.mutate<{ delete_exams_by_pk: { id: string } }>(DELETE_EXAM, { id });
  }

  /**
   * Start exam session for user
   */
  static async startExamSession(examId: string, userId: string) {
    return GraphQLService.mutate<{ insert_exam_sessions_one: ExamSession }>(START_EXAM_SESSION, { exam_id: examId, user_id: userId });
  }

  /**
   * Submit exam with score
   */
  static async submitExam(sessionId: string, score: number) {
    return GraphQLService.mutate<{ update_exam_sessions_by_pk: ExamSession }>(SUBMIT_EXAM, { session_id: sessionId, score });
  }
}

export default ExamService;
