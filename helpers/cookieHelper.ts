import Cookies from 'js-cookie';
import CryptoJS from 'crypto-js';
import { jwtDecode } from 'jwt-decode';
import { JwtPayload, UserData } from '@/types/auth.types';

// Cookie names - sesuai dengan web-admin SITAMA
const TOKEN_COOKIE = 'sitama_admin_session_v1';
const USER_DATA_COOKIE = 'sitama_admin_user_data';

// Secret key untuk decrypt cookie (harus sama dengan web-admin)
const COOKIE_SECRET = process.env.NEXT_PUBLIC_COOKIE_SECRET || 'S3cUr3K3Yw1tH5tRonGp@ttErn!@#';

/**
 * Decrypt cookie value yang di-encrypt oleh web-admin menggunakan CryptoJS AES
 */
const decryptCookie = (encryptedValue: string): string | null => {
  try {
    const bytes = CryptoJS.AES.decrypt(encryptedValue, COOKIE_SECRET);
    const decrypted = bytes.toString(CryptoJS.enc.Utf8);
    if (!decrypted) return null;
    return decrypted;
  } catch {
    // Decrypt gagal — kemungkinan secret tidak cocok atau cookie bukan AES encrypted
    return null;
  }
};

/**
 * Mengambil token dari cookie (dengan decrypt AES)
 * Cookie di-share antar subdomain .sitama.tabligh.id
 */
export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;

  const raw = Cookies.get(TOKEN_COOKIE);
  if (!raw) return null;

  // Coba decrypt AES (cookie dari web-admin di-encrypt)
  const decrypted = decryptCookie(raw);
  if (decrypted) return decrypted;

  // Fallback: mungkin cookie sudah berupa JWT plain (3 bagian dipisah titik)
  if (raw.split('.').length === 3) return raw;

  return null;
};

/**
 * Mengambil user data dari cookie (dengan decrypt AES)
 */
export const getUserData = (): UserData | null => {
  if (typeof window === 'undefined') return null;

  const encrypted = Cookies.get(USER_DATA_COOKIE);
  if (!encrypted) return null;

  try {
    const decrypted = decryptCookie(encrypted);
    if (!decrypted) return null;

    // Cek apakah hasilnya JSON object
    if (decrypted.trim().startsWith('{')) {
      return JSON.parse(decrypted) as UserData;
    }

    return JSON.parse(decrypted) as UserData;
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
 * Fallback ke .env DEFAULT_USER_ID untuk dev mode (admin-secret auth tanpa JWT)
 */
export const getUserIdFromToken = (): string | null => {
  const claims = getHasuraClaims();
  return claims?.['x-hasura-user-id'] || process.env.NEXT_PUBLIC_DEFAULT_USER_ID || null;
};

/**
 * Mendapatkan role dari token
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
 * Note: Cookie harus di-clear dengan domain yang sama
 */
export const clearAuthCookies = () => {
  const domain = '.sitama.tabligh.id';

  Cookies.remove(TOKEN_COOKIE, { domain });
  Cookies.remove(USER_DATA_COOKIE, { domain });
};
