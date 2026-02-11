'use client';

import { Plus, Edit, Trash2, FileQuestion, CheckCircle, XCircle, ChevronDown, ChevronRight, Layers, Loader2 } from 'lucide-react';
import { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { CategoryWithPackets } from '@/types/bank-soal';

// ============================================
// Category List Component
// ============================================

interface CategoryListProps {
  categories: CategoryWithPackets[];
  onCreateCategory: () => void;
  onEditCategory: (category: CategoryWithPackets) => void;
  onDeleteCategory: (categoryId: string) => void;
  onSelectCategory: (category: CategoryWithPackets) => void;
  isLoading?: boolean;
}

export function CategoryList({ categories, onCreateCategory, onEditCategory, onDeleteCategory, onSelectCategory, isLoading = false }: CategoryListProps) {
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const toggleExpand = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-teal-600" />
        <span className="ml-2 text-gray-500">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daftar Kategori Soal</h2>
          <p className="text-sm text-gray-500">Kelola kategori, paket, dan soal-soal ujian</p>
        </div>
        <Button onClick={onCreateCategory} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kategori
        </Button>
      </div>

      {/* Category Cards */}
      {categories.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <FileQuestion className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kategori soal</h3>
            <p className="text-sm text-gray-500 mb-4">Mulai dengan membuat kategori soal pertama</p>
            <Button onClick={onCreateCategory} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kategori
            </Button>
          </CardContent>
        </Card>
      ) : (
        categories.map((category) => {
          const isExpanded = expandedCategory === category.id;

          return (
            <Card key={category.id} className="overflow-hidden">
              {/* Category Header */}
              <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpand(category.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      {isExpanded ? <ChevronDown className="w-5 h-5 text-gray-400" /> : <ChevronRight className="w-5 h-5 text-gray-400" />}
                      <h3 className="font-semibold text-gray-900">{category.name}</h3>
                      <span className="text-xs font-mono bg-gray-100 px-2 py-0.5 rounded">{category.code}</span>
                      {category.isActive ? (
                        <span className="inline-flex items-center gap-1 text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">
                          <CheckCircle className="w-3 h-3" />
                          Aktif
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                          <XCircle className="w-3 h-3" />
                          Nonaktif
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2 ml-8">{category.description}</p>
                    <div className="flex items-center gap-4 text-xs text-gray-500 ml-8">
                      <span className="flex items-center gap-1">
                        <Layers className="w-3.5 h-3.5" />
                        {category.totalPackets} Paket
                      </span>
                      <span className="flex items-center gap-1">
                        <FileQuestion className="w-3.5 h-3.5" />
                        {category.totalQuestions} Soal
                      </span>
                      <span>Total: {category.totalScore} Poin</span>
                      <span>Passing Grade: {category.passingGrade}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditCategory(category);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon-sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteCategory(category.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Expanded Content - Packets Preview */}
              {isExpanded && (
                <div className="border-t border-gray-200 p-4 bg-gray-50">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                      <Layers className="w-4 h-4" />
                      Daftar Paket ({category.packets.length})
                    </h4>
                    <Button
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSelectCategory(category);
                      }}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      Kelola Paket
                    </Button>
                  </div>

                  {category.packets.length === 0 ? (
                    <div className="text-center py-6 bg-white rounded-lg border border-dashed border-gray-300">
                      <Layers className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                      <p className="text-sm text-gray-500">Belum ada paket</p>
                      <Button
                        variant="outline"
                        size="sm"
                        className="mt-2"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSelectCategory(category);
                        }}
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Tambah Paket
                      </Button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {category.packets.slice(0, 6).map((packet) => (
                        <div
                          key={packet.id}
                          className="bg-white p-3 rounded-lg border border-gray-200 hover:border-teal-300 transition-colors cursor-pointer"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectCategory(category);
                          }}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-medium text-sm text-gray-900">{packet.name}</span>
                            <span className="text-xs font-mono bg-teal-100 text-teal-700 px-1.5 py-0.5 rounded">{packet.code}</span>
                          </div>
                          <div className="text-xs text-gray-500">
                            {packet.totalQuestions} soal • {packet.totalScore} poin
                          </div>
                        </div>
                      ))}
                      {category.packets.length > 6 && <div className="bg-gray-100 p-3 rounded-lg flex items-center justify-center text-sm text-gray-500">+{category.packets.length - 6} paket lainnya</div>}
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-gray-200 text-xs text-gray-500">Terakhir diupdate: {formatDate(category.updatedAt)}</div>
                </div>
              )}
            </Card>
          );
        })
      )}
    </div>
  );
}
