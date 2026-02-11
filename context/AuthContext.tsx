'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AuthState } from '@/types/auth.types';

interface AuthContextType extends AuthState {
  isLoading: boolean;
  userId: string | null;
  userRole: string | null;
  hasRole: (role: string) => boolean;
  isAdmin: () => boolean;
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
