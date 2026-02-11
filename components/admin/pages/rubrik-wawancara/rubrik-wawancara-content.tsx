'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { Loader2, AlertCircle } from 'lucide-react';
import { RubrikList } from './rubrik-list';
import { RubrikFormModal } from './rubrik-form-modal';
import { KriteriaList } from './kriteria-list';
import { KriteriaFormModal } from './kriteria-form-modal';
import { DeleteConfirmModal } from './delete-confirm-modal';
import type { RubrikWawancaraWithKriteria, RubrikWawancaraFormInput, Kriteria, KriteriaFormInput } from '@/types/rubrik-wawancara';
import { getRubriks, createRubrik, updateRubrik, deleteRubrik, toggleRubrikActive, getKriteriaByRubrikId, createKriteria, updateKriteria, deleteKriteria } from '@/lib/mock-data/rubrik-wawancara';

// ============================================
// Rubrik Wawancara Content Component
// ============================================

type ViewMode = 'list' | 'kriteria';

interface DeleteTarget {
  type: 'rubrik' | 'kriteria';
  id: string;
  name: string;
}

export function RubrikWawancaraContent() {
  // State for rubrics data
  const [rubrics, setRubrics] = useState<RubrikWawancaraWithKriteria[]>([]);
  const [isLoadingRubrics, setIsLoadingRubrics] = useState(true);
  const [rubricError, setRubricError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const [pageSize] = useState(10);

  // View state
  const [viewMode, setViewMode] = useState<ViewMode>('list');
  const [selectedRubrik, setSelectedRubrik] = useState<RubrikWawancaraWithKriteria | null>(null);

  // State for criteria data
  const [criteria, setCriteria] = useState<Kriteria[]>([]);
  const [isLoadingCriteria, setIsLoadingCriteria] = useState(false);
  const [criteriaError, setCriteriaError] = useState<string | null>(null);
  const [criteriaPage, setCriteriaPage] = useState(0);
  const [criteriaTotalPages, setCriteriaTotalPages] = useState(0);
  const [criteriaTotalElements, setCriteriaTotalElements] = useState(0);
  const [criteriaPageSize] = useState(10);

  // Modal states for Rubrik
  const [isRubrikModalOpen, setIsRubrikModalOpen] = useState(false);
  const [rubrikModalMode, setRubrikModalMode] = useState<'create' | 'edit'>('create');
  const [editingRubrik, setEditingRubrik] = useState<RubrikWawancaraWithKriteria | null>(null);

  // Modal states for Kriteria
  const [isKriteriaModalOpen, setIsKriteriaModalOpen] = useState(false);
  const [kriteriaModalMode, setKriteriaModalMode] = useState<'create' | 'edit'>('create');
  const [editingKriteria, setEditingKriteria] = useState<Kriteria | null>(null);

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null);

  // Loading and error state
  const [actionError, setActionError] = useState<string | null>(null);

  // ============================================
  // Data Fetching
  // ============================================

  const fetchRubrics = useCallback(() => {
    setIsLoadingRubrics(true);
    setRubricError(null);
    try {
      const data = getRubriks(currentPage, pageSize);
      setRubrics(data.content);
      setTotalPages(data.totalPages);
      setTotalElements(data.totalElements);
    } catch (err) {
      setRubricError(err instanceof Error ? err.message : 'Gagal memuat data rubrik');
    } finally {
      setIsLoadingRubrics(false);
    }
  }, [currentPage, pageSize]);

  const fetchCriteria = useCallback(() => {
    if (!selectedRubrik?.id) return;

    setIsLoadingCriteria(true);
    setCriteriaError(null);
    try {
      const data = getKriteriaByRubrikId(selectedRubrik.id, criteriaPage, criteriaPageSize);
      setCriteria(data.content);
      setCriteriaTotalPages(data.totalPages);
      setCriteriaTotalElements(data.totalElements);
    } catch (err) {
      setCriteriaError(err instanceof Error ? err.message : 'Gagal memuat data kriteria');
    } finally {
      setIsLoadingCriteria(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRubrik?.id, criteriaPage, criteriaPageSize]);

  // Initial load
  useEffect(() => {
    fetchRubrics();
  }, [fetchRubrics]);

  // Load criteria when rubrik is selected (only when id changes)
  useEffect(() => {
    if (selectedRubrik?.id) {
      fetchCriteria();
    }
  }, [selectedRubrik?.id, fetchCriteria]);

  // Update selectedRubrik kriteriaList when criteria changes
  // Use a ref to prevent infinite loop
  const criteriaRef = useRef<Kriteria[]>([]);
  useEffect(() => {
    // Only update if criteria actually changed (by comparing ids)
    const currentIds = criteria.map((k) => k.id).join(',');
    const prevIds = criteriaRef.current.map((k) => k.id).join(',');

    if (currentIds !== prevIds && selectedRubrik) {
      criteriaRef.current = criteria;
      const totalBobot = criteria.reduce((sum, k) => sum + k.bobot, 0);
      setSelectedRubrik((prev) =>
        prev
          ? {
              ...prev,
              kriteriaList: criteria,
              totalKriteria: criteria.length,
              totalBobot,
            }
          : null,
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [criteria]);

  // ============================================
  // Rubrik Handlers
  // ============================================

  const handleCreateRubrik = useCallback(() => {
    setRubrikModalMode('create');
    setEditingRubrik(null);
    setIsRubrikModalOpen(true);
  }, []);

  const handleEditRubrik = useCallback((rubrik: RubrikWawancaraWithKriteria) => {
    setRubrikModalMode('edit');
    setEditingRubrik(rubrik);
    setIsRubrikModalOpen(true);
  }, []);

  const handleDeleteRubrik = useCallback(
    (rubrikId: string) => {
      const rubrik = rubrics.find((r) => r.id === rubrikId);
      if (rubrik) {
        setDeleteTarget({ type: 'rubrik', id: rubrikId, name: rubrik.nama });
        setIsDeleteModalOpen(true);
      }
    },
    [rubrics],
  );

  const handleSelectRubrik = useCallback((rubrik: RubrikWawancaraWithKriteria) => {
    setSelectedRubrik(rubrik);
    setCriteriaPage(0);
    setViewMode('kriteria');
  }, []);

  const handleToggleActive = useCallback(
    (rubrikId: string) => {
      setActionError(null);
      try {
        toggleRubrikActive(rubrikId);
        fetchRubrics();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Gagal mengubah status rubrik');
      }
    },
    [fetchRubrics],
  );

  const handleSaveRubrik = useCallback(
    (data: RubrikWawancaraFormInput) => {
      setActionError(null);

      try {
        if (rubrikModalMode === 'create') {
          createRubrik(data);
        } else if (editingRubrik) {
          updateRubrik(editingRubrik.id, data);

          // Update selectedRubrik if it's the one being edited
          if (selectedRubrik?.id === editingRubrik.id) {
            setSelectedRubrik((prev) =>
              prev
                ? {
                    ...prev,
                    nama: data.nama,
                    deskripsi: data.deskripsi,
                    isActive: data.isActive,
                  }
                : null,
            );
          }
        }

        setIsRubrikModalOpen(false);
        fetchRubrics();
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Gagal menyimpan rubrik');
      }
    },
    [rubrikModalMode, editingRubrik, selectedRubrik, fetchRubrics],
  );

  // ============================================
  // Kriteria Handlers
  // ============================================

  const handleBackToList = useCallback(() => {
    setViewMode('list');
    setSelectedRubrik(null);
    setCriteria([]);
    criteriaRef.current = [];
  }, []);

  const handleCreateKriteria = useCallback(() => {
    setKriteriaModalMode('create');
    setEditingKriteria(null);
    setIsKriteriaModalOpen(true);
  }, []);

  const handleEditKriteria = useCallback((kriteria: Kriteria) => {
    setKriteriaModalMode('edit');
    setEditingKriteria(kriteria);
    setIsKriteriaModalOpen(true);
  }, []);

  const handleDeleteKriteria = useCallback(
    (kriteriaId: string) => {
      if (!selectedRubrik) return;
      const kriteria = selectedRubrik.kriteriaList.find((k) => k.id === kriteriaId);
      if (kriteria) {
        setDeleteTarget({ type: 'kriteria', id: kriteriaId, name: kriteria.nama });
        setIsDeleteModalOpen(true);
      }
    },
    [selectedRubrik],
  );

  const handleSaveKriteria = useCallback(
    (data: KriteriaFormInput) => {
      if (!selectedRubrik) return;

      setActionError(null);

      try {
        if (kriteriaModalMode === 'create') {
          createKriteria(selectedRubrik.id, data);
        } else if (editingKriteria) {
          updateKriteria(editingKriteria.id, data);
        }

        setIsKriteriaModalOpen(false);
        fetchCriteria();
        fetchRubrics(); // Also refresh rubrics to update totals
      } catch (err) {
        setActionError(err instanceof Error ? err.message : 'Gagal menyimpan kriteria');
      }
    },
    [selectedRubrik, kriteriaModalMode, editingKriteria, fetchCriteria, fetchRubrics],
  );

  // ============================================
  // Delete Handler
  // ============================================

  const handleConfirmDelete = useCallback(() => {
    if (!deleteTarget) return;

    setActionError(null);

    try {
      if (deleteTarget.type === 'rubrik') {
        deleteRubrik(deleteTarget.id);

        // If deleted rubrik is currently selected, go back to list
        if (selectedRubrik?.id === deleteTarget.id) {
          setViewMode('list');
          setSelectedRubrik(null);
        }

        fetchRubrics();
      } else if (deleteTarget.type === 'kriteria') {
        deleteKriteria(deleteTarget.id);
        fetchCriteria();
        fetchRubrics(); // Also refresh rubrics to update totals
      }

      setDeleteTarget(null);
      setIsDeleteModalOpen(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Gagal menghapus data');
    }
  }, [deleteTarget, selectedRubrik, fetchRubrics, fetchCriteria]);

  // Calculate current total bobot for kriteria form validation
  const getCurrentTotalBobot = useCallback(() => {
    if (!selectedRubrik) return 0;
    if (kriteriaModalMode === 'edit' && editingKriteria) {
      return selectedRubrik.kriteriaList.filter((k) => k.id !== editingKriteria.id).reduce((sum, k) => sum + k.bobot, 0);
    }
    return selectedRubrik.totalBobot;
  }, [selectedRubrik, kriteriaModalMode, editingKriteria]);

  // ============================================
  // Render
  // ============================================

  return (
    <div>
      {/* Page Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Manajemen Rubrik Wawancara</h1>
        <p className="text-sm text-gray-500 mt-1">Kelola rubrik dan kriteria penilaian untuk proses wawancara</p>
      </div>

      {/* Action Error Display */}
      {actionError && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Terjadi Kesalahan</p>
            <p className="text-sm text-red-600 mt-1">{actionError}</p>
          </div>
        </div>
      )}

      {/* Main Content */}
      {viewMode === 'list' ? (
        <>
          {isLoadingRubrics ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <span className="ml-3 text-gray-600">Memuat data rubrik...</span>
            </div>
          ) : rubricError ? (
            <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Gagal Memuat Data</h3>
              <p className="text-sm text-red-600 mb-4">{rubricError}</p>
              <button onClick={() => fetchRubrics()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Coba Lagi
              </button>
            </div>
          ) : (
            <RubrikList
              rubrikList={rubrics}
              onCreateRubrik={handleCreateRubrik}
              onEditRubrik={handleEditRubrik}
              onDeleteRubrik={handleDeleteRubrik}
              onSelectRubrik={handleSelectRubrik}
              onToggleActive={handleToggleActive}
              currentPage={currentPage}
              totalPages={totalPages}
              totalElements={totalElements}
              pageSize={pageSize}
              onPageChange={setCurrentPage}
            />
          )}
        </>
      ) : selectedRubrik ? (
        <>
          {isLoadingCriteria ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 text-teal-600 animate-spin" />
              <span className="ml-3 text-gray-600">Memuat kriteria...</span>
            </div>
          ) : criteriaError ? (
            <div className="p-8 bg-red-50 border border-red-200 rounded-lg text-center">
              <AlertCircle className="w-12 h-12 text-red-600 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-red-800 mb-2">Gagal Memuat Kriteria</h3>
              <p className="text-sm text-red-600 mb-4">{criteriaError}</p>
              <button onClick={() => fetchCriteria()} className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors">
                Coba Lagi
              </button>
            </div>
          ) : (
            <KriteriaList
              rubrik={selectedRubrik}
              onBack={handleBackToList}
              onCreateKriteria={handleCreateKriteria}
              onEditKriteria={handleEditKriteria}
              onDeleteKriteria={handleDeleteKriteria}
              currentPage={criteriaPage}
              totalPages={criteriaTotalPages}
              totalElements={criteriaTotalElements}
              pageSize={criteriaPageSize}
              onPageChange={setCriteriaPage}
            />
          )}
        </>
      ) : null}

      {/* Rubrik Form Modal */}
      <RubrikFormModal isOpen={isRubrikModalOpen} onClose={() => setIsRubrikModalOpen(false)} onSave={handleSaveRubrik} rubrik={editingRubrik} mode={rubrikModalMode} />

      {/* Kriteria Form Modal */}
      <KriteriaFormModal isOpen={isKriteriaModalOpen} onClose={() => setIsKriteriaModalOpen(false)} onSave={handleSaveKriteria} kriteria={editingKriteria} mode={kriteriaModalMode} currentTotalBobot={getCurrentTotalBobot()} />

      {/* Delete Confirm Modal */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        title={`Hapus ${deleteTarget?.type === 'rubrik' ? 'Rubrik' : 'Kriteria'}`}
        message={`Apakah Anda yakin ingin menghapus ${deleteTarget?.type === 'rubrik' ? 'rubrik' : 'kriteria'} "${deleteTarget?.name}"? Tindakan ini tidak dapat dibatalkan.`}
      />
    </div>
  );
}
