// Types untuk Authentication dan User

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
  name: string;
  email: string;
  role: string;
  avatar?: string;
  organization_id?: string;
}

export interface AuthState {
  isAuthenticated: boolean;
  token: string | null;
  user: UserData | null;
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
