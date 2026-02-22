import { GraphQLService } from './graphql.service';
import { getUserIdFromToken } from '@/helpers/cookieHelper';
import type { RubrikWawancaraWithKriteria, RubrikWawancaraFormInput, Kriteria, KriteriaFormInput, RangeNilai } from '@/types/rubrik-wawancara';

// ============================================
// Hasura Raw Response Types (snake_case)
// ============================================

interface HasuraRubrik {
  id: string;
  name: string;
  description: string;
  is_active: boolean;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface HasuraCriteriaStats {
  rubric_id: string;
  weight: number;
}

interface HasuraCriteria {
  id: string;
  rubric_id: string;
  name: string;
  description: string;
  weight: number;
  score_ranges: HasuraScoreRange[] | null;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
  created_by: string | null;
  updated_by: string | null;
}

interface HasuraScoreRange {
  id: string;
  min_score: number;
  max_score: number;
  category: string;
  description?: string;
}

// ============================================
// GraphQL Queries
// ============================================

const GET_RUBRICS = `
  query GetRubrics($limit: Int!, $offset: Int!) {
    interview_rubrics(
      where: { is_deleted: { _eq: false } }
      order_by: { created_at: desc }
      limit: $limit
      offset: $offset
    ) {
      id
      name
      description
      is_active
      is_deleted
      created_at
      updated_at
    }
    interview_rubrics_aggregate(where: { is_deleted: { _eq: false } }) {
      aggregate {
        count
      }
    }
  }
`;

const GET_CRITERIA_STATS_BY_RUBRIC_IDS = `
  query GetCriteriaStatsByRubricIds($rubricIds: [uuid!]!) {
    rubric_criteria(
      where: { rubric_id: { _in: $rubricIds }, is_deleted: { _eq: false } }
    ) {
      rubric_id
      weight
    }
  }
`;

const GET_RUBRIC_BY_ID = `
  query GetRubricById($id: uuid!) {
    interview_rubrics_by_pk(id: $id) {
      id
      name
      description
      is_active
      is_deleted
      created_at
      updated_at
    }
  }
`;

const GET_CRITERIA_BY_RUBRIC_ID = `
  query GetCriteriaByRubricId($rubricId: uuid!, $limit: Int!, $offset: Int!) {
    rubric_criteria(
      where: { rubric_id: { _eq: $rubricId }, is_deleted: { _eq: false } }
      order_by: { created_at: asc }
      limit: $limit
      offset: $offset
    ) {
      id
      rubric_id
      name
      description
      weight
      score_ranges
      created_at
      updated_at
    }
    rubric_criteria_aggregate(
      where: { rubric_id: { _eq: $rubricId }, is_deleted: { _eq: false } }
    ) {
      aggregate {
        count
      }
    }
  }
`;

const GET_ALL_CRITERIA_BY_RUBRIC_ID = `
  query GetAllCriteriaByRubricId($rubricId: uuid!) {
    rubric_criteria(
      where: { rubric_id: { _eq: $rubricId }, is_deleted: { _eq: false } }
      order_by: { created_at: asc }
    ) {
      id
      rubric_id
      name
      description
      weight
      score_ranges
      created_at
      updated_at
    }
  }
`;

// ============================================
// GraphQL Mutations
// ============================================

const INSERT_RUBRIC = `
  mutation InsertRubric($object: interview_rubrics_insert_input!) {
    insert_interview_rubrics_one(object: $object) {
      id
    }
  }
`;

const UPDATE_RUBRIC = `
  mutation UpdateRubric($id: uuid!, $set: interview_rubrics_set_input!) {
    update_interview_rubrics_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

const DELETE_RUBRIC = `
  mutation DeleteRubric($id: uuid!) {
    update_interview_rubrics_by_pk(pk_columns: { id: $id }, _set: { is_deleted: true }) {
      id
    }
  }
`;

const TOGGLE_RUBRIC_ACTIVE = `
  mutation ToggleRubricActive($id: uuid!, $isActive: Boolean!) {
    update_interview_rubrics_by_pk(pk_columns: { id: $id }, _set: { is_active: $isActive }) {
      id
      is_active
    }
  }
`;

const INSERT_CRITERIA = `
  mutation InsertCriteria($object: rubric_criteria_insert_input!) {
    insert_rubric_criteria_one(object: $object) {
      id
    }
  }
`;

const UPDATE_CRITERIA = `
  mutation UpdateCriteria($id: uuid!, $set: rubric_criteria_set_input!) {
    update_rubric_criteria_by_pk(pk_columns: { id: $id }, _set: $set) {
      id
    }
  }
`;

const DELETE_CRITERIA = `
  mutation DeleteCriteria($id: uuid!) {
    update_rubric_criteria_by_pk(pk_columns: { id: $id }, _set: { is_deleted: true }) {
      id
    }
  }
`;

// ============================================
// Mapper Functions (Hasura → Frontend Types)
// ============================================

function mapScoreRanges(raw: HasuraScoreRange[] | null): RangeNilai[] {
  if (!raw || !Array.isArray(raw)) return [];
  return raw.map((r) => ({
    id: r.id,
    minNilai: r.min_score,
    maxNilai: r.max_score,
    kategori: r.category,
    deskripsi: r.description,
  }));
}

function mapCriteria(raw: HasuraCriteria, index: number): Kriteria {
  return {
    id: raw.id,
    rubrikId: raw.rubric_id,
    nama: raw.name,
    deskripsi: raw.description || '',
    bobot: raw.weight,
    urutan: index + 1,
    metodePenilaian: {
      tipe: 'range',
      ranges: mapScoreRanges(raw.score_ranges),
      nilaiMaksimum: 100,
    },
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

function mapRubrik(raw: HasuraRubrik, stats: { count: number; totalWeight: number } = { count: 0, totalWeight: 0 }, kriteriaList: Kriteria[] = []): RubrikWawancaraWithKriteria {
  return {
    id: raw.id,
    nama: raw.name,
    deskripsi: raw.description || '',
    isActive: raw.is_active,
    kriteriaList,
    totalKriteria: stats.count,
    totalBobot: stats.totalWeight,
    createdAt: raw.created_at,
    updatedAt: raw.updated_at,
  };
}

// ============================================
// Helper: Build score_ranges jsonb for Hasura
// ============================================

function buildScoreRangesJsonb(ranges?: RangeNilai[]): HasuraScoreRange[] | null {
  if (!ranges || ranges.length === 0) return null;
  return ranges.map((r) => ({
    id: r.id,
    min_score: r.minNilai,
    max_score: r.maxNilai,
    category: r.kategori,
    description: r.deskripsi,
  }));
}

// ============================================
// Paginated Response Type
// ============================================

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  page: number;
  size: number;
}

// ============================================
// RubrikWawancaraService
// ============================================

export class RubrikWawancaraService {
  // ------------------------------------------
  // Rubrics
  // ------------------------------------------

  /**
   * Get paginated rubrics with criteria aggregate stats
   */
  static async getRubrics(page: number = 0, size: number = 10): Promise<PaginatedResponse<RubrikWawancaraWithKriteria>> {
    const offset = page * size;

    // 1. Fetch rubrics
    const response = await GraphQLService.query<{
      interview_rubrics: HasuraRubrik[];
      interview_rubrics_aggregate: { aggregate: { count: number } };
    }>(GET_RUBRICS, { limit: size, offset });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    const rawRubrics = response.data?.interview_rubrics || [];
    const totalElements = response.data?.interview_rubrics_aggregate?.aggregate?.count || 0;

    if (rawRubrics.length === 0) {
      return { content: [], totalElements, totalPages: 0, page, size };
    }

    // 2. Fetch criteria stats for all rubric IDs in one query
    const rubricIds = rawRubrics.map((r) => r.id);
    const statsMap: Record<string, { count: number; totalWeight: number }> = {};

    const statsResponse = await GraphQLService.query<{
      rubric_criteria: HasuraCriteriaStats[];
    }>(GET_CRITERIA_STATS_BY_RUBRIC_IDS, { rubricIds });

    if (statsResponse.data?.rubric_criteria) {
      for (const c of statsResponse.data.rubric_criteria) {
        if (!statsMap[c.rubric_id]) {
          statsMap[c.rubric_id] = { count: 0, totalWeight: 0 };
        }
        statsMap[c.rubric_id].count++;
        statsMap[c.rubric_id].totalWeight += c.weight;
      }
    }

    // 3. Assemble rubrics with stats
    const content = rawRubrics.map((raw) => {
      const stats = statsMap[raw.id] || { count: 0, totalWeight: 0 };
      return mapRubrik(raw, stats);
    });

    return {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      page,
      size,
    };
  }

  /**
   * Get a single rubric by ID
   */
  static async getRubricById(id: string): Promise<RubrikWawancaraWithKriteria | null> {
    const response = await GraphQLService.query<{
      interview_rubrics_by_pk: HasuraRubrik | null;
    }>(GET_RUBRIC_BY_ID, { id });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    const raw = response.data?.interview_rubrics_by_pk;
    if (!raw) return null;

    // Also fetch criteria for this rubric
    const criteria = await this.getAllCriteriaByRubricId(id);
    const totalBobot = criteria.reduce((sum, k) => sum + k.bobot, 0);

    return {
      id: raw.id,
      nama: raw.name,
      deskripsi: raw.description || '',
      isActive: raw.is_active,
      kriteriaList: criteria,
      totalKriteria: criteria.length,
      totalBobot,
      createdAt: raw.created_at,
      updatedAt: raw.updated_at,
    };
  }

  /**
   * Create a new rubric
   */
  static async createRubric(input: RubrikWawancaraFormInput): Promise<string> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{
      insert_interview_rubrics_one: { id: string };
    }>(INSERT_RUBRIC, {
      object: {
        name: input.nama,
        description: input.deskripsi,
        is_active: input.isActive,
        created_by: userId,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    return response.data!.insert_interview_rubrics_one.id;
  }

  /**
   * Update an existing rubric
   */
  static async updateRubric(id: string, input: RubrikWawancaraFormInput): Promise<void> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{
      update_interview_rubrics_by_pk: { id: string };
    }>(UPDATE_RUBRIC, {
      id,
      set: {
        name: input.nama,
        description: input.deskripsi,
        is_active: input.isActive,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  /**
   * Soft-delete a rubric (set is_deleted = true)
   */
  static async deleteRubric(id: string): Promise<void> {
    const response = await GraphQLService.mutate<{
      update_interview_rubrics_by_pk: { id: string };
    }>(DELETE_RUBRIC, { id });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  /**
   * Toggle rubric active status
   */
  static async toggleRubricActive(id: string, currentIsActive: boolean): Promise<void> {
    const response = await GraphQLService.mutate<{
      update_interview_rubrics_by_pk: { id: string; is_active: boolean };
    }>(TOGGLE_RUBRIC_ACTIVE, {
      id,
      isActive: !currentIsActive,
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  // ------------------------------------------
  // Criteria
  // ------------------------------------------

  /**
   * Get paginated criteria by rubric ID
   */
  static async getCriteriaByRubricId(rubricId: string, page: number = 0, size: number = 10): Promise<PaginatedResponse<Kriteria>> {
    const offset = page * size;

    const response = await GraphQLService.query<{
      rubric_criteria: HasuraCriteria[];
      rubric_criteria_aggregate: { aggregate: { count: number } };
    }>(GET_CRITERIA_BY_RUBRIC_ID, { rubricId, limit: size, offset });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    const rawCriteria = response.data?.rubric_criteria || [];
    const totalElements = response.data?.rubric_criteria_aggregate?.aggregate?.count || 0;

    const content = rawCriteria.map((raw, index) => mapCriteria(raw, page * size + index));

    return {
      content,
      totalElements,
      totalPages: Math.ceil(totalElements / size),
      page,
      size,
    };
  }

  /**
   * Get all criteria by rubric ID (no pagination, for preview)
   */
  static async getAllCriteriaByRubricId(rubricId: string): Promise<Kriteria[]> {
    const response = await GraphQLService.query<{
      rubric_criteria: HasuraCriteria[];
    }>(GET_ALL_CRITERIA_BY_RUBRIC_ID, { rubricId });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    return (response.data?.rubric_criteria || []).map((raw, index) => mapCriteria(raw, index));
  }

  /**
   * Create a new criteria under a rubric
   */
  static async createCriteria(rubricId: string, input: KriteriaFormInput): Promise<string> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{
      insert_rubric_criteria_one: { id: string };
    }>(INSERT_CRITERIA, {
      object: {
        rubric_id: rubricId,
        name: input.nama,
        description: input.deskripsi,
        weight: input.bobot,
        score_ranges: buildScoreRangesJsonb(input.metodePenilaian.ranges),
        created_by: userId,
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }

    return response.data!.insert_rubric_criteria_one.id;
  }

  /**
   * Update an existing criteria
   */
  static async updateCriteria(id: string, input: KriteriaFormInput): Promise<void> {
    const userId = getUserIdFromToken();

    const response = await GraphQLService.mutate<{
      update_rubric_criteria_by_pk: { id: string };
    }>(UPDATE_CRITERIA, {
      id,
      set: {
        name: input.nama,
        description: input.deskripsi,
        weight: input.bobot,
        score_ranges: buildScoreRangesJsonb(input.metodePenilaian.ranges),
        updated_by: userId,
      },
    });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }

  /**
   * Soft-delete a criteria (set is_deleted = true)
   */
  static async deleteCriteria(id: string): Promise<void> {
    const response = await GraphQLService.mutate<{
      update_rubric_criteria_by_pk: { id: string };
    }>(DELETE_CRITERIA, { id });

    if (response.errors?.length) {
      throw new Error(response.errors[0].message);
    }
  }
}
