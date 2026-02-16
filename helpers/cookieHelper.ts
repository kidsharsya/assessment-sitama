import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload, UserData } from '@/types/auth.types';

// ============================================
// Cookie Names - sesuai dengan SITAMA apps
// ============================================

// Admin cookies (from admin.sitama.tabligh.id / web-admin)
const ADMIN_TOKEN_COOKIE = 'sitama_admin_session_v1';
const ADMIN_USER_DATA_COOKIE = 'sitama_admin_user_data';

// User cookies (from sitama.tabligh.id / web-app)
const USER_TOKEN_COOKIE = 'sitama_session_v1';
const USER_USER_DATA_COOKIE = 'sitamau_user_data';

// Secret key untuk decrypt cookie (harus sama dengan web-admin & web-app)
const COOKIE_SECRET = 'S3cUr3K3Yw1tH5tRonGp@ttErn!@#';

// App role type: admin atau user
export type AppRole = 'admin' | 'user' | null;

// ============================================
// Internal Helpers
// ============================================

/**
 * Decrypt cookie value yang di-encrypt oleh SITAMA apps menggunakan CryptoJS AES
 */
const decryptCookie = (encryptedValue: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, COOKIE_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return decrypted;
  } catch {
    return null;
  }
};

/**
 * Read & decrypt a single cookie value
 */
const readCookieValue = (cookieName: string): string | null => {
  const raw = Cookies.get(cookieName);
  if (!raw) return null;

  // Try AES decrypt
  const decrypted = decryptCookie(raw);
  if (decrypted) return decrypted;

  // Fallback: cookie might be plain JWT (3 segments separated by dots)
  if (raw.split('.').length === 3) return raw;

  return null;
};

/**
 * Read & decrypt user data cookie (returns parsed JSON)
 */
const readUserDataCookie = (cookieName: string): UserData | null => {
  const raw = Cookies.get(cookieName);
  if (!raw) return null;

  try {
    const decrypted = decryptCookie(raw);
    if (!decrypted) return null;

    return JSON.parse(decrypted) as UserData;
  } catch (error) {
    console.error('Error parsing user data cookie:', error);
    return null;
  }
};

// ============================================
// Public API
// ============================================

/**
 * Detect app role berdasarkan cookies yang tersedia.
 * Cek admin cookies dulu, lalu user cookies.
 */
export const detectAppRole = (): AppRole => {
  if (typeof window === 'undefined') return null;

  if (Cookies.get(ADMIN_TOKEN_COOKIE)) return 'admin';
  if (Cookies.get(USER_TOKEN_COOKIE)) return 'user';

  return null;
};

/**
 * Mengambil token dari cookie (dengan decrypt AES)
 * Otomatis detect apakah dari admin atau user cookies
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const role = detectAppRole();
  if (role === 'admin') return readCookieValue(ADMIN_TOKEN_COOKIE);
  if (role === 'user') return readCookieValue(USER_TOKEN_COOKIE);

  return null;
};

/**
 * Mengambil user data dari cookie (dengan decrypt AES)
 * Otomatis detect apakah dari admin atau user cookies
 */
export const getUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;

  const role = detectAppRole();
  if (role === 'admin') return readUserDataCookie(ADMIN_USER_DATA_COOKIE);
  if (role === 'user') return readUserDataCookie(USER_USER_DATA_COOKIE);

  return null;
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
 * Fallback ke .env DEFAULT_USER_ID untuk dev mode (admin-secret auth tanpa JWT)
 */
export const getUserIdFromToken = (): string | null => {
  const claims = getHasuraClaims();
  return claims?.['x-hasura-user-id'] || process.env.NEXT_PUBLIC_DEFAULT_USER_ID || null;
};

/**
 * Mendapatkan role dari token (hasura default role)
 */
export const getUserRoleFromToken = (): string | null => {
  const claims = getHasuraClaims();
  return claims?.['x-hasura-default-role'] || null;
};

/**
 * Mendapatkan allowed roles dari token (untuk x-hasura-role header)
 */
export const getAllowedRolesFromToken = (): string[] | null => {
  const claims = getHasuraClaims();
  return claims?.['x-hasura-allowed-roles'] || null;
};

/**
 * Clear semua auth cookies (untuk logout atau session expired)
 */
export const clearAuthCookies = () => {
  const domain = '.sitama.tabligh.id';

  // Clear admin cookies
  Cookies.remove(ADMIN_TOKEN_COOKIE, { domain });
  Cookies.remove(ADMIN_USER_DATA_COOKIE, { domain });

  // Clear user cookies
  Cookies.remove(USER_TOKEN_COOKIE, { domain });
  Cookies.remove(USER_USER_DATA_COOKIE, { domain });

  // Also clear without domain (for localhost dev)
  Cookies.remove(ADMIN_TOKEN_COOKIE);
  Cookies.remove(ADMIN_USER_DATA_COOKIE);
  Cookies.remove(USER_TOKEN_COOKIE);
  Cookies.remove(USER_USER_DATA_COOKIE);
};

/**
 * Debug: Log semua auth data ke console
 */
export const debugAuthCookies = () => {
  console.group('🔐 SITAMA Assessment Auth Debug');

  // Detected role
  const role = detectAppRole();
  console.log('🎯 Detected App Role:', role || '(none)');

  // All raw cookie values
  console.group('📦 Raw Cookies');
  console.log('Admin Token:', Cookies.get(ADMIN_TOKEN_COOKIE) || '(not found)');
  console.log('Admin User Data:', Cookies.get(ADMIN_USER_DATA_COOKIE) || '(not found)');
  console.log('User Token:', Cookies.get(USER_TOKEN_COOKIE) || '(not found)');
  console.log('User User Data:', Cookies.get(USER_USER_DATA_COOKIE) || '(not found)');
  console.log('All cookies:', Cookies.get());
  console.groupEnd();

  // Decrypted values
  const token = getToken();
  console.log('🔓 Decrypted Token:', token ? `${token.substring(0, 50)}...` : '(null)');

  const userData = getUserData();
  console.log('👤 User Data:', userData);

  // Decoded JWT
  if (token) {
    const decoded = decodeToken(token);
    console.log('🎫 Decoded JWT Payload:', decoded);
    console.log('✅ Token Valid:', isTokenValid(token));

    const claims = decoded?.['https://hasura.io/jwt/claims'];
    console.log('🔑 Hasura Claims:', claims);
    console.log('🆔 User ID:', claims?.['x-hasura-user-id'] || 'N/A');
    console.log('🎭 Default Role:', claims?.['x-hasura-default-role'] || 'N/A');
    console.log('🎭 Allowed Roles:', claims?.['x-hasura-allowed-roles'] || 'N/A');

    if (decoded?.exp) {
      const expiryDate = new Date(decoded.exp * 1000);
      console.log('⏰ Token Expires:', expiryDate.toLocaleString());
    }
  }

  console.log('🔒 Is Authenticated:', isAuthenticated());
  console.groupEnd();
};
