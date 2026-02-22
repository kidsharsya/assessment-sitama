'use client';

import { useState, useCallback } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { LinkWawancaraList } from './link-wawancara-list';
import { LinkWawancaraFormModal } from './link-wawancara-form-modal';
import { DeleteConfirmModal } from './delete-confirm-modal';
import { useInterviewSessions, useInterviewSession } from '@/hooks/use-interview-session';
import { useInterviewRubrics } from '@/hooks/use-interview-rubrics';
import { useApplicantsForInterview } from '@/hooks/use-applicants-for-interview';
import { Pagination } from '@/components/ui/pagination';
import type { InterviewSession, InterviewSessionFormInput, CreateInterviewSessionRequest, UpdateInterviewSessionRequest } from '@/types/interview-session';

// ============================================
// Manajemen Wawancara Content Component
// ============================================

export function ManajemenWawancaraContent() {
  // Fetch interview sessions
  const { sessions, isLoading: isLoadingSessions, error: sessionsError, currentPage, totalPages, totalElements, pageSize, setPage, createSession, updateSession, deleteSession, refetch: refetchSessions } = useInterviewSessions();

  // Fetch rubrics for selection
  const { rubrics, isLoading: isLoadingRubrics } = useInterviewRubrics(0, 100);

  // Fetch applicants for selection (eligible for interview)
  const { applicants, isLoading: isLoadingApplicants } = useApplicantsForInterview();

  // Modal states
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [formModalMode, setFormModalMode] = useState<'create' | 'edit'>('create');
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

  // Fetch session detail when editing
  const { session: editingSession, participantIds: editingParticipantIds, isLoading: isLoadingEditSession, refetch: refetchEditSession } = useInterviewSession(editingSessionId);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);

  // Saving state
  const [isSaving, setIsSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // ============================================
  // Handlers
  // ============================================

  const handleCreateLink = useCallback(() => {
    setFormModalMode('create');
    setEditingSessionId(null);
    setIsFormModalOpen(true);
    setSaveError(null);
  }, []);

  const handleEditLink = useCallback((session: InterviewSession) => {
    setFormModalMode('edit');
    setEditingSessionId(session.id);
    setIsFormModalOpen(true);
    setSaveError(null);
  }, []);

  const handleDeleteLink = useCallback(
    (sessionId: string) => {
      const session = sessions.find((s) => s.id === sessionId);
      if (session) {
        setDeleteTarget({ id: sessionId, name: session.namaInterviewer });
        setIsDeleteModalOpen(true);
      }
    },
    [sessions],
  );

  const handleSaveLink = useCallback(
    async (data: InterviewSessionFormInput) => {
      setIsSaving(true);
      setSaveError(null);

      try {
        if (formModalMode === 'create') {
          const request: CreateInterviewSessionRequest = {
            rubricId: data.rubrikId,
            interviewerName: data.namaInterviewer,
            interviewerEmail: data.emailInterviewer || undefined,
            accessPin: data.accessPin,
            applicationIds: data.applicationIds,
            isActive: data.status === 'aktif',
          };
          await createSession(request);
        } else if (editingSessionId) {
          const request: UpdateInterviewSessionRequest = {
            rubricId: data.rubrikId,
            interviewerName: data.namaInterviewer,
            interviewerEmail: data.emailInterviewer || undefined,
            accessPin: data.accessPin,
            applicationIds: data.applicationIds,
            isActive: data.status === 'aktif',
          };
          await updateSession(editingSessionId, request);
        }
        setIsFormModalOpen(false);
      } catch (err) {
        setSaveError(err instanceof Error ? err.message : 'Gagal menyimpan sesi wawancara');
      } finally {
        setIsSaving(false);
      }
    },
    [formModalMode, editingSessionId, createSession, updateSession],
  );

  const handleConfirmDelete = useCallback(async () => {
    if (!deleteTarget) return;

    try {
      await deleteSession(deleteTarget.id);
      setDeleteTarget(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      console.error('Failed to delete session:', err);
    }
  }, [deleteTarget, deleteSession]);

  const handleToggleActive = useCallback(
    async (sessionId: string) => {
      try {
        const { toggleInterviewSessionActive } = await import('@/lib/api/services/interview-session');
        await toggleInterviewSessionActive(sessionId);
        await refetchSessions();
      } catch (err) {
        console.error('Failed to toggle session status:', err);
      }
    },
    [refetchSessions],
  );

  const handlePageChange = useCallback(
    (page: number) => {
      setPage(page - 1); // API uses 0-based pagination
    },
    [setPage],
  );

  // ============================================
  // Loading State
  // ============================================

  if (isLoadingSessions) {
    return (
      <div className="flex items-center justify-center min-h-[300px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data sesi wawancara...</p>
        </div>
      </div>
    );
  }

  // ============================================
  // Error State
  // ============================================

  if (sessionsError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <AlertCircle className="h-5 w-5 text-red-600" />
          <p className="text-sm text-red-600">{sessionsError}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Error Alert for Save */}
      {saveError && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-red-600" />
            <p className="text-sm text-red-600">{saveError}</p>
          </div>
        </div>
      )}

      {/* Link Wawancara List */}
      <LinkWawancaraList sessionList={sessions} onCreateLink={handleCreateLink} onEditLink={handleEditLink} onDeleteLink={handleDeleteLink} onToggleActive={handleToggleActive} />

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage + 1} // Convert to 1-based for UI
          totalPages={totalPages}
          totalItems={totalElements}
          itemsPerPage={pageSize}
          onPageChange={handlePageChange}
        />
      )}

      {/* Form Modal */}
      <LinkWawancaraFormModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        onSave={handleSaveLink}
        session={editingSession}
        mode={formModalMode}
        rubrikList={rubrics}
        applicantList={applicants}
        selectedApplicationIds={editingParticipantIds}
        isLoading={isLoadingRubrics || isLoadingApplicants}
        isLoadingSession={isLoadingEditSession}
        isSaving={isSaving}
        onRefreshParticipants={refetchEditSession}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title="Hapus Sesi Wawancara"
        message={`Apakah Anda yakin ingin menghapus sesi wawancara untuk "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
