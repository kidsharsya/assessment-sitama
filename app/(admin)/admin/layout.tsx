'use client';

import { useState, useEffect } from 'react';
import { AdminSidebar, AdminHeader } from '@/components/admin/layout';
import { cn } from '@/lib/utils';
import { useAuthContext } from '@/context/AuthContext';
import { AUTH_URLS } from '@/lib/constants';
import { debugAuthCookies } from '@/helpers/cookieHelper';

// ============================================
// Admin Layout - Protected for admin role
// ============================================

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading, appRole } = useAuthContext();

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (savedState !== null) {
        return JSON.parse(savedState);
      }
    }
    return false;
  });

  // Derive auth error from state (no useEffect needed)
  const authError = isLoading
    ? null
    : !isAuthenticated
      ? 'Silakan login terlebih dahulu melalui halaman Admin SITAMA untuk mengakses fitur ini.'
      : appRole !== 'admin'
        ? 'Anda tidak memiliki akses sebagai admin. Silakan login melalui halaman Admin SITAMA.'
        : null;

  // Debug on mount
  useEffect(() => {
    if (!isLoading) {
      debugAuthCookies();
    }
  }, [isLoading]);

  // Save sidebar state to localStorage
  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newState));
  };

  // Show loading while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="mt-2 text-sm text-gray-500">Memverifikasi akses...</p>
        </div>
      </div>
    );
  }

  // Show auth error with debug info (no auto-redirect)
  if (authError) {
    return (
      <div className="flex h-screen items-center justify-center bg-gray-100">
        <div className="mx-4 max-w-md rounded-lg border border-red-200 bg-white p-6 text-center shadow-lg">
          <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-red-100">
            <span className="text-xl">🔒</span>
          </div>
          <h2 className="mb-2 text-lg font-semibold text-gray-900">Akses Ditolak</h2>
          <p className="mb-4 text-sm text-gray-600">{authError}</p>
          <div className="flex justify-center">
            <a href={AUTH_URLS.ADMIN_LOGIN} className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              Login Admin
            </a>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <AdminSidebar isCollapsed={isSidebarCollapsed} />
      <div className={cn('transition-all duration-300 ease-in-out', isSidebarCollapsed ? 'ml-17.5' : 'ml-64')}>
        <AdminHeader isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
