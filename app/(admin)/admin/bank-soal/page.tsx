'use client';

import { useState, useEffect, useCallback } from 'react';
import { CategoryList, CategoryFormModal, PacketList, PacketFormModal, QuestionList, QuestionFormModal, DeleteConfirmModal } from '@/components/admin/pages/bank-soal';
import { BankSoalService } from '@/services/bank-soal.service';
import { StorageService } from '@/services/storage.service';
import type { CategoryWithPackets, PacketWithQuestions, Question, CategoryFormInput, PacketFormInput, QuestionFormInput, ViewLevel, DeleteModalState, OptionLabel } from '@/types/bank-soal';

// ============================================
// Bank Soal Page Component
// ============================================
export default function BankSoalPage() {
  // Data State
  const [categories, setCategories] = useState<CategoryWithPackets[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // View State
  const [viewLevel, setViewLevel] = useState<ViewLevel>('category');
  const [selectedCategory, setSelectedCategory] = useState<CategoryWithPackets | null>(null);
  const [selectedPacket, setSelectedPacket] = useState<PacketWithQuestions | null>(null);

  // Modal State - Category
  const [categoryFormOpen, setCategoryFormOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<CategoryWithPackets | null>(null);

  // Modal State - Packet
  const [packetFormOpen, setPacketFormOpen] = useState(false);
  const [editingPacket, setEditingPacket] = useState<PacketWithQuestions | null>(null);

  // Modal State - Question
  const [questionFormOpen, setQuestionFormOpen] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);

  // Delete Modal State
  const [deleteModal, setDeleteModal] = useState<DeleteModalState>({
    isOpen: false,
    type: 'category',
    id: '',
    title: '',
    message: '',
  });

  // ============================================
  // Data Loading Functions
  // ============================================
  const loadCategories = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await BankSoalService.getCategories();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshSelectedCategory = useCallback(async () => {
    if (selectedCategory) {
      try {
        const updated = await BankSoalService.getCategoryById(selectedCategory.id);
        if (updated) {
          setSelectedCategory(updated);
        }
      } catch (error) {
        console.error('Error refreshing category:', error);
      }
    }
  }, [selectedCategory]);

  const refreshSelectedPacket = useCallback(async () => {
    if (selectedPacket) {
      try {
        const questions = await BankSoalService.getQuestionsByPacketId(selectedPacket.id);
        setSelectedPacket((prev) =>
          prev
            ? {
                ...prev,
                questions,
                totalQuestions: questions.length,
                totalScore: questions.reduce((sum, q) => sum + q.score, 0),
              }
            : null,
        );
      } catch (error) {
        console.error('Error refreshing packet:', error);
      }
    }
  }, [selectedPacket]);

  // Load on mount
  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  // ============================================
  // Category Handlers
  // ============================================
  const handleCreateCategory = () => {
    setEditingCategory(null);
    setCategoryFormOpen(true);
  };

  const handleEditCategory = (category: CategoryWithPackets) => {
    setEditingCategory(category);
    setCategoryFormOpen(true);
  };

  const handleDeleteCategory = (categoryId: string) => {
    const category = categories.find((c) => c.id === categoryId);
    setDeleteModal({
      isOpen: true,
      type: 'category',
      id: categoryId,
      title: 'Hapus Kategori Soal',
      message: `Apakah Anda yakin ingin menghapus kategori "${category?.name}"? Semua paket dan soal di dalamnya juga akan terhapus.`,
    });
  };

  const handleSaveCategory = async (data: CategoryFormInput) => {
    if (editingCategory) {
      await BankSoalService.updateCategory(editingCategory.id, data);
    } else {
      await BankSoalService.createCategory(data);
    }
    await loadCategories();
    setCategoryFormOpen(false);
  };

  const handleSelectCategory = async (category: CategoryWithPackets) => {
    try {
      const updated = await BankSoalService.getCategoryById(category.id);
      if (updated) {
        setSelectedCategory(updated);
        setViewLevel('packet');
      }
    } catch (error) {
      console.error('Error selecting category:', error);
    }
  };

  // ============================================
  // Packet Handlers
  // ============================================
  const handleCreatePacket = () => {
    setEditingPacket(null);
    setPacketFormOpen(true);
  };

  const handleEditPacket = (packet: PacketWithQuestions) => {
    setEditingPacket(packet);
    setPacketFormOpen(true);
  };

  const handleDeletePacket = (packetId: string) => {
    const packet = selectedCategory?.packets.find((p: PacketWithQuestions) => p.id === packetId);
    setDeleteModal({
      isOpen: true,
      type: 'packet',
      id: packetId,
      title: 'Hapus Paket Soal',
      message: `Apakah Anda yakin ingin menghapus paket "${packet?.name}"? Semua soal di dalamnya juga akan terhapus.`,
    });
  };

  const handleSavePacket = async (data: PacketFormInput) => {
    if (!selectedCategory) return;

    if (editingPacket) {
      await BankSoalService.updatePacket(editingPacket.id, data);
    } else {
      await BankSoalService.createPacket(selectedCategory.id, data);
    }
    await refreshSelectedCategory();
    await loadCategories();
    setPacketFormOpen(false);
  };

  const handleSelectPacket = async (packet: PacketWithQuestions) => {
    try {
      const questions = await BankSoalService.getQuestionsByPacketId(packet.id);
      setSelectedPacket({
        ...packet,
        questions,
        totalQuestions: questions.length,
        totalScore: questions.reduce((sum, q) => sum + q.score, 0),
      });
      setViewLevel('question');
    } catch (error) {
      console.error('Error selecting packet:', error);
    }
  };

  // ============================================
  // Question Handlers
  // ============================================
  const handleCreateQuestion = () => {
    setEditingQuestion(null);
    setQuestionFormOpen(true);
  };

  const handleEditQuestion = (question: Question) => {
    setEditingQuestion(question);
    setQuestionFormOpen(true);
  };

  const handleDeleteQuestion = (questionId: string) => {
    setDeleteModal({
      isOpen: true,
      type: 'question',
      id: questionId,
      title: 'Hapus Soal',
      message: 'Apakah Anda yakin ingin menghapus soal ini?',
    });
  };

  const handleSaveQuestion = async (data: QuestionFormInput) => {
    if (!selectedPacket) return;

    // Upload image file ke storage jika ada File baru
    let processedData = { ...data };
    if (data.imagePath instanceof File) {
      const uploadedPath = await StorageService.uploadFile(data.imagePath);
      processedData = { ...data, imagePath: uploadedPath };
    }

    if (editingQuestion) {
      await BankSoalService.updateQuestion(editingQuestion.id, processedData);
    } else {
      await BankSoalService.createQuestion(selectedPacket.id, processedData);
    }
    await refreshSelectedPacket();
    await refreshSelectedCategory();
    await loadCategories();
    setQuestionFormOpen(false);
  };

  // ============================================
  // Delete Confirm Handler
  // ============================================
  const handleConfirmDelete = async () => {
    const { type, id } = deleteModal;
    setDeleteModal({ ...deleteModal, isOpen: false });

    try {
      if (type === 'category') {
        await BankSoalService.deleteCategory(id);
        await loadCategories();
      } else if (type === 'packet') {
        await BankSoalService.deletePacket(id);
        await refreshSelectedCategory();
        await loadCategories();
      } else if (type === 'question') {
        await BankSoalService.deleteQuestion(id);
        await refreshSelectedPacket();
        await refreshSelectedCategory();
        await loadCategories();
      }
    } catch (error) {
      console.error('Error deleting:', error);
    }
  };

  // ============================================
  // Navigation Handlers
  // ============================================
  const handleBackToCategory = () => {
    setViewLevel('category');
    setSelectedCategory(null);
    setSelectedPacket(null);
    loadCategories();
  };

  const handleBackToPacket = () => {
    setViewLevel('packet');
    setSelectedPacket(null);
    refreshSelectedCategory();
  };

  // ============================================
  // Render
  // ============================================
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Bank Soal</h1>
        <p className="text-gray-500">Kelola kategori, paket, dan soal-soal ujian</p>
      </div>

      {/* Content based on view level */}
      {viewLevel === 'category' && (
        <CategoryList categories={categories} onCreateCategory={handleCreateCategory} onEditCategory={handleEditCategory} onDeleteCategory={handleDeleteCategory} onSelectCategory={handleSelectCategory} isLoading={isLoading} />
      )}

      {viewLevel === 'packet' && selectedCategory && (
        <PacketList category={selectedCategory} onBack={handleBackToCategory} onCreatePacket={handleCreatePacket} onEditPacket={handleEditPacket} onDeletePacket={handleDeletePacket} onSelectPacket={handleSelectPacket} />
      )}

      {viewLevel === 'question' && selectedCategory && selectedPacket && (
        <QuestionList category={selectedCategory} packet={selectedPacket} onBack={handleBackToPacket} onCreateQuestion={handleCreateQuestion} onEditQuestion={handleEditQuestion} onDeleteQuestion={handleDeleteQuestion} />
      )}

      {/* Modals */}
      <CategoryFormModal isOpen={categoryFormOpen} onClose={() => setCategoryFormOpen(false)} onSave={handleSaveCategory} category={editingCategory} mode={editingCategory ? 'edit' : 'create'} />

      <PacketFormModal isOpen={packetFormOpen} onClose={() => setPacketFormOpen(false)} onSave={handleSavePacket} packet={editingPacket} mode={editingPacket ? 'edit' : 'create'} />

      <QuestionFormModal isOpen={questionFormOpen} onClose={() => setQuestionFormOpen(false)} onSave={handleSaveQuestion} question={editingQuestion} mode={editingQuestion ? 'edit' : 'create'} />

      <DeleteConfirmModal isOpen={deleteModal.isOpen} onClose={() => setDeleteModal({ ...deleteModal, isOpen: false })} onConfirm={handleConfirmDelete} title={deleteModal.title} message={deleteModal.message} />
    </div>
  );
}
