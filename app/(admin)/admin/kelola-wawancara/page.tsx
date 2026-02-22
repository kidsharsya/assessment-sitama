'use client';

import { ManajemenWawancaraContent } from '@/components/admin/pages/kelola-sesi-wawancara';

// ============================================
// Halaman Manajemen Wawancara
// ============================================

export default function ManajemenWawancaraPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Wawancara</h1>
        <p className="text-gray-500 mt-1">Kelola link wawancara dan assign interviewer ke pelamar</p>
      </div>

      {/* Main Content */}
      <ManajemenWawancaraContent />
    </div>
  );
}
