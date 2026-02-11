import { GraphQLService } from './graphql.service';
import { getUserIdFromToken } from '@/helpers/cookieHelper';
import type { ExamSession, SessionCategory, ExamSessionFormInput } from '@/types/exam-session';
import type { CategoryWithPackets } from '@/types/bank-soal';

// ============================================
// Hasura Raw Response Types (snake_case)
// ============================================

interface HasuraExamSession {
  id: string;
  name: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  access_token: string;
  is_random_packet: boolean;
  is_random_questions: boolean;
  is_random_answers: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string;
  updated_by: string;
}

interface HasuraSessionCategory {
  id: string;
  session_id: string;
  category_id: string;
  order_index: number;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface HasuraCategory {
  id: string;
  name: string;
  code: string;
  description: string;
  passing_grade: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// ============================================
// GraphQL Queries
// ============================================

const GET_SESSIONS = `
  query GetSessions {
    exam_sessions(
      where: { is_deleted: { _eq: false } }
      order_by: { start_time: desc }
    ) {
      id
      name
      start_time
      end_time
      duration_minutes
      access_token
      is_random_packet
      is_random_questions
      is_random_answers
      created_at
      updated_at
    }
  }
`;

const GET_SESSION_BY_ID = `
  query GetSessionById($id: uuid!) {
    exam_sessions_by_pk(id: $id) {
      id
      name
      start_time
      end_time
      duration_minutes
      access_token
      is_random_packet
      is_random_questions
      is_random_answers
      created_at
      updated_at
    }
  }
`;

const GET_SESSION_CATEGORIES = `
  query GetSessionCategories($sessionIds: [uuid!]!) {
    exam_session_categories(
      where: {
        session_id: { _in: $sessionIds }
        is_deleted: { _eq: false }
      }
      order_by: { order_index: asc }
    ) {
      id
      session_id
      category_id
      order_index
    }
  }
`;

const GET_SESSION_CATEGORIES_BY_SESSION = `
  query GetSessionCategoriesBySession($sessionId: uuid!) {
    exam_session_categories(
      where: {
        session_id: { _eq: $sessionId }
        is_deleted: { _eq: false }
      }
      order_by: { order_index: asc }
    ) {
      id
      session_id
      category_id
      order_index
    }
  }
`;

const GET_CATEGORIES_BY_IDS = `
  query GetCategoriesByIds($ids: [uuid!]!) {
    exam_categories(
      where: {
        id: { _in: $ids }
        is_deleted: { _eq: false }
      }
    ) {
      id
      name
      code
      description
      passing_grade
      is_active
    }
  }
`;

const GET_ALL_ACTIVE_CATEGORIES = `
  query GetAllActiveCategories {
    exam_categories(
      where: {
        is_deleted: { _eq: false }
        is_active: { _eq: true }
      }
      order_by: { name: asc }
    ) {
      id
      name
      code
      description
      passing_grade
      is_active
      created_at
      updated_at
    }
  }
`;

// ============================================
// GraphQL Mutations
// ============================================

const CREATE_SESSION = `
  mutation CreateSession($object: exam_sessions_insert_input!) {
    insert_exam_sessions_one(object: $object) {
      id
      name
      start_time
      end_time
      duration_minutes
      access_token
      is_random_packet
      is_random_questions
      is_random_answers
      created_at
      updated_at
    }
  }
`;

const UPDATE_SESSION = `
  mutation UpdateSession($id: uuid!, $set: exam_sessions_set_input!) {
    update_exam_sessions_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
      name
      start_time
      end_time
      duration_minutes
      access_token
      is_random_packet
      is_random_questions
      is_random_answers
      created_at
      updated_at
    }
  }
`;

const DELETE_SESSION = `
  mutation DeleteSession($id: uuid!) {
    update_exam_sessions_by_pk(
      pk_columns: { id: $id }
      _set: { is_deleted: true }
    ) {
      id
    }
  }
`;

const INSERT_SESSION_CATEGORIES = `
  mutation InsertSessionCategories($objects: [exam_session_categories_insert_input!]!) {
    insert_exam_session_categories(objects: $objects) {
      affected_rows
    }
  }
`;

const SOFT_DELETE_SESSION_CATEGORIES = `
  mutation SoftDeleteSessionCategories($sessionId: uuid!) {
    update_exam_session_categories(
      where: { session_id: { _eq: $sessionId }, is_deleted: { _eq: false } }
      _set: { is_deleted: true }
    ) {
      affected_rows
    }
  }
`;

// ============================================
// Helper Functions
// ============================================

/**
 * Convert date (YYYY-MM-DD) + time (HH:mm) to ISO string with timezone.
 * e.g. "2026-02-12" + "07:14" → "2026-02-12T00:14:00.000Z" (UTC)
 */
function toISOWithTimezone(date: string, time: string): string {
  return new Date(`${date}T${time}:00`).toISOString();
}

function generateToken(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let token = '';
  for (let i = 0; i < 6; i++) {
    token += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return token;
}

/**
 * Map Hasura session to frontend ExamSession type.
 * categories will be populated separately.
 */
function mapSession(h: HasuraExamSession, categories: SessionCategory[]): ExamSession {
  const startDate = new Date(h.start_time);
  const dateStr = startDate.toISOString().split('T')[0]; // YYYY-MM-DD

  return {
    id: h.id,
    name: h.name,
    categories,
    date: dateStr,
    startTime: h.start_time,
    endTime: h.end_time,
    duration: h.duration_minutes,
    accessToken: h.access_token,
    isRandomPacket: h.is_random_packet,
    isRandomQuestions: h.is_random_questions,
    isRandomAnswers: h.is_random_answers,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  };
}

function mapCategoryToWithPackets(h: HasuraCategory): CategoryWithPackets {
  return {
    id: h.id,
    name: h.name,
    code: h.code,
    description: h.description,
    passingGrade: h.passing_grade,
    isActive: h.is_active,
    packets: [],
    totalPackets: 0,
    totalQuestions: 0,
    totalScore: 0,
    createdAt: h.created_at,
    updatedAt: h.updated_at,
  };
}

// ============================================
// Exam Session Service
// ============================================

export class ExamSessionService {
  /**
   * Get all sessions with their categories
   */
  static async getSessions(): Promise<ExamSession[]> {
    // 1. Fetch all sessions
    const sessionsRes = await GraphQLService.query<{
      exam_sessions: HasuraExamSession[];
    }>(GET_SESSIONS);

    if (sessionsRes.errors || !sessionsRes.data) {
      console.error('Failed to fetch sessions:', sessionsRes.errors);
      return [];
    }

    const sessions = sessionsRes.data.exam_sessions;
    if (sessions.length === 0) return [];

    // 2. Fetch all session_categories for these sessions
    const sessionIds = sessions.map((s) => s.id);
    const scRes = await GraphQLService.query<{
      exam_session_categories: HasuraSessionCategory[];
    }>(GET_SESSION_CATEGORIES, { sessionIds });

    const sessionCategories = scRes.data?.exam_session_categories || [];

    // 3. Fetch all referenced categories
    const categoryIds = [...new Set(sessionCategories.map((sc) => sc.category_id))];
    const categoriesMap: Map<string, HasuraCategory> = new Map();

    if (categoryIds.length > 0) {
      const catRes = await GraphQLService.query<{
        exam_categories: HasuraCategory[];
      }>(GET_CATEGORIES_BY_IDS, { ids: categoryIds });

      if (catRes.data?.exam_categories) {
        for (const cat of catRes.data.exam_categories) {
          categoriesMap.set(cat.id, cat);
        }
      }
    }

    // 4. Build session categories grouped by session_id
    const scBySession = new Map<string, SessionCategory[]>();
    for (const sc of sessionCategories) {
      const cat = categoriesMap.get(sc.category_id);
      if (!cat) continue;

      const sessionCat: SessionCategory = {
        categoryId: cat.id,
        categoryCode: cat.code,
        categoryName: cat.name,
        orderIndex: sc.order_index,
      };

      const existing = scBySession.get(sc.session_id) || [];
      existing.push(sessionCat);
      scBySession.set(sc.session_id, existing);
    }

    // 5. Map to frontend types
    return sessions.map((s) => {
      const cats = (scBySession.get(s.id) || []).sort((a, b) => a.orderIndex - b.orderIndex);
      return mapSession(s, cats);
    });
  }

  /**
   * Get a single session by ID with its categories
   */
  static async getSessionById(id: string): Promise<ExamSession | null> {
    // Fetch session
    const sessionRes = await GraphQLService.query<{
      exam_sessions_by_pk: HasuraExamSession | null;
    }>(GET_SESSION_BY_ID, { id });

    const session = sessionRes.data?.exam_sessions_by_pk;
    if (!session) return null;

    // Fetch session categories
    const scRes = await GraphQLService.query<{
      exam_session_categories: HasuraSessionCategory[];
    }>(GET_SESSION_CATEGORIES_BY_SESSION, { sessionId: id });

    const sessionCats = scRes.data?.exam_session_categories || [];

    // Fetch category details
    const categoryIds = sessionCats.map((sc) => sc.category_id);
    const categoriesMap: Map<string, HasuraCategory> = new Map();

    if (categoryIds.length > 0) {
      const catRes = await GraphQLService.query<{
        exam_categories: HasuraCategory[];
      }>(GET_CATEGORIES_BY_IDS, { ids: categoryIds });

      if (catRes.data?.exam_categories) {
        for (const cat of catRes.data.exam_categories) {
          categoriesMap.set(cat.id, cat);
        }
      }
    }

    // Build SessionCategory array
    const categories: SessionCategory[] = sessionCats
      .map((sc) => {
        const cat = categoriesMap.get(sc.category_id);
        if (!cat) return null;
        return {
          categoryId: cat.id,
          categoryCode: cat.code,
          categoryName: cat.name,
          orderIndex: sc.order_index,
        } as SessionCategory;
      })
      .filter((c): c is SessionCategory => c !== null)
      .sort((a, b) => a.orderIndex - b.orderIndex);

    return mapSession(session, categories);
  }

  /**
   * Create a new exam session with its categories
   */
  static async createSession(input: ExamSessionFormInput): Promise<ExamSession | null> {
    const userId = getUserIdFromToken();
    const now = new Date().toISOString();

    const startTime = toISOWithTimezone(input.date, input.startTime);
    const endTime = toISOWithTimezone(input.date, input.endTime);

    // 1. Create the session
    const sessionRes = await GraphQLService.mutate<{
      insert_exam_sessions_one: HasuraExamSession;
    }>(CREATE_SESSION, {
      object: {
        name: input.name,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: input.duration,
        access_token: generateToken(),
        is_random_packet: input.isRandomPacket,
        is_random_questions: input.isRandomQuestions,
        is_random_answers: input.isRandomAnswers,
        is_deleted: false,
        created_by: userId,
        updated_by: userId,
        created_at: now,
        updated_at: now,
      },
    });

    if (sessionRes.errors || !sessionRes.data?.insert_exam_sessions_one) {
      console.error('Failed to create session:', sessionRes.errors);
      return null;
    }

    const newSession = sessionRes.data.insert_exam_sessions_one;

    // 2. Insert session categories
    if (input.categoryIds.length > 0) {
      const categoryObjects = input.categoryIds.map((catId, index) => ({
        session_id: newSession.id,
        category_id: catId,
        order_index: index + 1,
        is_deleted: false,
        created_by: userId,
        updated_by: userId,
        created_at: now,
        updated_at: now,
      }));

      const scRes = await GraphQLService.mutate<{
        insert_exam_session_categories: { affected_rows: number };
      }>(INSERT_SESSION_CATEGORIES, { objects: categoryObjects });

      if (scRes.errors) {
        console.error('Failed to insert session categories:', scRes.errors);
      }
    }

    // 3. Return the full session
    return this.getSessionById(newSession.id);
  }

  /**
   * Update an existing exam session and its categories
   */
  static async updateSession(id: string, input: ExamSessionFormInput): Promise<ExamSession | null> {
    const userId = getUserIdFromToken();
    const now = new Date().toISOString();

    const startTime = toISOWithTimezone(input.date, input.startTime);
    const endTime = toISOWithTimezone(input.date, input.endTime);

    // 1. Update the session
    const sessionRes = await GraphQLService.mutate<{
      update_exam_sessions_by_pk: HasuraExamSession;
    }>(UPDATE_SESSION, {
      id,
      set: {
        name: input.name,
        start_time: startTime,
        end_time: endTime,
        duration_minutes: input.duration,
        is_random_packet: input.isRandomPacket,
        is_random_questions: input.isRandomQuestions,
        is_random_answers: input.isRandomAnswers,
        updated_by: userId,
        updated_at: now,
      },
    });

    if (sessionRes.errors || !sessionRes.data?.update_exam_sessions_by_pk) {
      console.error('Failed to update session:', sessionRes.errors);
      return null;
    }

    // 2. Soft-delete old session categories
    await GraphQLService.mutate<{
      update_exam_session_categories: { affected_rows: number };
    }>(SOFT_DELETE_SESSION_CATEGORIES, { sessionId: id });

    // 3. Insert new session categories
    if (input.categoryIds.length > 0) {
      const categoryObjects = input.categoryIds.map((catId, index) => ({
        session_id: id,
        category_id: catId,
        order_index: index + 1,
        is_deleted: false,
        created_by: userId,
        updated_by: userId,
        created_at: now,
        updated_at: now,
      }));

      const scRes = await GraphQLService.mutate<{
        insert_exam_session_categories: { affected_rows: number };
      }>(INSERT_SESSION_CATEGORIES, { objects: categoryObjects });

      if (scRes.errors) {
        console.error('Failed to insert session categories:', scRes.errors);
      }
    }

    // 4. Return the full updated session
    return this.getSessionById(id);
  }

  /**
   * Soft-delete a session and its categories
   */
  static async deleteSession(id: string): Promise<boolean> {
    // Soft-delete the session
    const res = await GraphQLService.mutate<{
      update_exam_sessions_by_pk: { id: string };
    }>(DELETE_SESSION, { id });

    if (res.errors) {
      console.error('Failed to delete session:', res.errors);
      return false;
    }

    // Also soft-delete the session categories
    await GraphQLService.mutate<{
      update_exam_session_categories: { affected_rows: number };
    }>(SOFT_DELETE_SESSION_CATEGORIES, { sessionId: id });

    return true;
  }

  /**
   * Get available categories for the form (active, not deleted)
   */
  static async getAvailableCategories(): Promise<CategoryWithPackets[]> {
    const res = await GraphQLService.query<{
      exam_categories: HasuraCategory[];
    }>(GET_ALL_ACTIVE_CATEGORIES);

    if (res.errors || !res.data?.exam_categories) {
      console.error('Failed to fetch categories:', res.errors);
      return [];
    }

    return res.data.exam_categories.map(mapCategoryToWithPackets);
  }
}
