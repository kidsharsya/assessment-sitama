'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthState } from '@/types/auth.types';
import type { AppRole } from '@/helpers/cookieHelper';

interface AuthContextType extends AuthState {
  isLoading: boolean;
  userId: string | null;
  userRole: string | null;
  appRole: AppRole;
  displayName: string;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
  isUser: () => boolean;
  checkAuth: () => void;
  requireAuth: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

/**
 * Auth Provider Component
 * Wrap aplikasi dengan provider ini untuk akses auth di seluruh app
 * Mendukung admin (web-admin) dan user (web-app) cookies
 */
export function AuthProvider({ children }: AuthProviderProps) {
  const auth = useAuth();

  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
}

/**
 * Hook untuk menggunakan AuthContext
 */
export function useAuthContext() {
  const context = useContext(AuthContext);

  if (context === undefined) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }

  return context;
}

export default AuthContext;
