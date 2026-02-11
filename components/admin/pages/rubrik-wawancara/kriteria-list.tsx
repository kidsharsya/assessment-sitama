'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, Edit, Trash2, Percent, GripVertical, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import type { RubrikWawancaraWithKriteria, Kriteria } from '@/types/rubrik-wawancara';

// ============================================
// Kriteria List Component
// ============================================

interface KriteriaListProps {
  rubrik: RubrikWawancaraWithKriteria;
  onBack: () => void;
  onCreateKriteria: () => void;
  onEditKriteria: (kriteria: Kriteria) => void;
  onDeleteKriteria: (kriteriaId: string) => void;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function KriteriaList({ rubrik, onBack, onCreateKriteria, onEditKriteria, onDeleteKriteria, currentPage, totalPages, totalElements, pageSize, onPageChange }: KriteriaListProps) {
  const totalBobot = rubrik.kriteriaList.reduce((sum, k) => sum + k.bobot, 0);
  const isValidBobot = totalBobot === 100;
  const [expandedKriteria, setExpandedKriteria] = useState<Record<string, boolean>>({});

  const toggleExpand = (kriteriaId: string) => {
    setExpandedKriteria((prev) => ({
      ...prev,
      [kriteriaId]: !prev[kriteriaId],
    }));
  };

  const getRangeColor = (index: number, total: number) => {
    const percentage = total > 1 ? index / (total - 1) : 0;
    if (percentage <= 0.25) return { bg: 'bg-red-100', text: 'text-red-700', border: 'border-red-200' };
    if (percentage <= 0.5) return { bg: 'bg-amber-100', text: 'text-amber-700', border: 'border-amber-200' };
    if (percentage <= 0.75) return { bg: 'bg-blue-100', text: 'text-blue-700', border: 'border-blue-200' };
    return { bg: 'bg-green-100', text: 'text-green-700', border: 'border-green-200' };
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" onClick={onBack}>
          <ArrowLeft className="w-4 h-4 mr-2" />
          Kembali
        </Button>
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-900">{rubrik.nama}</h2>
          <p className="text-sm text-gray-500">{rubrik.deskripsi}</p>
        </div>
      </div>

      {/* Stats & Actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg ${isValidBobot ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>
            <Percent className="w-4 h-4" />
            <span className="text-sm font-medium">
              Total Bobot: {totalBobot}%{!isValidBobot && <span className="ml-1">(harus 100%)</span>}
            </span>
          </div>
          <span className="text-sm text-gray-500">{rubrik.kriteriaList.length} Kriteria</span>
        </div>
        <Button onClick={onCreateKriteria} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Kriteria
        </Button>
      </div>

      {/* Kriteria Cards */}
      {rubrik.kriteriaList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Plus className="w-6 h-6 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada kriteria</h3>
            <p className="text-sm text-gray-500 mb-4">Tambahkan kriteria penilaian untuk rubrik ini</p>
            <Button onClick={onCreateKriteria} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Kriteria
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rubrik.kriteriaList.map((kriteria, index) => (
            <Card key={kriteria.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  {/* Drag Handle (visual only for now) */}
                  <div className="flex items-center justify-center w-8 h-8 text-gray-400 cursor-move">
                    <GripVertical className="w-5 h-5" />
                  </div>

                  {/* Kriteria Number */}
                  <div className="flex items-center justify-center w-8 h-8 bg-teal-100 text-teal-700 rounded-full font-semibold text-sm">{index + 1}</div>

                  {/* Kriteria Info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900">{kriteria.nama}</h4>
                        <p className="text-sm text-gray-500 mt-1">{kriteria.deskripsi}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-teal-100 text-teal-700 text-sm font-medium rounded-full">{kriteria.bobot}%</span>
                        <Button variant="outline" size="sm" onClick={() => onEditKriteria(kriteria)}>
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => onDeleteKriteria(kriteria.id)} className="text-red-600 hover:text-red-700 hover:bg-red-50">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>

                    {/* Range Nilai Summary - dengan tombol expand */}
                    {kriteria.metodePenilaian.ranges && kriteria.metodePenilaian.ranges.length > 0 && (
                      <div className="mt-3">
                        <button onClick={() => toggleExpand(kriteria.id)} className="flex items-center gap-2 text-sm text-teal-600 hover:text-teal-700 transition-colors">
                          <Info className="w-4 h-4" />
                          <span>Lihat Info Kriteria Range</span>
                          {expandedKriteria[kriteria.id] ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </button>

                        {/* Expanded Detail */}
                        {expandedKriteria[kriteria.id] && (
                          <div className="mt-3 space-y-2">
                            {kriteria.metodePenilaian.ranges.map((range, idx) => {
                              const colors = getRangeColor(idx, kriteria.metodePenilaian.ranges?.length || 0);
                              return (
                                <div key={idx} className={`p-3 rounded-lg border ${colors.border} ${colors.bg.replace('100', '50')}`}>
                                  <div className="flex items-center gap-3">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold ${colors.bg} ${colors.text}`}>
                                      {range.minNilai} - {range.maxNilai}
                                    </span>
                                    <span className={`font-medium ${colors.text}`}>{range.kategori}</span>
                                  </div>
                                  {range.deskripsi && <p className="mt-2 text-sm text-gray-600">{range.deskripsi}</p>}
                                </div>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && <Pagination currentPage={currentPage + 1} totalPages={totalPages} totalItems={totalElements} itemsPerPage={pageSize} onPageChange={(page) => onPageChange(page - 1)} showItemsInfo={true} />}
    </div>
  );
}
