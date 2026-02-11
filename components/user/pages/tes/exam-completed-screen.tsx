'use client';

import { useRouter } from 'next/navigation';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExamResult } from '@/types/exam';

// ============================================
// Exam Completed Screen Component
// ============================================

interface ExamCompletedScreenProps {
  result: ExamResult;
}

export function ExamCompletedScreen({ result }: ExamCompletedScreenProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md sm:max-w-xl bg-white rounded-xl sm:rounded-2xl shadow-sm border border-gray-200 p-6 sm:p-8">
        {/* Success Icon */}
        <div className="flex justify-center mb-4 sm:mb-6">
          <div className="w-16 h-16 sm:w-20 sm:h-20 bg-teal-50 rounded-full flex items-center justify-center">
            <CheckCircle className="w-10 h-10 sm:w-12 sm:h-12 text-teal-600" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">Tes Selesai!</h1>
          <p className="text-gray-500 text-sm sm:text-base">Jawaban Anda telah berhasil tersimpan. Hasil tes akan diumumkan setelah proses penilaian selesai.</p>
        </div>

        {/* Stats */}
        <div className="bg-gray-50 rounded-xl p-4 sm:p-6 mb-6 flex justify-around">
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Total Soal</p>
            <p className="text-2xl sm:text-3xl font-bold text-gray-900">{result.totalSoal}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Dijawab</p>
            <p className="text-2xl sm:text-3xl font-bold text-teal-600">{result.soalDijawab}</p>
          </div>
          <div className="text-center">
            <p className="text-xs sm:text-sm text-gray-500 mb-1">Ditandai</p>
            <p className="text-2xl sm:text-3xl font-bold text-amber-600">{result.soalDitandai}</p>
          </div>
        </div>

        {/* Back Button */}
        <Button className="w-full h-11 sm:h-12 text-sm sm:text-base rounded-xl bg-teal-600 hover:bg-teal-700" onClick={() => router.push('/tes-overview')}>
          Kembali ke Halaman Tes
        </Button>
      </div>
    </div>
  );
}
