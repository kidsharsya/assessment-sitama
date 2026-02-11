import Cookies from 'js-cookie';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload, UserData } from '@/types/auth.types';

// Cookie names - sesuai dengan web-admin SITAMA
const TOKEN_COOKIE = 'sitama_admin_session_v1';
const USER_DATA_COOKIE = 'sitama_admin_user_data';

/**
 * Mengambil token dari cookie
 * Cookie di-share antar subdomain .sitama.tabligh.id
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(TOKEN_COOKIE) || null;
};

/**
 * Mengambil user data dari cookie
 */
export const getUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;

  const userData = Cookies.get(USER_DATA_COOKIE);
  if (!userData) return null;

  try {
    return JSON.parse(decodeURIComponent(userData)) as UserData;
  } catch (error) {
    console.error('Error parsing user data cookie:', error);
    return null;
  }
};

/**
 * Decode JWT token untuk mendapatkan payload
 */
export const decodeToken = (token: string): JwtPayload | null => {
  try {
    return jwtDecode<JwtPayload>(token);
  } catch (error) {
    console.error('Error decoding token:', error);
    return null;
  }
};

/**
 * Cek apakah token masih valid (belum expired)
 */
export const isTokenValid = (token: string): boolean => {
  const decoded = decodeToken(token);
  if (!decoded) return false;

  const currentTime = Math.floor(Date.now() / 1000);
  return decoded.exp > currentTime;
};

/**
 * Cek apakah user sudah terautentikasi
 */
export const isAuthenticated = (): boolean => {
  const token = getToken();
  if (!token) return false;
  return isTokenValid(token);
};

/**
 * Mendapatkan Hasura claims dari token
 */
export const getHasuraClaims = () => {
  const token = getToken();
  if (!token) return null;

  const decoded = decodeToken(token);
  if (!decoded) return null;

  return decoded['https://hasura.io/jwt/claims'] || null;
};

/**
 * Mendapatkan user ID dari token
 */
export const getUserIdFromToken = (): string | null => {
  const claims = getHasuraClaims();
  return claims?.['x-hasura-user-id'] || null;
};

/**
 * Mendapatkan role dari token
 */
export const getUserRoleFromToken = (): string | null => {
  const claims = getHasuraClaims();
  return claims?.['x-hasura-default-role'] || null;
};

/**
 * Clear semua auth cookies (untuk logout atau session expired)
 * Note: Cookie harus di-clear dengan domain yang sama
 */
export const clearAuthCookies = () => {
  const domain = '.sitama.tabligh.id';

  Cookies.remove(TOKEN_COOKIE, { domain });
  Cookies.remove(USER_DATA_COOKIE, { domain });
};
