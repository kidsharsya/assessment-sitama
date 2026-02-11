'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { getCurrentAttempt, getQuestionByIndex, getAnswer, submitAnswer as submitAnswerMock, toggleNotSure as toggleNotSureMock, getExamStats, submitExam as submitExamMock, getCategoryIndex } from '@/lib/mock-data/exam-attempt';
import { ExamHeader } from '@/components/user/pages/tes/exam-header';
import { QuestionNavSidebar } from '@/components/user/pages/tes/question-nav-sidebar';
import { ExamCompletedScreen } from '@/components/user/pages/tes/exam-completed-screen';
import { SubmitConfirmModal } from '@/components/user/pages/tes/submit-confirm-modal';
import { QuestionCard } from '@/components/user/pages/tes/question-card';
import type { ExamAttempt, ExamResult, ExamDisplaySoal } from '@/types/exam';

// ============================================
// Tes Started Page - Mock Data Version
// ============================================

export default function TesStartedPage() {
  const router = useRouter();

  // Exam state
  const [attempt, setAttempt] = useState<ExamAttempt | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Navigation state
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Modal state
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);

  // Sidebar visibility for mobile
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Initialize exam on mount
  useEffect(() => {
    const initializeExam = async () => {
      const attemptId = sessionStorage.getItem('examAttemptId');

      if (!attemptId) {
        setError('Sesi ujian tidak ditemukan. Silakan mulai ujian dari halaman tes overview.');
        setIsLoading(false);
        return;
      }

      const currentAttempt = getCurrentAttempt();
      if (!currentAttempt || currentAttempt.attemptId !== attemptId) {
        setError('Sesi ujian tidak valid. Silakan mulai ujian baru.');
        setIsLoading(false);
        return;
      }

      setAttempt(currentAttempt);
      setTimeRemaining(currentAttempt.durationSeconds);
      setIsLoading(false);
    };

    initializeExam();
  }, []);

  // Timer countdown
  useEffect(() => {
    if (!attempt || isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          // Auto submit when time is up
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [attempt, isSubmitted, timeRemaining]);

  // Disable right-click and copy
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => {
      e.preventDefault();
    };

    const handleCopy = (e: ClipboardEvent) => {
      e.preventDefault();
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      // Disable Ctrl+C, Ctrl+V, Ctrl+X
      if (e.ctrlKey && (e.key === 'c' || e.key === 'v' || e.key === 'x')) {
        e.preventDefault();
      }
    };

    document.addEventListener('contextmenu', handleContextMenu);
    document.addEventListener('copy', handleCopy);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('contextmenu', handleContextMenu);
      document.removeEventListener('copy', handleCopy);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Get current question
  const currentQuestion = useMemo((): ExamDisplaySoal | null => {
    return getQuestionByIndex(currentSoalIndex);
  }, [currentSoalIndex]);

  // Get current answer - depends on attempt to re-render when answer changes
  const currentAnswer = useMemo(() => {
    if (!currentQuestion) return null;
    return getAnswer(currentQuestion.questionId);
  }, [currentQuestion, attempt]);

  // Get current category index
  const currentKategoriIndex = useMemo(() => {
    return getCategoryIndex(currentSoalIndex);
  }, [currentSoalIndex]);

  // Get stats - depends on attempt to re-render when answers change
  const stats = useMemo(() => getExamStats(), [attempt]);

  // Handle answer selection
  const handleSelectAnswer = useCallback(
    (code: string) => {
      if (!currentQuestion) return;
      const current = getAnswer(currentQuestion.questionId);
      submitAnswerMock(currentQuestion.questionId, code, current?.notSure || false);
      // Force re-render
      setAttempt({ ...getCurrentAttempt()! });
    },
    [currentQuestion],
  );

  // Handle flag toggle
  const handleToggleFlag = useCallback(() => {
    if (!currentQuestion) return;
    toggleNotSureMock(currentQuestion.questionId);
    // Force re-render
    setAttempt({ ...getCurrentAttempt()! });
  }, [currentQuestion]);

  // Navigation
  const goToPrevious = () => {
    if (currentSoalIndex > 0) {
      setCurrentSoalIndex(currentSoalIndex - 1);
    }
  };

  const goToNext = () => {
    if (attempt && currentSoalIndex < attempt.questions.length - 1) {
      setCurrentSoalIndex(currentSoalIndex + 1);
    }
  };

  const goToSoal = (index: number) => {
    setCurrentSoalIndex(index);
    setShowMobileSidebar(false);
  };

  // Submit exam
  const handleSubmit = useCallback(() => {
    submitExamMock();
    const finalStats = getExamStats();
    setExamResult({
      totalSoal: finalStats.total,
      soalDijawab: finalStats.answered,
      soalDitandai: finalStats.marked,
      soalBelum: finalStats.unanswered,
    });
    setIsSubmitted(true);
    setShowSubmitConfirm(false);
    sessionStorage.removeItem('examAttemptId');
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-teal-600 animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Memuat sesi ujian...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !attempt) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <p className="text-red-600 mb-4">{error || 'Sesi ujian tidak ditemukan'}</p>
          <button onClick={() => router.push('/tes-overview')} className="px-4 py-2 bg-teal-600 text-white rounded-lg hover:bg-teal-700">
            Kembali ke Halaman Tes
          </button>
        </div>
      </div>
    );
  }

  // Show completion screen after submit
  if (isSubmitted && examResult) {
    return <ExamCompletedScreen result={examResult} />;
  }

  const totalSoal = attempt.questions.length;

  return (
    <div className="min-h-screen select-none">
      {/* Exam Header */}
      <ExamHeader
        title={attempt.sessionName}
        kategoriList={attempt.categories.map((k, idx) => ({
          kode: k.categoryCode,
          nama: k.categoryName,
          isActive: idx === currentKategoriIndex,
          isCompleted: k.isCompleted,
        }))}
        currentKategori={attempt.categories[currentKategoriIndex]?.categoryCode || ''}
        timeRemaining={timeRemaining}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Question Card */}
          <div className="flex-1 order-1">
            <QuestionCard
              currentIndex={currentSoalIndex}
              totalSoal={totalSoal}
              soal={currentQuestion}
              jawaban={currentAnswer?.answerCode || null}
              ditandai={currentAnswer?.notSure || false}
              onSelectAnswer={handleSelectAnswer}
              onToggleFlag={handleToggleFlag}
              onPrevious={goToPrevious}
              onNext={goToNext}
              canGoPrevious={currentSoalIndex > 0}
              canGoNext={currentSoalIndex < totalSoal - 1}
            />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block order-2">
            <QuestionNavSidebar
              totalSoal={totalSoal}
              currentIndex={currentSoalIndex}
              jawaban={(attempt?.answers || []).map((a, idx) => ({
                soalId: idx + 1,
                jawaban: a.answerCode,
                ditandai: a.notSure,
              }))}
              onGoToSoal={goToSoal}
              onSubmit={() => setShowSubmitConfirm(true)}
            />
          </div>
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {showMobileSidebar && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50" onClick={() => setShowMobileSidebar(false)}>
          <div className="absolute right-0 top-0 bottom-0 w-80 max-w-[90vw] bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-4">
              <QuestionNavSidebar
                totalSoal={totalSoal}
                currentIndex={currentSoalIndex}
                jawaban={(attempt?.answers || []).map((a, idx) => ({
                  soalId: idx + 1,
                  jawaban: a.answerCode,
                  ditandai: a.notSure,
                }))}
                onGoToSoal={goToSoal}
                onSubmit={() => {
                  setShowMobileSidebar(false);
                  setShowSubmitConfirm(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Submit Confirmation Modal */}
      <SubmitConfirmModal open={showSubmitConfirm} onOpenChange={setShowSubmitConfirm} dijawab={stats.answered} ditandai={stats.marked} belum={stats.unanswered} totalSoal={totalSoal} onConfirm={handleSubmit} />
    </div>
  );
}
