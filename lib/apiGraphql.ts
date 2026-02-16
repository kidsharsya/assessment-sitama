import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, getHasuraClaims, detectAppRole } from '@/helpers/cookieHelper';
import { API_ENDPOINTS, AUTH_URLS } from '@/lib/constants';
import { GraphQLResponse } from '@/types/auth.types';

/**
 * Axios instance untuk Hasura GraphQL
 * Otomatis menambahkan Authorization header dari cookie (admin atau user)
 */
const apiGraphql: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.GRAPHQL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - tambahkan Authorization header atau Admin Secret
apiGraphql.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const adminSecret = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

    if (adminSecret) {
      // Gunakan admin-secret saja — jangan campur dengan JWT/role headers
      // karena Hasura bisa konflik jika kedua auth method dikirim bersamaan
      config.headers['x-hasura-admin-secret'] = adminSecret;
    } else {
      // Fallback: gunakan JWT dari cookie
      const token = getToken();
      const appRole = detectAppRole();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['x-app'] = appRole === 'admin' ? 'admin' : 'app';

        const claims = getHasuraClaims();
        const allowedRoles = claims?.['x-hasura-allowed-roles'];
        if (allowedRoles && allowedRoles.length > 0) {
          config.headers['x-hasura-role'] = allowedRoles[0];
        }
      }
    }

    return config;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  },
);

// Response interceptor - handle errors
apiGraphql.interceptors.response.use(
  (response) => {
    // Cek GraphQL errors dalam response
    const data = response.data as GraphQLResponse<unknown>;
    if (data.errors && data.errors.length > 0) {
      console.error('GraphQL Errors:', data.errors);
    }
    return response;
  },
  (error: AxiosError) => {
    // Handle HTTP errors
    if (error.response) {
      const status = error.response.status;

      switch (status) {
        case 401:
          // Unauthorized - redirect ke login sesuai role
          console.error('Unauthorized: Token tidak valid atau expired');
          if (typeof window !== 'undefined') {
            const role = detectAppRole();
            const loginUrl = role === 'user' ? AUTH_URLS.USER_LOGIN : AUTH_URLS.ADMIN_LOGIN;
            window.location.href = loginUrl;
          }
          break;
        case 403:
          console.error('Forbidden: Tidak memiliki akses');
          break;
        case 500:
          console.error('Server Error');
          break;
        default:
          console.error(`HTTP Error: ${status}`);
      }
    } else if (error.request) {
      console.error('Network Error: Tidak dapat terhubung ke server');
    }

    return Promise.reject(error);
  },
);

/**
 * Helper function untuk execute GraphQL query/mutation
 */
export async function executeGraphQL<T>(query: string, variables?: Record<string, unknown>): Promise<GraphQLResponse<T>> {
  const response = await apiGraphql.post<GraphQLResponse<T>>('', {
    query,
    variables,
  });

  return response.data;
}

/**
 * Axios instance untuk Hasura REST API
 */
export const apiRest: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.REST,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 30000,
});

// Copy interceptors ke REST instance
apiRest.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const adminSecret = process.env.NEXT_PUBLIC_HASURA_ADMIN_SECRET;

    if (adminSecret) {
      config.headers['x-hasura-admin-secret'] = adminSecret;
    } else {
      const token = getToken();
      const appRole = detectAppRole();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        config.headers['x-app'] = appRole === 'admin' ? 'admin' : 'app';

        const claims = getHasuraClaims();
        const allowedRoles = claims?.['x-hasura-allowed-roles'];
        if (allowedRoles && allowedRoles.length > 0) {
          config.headers['x-hasura-role'] = allowedRoles[0];
        }
      }
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

/**
 * Axios instance untuk Storage API
 */
export const apiStorage: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.STORAGE,
  // timeout: 60000,
});

apiStorage.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

export default apiGraphql;
