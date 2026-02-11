'use client';

import { useState } from 'react';
import { AdminSidebar, AdminHeader } from '@/components/admin/layout';
import { cn } from '@/lib/utils';

// ============================================
// Admin Layout
// ============================================

const SIDEBAR_COLLAPSED_KEY = 'admin-sidebar-collapsed';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedState = localStorage.getItem(SIDEBAR_COLLAPSED_KEY);
      if (savedState !== null) {
        return JSON.parse(savedState);
      }
    }
    return false;
  });

  // Save sidebar state to localStorage
  const handleToggleSidebar = () => {
    const newState = !isSidebarCollapsed;
    setIsSidebarCollapsed(newState);
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, JSON.stringify(newState));
  };

  const adminName = 'Admin';

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <AdminSidebar isCollapsed={isSidebarCollapsed} />

      {/* Main Content */}
      <div className={cn('transition-all duration-300 ease-in-out', isSidebarCollapsed ? 'ml-[70px]' : 'ml-64')}>
        <AdminHeader userName={adminName} isSidebarCollapsed={isSidebarCollapsed} onToggleSidebar={handleToggleSidebar} />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
