'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { getToken, getUserData, getUserIdFromToken, getUserRoleFromToken, isTokenValid } from '@/helpers/cookieHelper';
import { AuthState } from '@/types/auth.types';
import { AUTH_URLS } from '@/lib/constants';

/**
 * Helper function untuk get auth state dari cookie
 */
function getAuthStateFromCookie(): AuthState {
  const token = getToken();
  const isAuth = token ? isTokenValid(token) : false;
  const userData = getUserData();

  return { isAuthenticated: isAuth, token, user: userData };
}

// Server snapshot - selalu return default state
const getServerSnapshot = (): AuthState => ({
  isAuthenticated: false,
  token: null,
  user: null,
});

// Subscribe to cookie changes
// Menggunakan storage event untuk detect perubahan dari tab lain
const subscribe = (onStoreChange: () => void): (() => void) => {
  window.addEventListener('storage', onStoreChange);
  return () => window.removeEventListener('storage', onStoreChange);
};

/**
 * Custom hook untuk authentication
 * Mengambil data auth dari cookie yang di-share dengan web-admin
 */
export function useAuth() {
  // Gunakan useSyncExternalStore untuk handle hydration dengan benar
  const authState = useSyncExternalStore(subscribe, getAuthStateFromCookie, getServerSnapshot);

  // Di server, isLoading = true. Di client, langsung false karena useSyncExternalStore
  // sudah handle hydration dengan getServerSnapshot
  const isLoading = typeof window === 'undefined';

  // Manual refresh function
  const checkAuth = useCallback(() => {
    // Force re-render dengan current cookie state
    window.location.reload();
  }, []);

  // Redirect ke login jika tidak terautentikasi
  const requireAuth = useCallback(() => {
    if (!authState.isAuthenticated) {
      window.location.href = AUTH_URLS.LOGIN;
    }
  }, [authState.isAuthenticated]);

  // Get user ID from token
  const userId = getUserIdFromToken();

  // Get user role from token
  const userRole = getUserRoleFromToken();

  // Check if user has specific role
  const hasRole = useCallback(
    (role: string): boolean => {
      return userRole === role;
    },
    [userRole],
  );

  // Check if user is admin
  const isAdmin = useCallback((): boolean => {
    return hasRole('admin') || hasRole('super_admin');
  }, [hasRole]);

  return {
    ...authState,
    isLoading,
    userId,
    userRole,
    hasRole,
    isAdmin,
    checkAuth,
    requireAuth,
  };
}

export default useAuth;
