'use client';

import { useParams } from 'next/navigation';
import { ManajemenWawancaraContent } from '@/components/admin/pages/kelola-sesi-wawancara';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

// ============================================
// Halaman Manajemen Wawancara
// ============================================

export default function ManajemenWawancaraPage() {
  const params = useParams();
  const sessionId = params.sessionId as string;

  return (
    <div className="space-y-6">
      <div>
        <Button variant="outline" size="lg" className="hover:bg-teal-600 hover:text-white" onClick={() => window.history.back()}>
          <ArrowLeft className="w-4 h-4" />
          Kembali
        </Button>
      </div>
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Wawancara</h1>
        <p className="text-gray-500 mt-1">Kelola link wawancara dan assign pewawancara ke peserta</p>
      </div>

      {/* Main Content */}
      <ManajemenWawancaraContent examSessionId={sessionId} />
    </div>
  );
}
