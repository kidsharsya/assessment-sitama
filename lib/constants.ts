// Constants untuk aplikasi assessment

// Cookie names
export const TOKEN_COOKIE = 'sitama_admin_session_v1';
export const USER_DATA_COOKIE = 'sitama_admin_user_data';

// API Endpoints
export const API_ENDPOINTS = {
  GRAPHQL: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || 'https://hasura.sitama.tabligh.id/v1/graphql',
  REST: process.env.NEXT_PUBLIC_HASURA_REST_URL || 'https://hasura.sitama.tabligh.id/api/rest',
  STORAGE: process.env.NEXT_PUBLIC_STORAGE_URL || 'https://storage.sitama.tabligh.id',
} as const;

// Auth redirect URLs
export const AUTH_URLS = {
  LOGIN: 'https://admin.sitama.tabligh.id/login',
  ADMIN_DASHBOARD: 'https://admin.sitama.tabligh.id',
  USER_APP: 'https://sitama.tabligh.id',
} as const;

// Assessment specific constants
export const ASSESSMENT = {
  TOKEN_LENGTH: 8,
  MAX_DURATION_HOURS: 4,
  DEFAULT_PASSING_SCORE: 60,
} as const;
