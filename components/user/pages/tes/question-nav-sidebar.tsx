'use client';

import { Button } from '@/components/ui/button';
import type { JawabanStatus } from '@/types/exam';

// ============================================
// Question Navigation Sidebar Component
// ============================================

interface QuestionNavSidebarProps {
  totalSoal: number;
  currentIndex: number;
  jawaban: JawabanStatus[];
  onGoToSoal: (index: number) => void;
  onSubmit: () => void;
}

export function QuestionNavSidebar({ totalSoal, currentIndex, jawaban, onGoToSoal, onSubmit }: QuestionNavSidebarProps) {
  // Calculate statistics
  const dijawab = jawaban.filter((j) => j.jawaban !== null).length;
  const ditandai = jawaban.filter((j) => j.ditandai).length;
  const belum = jawaban.filter((j) => j.jawaban === null).length;

  // Get status color for navigation button
  const getStatusColor = (index: number): string => {
    const j = jawaban[index];
    if (currentIndex === index) {
      return 'bg-teal-600 text-white ring-2 ring-teal-300';
    }
    if (j?.ditandai) {
      return 'bg-amber-100 text-amber-800 border-amber-300';
    }
    if (j?.jawaban !== null) {
      return 'bg-teal-100 text-teal-800 border-teal-300';
    }
    return 'bg-gray-100 text-gray-600 border-gray-200';
  };

  return (
    <div className="w-full lg:w-72 shrink-0">
      <div className="bg-white rounded-xl lg:rounded-2xl border border-gray-200 p-4 lg:p-5 lg:sticky lg:top-20">
        <h3 className="font-semibold text-gray-900 mb-3 lg:mb-4">Navigasi Soal</h3>

        {/* Question Grid */}
        <div className="grid grid-cols-8 sm:grid-cols-10 lg:grid-cols-5 gap-1.5 lg:gap-2 mb-4 lg:mb-6">
          {Array.from({ length: totalSoal }).map((_, index) => (
            <button key={index} onClick={() => onGoToSoal(index)} className={`w-8 h-8 lg:w-10 lg:h-10 rounded-lg border font-medium text-xs lg:text-sm transition-colors ${getStatusColor(index)}`}>
              {index + 1}
            </button>
          ))}
        </div>

        {/* Legend */}
        <div className="space-y-1.5 lg:space-y-2 mb-4 lg:mb-6">
          <div className="flex items-center justify-between text-xs lg:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-teal-100 border border-teal-300" />
              <span className="text-gray-600">Dijawab</span>
            </div>
            <span className="font-medium text-gray-900">{dijawab}</span>
          </div>
          <div className="flex items-center justify-between text-xs lg:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-amber-100 border border-amber-300" />
              <span className="text-gray-600">Ditandai</span>
            </div>
            <span className="font-medium text-gray-900">{ditandai}</span>
          </div>
          <div className="flex items-center justify-between text-xs lg:text-sm">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 lg:w-4 lg:h-4 rounded bg-gray-100 border border-gray-200" />
              <span className="text-gray-600">Belum</span>
            </div>
            <span className="font-medium text-gray-900">{belum}</span>
          </div>
        </div>

        {/* Submit Button */}
        <Button className="w-full text-teal-600 bg-white hover:bg-teal-600 hover:text-white border-2 border-teal-600" onClick={onSubmit}>
          Submit Tes
        </Button>
      </div>
    </div>
  );
}
