'use client';

import { Clock, Menu } from 'lucide-react';

// ============================================
// Exam Header Component
// ============================================

interface KategoriProgress {
  kode: string;
  nama: string;
  isActive: boolean;
  isCompleted: boolean;
}

interface ExamHeaderProps {
  title: string;
  kategoriList: KategoriProgress[];
  currentKategori: string;
  timeRemaining: number;
  onToggleSidebar?: () => void;
}

// Format time as HH:MM:SS
function formatTime(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

export function ExamHeader({ title, kategoriList, currentKategori, timeRemaining, onToggleSidebar }: ExamHeaderProps) {
  const isLowTime = timeRemaining < 300; // Less than 5 minutes

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-2">
        {/* Left - Logo & Title */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-teal-600 rounded-lg flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 sm:w-6 sm:h-6 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <div className="min-w-0">
            <h1 className="font-semibold text-gray-900 text-sm sm:text-base truncate">{title}</h1>
            {/* Kategori Progress Badges - Hide on very small screens */}
            <div className="hidden sm:flex items-center gap-1 mt-0.5 flex-wrap">
              {kategoriList.map((kat, idx) => (
                <span key={idx} className="flex items-center">
                  {idx > 0 && <span className="text-gray-300 mx-0.5">→</span>}
                  <span className={`text-xs px-1.5 py-0.5 rounded ${kat.isActive ? 'bg-teal-600 text-white font-medium' : kat.isCompleted ? 'bg-teal-100 text-teal-700' : 'bg-gray-100 text-gray-500'}`}>{kat.nama}</span>
                </span>
              ))}
            </div>
            {/* Simple current category on mobile */}
            <p className="sm:hidden text-xs text-gray-500">{currentKategori}</p>
          </div>
        </div>

        {/* Right - Timer & Mobile Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Timer */}
          <div className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-4 py-1.5 sm:py-2 rounded-full ${isLowTime ? 'bg-red-600 animate-pulse' : 'bg-teal-600'} text-white`}>
            <Clock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            <span className="font-mono font-semibold text-sm sm:text-base">{formatTime(timeRemaining)}</span>
          </div>

          {/* Mobile Sidebar Toggle */}
          {onToggleSidebar && (
            <button onClick={onToggleSidebar} className="lg:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors" aria-label="Toggle navigation">
              <Menu className="w-5 h-5 text-gray-600" />
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
