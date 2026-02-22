'use client';

import { useState, useCallback } from 'react';
import { ClipboardList, User, Loader2 } from 'lucide-react';
import { PesertaList } from './peserta-list';
import { AssessmentForm } from './assessment-form';
import { useParticipantForm, useSubmitScore } from '@/hooks/use-interview-process';
import type { InterviewDashboard, DashboardParticipant, SubmitScoreRequest } from '@/types/interview-process';

// ============================================
// Interview Page Content Component
// ============================================

interface InterviewPageContentProps {
  dashboard: InterviewDashboard;
  onRefresh: () => Promise<void>;
}

export function InterviewPageContent({ dashboard, onRefresh }: InterviewPageContentProps) {
  const [selectedParticipant, setSelectedParticipant] = useState<DashboardParticipant | null>(dashboard.participants[0] || null);

  // Fetch participant form when a participant is selected
  const { form: participantForm, isLoading: isLoadingForm, refetch: refetchForm } = useParticipantForm(selectedParticipant?.participantId || null);

  // Submit score hook
  const { isSubmitting, submitScore, error: submitError } = useSubmitScore();

  const handleSelectParticipant = useCallback((participant: DashboardParticipant) => {
    setSelectedParticipant(participant);
  }, []);

  const handleSaveScore = useCallback(
    async (data: SubmitScoreRequest) => {
      if (!selectedParticipant) return;

      const success = await submitScore(selectedParticipant.participantId, data);

      if (success) {
        // Refresh dashboard to update participant status
        await onRefresh();
        // Refresh form to show updated assessment
        await refetchForm();
      }
    },
    [selectedParticipant, submitScore, onRefresh, refetchForm],
  );

  return (
    <div className="h-screen flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-teal-100 rounded-lg flex items-center justify-center">
              <ClipboardList className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Form Penilaian Wawancara</h1>
              <p className="text-sm text-gray-500">
                Interviewer: <span className="font-medium">{dashboard.sessionInfo.interviewerName}</span>
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-500">Rubrik</p>
            <p className="font-medium text-gray-900">{dashboard.sessionInfo.rubricName}</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar - Peserta List */}
        <div className="w-80 shrink-0">
          <PesertaList participants={dashboard.participants} selectedParticipantId={selectedParticipant?.participantId || null} onSelectParticipant={handleSelectParticipant} />
        </div>

        {/* Main Area - Assessment Form */}
        <div className="flex-1 bg-gray-50">
          {selectedParticipant ? (
            isLoadingForm || !participantForm ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
                  <p className="text-gray-500">Memuat form penilaian...</p>
                </div>
              </div>
            ) : (
              <AssessmentForm key={selectedParticipant.participantId} participantForm={participantForm} onSave={handleSaveScore} isSaving={isSubmitting} error={submitError} />
            )
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <User className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Pilih Peserta</h3>
                <p className="text-sm text-gray-500">Klik nama peserta di sebelah kiri untuk memulai penilaian</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
