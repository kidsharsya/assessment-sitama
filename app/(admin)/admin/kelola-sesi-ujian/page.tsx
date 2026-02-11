'use client';

import { useState, useEffect, useCallback } from 'react';
import { SesiUjianList, SesiUjianFormModal, DeleteConfirmModal } from '@/components/admin/pages/kelola-sesi-ujian';
import { ExamSessionService } from '@/services/exam-session.service';
import { BankSoalService } from '@/services/bank-soal.service';
import type { ExamSession, ExamSessionFormInput, SessionDeleteModalState } from '@/types/exam-session';
import type { CategoryWithPackets } from '@/types/bank-soal';

// ============================================
// Kelola Sesi Ujian Page
// Hasura GraphQL Integration
// ============================================

export default function KelolaUjianPage() {
  // Data State
  const [sessions, setSessions] = useState<ExamSession[]>([]);
  const [categories, setCategories] = useState<CategoryWithPackets[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Modal State
  const [formOpen, setFormOpen] = useState(false);
  const [editingSession, setEditingSession] = useState<ExamSession | null>(null);
  const [deleteModal, setDeleteModal] = useState<SessionDeleteModalState>({
    isOpen: false,
    session: null,
  });

  // Load sessions from Hasura
  const loadSessions = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await ExamSessionService.getSessions();
      setSessions(data);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Load categories for form dropdown (with packet/question stats)
  const loadCategories = useCallback(async () => {
    try {
      const all = await BankSoalService.getCategories();
      setCategories(all.filter((c) => c.isActive));
    } catch (error) {
      console.error('Failed to load categories:', error);
    }
  }, []);

  useEffect(() => {
    loadSessions();
    loadCategories();
  }, [loadSessions, loadCategories]);

  // ============================================
  // Handlers
  // ============================================
  const handleCreateSession = () => {
    setEditingSession(null);
    setFormOpen(true);
  };

  const handleEditSession = async (session: ExamSession) => {
    try {
      const freshSession = await ExamSessionService.getSessionById(session.id);
      if (freshSession) {
        setEditingSession(freshSession);
        setFormOpen(true);
      }
    } catch (error) {
      console.error('Failed to fetch session:', error);
    }
  };

  const handleDeleteSession = (session: ExamSession) => {
    setDeleteModal({ isOpen: true, session });
  };

  const handleSaveSession = async (input: ExamSessionFormInput) => {
    try {
      if (editingSession) {
        await ExamSessionService.updateSession(editingSession.id, input);
      } else {
        await ExamSessionService.createSession(input);
      }
      await loadSessions();
    } catch (error) {
      console.error('Failed to save session:', error);
    }
    setFormOpen(false);
    setEditingSession(null);
  };

  const handleConfirmDelete = async () => {
    if (deleteModal.session) {
      try {
        await ExamSessionService.deleteSession(deleteModal.session.id);
        await loadSessions();
      } catch (error) {
        console.error('Failed to delete session:', error);
      }
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
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600" />
        </div>
      ) : (
        <SesiUjianList sessions={sessions} onCreateSession={handleCreateSession} onEditSession={handleEditSession} onDeleteSession={handleDeleteSession} />
      )}

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
