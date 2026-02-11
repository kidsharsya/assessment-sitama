'use client';

import { UserHeader } from '@/components/user/layout/header';

// ============================================
// User Layout
// ============================================

export default function UserLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <UserHeader />
      <main className="mx-auto">{children}</main>
    </div>
  );
}
