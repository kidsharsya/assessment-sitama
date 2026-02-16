'use client';

import { useState, useCallback, useEffect, useMemo, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { AssessmentService } from '@/services/assessment.service';
import type { AnswerStatusItem, ManifestCategory } from '@/services/assessment.service';
import { ExamHeader } from '@/components/user/pages/tes/exam-header';
import { QuestionNavSidebar } from '@/components/user/pages/tes/question-nav-sidebar';
import { ExamCompletedScreen } from '@/components/user/pages/tes/exam-completed-screen';
import { SubmitConfirmModal } from '@/components/user/pages/tes/submit-confirm-modal';
import { QuestionCard } from '@/components/user/pages/tes/question-card';
import type { ExamDisplaySoal, ExamResult, ManifestQuestionEntry } from '@/types/exam';

// ============================================
// Tes Started Page - Real API Version
// ============================================

interface ExamSessionData {
  attemptId: string;
  startTime: string;
  endTime: string;
  durationMinutes: number;
  categories: ManifestCategory[];
  /** Flat ordered list of all questions from manifest */
  questionsOrder: ManifestQuestionEntry[];
}

export default function TesStartedPage() {
  const router = useRouter();

  // Core exam state
  const [session, setSession] = useState<ExamSessionData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Answer statuses (from API, for nav sidebar)
  const [answerStatuses, setAnswerStatuses] = useState<AnswerStatusItem[]>([]);

  // Current question content (loaded lazily)
  const [currentQuestion, setCurrentQuestion] = useState<ExamDisplaySoal | null>(null);
  const [isLoadingQuestion, setIsLoadingQuestion] = useState(false);

  // Navigation state
  const [currentSoalIndex, setCurrentSoalIndex] = useState(0);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [examResult, setExamResult] = useState<ExamResult | null>(null);

  // Timer state
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  // Modal & sidebar state
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false);
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);

  // Saving answer indicator (for future loading UI)
  const [, setIsSavingAnswer] = useState(false);

  // Question content cache
  const questionCache = useRef<Map<string, ExamDisplaySoal>>(new Map());

  // ============================================================
  // Initialize exam: load manifest + answer statuses
  // ============================================================
  useEffect(() => {
    const initializeExam = async () => {
      const attemptId = sessionStorage.getItem('examAttemptId');

      if (!attemptId) {
        setError('Sesi ujian tidak ditemukan. Silakan mulai ujian dari halaman tes overview.');
        setIsLoading(false);
        return;
      }

      try {
        // Fetch manifest + answer statuses in parallel
        const [manifestRes, statusRes] = await Promise.all([AssessmentService.getExamManifest(attemptId), AssessmentService.getAnswerStatuses(attemptId)]);

        if (!manifestRes.success || !statusRes.success) {
          setError('Gagal memuat data ujian. Silakan coba lagi.');
          setIsLoading(false);
          return;
        }

        // Build flat question order from manifest categories
        const questionsOrder: ManifestQuestionEntry[] = [];
        for (const cat of manifestRes.data.categories) {
          for (const q of cat.questions) {
            questionsOrder.push({
              number: q.number,
              questionId: q.questionId,
              categoryCode: cat.categoryCode,
              optionShuffleOrder: q.optionShuffleOrder,
            });
          }
        }

        // Get start data from sessionStorage (saved by tes-overview)
        const startDataRaw = sessionStorage.getItem('examStartData');
        const startData = startDataRaw ? JSON.parse(startDataRaw) : null;

        // Calculate time remaining from endTime
        const endTime = startData?.endTime || new Date(Date.now() + 60 * 60 * 1000).toISOString();
        const remainingMs = new Date(endTime).getTime() - Date.now();
        const remainingSec = Math.max(0, Math.floor(remainingMs / 1000));

        const sessionData: ExamSessionData = {
          attemptId,
          startTime: startData?.startTime || new Date().toISOString(),
          endTime,
          durationMinutes: startData?.durationMinutes || 60,
          categories: manifestRes.data.categories,
          questionsOrder,
        };

        setSession(sessionData);
        setAnswerStatuses(statusRes.data.statuses);
        setTimeRemaining(remainingSec);
        setIsLoading(false);

        // Load first question
        if (questionsOrder.length > 0) {
          loadQuestionContent(questionsOrder[0]);
        }
      } catch (err) {
        console.error('Error initializing exam:', err);
        setError('Gagal memuat sesi ujian. Periksa koneksi internet Anda.');
        setIsLoading(false);
      }
    };

    initializeExam();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ============================================================
  // Load question content (with cache)
  // ============================================================
  const loadQuestionContent = useCallback(async (questionEntry: ManifestQuestionEntry) => {
    const cached = questionCache.current.get(questionEntry.questionId);
    if (cached) {
      setCurrentQuestion(cached);
      return;
    }

    setIsLoadingQuestion(true);
    try {
      const res = await AssessmentService.getQuestionContent(questionEntry.questionId);
      if (res.success) {
        // Shuffle options according to optionShuffleOrder from manifest
        const originalOptions = res.data.options;
        const shuffledOptions = questionEntry.optionShuffleOrder.length > 0 ? questionEntry.optionShuffleOrder.filter((idx) => idx < originalOptions.length).map((idx) => originalOptions[idx]) : originalOptions;

        const displaySoal: ExamDisplaySoal = {
          questionId: res.data.questionId,
          number: questionEntry.number,
          text: res.data.text,
          imagePath: res.data.imagePath,
          options: shuffledOptions.map((opt) => ({
            code: opt.label,
            text: opt.text,
            imagePath: opt.imagePath,
          })),
          categoryCode: questionEntry.categoryCode,
        };

        questionCache.current.set(questionEntry.questionId, displaySoal);
        setCurrentQuestion(displaySoal);
      }
    } catch (err) {
      console.error('Error loading question:', err);
    } finally {
      setIsLoadingQuestion(false);
    }
  }, []);

  // ============================================================
  // Timer countdown
  // ============================================================
  useEffect(() => {
    if (!session || isSubmitted || timeRemaining <= 0) return;

    const timer = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, isSubmitted, timeRemaining]);

  // ============================================================
  // Disable right-click and copy
  // ============================================================
  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault();
    const handleCopy = (e: ClipboardEvent) => e.preventDefault();
    const handleKeyDown = (e: KeyboardEvent) => {
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

  // ============================================================
  // Derived data
  // ============================================================

  // Current answer for the active question
  const currentAnswer = useMemo(() => {
    if (!currentQuestion || !answerStatuses.length) return null;
    return answerStatuses.find((s) => s.questionId === currentQuestion.questionId) || null;
  }, [currentQuestion, answerStatuses]);

  // Current category index
  const currentKategoriIndex = useMemo(() => {
    if (!session || !session.questionsOrder[currentSoalIndex]) return 0;
    const catCode = session.questionsOrder[currentSoalIndex].categoryCode;
    return session.categories.findIndex((c) => c.categoryCode === catCode);
  }, [session, currentSoalIndex]);

  // Stats for submit modal and sidebar
  const stats = useMemo(() => {
    const total = answerStatuses.length;
    const answered = answerStatuses.filter((s) => s.answerCode !== null).length;
    const marked = answerStatuses.filter((s) => s.notSure).length;
    const unanswered = total - answered;
    return { total, answered, marked, unanswered };
  }, [answerStatuses]);

  // ============================================================
  // Handle answer selection → save to API
  // ============================================================
  const handleSelectAnswer = useCallback(
    async (code: string) => {
      if (!currentQuestion || !session) return;

      const currentStatus = answerStatuses.find((s) => s.questionId === currentQuestion.questionId);

      // Optimistic update
      setAnswerStatuses((prev) => prev.map((s) => (s.questionId === currentQuestion.questionId ? { ...s, answerCode: code } : s)));

      setIsSavingAnswer(true);
      try {
        await AssessmentService.saveAnswer({
          attemptId: session.attemptId,
          questionId: currentQuestion.questionId,
          answerCode: code,
          notSure: currentStatus?.notSure || false,
        });
      } catch (err) {
        console.error('Error saving answer:', err);
        // Revert optimistic update on error
        setAnswerStatuses((prev) => prev.map((s) => (s.questionId === currentQuestion.questionId ? { ...s, answerCode: currentStatus?.answerCode || null } : s)));
      } finally {
        setIsSavingAnswer(false);
      }
    },
    [currentQuestion, session, answerStatuses],
  );

  // ============================================================
  // Handle flag/notSure toggle → save to API
  // ============================================================
  const handleToggleFlag = useCallback(async () => {
    if (!currentQuestion || !session) return;

    const currentStatus = answerStatuses.find((s) => s.questionId === currentQuestion.questionId);
    const newNotSure = !(currentStatus?.notSure || false);

    // Optimistic update
    setAnswerStatuses((prev) => prev.map((s) => (s.questionId === currentQuestion.questionId ? { ...s, notSure: newNotSure } : s)));

    try {
      await AssessmentService.saveAnswer({
        attemptId: session.attemptId,
        questionId: currentQuestion.questionId,
        answerCode: currentStatus?.answerCode || null,
        notSure: newNotSure,
      });
    } catch (err) {
      console.error('Error toggling flag:', err);
      // Revert
      setAnswerStatuses((prev) => prev.map((s) => (s.questionId === currentQuestion.questionId ? { ...s, notSure: currentStatus?.notSure || false } : s)));
    }
  }, [currentQuestion, session, answerStatuses]);

  // ============================================================
  // Navigation
  // ============================================================
  const navigateToQuestion = useCallback(
    (index: number) => {
      if (!session || index < 0 || index >= session.questionsOrder.length) return;
      setCurrentSoalIndex(index);
      setShowMobileSidebar(false);
      loadQuestionContent(session.questionsOrder[index]);
    },
    [session, loadQuestionContent],
  );

  const goToPrevious = () => {
    if (currentSoalIndex > 0) navigateToQuestion(currentSoalIndex - 1);
  };

  const goToNext = () => {
    if (session && currentSoalIndex < session.questionsOrder.length - 1) {
      navigateToQuestion(currentSoalIndex + 1);
    }
  };

  // ============================================================
  // Submit exam → call finish API
  // ============================================================
  const handleSubmit = useCallback(async () => {
    if (!session) return;

    try {
      await AssessmentService.finishExam(session.attemptId);

      setExamResult({
        totalSoal: stats.total,
        soalDijawab: stats.answered,
        soalDitandai: stats.marked,
        soalBelum: stats.unanswered,
      });
      setIsSubmitted(true);
      setShowSubmitConfirm(false);
      sessionStorage.removeItem('examAttemptId');
      sessionStorage.removeItem('examStartData');
    } catch (err) {
      console.error('Error finishing exam:', err);
      // Still mark as submitted even on error (exam may have been auto-submitted server-side)
      setExamResult({
        totalSoal: stats.total,
        soalDijawab: stats.answered,
        soalDitandai: stats.marked,
        soalBelum: stats.unanswered,
      });
      setIsSubmitted(true);
      setShowSubmitConfirm(false);
      sessionStorage.removeItem('examAttemptId');
      sessionStorage.removeItem('examStartData');
    }
  }, [session, stats]);

  // ============================================================
  // Render states
  // ============================================================

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
  if (error || !session) {
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

  const totalSoal = session.questionsOrder.length;

  // Build jawaban array for QuestionNavSidebar
  const jawabanForSidebar = session.questionsOrder.map((q) => {
    const status = answerStatuses.find((s) => s.questionId === q.questionId);
    return {
      soalId: q.number,
      jawaban: status?.answerCode || null,
      ditandai: status?.notSure || false,
    };
  });

  // Build kategori list for ExamHeader
  const kategoriList = session.categories.map((cat, idx) => ({
    kode: cat.categoryCode,
    nama: cat.categoryName,
    isActive: idx === currentKategoriIndex,
    isCompleted: false,
  }));

  return (
    <div className="min-h-screen select-none">
      {/* Exam Header */}
      <ExamHeader
        title="Assessment Sitama"
        kategoriList={kategoriList}
        currentKategori={session.categories[currentKategoriIndex]?.categoryCode || ''}
        timeRemaining={timeRemaining}
        onToggleSidebar={() => setShowMobileSidebar(!showMobileSidebar)}
      />

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 py-4 lg:py-6">
        <div className="flex flex-col lg:flex-row gap-4 lg:gap-6">
          {/* Question Card */}
          <div className="flex-1 order-1">
            {isLoadingQuestion ? (
              <div className="bg-white rounded-xl sm:rounded-2xl border border-gray-200 p-6 flex items-center justify-center min-h-75">
                <div className="text-center">
                  <Loader2 className="w-8 h-8 text-teal-600 animate-spin mx-auto mb-2" />
                  <p className="text-gray-500 text-sm">Memuat soal...</p>
                </div>
              </div>
            ) : (
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
            )}
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block order-2">
            <QuestionNavSidebar totalSoal={totalSoal} currentIndex={currentSoalIndex} jawaban={jawabanForSidebar} onGoToSoal={navigateToQuestion} onSubmit={() => setShowSubmitConfirm(true)} />
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
                jawaban={jawabanForSidebar}
                onGoToSoal={navigateToQuestion}
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
