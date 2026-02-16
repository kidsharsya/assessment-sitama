import axios, { AxiosInstance, AxiosError, InternalAxiosRequestConfig } from 'axios';
import { getToken, detectAppRole } from '@/helpers/cookieHelper';
import { API_ENDPOINTS, AUTH_URLS } from '@/lib/constants';

/**
 * Axios instance untuk Assessment REST API
 * Endpoint khusus ujian: start exam, get manifest, get questions, submit, finish
 * Menggunakan Bearer token dari cookie (admin atau user)
 */
const apiAssessment: AxiosInstance = axios.create({
  baseURL: API_ENDPOINTS.ASSESSMENT_API,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  timeout: 30000,
});

// Request interceptor - tambahkan Authorization header
apiAssessment.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getToken();
    // const appRole = detectAppRole();

    if (!token) {
      return Promise.reject(new Error('Not authenticated'));
    }

    config.headers.Authorization = `Bearer ${token}`;
    // config.headers['x-app'] = appRole === 'admin' ? 'admin' : 'app';

    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

// Response interceptor - handle errors
apiAssessment.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response) {
      const status = error.response.status;

      if (status === 401) {
        console.error('Assessment API: Unauthorized');
        if (typeof window !== 'undefined') {
          const role = detectAppRole();
          const loginUrl = role === 'user' ? AUTH_URLS.USER_LOGIN : AUTH_URLS.ADMIN_LOGIN;
          window.location.href = loginUrl;
        }
      }

      if (status === 403) {
        console.error('Assessment API: Forbidden - Tidak memiliki akses');
      }
    }

    return Promise.reject(error);
  },
);

export default apiAssessment;
