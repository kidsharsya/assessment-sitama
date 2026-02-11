'use client';
import { useState } from 'react';
import { User, Menu, X } from 'lucide-react';
import Image from 'next/image';

// ============================================
// Peserta Header Component - Untuk user SUDAH login
// ============================================

export function UserHeader() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
          <div className="hidden md:flex items-center gap-3 px-3 py-2">
            <div className="text-right">
              <p className="text-sm font-medium text-gray-900">{displayName}</p>
              <p className="text-xs text-gray-500">Mubaligh</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-teal-500 flex items-center justify-center bg-teal-50">
              <User className="w-5 h-5 text-teal-600" />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button className="md:hidden p-2 rounded-lg hover:bg-gray-100" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-gray-100">
            {/* Mobile User Info */}
            <div className="px-4 py-3 flex items-center gap-3">
              <div className="w-10 h-10 rounded-full border-2 border-teal-500 flex items-center justify-center bg-teal-50">
                <User className="w-5 h-5 text-teal-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{displayName}</p>
                <p className="text-xs text-gray-500">Mubaligh</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
