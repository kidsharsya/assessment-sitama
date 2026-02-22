'use client';

import { useState, useCallback } from 'react';
import { Plus, ChevronDown, ChevronUp, FileText, Percent, Edit, Trash2, ClipboardList, Loader2, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { RubrikWawancaraService } from '@/services/rubrik-wawancara.service';
import type { RubrikWawancaraWithKriteria, Kriteria } from '@/types/rubrik-wawancara';

// ============================================
// Rubrik List Component
// ============================================

interface RubrikListProps {
  rubrikList: RubrikWawancaraWithKriteria[];
  onCreateRubrik: () => void;
  onEditRubrik: (rubrik: RubrikWawancaraWithKriteria) => void;
  onDeleteRubrik: (rubrikId: string) => void;
  onSelectRubrik: (rubrik: RubrikWawancaraWithKriteria) => void;
  onToggleActive: (rubrikId: string) => void;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

// State for criteria cache per rubrik
interface CriteriaCache {
  [rubrikId: string]: {
    criteria: Kriteria[];
    isLoading: boolean;
    error: string | null;
  };
}

export function RubrikList({ rubrikList, onCreateRubrik, onEditRubrik, onDeleteRubrik, onSelectRubrik, onToggleActive, currentPage, totalPages, totalElements, pageSize, onPageChange }: RubrikListProps) {
  const [expandedRubrik, setExpandedRubrik] = useState<string | null>(null);
  const [criteriaCache, setCriteriaCache] = useState<CriteriaCache>({});

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  // Fetch criteria when rubrik is expanded
  const fetchCriteriaForRubrik = useCallback(async (rubrikId: string) => {
    // Check current cache state to avoid redundant fetches
    setCriteriaCache((prev) => {
      // Skip if already loading or already have data
      if (prev[rubrikId]?.isLoading || prev[rubrikId]?.criteria?.length > 0) {
        return prev;
      }
      return {
        ...prev,
        [rubrikId]: { criteria: [], isLoading: true, error: null },
      };
    });

    try {
      const data = await RubrikWawancaraService.getAllCriteriaByRubricId(rubrikId);

      setCriteriaCache((prev) => ({
        ...prev,
        [rubrikId]: { criteria: data, isLoading: false, error: null },
      }));
    } catch (err) {
      setCriteriaCache((prev) => ({
        ...prev,
        [rubrikId]: { criteria: [], isLoading: false, error: err instanceof Error ? err.message : 'Gagal memuat kriteria' },
      }));
    }
  }, []);

  const toggleExpand = (rubrikId: string) => {
    const newExpandedId = expandedRubrik === rubrikId ? null : rubrikId;
    setExpandedRubrik(newExpandedId);

    // Fetch criteria when expanding
    if (newExpandedId) {
      fetchCriteriaForRubrik(newExpandedId);
    }
  };

  // Get criteria for a specific rubrik from cache
  const getCriteriaForRubrik = (rubrikId: string) => {
    return criteriaCache[rubrikId] || { criteria: [], isLoading: false, error: null };
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daftar Rubrik Wawancara</h2>
          <p className="text-sm text-gray-500">Kelola rubrik dan kriteria penilaian wawancara</p>
        </div>
        <Button onClick={onCreateRubrik} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Rubrik
        </Button>
      </div>

      {/* Rubrik Cards */}
      {rubrikList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <ClipboardList className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada rubrik wawancara</h3>
            <p className="text-sm text-gray-500 mb-4">Mulai dengan membuat rubrik wawancara pertama</p>
            <Button onClick={onCreateRubrik} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Rubrik
            </Button>
          </CardContent>
        </Card>
      ) : (
        rubrikList.map((rubrik) => {
          const isExpanded = expandedRubrik === rubrik.id;

          return (
            <Card key={rubrik.id} className="overflow-hidden">
              {/* Rubrik Header */}
              <div className="p-4 cursor-pointer hover:bg-gray-50 transition-colors" onClick={() => toggleExpand(rubrik.id)}>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900">{rubrik.nama}</h3>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleActive(rubrik.id);
                        }}
                        className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full transition-colors cursor-pointer hover:opacity-80 ${
                          rubrik.isActive ? 'bg-green-100 text-green-600 hover:bg-green-200' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                        title={rubrik.isActive ? 'Klik untuk nonaktifkan' : 'Klik untuk aktifkan'}
                      >
                        {rubrik.isActive ? (
                          <>
                            <ToggleRight className="w-3 h-3" />
                            Aktif
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-3 h-3" />
                            Nonaktif
                          </>
                        )}
                      </button>
                    </div>
                    <p className="text-sm text-gray-500 mb-3 line-clamp-2">{rubrik.deskripsi}</p>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="flex items-center gap-2 text-gray-600">
                        <FileText className="w-4 h-4" />
                        <span>{rubrik.totalKriteria} Kriteria</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <Percent className="w-4 h-4" />
                        <span>Total Bobot: {rubrik.totalBobot}%</span>
                      </div>
                      <div className="text-gray-400 text-xs">Dibuat: {formatDate(rubrik.createdAt)}</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onEditRubrik(rubrik);
                      }}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteRubrik(rubrik.id);
                      }}
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                    {isExpanded ? <ChevronUp className="w-5 h-5 text-gray-400" /> : <ChevronDown className="w-5 h-5 text-gray-400" />}
                  </div>
                </div>
              </div>

              {/* Expanded Content - Kriteria Preview */}
              {isExpanded &&
                (() => {
                  const { criteria: cachedCriteria, isLoading: isLoadingCriteria, error: criteriaError } = getCriteriaForRubrik(rubrik.id);

                  return (
                    <div className="border-t border-gray-200 p-4 bg-gray-50">
                      <div className="flex items-center justify-between mb-3">
                        <h4 className="text-sm font-medium text-gray-700 flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          Daftar Kriteria ({rubrik.totalKriteria})
                        </h4>
                        <Button
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectRubrik(rubrik);
                          }}
                          className="bg-teal-600 hover:bg-teal-700"
                        >
                          Kelola Kriteria
                        </Button>
                      </div>

                      {isLoadingCriteria ? (
                        <div className="flex items-center justify-center py-4">
                          <Loader2 className="w-5 h-5 text-teal-600 animate-spin" />
                          <span className="ml-2 text-sm text-gray-500">Memuat kriteria...</span>
                        </div>
                      ) : criteriaError ? (
                        <p className="text-sm text-red-500 text-center py-4">{criteriaError}</p>
                      ) : cachedCriteria.length === 0 ? (
                        <p className="text-sm text-gray-500 text-center py-4">Belum ada kriteria dalam rubrik ini</p>
                      ) : (
                        <div className="space-y-2">
                          {cachedCriteria.slice(0, 5).map((kriteria) => (
                            <div key={kriteria.id} className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200">
                              <div className="flex-1">
                                <p className="text-sm font-medium text-gray-900">{kriteria.nama}</p>
                                <p className="text-xs text-gray-500 line-clamp-1">{kriteria.deskripsi}</p>
                              </div>
                              <div className="flex items-center gap-4">
                                <span className="text-sm font-medium text-teal-600">{kriteria.bobot}%</span>
                              </div>
                            </div>
                          ))}
                          {cachedCriteria.length > 5 && <p className="text-xs text-gray-500 text-center pt-2">+{cachedCriteria.length - 5} kriteria lainnya</p>}
                        </div>
                      )}
                    </div>
                  );
                })()}
            </Card>
          );
        })
      )}

      {/* Pagination */}
      {totalPages > 1 && <Pagination currentPage={currentPage + 1} totalPages={totalPages} totalItems={totalElements} itemsPerPage={pageSize} onPageChange={(page) => onPageChange(page - 1)} showItemsInfo={true} />}
    </div>
  );
}
