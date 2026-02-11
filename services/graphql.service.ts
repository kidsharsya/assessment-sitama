import { executeGraphQL } from '@/lib/apiGraphql';
import { GraphQLResponse } from '@/types/auth.types';

/**
 * Base GraphQL Service
 * Menyediakan method untuk query dan mutation ke Hasura
 */
export class GraphQLService {
  /**
   * Execute GraphQL Query
   */
  static async query<T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> {
    return executeGraphQL<T>(query, variables);
  }

  /**
   * Execute GraphQL Mutation
   */
  static async mutate<T>(mutation: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> {
    return executeGraphQL<T>(mutation, variables);
  }
}

// =============================================================================
// EXAMPLE QUERIES & MUTATIONS
// Uncomment dan sesuaikan dengan schema Hasura Anda
// =============================================================================

/*
// Contoh Query - Get Exams
export const GET_EXAMS = `
  query GetExams($limit: Int, $offset: Int) {
    exams(limit: $limit, offset: $offset, order_by: {created_at: desc}) {
      id
      title
      description
      duration_minutes
      passing_score
      status
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

// Contoh Query - Get Exam by ID
export const GET_EXAM_BY_ID = `
  query GetExamById($id: uuid!) {
    exams_by_pk(id: $id) {
      id
      title
      description
      duration_minutes
      passing_score
      status
      questions {
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

// Contoh Mutation - Create Exam
export const CREATE_EXAM = `
  mutation CreateExam($input: exams_insert_input!) {
    insert_exams_one(object: $input) {
      id
      title
      created_at
    }
  }
`;

// Contoh Mutation - Update Exam
export const UPDATE_EXAM = `
  mutation UpdateExam($id: uuid!, $input: exams_set_input!) {
    update_exams_by_pk(pk_columns: {id: $id}, _set: $input) {
      id
      title
      updated_at
    }
  }
`;

// Contoh Mutation - Delete Exam
export const DELETE_EXAM = `
  mutation DeleteExam($id: uuid!) {
    delete_exams_by_pk(id: $id) {
      id
    }
  }
`;
*/

export default GraphQLService;
