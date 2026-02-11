'use client';
import { User } from 'lucide-react';
import Image from 'next/image';

// ============================================
// Peserta Header Component - Untuk user SUDAH login
// ============================================

export function UserHeader() {
  // Display name with fallback
  const displayName = 'Muhammad Rizki';

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-full mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 relative flex items-center justify-center">
              <Image src="/images/Logo.webp" alt="Logo" fill className="object-contain rounded-lg" />
            </div>
            <div className="hidden sm:block">
              <h1 className="text-lg font-bold text-gray-900">Sitama Assessment</h1>
            </div>
          </div>

          {/* User Info */}
          <div className="flex items-center gap-2 sm:gap-3 px-2 sm:px-3 py-2">
            <div className="text-right">
              <p className="text-xs sm:text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-[10px] sm:text-xs text-gray-500">Mubaligh</p>
            </div>
            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full border-2 border-teal-500 flex items-center justify-center bg-teal-50">
              <User className="w-4 h-4 sm:w-5 sm:h-5 text-teal-600" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
