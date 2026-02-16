'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getToken, getUserData, getUserIdFromToken, getUserRoleFromToken, isTokenValid, detectAppRole } from '@/helpers/cookieHelper';
import type { AppRole } from '@/helpers/cookieHelper';
import { AuthState } from '@/types/auth.types';
import { AUTH_URLS } from '@/lib/constants';

/**
 * Helper function untuk get auth state dari cookie
 */
function getAuthStateFromCookie(): AuthState {
  const token = getToken();
  const isAuth = token ? isTokenValid(token) : false;
  const userData = getUserData();
  const appRole = detectAppRole();

  return { isAuthenticated: isAuth, token, user: userData, appRole };
}

const DEFAULT_STATE: AuthState = {
  isAuthenticated: false,
  token: null,
  user: null,
  appRole: null,
};

// ============================================
// useSyncExternalStore plumbing — referentially stable
// ============================================

let _cachedState: AuthState = DEFAULT_STATE;
let _initialized = false;

function subscribe(onStoreChange: () => void): () => void {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
}

function getSnapshot(): AuthState {
  const newState = getAuthStateFromCookie();
  // Return cached reference jika nilai tidak berubah (mencegah infinite re-render)
  if (_initialized && newState.isAuthenticated === _cachedState.isAuthenticated && newState.token === _cachedState.token && newState.appRole === _cachedState.appRole) {
    return _cachedState;
  }
  _initialized = true;
  _cachedState = newState;
  return _cachedState;
}

function getServerSnapshot(): AuthState {
  return DEFAULT_STATE;
}

/**
 * Custom hook untuk authentication
 * Otomatis mendeteksi admin (web-admin) atau user (web-app) cookies
 * Menggunakan useSyncExternalStore untuk baca cookie tanpa hydration mismatch
 */
export function useAuth() {
  // Server/hydration: DEFAULT_STATE (loading). Client: real cookie data.
  const authState = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  // Pada server & hydration pass, authState === DEFAULT_STATE (reference equality)
  // Setelah hydration selesai, authState adalah objek baru → isLoading = false
  const isLoading = authState === DEFAULT_STATE;

  // Manual refresh function
  const checkAuth = useCallback(() => {
    window.location.reload();
  }, []);

  /**
   * Redirect ke login page yang sesuai berdasarkan app role
   */
  const requireAuth = useCallback(() => {
    if (!authState.isAuthenticated) {
      const loginUrl = authState.appRole === 'user' ? AUTH_URLS.USER_LOGIN : AUTH_URLS.ADMIN_LOGIN;
      window.location.href = loginUrl;
    }
  }, [authState.isAuthenticated, authState.appRole]);

  // Get user ID from token
  const userId = getUserIdFromToken();
  const userRole = getUserRoleFromToken();
  const appRole: AppRole = authState.appRole;

  // Check if user has specific role (hasura role)
  const hasRole = useCallback(
    (role: string): boolean => {
      return userRole === role;
    },
    [userRole],
  );

  const isAdmin = useCallback((): boolean => {
    return appRole === 'admin';
  }, [appRole]);

  const isUser = useCallback((): boolean => {
    return appRole === 'user';
  }, [appRole]);

  const displayName = authState.user?.displayName || authState.user?.name || authState.user?.fullname || authState.user?.username || 'User';

  return {
    ...authState,
    isLoading,
    userId,
    userRole,
    appRole,
    displayName,
    hasRole,
    isAdmin,
    isUser,
    checkAuth,
    requireAuth,
  };
}

export default useAuth;
