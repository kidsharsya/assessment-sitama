import { GraphQLService } from './graphql.service';
import { getUserIdFromToken } from '@/helpers/cookieHelper';
import type { InterviewSession, ApiInterviewSessionDetail, CreateInterviewSessionRequest, UpdateInterviewSessionRequest, ExamSessionUser, InterviewParticipant } from '@/types/interview-session';

// ============================================
// Hasura Raw Response Types (snake_case)
// ============================================

interface HasuraInterviewSession {
  id: string;
  exam_session_id: string;
  interviewer_name: string;
  interviewer_email: string | null;
  rubric_id: string;
  access_pin: string | null;
  session_token: string;
  is_active: boolean;
  is_deleted: boolean;
  scheduled_start_at: string | null;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface HasuraInterviewParticipant {
  id: string;
  session_id: string;
  participant_reference: string;
  status: string;
  final_score: number | null;
  interviewer_notes: string | null;
  score_details: Record<string, unknown> | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface HasuraExamSessionParticipant {
  userByUserId: {
    id: string;
    displayName: string;
    email: string;
    avatarUrl: string | null;
    defaultRole: string;
  };
}

// ============================================
// GraphQL Queries
// ============================================

const GET_INTERVIEW_SESSIONS = `
  query GetInterviewSessions($examSessionId: uuid!, $limit: Int!, $offset: Int!) {
    interview_sessions(
      where: {
        exam_session_id: { _eq: $examSessionId },
        is_deleted: { _eq: false }
      }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      exam_session_id
      interviewer_name
      interviewer_email
      rubric_id
      access_pin
      session_token
      is_active
      scheduled_start_at
      created_at
      updated_at
    }
    interview_sessions_aggregate(
      where: {
        exam_session_id: { _eq: $examSessionId },
        is_deleted: { _eq: false }
      }
    ) {
      aggregate {
        count
      }
    }
  }
`;

const GET_INTERVIEW_SESSION_BY_ID = `
  query GetInterviewSessionById($id: uuid!) {
    interview_sessions_by_pk(id: $id) {
      id
      exam_session_id
      interviewer_name
      interviewer_email
      rubric_id
      access_pin
      session_token
      is_active
      scheduled_start_at
      created_at
      updated_at
    }
  }
`;

const GET_INTERVIEW_PARTICIPANTS = `
  query GetInterviewParticipants($sessionId: uuid!) {
    interview_participants(
      where: {
        session_id: { _eq: $sessionId },
        is_deleted: { _eq: false }
      }
      order_by: { created_at: asc }
    ) {
      id
      session_id
      participant_reference
      status
      final_score
      interviewer_notes
      score_details
      created_at
      updated_at
    }
  }
`;

const GET_EXAM_SESSION_USERS = `
  query GetExamSessionUsers($sessionId: uuid!) {
    exam_session_participants(
      where: {
        session_id: { _eq: $sessionId },
        is_deleted: { _eq: false }
      }
    ) {
      userByUserId {
        id
        displayName
        email
        avatarUrl
        defaultRole
      }
    }
  }
`;

// ============================================
// GraphQL Mutations
// ============================================

const INSERT_INTERVIEW_SESSION = `
  mutation InsertInterviewSession($object: interview_sessions_insert_input!) {
    insert_interview_sessions_one(object: $object) {
      id
      session_token
    }
  }
`;

const UPDATE_INTERVIEW_SESSION = `
  mutation UpdateInterviewSession($id: uuid!, $set: interview_sessions_set_input!) {
    update_interview_sessions_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

const DELETE_INTERVIEW_SESSION = `
  mutation DeleteInterviewSession($id: uuid!, $updatedBy: uuid) {
    update_interview_sessions_by_pk(
      pk_columns: { id: $id },
      _set: { is_deleted: true, updated_by: $updatedBy }
    ) {
      id
    }
  }
`;

const TOGGLE_INTERVIEW_SESSION_ACTIVE = `
  mutation ToggleInterviewSessionActive($id: uuid!, $isActive: Boolean!, $updatedBy: uuid) {
    update_interview_sessions_by_pk(
      pk_columns: { id: $id },
      _set: { is_active: $isActive, updated_by: $updatedBy }
    ) {
      id
      is_active
    }
  }
`;

const INSERT_INTERVIEW_PARTICIPANTS = `
  mutation InsertInterviewParticipants($objects: [interview_participants_insert_input!]!) {
    insert_interview_participants(objects: $objects) {
      affected_rows
      returning {
        id
        participant_reference
      }
    }
  }
`;

const SOFT_DELETE_INTERVIEW_PARTICIPANTS = `
  mutation SoftDeleteInterviewParticipants($sessionId: uuid!, $participantReferences: [String!]!, $updatedBy: uuid) {
    update_interview_participants(
      where: {
        session_id: { _eq: $sessionId },
        participant_reference: { _in: $participantReferences },
        is_deleted: { _eq: false }
      },
      _set: { is_deleted: true, updated_by: $updatedBy }
    ) {
      affected_rows
    }
  }
`;

// ============================================
// Mapper Functions (Hasura → Frontend Types)
// ============================================

function mapInterviewSession(raw: HasuraInterviewSession, rubricNameMap?: Record<string, string>): InterviewSession {
  return {
    id: raw.id,
    examSessionId: raw.exam_session_id,
    namaInterviewer: raw.interviewer_name,
    emailInterviewer: raw.interviewer_email || undefined,
    rubrikId: raw.rubric_id,
    rubrikNama: rubricNameMap?.[raw.rubric_id] || '-',
    jumlahPeserta: 0, // Will be overridden by participant count map
    status: raw.is_active ? 'aktif' : 'nonaktif',
    accessPin: raw.access_pin || '',
    link: `/wawancara/${raw.session_token}`,
    sessionToken: raw.session_token,
    isActive: raw.is_active,
    scheduledStartAt: raw.scheduled_start_at || undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapInterviewSessionDetail(raw: HasuraInterviewSession): ApiInterviewSessionDetail {
  return {
    id: raw.id,
    examSessionId: raw.exam_session_id,
    interviewerName: raw.interviewer_name,
    interviewerEmail: raw.interviewer_email || undefined,
    rubricId: raw.rubric_id,
    accessPin: raw.access_pin || '',
    sessionToken: raw.session_token,
    isActive: raw.is_active,
    scheduledStartAt: raw.scheduled_start_at || undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapInterviewParticipant(raw: HasuraInterviewParticipant): InterviewParticipant {
  return {
    id: raw.id,
    sessionId: raw.session_id,
    participantReference: raw.participant_reference,
    status: raw.status,
    finalScore: raw.final_score,
    interviewerNotes: raw.interviewer_notes || undefined,
    scoreDetails: raw.score_details || undefined,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapExamSessionUser(raw: HasuraExamSessionParticipant): ExamSessionUser {
  return {
    userId: raw.userByUserId.id,
    displayName: raw.userByUserId.displayName,
    email: raw.userByUserId.email,
    avatarUrl: raw.userByUserId.avatarUrl || undefined,
  };
}

// ============================================
// Helper: Generate session token
// ============================================

function generateSessionToken(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let token = '';
  for (let i = 0; i < 32; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

// ============================================
// InterviewSessionService
// ============================================

export class InterviewSessionService {
  /**
   * Get interview sessions by exam session ID (paginated)
   */
  static async getSessions(examSessionId: string, page: number = 0, size: number = 10): Promise<{ content: InterviewSession[]; totalElements: number }> {
    const offset = page * size;

    const { data, errors } = await GraphQLService.query<{
      interview_sessions: HasuraInterviewSession[];
      interview_sessions_aggregate: { aggregate: { count: number } };
    }>(GET_INTERVIEW_SESSIONS, { examSessionId, limit: size, offset });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    const rawSessions = data?.interview_sessions || [];
    const totalElements = data?.interview_sessions_aggregate?.aggregate?.count || 0;

    // Build rubric name map and participant count map in parallel
    const rubricIds = [...new Set(rawSessions.map((s) => s.rubric_id).filter(Boolean))];
    const sessionIds = rawSessions.map((s) => s.id);

    const [rubricNameMap, participantCountMap] = await Promise.all([
      // Fetch rubric names
      rubricIds.length > 0
        ? GraphQLService.query<{ interview_rubrics: { id: string; name: string }[] }>(
            `query GetRubricNames($ids: [uuid!]!) {
              interview_rubrics(where: { id: { _in: $ids } }) { id, name }
            }`,
            { ids: rubricIds },
          ).then((res) => {
            const map: Record<string, string> = {};
            for (const r of res.data?.interview_rubrics || []) map[r.id] = r.name;
            return map;
          })
        : Promise.resolve({} as Record<string, string>),

      // Fetch participant counts per session
      sessionIds.length > 0
        ? GraphQLService.query<{
            interview_participants: { session_id: string }[];
          }>(
            `query GetParticipantCounts($sessionIds: [uuid!]!) {
              interview_participants(
                where: { session_id: { _in: $sessionIds }, is_deleted: { _eq: false } }
              ) { session_id }
            }`,
            { sessionIds },
          ).then((res) => {
            const map: Record<string, number> = {};
            for (const p of res.data?.interview_participants || []) {
              map[p.session_id] = (map[p.session_id] || 0) + 1;
            }
            return map;
          })
        : Promise.resolve({} as Record<string, number>),
    ]);

    const sessions = rawSessions.map((s) => {
      const mapped = mapInterviewSession(s, rubricNameMap);
      mapped.jumlahPeserta = participantCountMap[s.id] || 0;
      return mapped;
    });

    return { content: sessions, totalElements };
  }

  /**
   * Get interview session detail by ID
   */
  static async getSessionById(id: string): Promise<ApiInterviewSessionDetail | null> {
    const { data, errors } = await GraphQLService.query<{
      interview_sessions_by_pk: HasuraInterviewSession | null;
    }>(GET_INTERVIEW_SESSION_BY_ID, { id });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    if (!data?.interview_sessions_by_pk) return null;
    return mapInterviewSessionDetail(data.interview_sessions_by_pk);
  }

  /**
   * Get participants of an interview session
   */
  static async getParticipants(sessionId: string): Promise<InterviewParticipant[]> {
    const { data, errors } = await GraphQLService.query<{
      interview_participants: HasuraInterviewParticipant[];
    }>(GET_INTERVIEW_PARTICIPANTS, { sessionId });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    return (data?.interview_participants || []).map(mapInterviewParticipant);
  }

  /**
   * Get participant user IDs of an interview session
   */
  static async getParticipantUserIds(sessionId: string): Promise<string[]> {
    const participants = await this.getParticipants(sessionId);
    return participants.map((p) => p.participantReference);
  }

  /**
   * Get users who completed the exam session (eligible for interview)
   */
  static async getExamSessionUsers(examSessionId: string): Promise<ExamSessionUser[]> {
    const { data, errors } = await GraphQLService.query<{
      exam_session_participants: HasuraExamSessionParticipant[];
    }>(GET_EXAM_SESSION_USERS, { sessionId: examSessionId });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    return (data?.exam_session_participants || []).map(mapExamSessionUser);
  }

  /**
   * Create a new interview session with participants
   */
  static async createSession(request: CreateInterviewSessionRequest): Promise<{ id: string; sessionToken: string }> {
    const userId = getUserIdFromToken();
    const sessionToken = generateSessionToken();

    const { data, errors } = await GraphQLService.mutate<{
      insert_interview_sessions_one: { id: string; session_token: string };
    }>(INSERT_INTERVIEW_SESSION, {
      object: {
        exam_session_id: request.examSessionId,
        interviewer_name: request.interviewerName,
        interviewer_email: request.interviewerEmail || null,
        rubric_id: request.rubricId,
        access_pin: request.accessPin || null,
        session_token: sessionToken,
        is_active: request.isActive,
        scheduled_start_at: request.scheduledStartAt || null,
        created_by: userId,
        updated_by: userId,
      },
    });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }

    const sessionId = data!.insert_interview_sessions_one.id;

    // Insert participants if any
    if (request.participantUserIds.length > 0) {
      await this.addParticipants(sessionId, request.participantUserIds);
    }

    return { id: sessionId, sessionToken: data!.insert_interview_sessions_one.session_token };
  }

  /**
   * Update an interview session
   */
  static async updateSession(id: string, request: UpdateInterviewSessionRequest): Promise<void> {
    const userId = getUserIdFromToken();

    const { errors } = await GraphQLService.mutate<{
      update_interview_sessions_by_pk: { id: string };
    }>(UPDATE_INTERVIEW_SESSION, {
      id,
      set: {
        interviewer_name: request.interviewerName,
        interviewer_email: request.interviewerEmail || null,
        rubric_id: request.rubricId,
        access_pin: request.accessPin || null,
        is_active: request.isActive,
        scheduled_start_at: request.scheduledStartAt || null,
        updated_by: userId,
      },
    });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }
  }

  /**
   * Soft delete an interview session
   */
  static async deleteSession(id: string): Promise<void> {
    const userId = getUserIdFromToken();

    const { errors } = await GraphQLService.mutate<{
      update_interview_sessions_by_pk: { id: string };
    }>(DELETE_INTERVIEW_SESSION, { id, updatedBy: userId });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }
  }

  /**
   * Toggle active status
   */
  static async toggleActive(id: string, currentActive: boolean): Promise<void> {
    const userId = getUserIdFromToken();

    const { errors } = await GraphQLService.mutate<{
      update_interview_sessions_by_pk: { id: string; is_active: boolean };
    }>(TOGGLE_INTERVIEW_SESSION_ACTIVE, {
      id,
      isActive: !currentActive,
      updatedBy: userId,
    });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }
  }

  /**
   * Add participants to an interview session
   */
  static async addParticipants(sessionId: string, userIds: string[]): Promise<void> {
    const userId = getUserIdFromToken();

    const objects = userIds.map((uid) => ({
      session_id: sessionId,
      participant_reference: uid,
      status: 'PENDING',
      created_by: userId,
      updated_by: userId,
    }));

    const { errors } = await GraphQLService.mutate<{
      insert_interview_participants: { affected_rows: number };
    }>(INSERT_INTERVIEW_PARTICIPANTS, { objects });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }
  }

  /**
   * Remove participants from an interview session (soft delete)
   */
  static async removeParticipants(sessionId: string, userIds: string[]): Promise<void> {
    const userId = getUserIdFromToken();

    const { errors } = await GraphQLService.mutate<{
      update_interview_participants: { affected_rows: number };
    }>(SOFT_DELETE_INTERVIEW_PARTICIPANTS, {
      sessionId,
      participantReferences: userIds,
      updatedBy: userId,
    });

    if (errors?.length) {
      throw new Error(errors[0].message);
    }
  }
}
