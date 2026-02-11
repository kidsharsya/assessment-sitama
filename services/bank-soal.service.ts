import { GraphQLService } from './graphql.service';
import { getUserIdFromToken } from '@/helpers/cookieHelper';
import type { CategoryWithPackets, PacketWithQuestions, Question, QuestionOption, OptionLabel, CategoryFormInput, PacketFormInput, QuestionFormInput } from '@/types/bank-soal';

// ============================================
// Hasura Raw Response Types (snake_case)
// ============================================

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

interface HasuraPacket {
  id: string;
  category_id: string;
  name: string;
  code: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

interface HasuraPacketWithAggregate extends HasuraPacket {
  questions_aggregate: {
    aggregate: {
      count: number;
      sum: { score: number | null };
    };
  };
}

interface HasuraQuestion {
  id: string;
  packet_id: string;
  question_text: string;
  image_path: string | null;
  options: HasuraOptionItem[];
  correct_option: string;
  score: number;
  created_at: string;
  updated_at: string;
}

interface HasuraOptionItem {
  label: string;
  text: string;
}

// ============================================
// GraphQL Queries
// ============================================

const GET_CATEGORIES = `
  query GetCategories {
    exam_categories(
      where: { is_deleted: { _eq: false } }
      order_by: { created_at: desc }
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

const GET_CATEGORY_BY_ID = `
  query GetCategoryById($id: uuid!) {
    exam_categories_by_pk(id: $id) {
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

const GET_PACKETS_BY_CATEGORY_ID = `
  query GetPacketsByCategoryId($categoryId: uuid!) {
    exam_packets(
      where: { category_id: { _eq: $categoryId }, is_deleted: { _eq: false } }
      order_by: { created_at: asc }
    ) {
      id
      category_id
      name
      code
      is_active
      created_at
      updated_at
    }
  }
`;

const GET_ALL_PACKETS = `
  query GetAllPackets {
    exam_packets(
      where: { is_deleted: { _eq: false } }
      order_by: { created_at: asc }
    ) {
      id
      category_id
      name
      code
      is_active
      created_at
      updated_at
    }
  }
`;

const GET_QUESTIONS_COUNT_BY_PACKET_IDS = `
  query GetQuestionsCountByPacketIds($packetIds: [uuid!]!) {
    questions(
      where: { packet_id: { _in: $packetIds }, is_deleted: { _eq: false } }
    ) {
      packet_id
      score
    }
  }
`;

const GET_QUESTIONS_BY_PACKET_ID = `
  query GetQuestionsByPacketId($packetId: uuid!) {
    questions(
      where: { packet_id: { _eq: $packetId }, is_deleted: { _eq: false } }
      order_by: { created_at: asc }
    ) {
      id
      packet_id
      question_text
      image_path
      options
      correct_option
      score
      created_at
      updated_at
    }
  }
`;

// ============================================
// GraphQL Mutations
// ============================================

const INSERT_CATEGORY = `
  mutation InsertCategory($object: exam_categories_insert_input!) {
    insert_exam_categories_one(object: $object) {
      id
    }
  }
`;

const UPDATE_CATEGORY = `
  mutation UpdateCategory($id: uuid!, $set: exam_categories_set_input!) {
    update_exam_categories_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

const DELETE_CATEGORY = `
  mutation DeleteCategory($id: uuid!) {
    update_exam_categories_by_pk(pk_columns: { id: $id }, _set: { is_deleted: true }) {
      id
    }
  }
`;

const INSERT_PACKET = `
  mutation InsertPacket($object: exam_packets_insert_input!) {
    insert_exam_packets_one(object: $object) {
      id
    }
  }
`;

const UPDATE_PACKET = `
  mutation UpdatePacket($id: uuid!, $set: exam_packets_set_input!) {
    update_exam_packets_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

const DELETE_PACKET = `
  mutation DeletePacket($id: uuid!) {
    update_exam_packets_by_pk(pk_columns: { id: $id }, _set: { is_deleted: true }) {
      id
    }
  }
`;

const INSERT_QUESTION = `
  mutation InsertQuestion($object: questions_insert_input!) {
    insert_questions_one(object: $object) {
      id
    }
  }
`;

const UPDATE_QUESTION = `
  mutation UpdateQuestion($id: uuid!, $set: questions_set_input!) {
    update_questions_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

const DELETE_QUESTION = `
  mutation DeleteQuestion($id: uuid!) {
    update_questions_by_pk(pk_columns: { id: $id }, _set: { is_deleted: true }) {
      id
    }
  }
`;

// ============================================
// Mapper Functions (Hasura → Frontend Types)
// ============================================

function mapQuestion(raw: HasuraQuestion, index: number): Question {
  // Parse options from jsonb - expected format: [{ label: "A", text: "..." }, ...]
  const rawOptions: HasuraOptionItem[] = Array.isArray(raw.options) ? raw.options : [];

  const options: QuestionOption[] = rawOptions.map((opt) => ({
    id: `opt-${raw.id}-${opt.label}`,
    label: opt.label as OptionLabel,
    text: opt.text,
  }));

  return {
    id: raw.id,
    packetId: raw.packet_id,
    questionText: raw.question_text,
    imagePath: raw.image_path || undefined,
    options,
    correctAnswer: raw.correct_option as OptionLabel,
    score: raw.score,
    order: index + 1,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapPacket(raw: HasuraPacket, totalQuestions = 0, totalScore = 0): PacketWithQuestions {
  return {
    id: raw.id,
    categoryId: raw.category_id,
    name: raw.name,
    code: raw.code || '',
    isActive: raw.is_active,
    questions: [], // Questions are loaded separately when needed
    totalQuestions,
    totalScore,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapCategoryOnly(raw: HasuraCategory): CategoryWithPackets {
  return {
    id: raw.id,
    name: raw.name,
    code: raw.code || '',
    description: raw.description || '',
    passingGrade: raw.passing_grade,
    isActive: raw.is_active,
    packets: [],
    totalPackets: 0,
    totalQuestions: 0,
    totalScore: 0,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ============================================
// Helper: Build options jsonb for Hasura
// ============================================

function buildOptionsJsonb(formOptions: QuestionFormInput['options']): HasuraOptionItem[] {
  return (['A', 'B', 'C', 'D', 'E'] as OptionLabel[]).map((label) => ({
    label,
    text: formOptions[label].text,
  }));
}

// ============================================
// BankSoalService
// ============================================

export class BankSoalService {
  // ------------------------------------------
  // Categories
  // ------------------------------------------

  /**
   * Get all categories with their packets and question stats
   */
  static async getCategories(): Promise<CategoryWithPackets[]> {
    // 1. Fetch categories
    const catResponse = await GraphQLService.query<{ exam_categories: HasuraCategory[] }>(GET_CATEGORIES);

    if (catResponse.errors?.length) {
      throw new Error(catResponse.errors[0].message);
    }

    const rawCategories = catResponse.data?.exam_categories || [];
    if (rawCategories.length === 0) return [];

    // 2. Fetch all packets
    const pktResponse = await GraphQLService.query<{ exam_packets: HasuraPacket[] }>(GET_ALL_PACKETS);
    const rawPackets = pktResponse.data?.exam_packets || [];

    // 3. Fetch question stats for all packets (if any)
    const statsMap: Record<string, { count: number; totalScore: number }> = {};
    if (rawPackets.length > 0) {
      const packetIds = rawPackets.map((p) => p.id);
      const qResponse = await GraphQLService.query<{ questions: { packet_id: string; score: number }[] }>(GET_QUESTIONS_COUNT_BY_PACKET_IDS, { packetIds });

      if (qResponse.data?.questions) {
        for (const q of qResponse.data.questions) {
          if (!statsMap[q.packet_id]) {
            statsMap[q.packet_id] = { count: 0, totalScore: 0 };
          }
          statsMap[q.packet_id].count++;
          statsMap[q.packet_id].totalScore += q.score;
        }
      }
    }

    // 4. Group packets by category
    const packetsByCategoryId: Record<string, PacketWithQuestions[]> = {};
    for (const raw of rawPackets) {
      if (!packetsByCategoryId[raw.category_id]) {
        packetsByCategoryId[raw.category_id] = [];
      }
      const stats = statsMap[raw.id] || { count: 0, totalScore: 0 };
      packetsByCategoryId[raw.category_id].push(mapPacket(raw, stats.count, stats.totalScore));
    }

    // 5. Assemble categories with packets
    return rawCategories.map((rawCat) => {
      const category = mapCategoryOnly(rawCat);
      const packets = packetsByCategoryId[rawCat.id] || [];
      category.packets = packets;
      category.totalPackets = packets.length;
      category.totalQuestions = packets.reduce((sum, p) => sum + p.totalQuestions, 0);
      category.totalScore = packets.reduce((sum, p) => sum + p.totalScore, 0);
      return category;
    });
  }

  /**
   * Get single category by ID with its packets (separate queries)
   */
  static async getCategoryById(id: string): Promise<CategoryWithPackets | null> {
    // 1. Fetch category
    const catResponse = await GraphQLService.query<{ exam_categories_by_pk: HasuraCategory | null }>(GET_CATEGORY_BY_ID, { id });

    if (catResponse.errors?.length) {
      throw new Error(catResponse.errors[0].message);
    }

    const rawCat = catResponse.data?.exam_categories_by_pk;
    if (!rawCat) return null;

    // 2. Fetch packets for this category
    const packets = await this.getPacketsByCategoryId(id);

    const category = mapCategoryOnly(rawCat);
    category.packets = packets;
    category.totalPackets = packets.length;
    category.totalQuestions = packets.reduce((sum, p) => sum + p.totalQuestions, 0);
    category.totalScore = packets.reduce((sum, p) => sum + p.totalScore, 0);

    return category;
  }

  /**
   * Get packets for a given category, with question count/score stats
   */
  static async getPacketsByCategoryId(categoryId: string): Promise<PacketWithQuestions[]> {
    // 1. Fetch packets
    const pktResponse = await GraphQLService.query<{ exam_packets: HasuraPacket[] }>(GET_PACKETS_BY_CATEGORY_ID, { categoryId });

    if (pktResponse.errors?.length) {
      throw new Error(pktResponse.errors[0].message);
    }

    const rawPackets = pktResponse.data?.exam_packets || [];
    if (rawPackets.length === 0) return [];

    // 2. Fetch question stats for all packets in one query
    const packetIds = rawPackets.map((p) => p.id);
    const qResponse = await GraphQLService.query<{ questions: { packet_id: string; score: number }[] }>(GET_QUESTIONS_COUNT_BY_PACKET_IDS, { packetIds });

    // Build a map: packet_id → { count, totalScore }
    const statsMap: Record<string, { count: number; totalScore: number }> = {};
    if (qResponse.data?.questions) {
      for (const q of qResponse.data.questions) {
        if (!statsMap[q.packet_id]) {
          statsMap[q.packet_id] = { count: 0, totalScore: 0 };
        }
        statsMap[q.packet_id].count++;
        statsMap[q.packet_id].totalScore += q.score;
      }
    }

    return rawPackets.map((raw) => {
      const stats = statsMap[raw.id] || { count: 0, totalScore: 0 };
      return mapPacket(raw, stats.count, stats.totalScore);
    });
  }

  /**
   * Create a new category
   */
  static async createCategory(input: CategoryFormInput): Promise<string> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{ insert_exam_categories_one: { id: string } }>(INSERT_CATEGORY, {
      object: {
        name: input.name,
        code: input.code,
        description: input.description,
        passing_grade: input.passingGrade,
        is_active: input.isActive,
        created_by: userId,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    return response.data!.insert_exam_categories_one.id;
  }

  /**
   * Update an existing category
   */
  static async updateCategory(id: string, input: CategoryFormInput): Promise<void> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{ update_exam_categories_by_pk: { id: string } }>(UPDATE_CATEGORY, {
      id,
      set: {
        name: input.name,
        code: input.code,
        description: input.description,
        passing_grade: input.passingGrade,
        is_active: input.isActive,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  /**
   * Soft-delete a category (set is_deleted = true)
   */
  static async deleteCategory(id: string): Promise<void> {
    const response = await GraphQLService.mutate<{ update_exam_categories_by_pk: { id: string } }>(DELETE_CATEGORY, { id });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  // ------------------------------------------
  // Packets
  // ------------------------------------------

  /**
   * Get questions for a specific packet
   */
  static async getQuestionsByPacketId(packetId: string): Promise<Question[]> {
    const response = await GraphQLService.query<{ questions: HasuraQuestion[] }>(GET_QUESTIONS_BY_PACKET_ID, { packetId });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    return (response.data?.questions || []).map((q, index) => mapQuestion(q, index));
  }

  /**
   * Create a new packet under a category
   */
  static async createPacket(categoryId: string, input: PacketFormInput): Promise<string> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{ insert_exam_packets_one: { id: string } }>(INSERT_PACKET, {
      object: {
        category_id: categoryId,
        name: input.name,
        code: input.code,
        is_active: input.isActive,
        created_by: userId,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    return response.data!.insert_exam_packets_one.id;
  }

  /**
   * Update an existing packet
   */
  static async updatePacket(id: string, input: PacketFormInput): Promise<void> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{ update_exam_packets_by_pk: { id: string } }>(UPDATE_PACKET, {
      id,
      set: {
        name: input.name,
        code: input.code,
        is_active: input.isActive,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  /**
   * Soft-delete a packet
   */
  static async deletePacket(id: string): Promise<void> {
    const response = await GraphQLService.mutate<{ update_exam_packets_by_pk: { id: string } }>(DELETE_PACKET, { id });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  // ------------------------------------------
  // Questions
  // ------------------------------------------

  /**
   * Create a new question under a packet
   */
  static async createQuestion(packetId: string, input: QuestionFormInput): Promise<string> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{ insert_questions_one: { id: string } }>(INSERT_QUESTION, {
      object: {
        packet_id: packetId,
        question_text: input.questionText,
        image_path: typeof input.imagePath === 'string' ? input.imagePath : null,
        options: buildOptionsJsonb(input.options),
        correct_option: input.correctAnswer,
        score: input.score,
        created_by: userId,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    return response.data!.insert_questions_one.id;
  }

  /**
   * Update an existing question
   */
  static async updateQuestion(id: string, input: QuestionFormInput): Promise<void> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{ update_questions_by_pk: { id: string } }>(UPDATE_QUESTION, {
      id,
      set: {
        question_text: input.questionText,
        image_path: typeof input.imagePath === 'string' ? input.imagePath : null,
        options: buildOptionsJsonb(input.options),
        correct_option: input.correctAnswer,
        score: input.score,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  /**
   * Soft-delete a question
   */
  static async deleteQuestion(id: string): Promise<void> {
    const response = await GraphQLService.mutate<{ update_questions_by_pk: { id: string } }>(DELETE_QUESTION, { id });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }
}
