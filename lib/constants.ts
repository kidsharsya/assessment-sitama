// Constants untuk aplikasi assessment

// ============================================
// Cookie Names
// ============================================

// Admin cookies (from admin.sitama.tabligh.id)
export const ADMIN_TOKEN_COOKIE = 'sitama_admin_session_v1';
export const ADMIN_USER_DATA_COOKIE = 'sitama_admin_user_data';

// User cookies (from sitama.tabligh.id)
export const USER_TOKEN_COOKIE = 'sitama_session_v1';
export const USER_USER_DATA_COOKIE = 'sitamau_user_data';

// API Endpoints
export const API_ENDPOINTS = {
  GRAPHQL: process.env.NEXT_PUBLIC_HASURA_GRAPHQL_URL || 'https://hasura.sitama.tabligh.id/v1/graphql',
  REST: process.env.NEXT_PUBLIC_HASURA_REST_URL || 'https://hasura.sitama.tabligh.id/api/rest',
  STORAGE: process.env.NEXT_PUBLIC_BASE_URL_STORAGE || 'https://storage.sitama.tabligh.id',
  ASSESSMENT_API: process.env.NEXT_PUBLIC_ASSESSMENT_API_URL || 'https://assessment.sitama.tabligh.id',
} as const;

// Auth redirect URLs - berbeda untuk admin dan user
export const AUTH_URLS = {
  ADMIN_LOGIN: process.env.NEXT_PUBLIC_ADMIN_URL ? `${process.env.NEXT_PUBLIC_ADMIN_URL}/app/auth/login` : 'https://admin.sitama.tabligh.id/app/auth/login',
  USER_LOGIN: process.env.NEXT_PUBLIC_APP_URL ? `${process.env.NEXT_PUBLIC_APP_URL}/app/auth/login` : 'https://sitama.tabligh.id/app/auth/login',
  ADMIN_DASHBOARD: process.env.NEXT_PUBLIC_ADMIN_URL,
  USER_APP: process.env.NEXT_PUBLIC_APP_URL,
  // Legacy - fallback
  LOGIN: process.env.NEXT_PUBLIC_ADMIN_URL ? `${process.env.NEXT_PUBLIC_ADMIN_URL}/app/auth/login` : 'https://admin.sitama.tabligh.id/app/auth/login',
} as const;

// Assessment specific constants
export const ASSESSMENT = {
  TOKEN_LENGTH: 8,
  MAX_DURATION_HOURS: 4,
  DEFAULT_PASSING_SCORE: 60,
} as const;
