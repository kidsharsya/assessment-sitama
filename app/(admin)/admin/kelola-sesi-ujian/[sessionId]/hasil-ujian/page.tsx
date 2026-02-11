'use client';

import { useState, useMemo, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, CheckCircle, XCircle, Send, Trophy, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { getSessionById } from '@/lib/mock-data/exam-session';
import { getLeaderboard, getExamResultStats, isSessionPublished, publishSessionResults } from '@/lib/mock-data/hasil-ujian';
import type { LeaderboardData, ExamResultStats } from '@/types/hasil-ujian';
import type { ExamSession } from '@/types/exam-session';

// ============================================
// Halaman Hasil Ujian (per Sesi)
// ============================================

type StatusType = 'LULUS' | 'TIDAK LULUS';

const statusConfig: Record<StatusType, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  LULUS: { label: 'Lulus', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  'TIDAK LULUS': { label: 'Tidak Lulus', color: 'text-red-600', bgColor: 'bg-red-100', icon: XCircle },
};

const statusOptions: { value: StatusType | 'SEMUA'; label: string }[] = [
  { value: 'SEMUA', label: 'Semua Status' },
  { value: 'LULUS', label: 'Lulus' },
  { value: 'TIDAK LULUS', label: 'Tidak Lulus' },
];

// Get ranking badge style
function getRankingBadge(ranking: number) {
  if (ranking === 1) return { bg: 'bg-yellow-100', text: 'text-yellow-700', icon: true };
  if (ranking === 2) return { bg: 'bg-gray-100', text: 'text-gray-700', icon: false };
  if (ranking === 3) return { bg: 'bg-orange-100', text: 'text-orange-700', icon: false };
  return { bg: 'bg-white', text: 'text-gray-600', icon: false };
}

export default function SessionHasilUjianPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // State
  const [session, setSession] = useState<ExamSession | null>(null);
  const [leaderboardData, setLeaderboardData] = useState<LeaderboardData | null>(null);
  const [stats, setStats] = useState<ExamResultStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusType | 'SEMUA'>('SEMUA');
  const [isPublished, setIsPublished] = useState(false);
  const [publishModalOpen, setPublishModalOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Load data
  useEffect(() => {
    const loadData = () => {
      setIsLoading(true);
      setError(null);

      try {
        const sessionData = getSessionById(sessionId);
        if (!sessionData) {
          setError('Sesi ujian tidak ditemukan');
          setIsLoading(false);
          return;
        }

        setSession(sessionData);
        setIsPublished(isSessionPublished(sessionId));

        const leaderboard = getLeaderboard(sessionId, currentPage, pageSize);
        setLeaderboardData(leaderboard);

        const resultStats = getExamResultStats(sessionId);
        setStats(resultStats);
      } catch {
        setError('Gagal memuat data hasil ujian');
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [sessionId, currentPage]);

  // Client-side filtering by search and status
  const filteredRows = useMemo(() => {
    if (!leaderboardData?.rows) return [];

    return leaderboardData.rows.filter((row) => {
      const matchSearch = row.participantName.toLowerCase().includes(searchQuery.toLowerCase()) || row.registrationNumber.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'SEMUA' || row.status === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [leaderboardData?.rows, searchQuery, filterStatus]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, filterStatus]);

  // Handlers
  const handlePublish = async () => {
    setIsPublishing(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      const success = publishSessionResults(sessionId);
      if (success) {
        setIsPublished(true);
      }
      setPublishModalOpen(false);
    } finally {
      setIsPublishing(false);
    }
  };

  const handleGoBack = () => {
    router.push('/admin/kelola-sesi-ujian');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data hasil ujian...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-sm text-red-600">{error}</p>
      </div>
    );
  }

  if (!session || !leaderboardData) return null;

  const { dynamicColumns, totalPages, totalElements } = leaderboardData;

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button variant="ghost" onClick={handleGoBack} className="gap-2 text-gray-600 hover:text-gray-900">
        <ArrowLeft className="w-4 h-4" />
        <span>Kembali ke Kelola Sesi Ujian</span>
      </Button>

      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Hasil Ujian</h1>
          <p className="text-gray-500 mt-1">Lihat hasil ujian peserta sesi {session.name}</p>
        </div>
        <div className="flex items-center gap-3">
          {isPublished ? (
            <div className="flex items-center gap-2 px-4 py-2 bg-green-100 text-green-700 rounded-lg">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Hasil Sudah Dipublikasi</span>
            </div>
          ) : (
            <Button onClick={() => setPublishModalOpen(true)} className="gap-2 bg-teal-600 hover:bg-teal-700">
              <Send className="w-4 h-4" />
              Publikasikan Hasil
            </Button>
          )}
        </div>
      </div>

      {/* Filter & Search */}
      <Card>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Cari nama atau no pendaftaran..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as StatusType | 'SEMUA')}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent"
            >
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500 w-16">Ranking</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Nama Peserta</th>
                  {/* Dynamic columns for each category */}
                  {dynamicColumns.map((categoryCode) => (
                    <th key={categoryCode} className="text-center py-3 px-4 text-sm font-medium text-gray-500">
                      {categoryCode}
                    </th>
                  ))}
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRows.length === 0 ? (
                  <tr>
                    <td colSpan={4 + dynamicColumns.length} className="py-8 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredRows.map((row) => {
                    const status = statusConfig[row.status];
                    const StatusIcon = status.icon;
                    const ranking = row.ranking;
                    const rankBadge = getRankingBadge(ranking);

                    return (
                      <tr key={row.registrationNumber} className="hover:bg-gray-50">
                        {/* Ranking */}
                        <td className="py-3 px-4 text-center">
                          <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold', rankBadge.bg, rankBadge.text)}>{rankBadge.icon ? <Trophy className="w-4 h-4" /> : ranking}</span>
                        </td>
                        {/* Nama Peserta */}
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium text-gray-900">{row.participantName}</p>
                            <p className="text-xs text-gray-500">{row.registrationNumber}</p>
                          </div>
                        </td>
                        {/* Skor per Category (dynamic columns) */}
                        {dynamicColumns.map((categoryCode) => {
                          const categoryScore = row.categoryScores[categoryCode];
                          return (
                            <td key={categoryCode} className="py-3 px-4 text-center">
                              {categoryScore ? (
                                <span className={cn('inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-semibold', categoryScore.isPassed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>
                                  {categoryScore.score}
                                </span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          );
                        })}
                        {/* Total Score */}
                        <td className="py-3 px-4 text-center">
                          <div>
                            <span className="inline-flex items-center justify-center w-16 h-8 rounded-lg text-sm font-bold bg-blue-50 text-blue-700">{row.totalScore}</span>
                            <p className="text-xs text-gray-400 mt-1">/ {row.maxScore}</p>
                          </div>
                        </td>
                        {/* Status */}
                        <td className="py-3 px-4 text-center">
                          <span className={cn('inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium', status.bgColor, status.color)}>
                            <StatusIcon className="w-3.5 h-3.5" />
                            {status.label}
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-gray-100">
              <Pagination currentPage={currentPage + 1} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page - 1)} totalItems={totalElements} itemsPerPage={10} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Publish Modal */}
      <Dialog open={publishModalOpen} onOpenChange={setPublishModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Publikasikan Hasil Ujian</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-600 mb-4">Anda akan mempublikasikan hasil ujian ke seluruh peserta. Pastikan semua data sudah benar.</p>

            {stats && (
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Total Peserta</span>
                  <span className="font-medium">{stats.total}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Lulus</span>
                  <span className="font-medium text-green-600">{stats.lulus}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500">Tidak Lulus</span>
                  <span className="font-medium text-red-600">{stats.tidakLulus}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2 mt-2">
                  <span className="text-gray-500">Persentase Kelulusan (halaman ini)</span>
                  <span className="font-bold">{stats.persentaseKelulusan}%</span>
                </div>
              </div>
            )}

            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>Perhatian:</strong> Setelah dipublikasikan, peserta akan dapat melihat hasil ujian mereka melalui dashboard masing-masing.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPublishModalOpen(false)} disabled={isPublishing}>
              Batal
            </Button>
            <Button onClick={handlePublish} disabled={isPublishing} className="gap-2 bg-teal-600 hover:bg-teal-700">
              {isPublishing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Mempublikasikan...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  Publikasikan Sekarang
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
