'use client';

import { useState } from 'react';
import { CategoryList, CategoryFormModal, PacketList, PacketFormModal, QuestionList, QuestionFormModal, DeleteConfirmModal } from '@/components/admin/pages/bank-soal';
import {
  getCategories,
  getCategoryById,
  createCategory as createCategoryMock,
  updateCategory as updateCategoryMock,
  deleteCategory as deleteCategoryMock,
  getPacketsByCategoryId,
  createPacket as createPacketMock,
  updatePacket as updatePacketMock,
  deletePacket as deletePacketMock,
  getQuestionsByPacketId,
  createQuestion as createQuestionMock,
  updateQuestion as updateQuestionMock,
  deleteQuestion as deleteQuestionMock,
} from '@/lib/mock-data/bank-soal';
import type { CategoryWithPackets, PacketWithQuestions, Question, CategoryFormInput, PacketFormInput, QuestionFormInput, ViewLevel, DeleteModalState, OptionLabel } from '@/types/bank-soal';

// ============================================
// Bank Soal Page Component
// ============================================
export default function BankSoalPage() {
  // Data State - initialize with data
  const [categories, setCategories] = useState<CategoryWithPackets[]>(() => getCategories());

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

  const loadCategories = () => {
    const data = getCategories();
    setCategories(data);
  };

  const refreshSelectedCategory = () => {
    if (selectedCategory) {
      const updated = getCategoryById(selectedCategory.id);
      if (updated) {
        setSelectedCategory(updated);
      }
    }
  };

  const refreshSelectedPacket = () => {
    if (selectedPacket && selectedCategory) {
      const packets = getPacketsByCategoryId(selectedCategory.id);
      const updated = packets.find((p) => p.id === selectedPacket.id);
      if (updated) {
        setSelectedPacket(updated);
      }
    }
  };

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

  const handleSaveCategory = (data: CategoryFormInput) => {
    if (editingCategory) {
      updateCategoryMock(editingCategory.id, data);
    } else {
      createCategoryMock(data);
    }
    loadCategories();
    setCategoryFormOpen(false);
  };

  const handleSelectCategory = (category: CategoryWithPackets) => {
    // Refresh category data with packets
    const updated = getCategoryById(category.id);
    if (updated) {
      setSelectedCategory(updated);
      setViewLevel('packet');
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

  const handleSavePacket = (data: PacketFormInput) => {
    if (!selectedCategory) return;

    if (editingPacket) {
      updatePacketMock(editingPacket.id, {
        ...data,
        categoryId: selectedCategory.id,
      });
    } else {
      createPacketMock({
        ...data,
        categoryId: selectedCategory.id,
      });
    }
    refreshSelectedCategory();
    loadCategories();
    setPacketFormOpen(false);
  };

  const handleSelectPacket = (packet: PacketWithQuestions) => {
    // Get fresh questions data
    const questions = getQuestionsByPacketId(packet.id);
    setSelectedPacket({
      ...packet,
      questions,
      totalQuestions: questions.length,
      totalScore: questions.reduce((sum, q) => sum + q.score, 0),
    });
    setViewLevel('question');
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

  const handleSaveQuestion = (data: QuestionFormInput) => {
    if (!selectedPacket) return;

    const options = (['A', 'B', 'C', 'D', 'E'] as OptionLabel[]).map((label) => ({
      id: `opt-new-${label}`,
      label,
      text: data.options[label].text,
    }));

    if (editingQuestion) {
      updateQuestionMock(editingQuestion.id, {
        questionText: data.questionText,
        imagePath: typeof data.imagePath === 'string' ? data.imagePath : undefined,
        options,
        correctAnswer: data.correctAnswer,
        score: data.score,
      });
    } else {
      const questions = getQuestionsByPacketId(selectedPacket.id);
      createQuestionMock({
        packetId: selectedPacket.id,
        questionText: data.questionText,
        imagePath: typeof data.imagePath === 'string' ? data.imagePath : undefined,
        options,
        correctAnswer: data.correctAnswer,
        score: data.score,
        order: questions.length + 1,
      });
    }
    refreshSelectedPacket();
    refreshSelectedCategory();
    loadCategories();
    setQuestionFormOpen(false);
  };

  // ============================================
  // Delete Confirm Handler
  // ============================================
  const handleConfirmDelete = () => {
    const { type, id } = deleteModal;

    if (type === 'category') {
      deleteCategoryMock(id);
      loadCategories();
    } else if (type === 'packet') {
      deletePacketMock(id);
      refreshSelectedCategory();
      loadCategories();
    } else if (type === 'question') {
      deleteQuestionMock(id);
      refreshSelectedPacket();
      refreshSelectedCategory();
      loadCategories();
    }

    setDeleteModal({ ...deleteModal, isOpen: false });
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
      {viewLevel === 'category' && <CategoryList categories={categories} onCreateCategory={handleCreateCategory} onEditCategory={handleEditCategory} onDeleteCategory={handleDeleteCategory} onSelectCategory={handleSelectCategory} />}

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
