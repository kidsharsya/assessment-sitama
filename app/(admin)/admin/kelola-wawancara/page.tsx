'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

// ============================================
// Halaman Manajemen Wawancara (Redirect)
// Halaman ini sudah dipindahkan ke /admin/kelola-sesi-ujian/[sessionId]/kelola-sesi-wawancara
// ============================================

export default function ManajemenWawancaraPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect ke halaman kelola sesi ujian
    router.replace('/admin/kelola-sesi-ujian');
  }, [router]);

  return (
    <div className="flex items-center justify-center min-h-[400px]">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
        <p className="text-gray-500">Mengarahkan ke halaman kelola sesi ujian...</p>
        <p className="text-xs text-gray-400 mt-2">Manajemen wawancara sekarang diakses melalui sesi ujian</p>
      </div>
    </div>
  );
}
