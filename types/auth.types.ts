// Types untuk Authentication dan User

import type { AppRole } from '@/helpers/cookieHelper';

export interface JwtPayload {
  sub: string;
  iat: number;
  exp: number;
  'https://hasura.io/jwt/claims'?: HasuraClaims;
}

export interface HasuraClaims {
  'x-hasura-allowed-roles': string[];
  'x-hasura-default-role': string;
  'x-hasura-user-id': string;
  'x-hasura-org-id'?: string;
}

export interface UserData {
  id: string;
  name?: string;
  fullname?: string;
  username?: string;
  displayName?: string;
  email?: string;
  phone?: string;
  role?: string;
  defaultRole?: string;
  roles?: string[];
  avatar?: string;
  avatarUrl?: string;
  organization_id?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  m_id?: string | null;
  mubaligh?: unknown;
  profile?: unknown;
  [key: string]: unknown; // Allow extra fields from different apps
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserData | null;
  appRole: AppRole;
}

// Response types untuk GraphQL
export interface GraphQLResponse<T> {
  data?: T;
  errors?: GraphQLError[];
}

export interface GraphQLError {
  message: string;
  extensions?: {
    path: string;
    code: string;
  };
}
