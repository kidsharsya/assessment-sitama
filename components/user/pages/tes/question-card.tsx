'use client';

import { Flag, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { ExamDisplaySoal } from '@/types/exam';

// ============================================
// Question Card Component
// ============================================

interface QuestionCardProps {
  currentIndex: number;
  totalSoal: number;
  soal: ExamDisplaySoal | null;
  jawaban: string | null;
  ditandai: boolean;
  onSelectAnswer: (code: string) => void;
  onToggleFlag: () => void;
  onPrevious: () => void;
  onNext: () => void;
  canGoPrevious: boolean;
  canGoNext: boolean;
}

export function QuestionCard({ currentIndex, totalSoal, soal, jawaban, ditandai, onSelectAnswer, onToggleFlag, onPrevious, onNext, canGoPrevious, canGoNext }: QuestionCardProps) {
  if (!soal) {
    return (
      <div className="bg-white rounded-2xl border border-gray-200 p-6">
        <div className="flex items-center justify-center min-h-[300px]">
          <p className="text-gray-500">Soal tidak ditemukan</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-4 sm:p-6">
      {/* Question Header */}
      <div className="flex items-center justify-between mb-4 sm:mb-6">
        <div className="flex items-center gap-2">
          <h2 className="text-base sm:text-lg font-semibold text-gray-900">
            Soal {soal.number} <span className="text-gray-400 font-normal">/ {totalSoal}</span>
          </h2>
          <span className="text-xs px-2 py-0.5 bg-teal-50 text-teal-700 rounded">{soal.categoryCode}</span>
        </div>
        <button onClick={onToggleFlag} className={`p-2 rounded-lg transition-colors ${ditandai ? 'bg-amber-100 text-amber-600' : 'bg-gray-100 text-gray-400 hover:text-gray-600'}`} title={ditandai ? 'Hapus tanda' : 'Tandai soal'}>
          <Flag className="w-4 h-4 sm:w-5 sm:h-5" fill={ditandai ? 'currentColor' : 'none'} />
        </button>
      </div>

      {/* Question Text */}
      <div className="mb-4 sm:mb-6">
        <p className="text-gray-800 text-base sm:text-lg leading-relaxed">{soal.text}</p>
        {soal.imagePath && (
          <div className="mt-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={soal.imagePath} alt="Gambar Soal" className="max-h-48 sm:max-h-64 rounded-lg border" />
          </div>
        )}
      </div>

      {/* Answer Options */}
      <div className="space-y-2 sm:space-y-3">
        {soal.options.map((option) => (
          <button
            key={option.code}
            onClick={() => onSelectAnswer(option.code)}
            className={`w-full text-left p-3 sm:p-4 rounded-xl border-2 transition-all ${jawaban === option.code ? 'border-teal-600 bg-teal-50' : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'}`}
          >
            <div className="flex items-start gap-2 sm:gap-3">
              <div
                className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full border-2 flex items-center justify-center shrink-0 font-bold text-sm sm:text-base ${jawaban === option.code ? 'border-teal-600 bg-teal-600 text-white' : 'border-gray-300 text-gray-600'}`}
              >
                {option.code}
              </div>
              <div className="flex-1 pt-0.5 sm:pt-1">
                <span className="text-gray-700 text-sm sm:text-base">{option.text}</span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {/* Navigation Buttons */}
      <div className="flex justify-between mt-6 sm:mt-8 gap-3">
        <Button variant="outline" onClick={onPrevious} disabled={!canGoPrevious} className="gap-1 sm:gap-2 flex-1 sm:flex-none">
          <ChevronLeft className="w-4 h-4" />
          <span className="hidden sm:inline">Sebelumnya</span>
          <span className="sm:hidden">Prev</span>
        </Button>
        <Button onClick={onNext} disabled={!canGoNext} className="gap-1 sm:gap-2 bg-teal-600 hover:bg-teal-700 flex-1 sm:flex-none">
          <span className="hidden sm:inline">Selanjutnya</span>
          <span className="sm:hidden">Next</span>
          <ChevronRight className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
