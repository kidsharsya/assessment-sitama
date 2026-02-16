'use client';

import { LogOut, ChevronDown, PanelLeftClose, PanelLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { clearAuthCookies } from '@/helpers/cookieHelper';
import { AUTH_URLS } from '@/lib/constants';
import { useAuthContext } from '@/context/AuthContext';

// ============================================
// Admin Header Component
// ============================================

interface AdminHeaderProps {
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export function AdminHeader({ isSidebarCollapsed, onToggleSidebar }: AdminHeaderProps) {
  const { displayName, userRole, user } = useAuthContext();
  const roleLabel = userRole || user?.defaultRole || 'Administrator';

  const handleLogout = () => {
    clearAuthCookies();
    window.location.href = AUTH_URLS.ADMIN_LOGIN;
  };

  return (
    <header className="sticky top-0 z-30 h-16 bg-white border-b border-gray-200">
      <div className="h-full px-4 md:px-6 flex items-center justify-between">
        {/* Toggle Sidebar Button */}
        <button
          onClick={onToggleSidebar}
          className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-gray-100 transition-colors text-gray-600 hover:text-gray-900"
          title={isSidebarCollapsed ? 'Perbesar sidebar' : 'Perkecil sidebar'}
        >
          {isSidebarCollapsed ? <PanelLeft className="w-5 h-5" /> : <PanelLeftClose className="w-5 h-5" />}
        </button>

        {/* User Dropdown */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors">
              <div className="w-8 h-8 bg-teal-600 rounded-full flex items-center justify-center">
                <span className="text-white text-sm font-medium">{displayName.charAt(0).toUpperCase()}</span>
              </div>
              <div className="text-left hidden sm:block">
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">{roleLabel}</p>
              </div>
              <ChevronDown className="w-4 h-4 text-gray-400" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuItem className="text-red-600 cursor-pointer" onClick={handleLogout}>
              <LogOut className="w-4 h-4 mr-2" />
              Keluar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
