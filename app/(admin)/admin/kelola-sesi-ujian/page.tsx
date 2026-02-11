'use client';

import { useState } from 'react';
import { SesiUjianList, SesiUjianFormModal, DeleteConfirmModal } from '@/components/admin/pages/kelola-sesi-ujian';
import { getSessions, getSessionById, createSession as createSessionMock, updateSession as updateSessionMock, deleteSession as deleteSessionMock, getAvailableCategories } from '@/lib/mock-data/exam-session';
import type { ExamSession, ExamSessionFormInput, SessionDeleteModalState } from '@/types/exam-session';
import type { CategoryWithPackets } from '@/types/bank-soal';

// ============================================
// Kelola Sesi Ujian Page
// Mock Data Version (tidak terikat BatchId)
// ============================================

export default function KelolaUjianPage() {
  // Data State - initialize with mock data
  const [sessions, setSessions] = useState<ExamSession[]>(() => getSessions());
  const categories: CategoryWithPackets[] = getAvailableCategories();

  // Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ExamSession | null>(null);
  const [deleteModal, setDeleteModal] = useState<SessionDeleteModalState>({
    isOpen: false,
    session: null,
  });

  // Refresh sessions
  const refreshSessions = () => {
    setSessions(getSessions());
  };

  // ============================================
  // Handlers
  // ============================================
  const handleCreateSession = () => {
    setEditingSession(null);
    setFormOpen(true);
  };

  const handleEditSession = (session: ExamSession) => {
    const freshSession = getSessionById(session.id);
    if (freshSession) {
      setEditingSession(freshSession);
      setFormOpen(true);
    }
  };

  const handleDeleteSession = (session: ExamSession) => {
    setDeleteModal({ isOpen: true, session });
  };

  const handleSaveSession = (input: ExamSessionFormInput) => {
    if (editingSession) {
      updateSessionMock(editingSession.id, input);
    } else {
      createSessionMock(input);
    }
    refreshSessions();
    setFormOpen(false);
    setEditingSession(null);
  };

  const handleConfirmDelete = () => {
    if (deleteModal.session) {
      deleteSessionMock(deleteModal.session.id);
      refreshSessions();
    }
    setDeleteModal({ isOpen: false, session: null });
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Kelola Sesi Ujian</h1>
        <p className="text-gray-500">Kelola jadwal dan konfigurasi sesi ujian</p>
      </div>

      {/* Sesi Ujian List */}
      <SesiUjianList sessions={sessions} onCreateSession={handleCreateSession} onEditSession={handleEditSession} onDeleteSession={handleDeleteSession} />

      {/* Form Modal */}
      <SesiUjianFormModal
        isOpen={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingSession(null);
        }}
        onSave={handleSaveSession}
        session={editingSession}
        mode={editingSession ? 'edit' : 'create'}
        categories={categories}
      />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        onClose={() => setDeleteModal({ isOpen: false, session: null })}
        onConfirm={handleConfirmDelete}
        title="Hapus Sesi Ujian"
        message={`Apakah Anda yakin ingin menghapus sesi "${deleteModal.session?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
