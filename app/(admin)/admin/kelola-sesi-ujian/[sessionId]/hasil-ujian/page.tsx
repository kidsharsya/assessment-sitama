'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Search, CheckCircle, XCircle, Trophy, ArrowLeft, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Pagination } from '@/components/ui/pagination';
import { cn } from '@/lib/utils';
import { ExamSessionService } from '@/services/exam-session.service';
import { AssessmentService } from '@/services/assessment.service';
import type { LeaderboardParticipant, LeaderboardPagination, ExamResultStatus, ExamResultStats } from '@/types/hasil-ujian';

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

/** Determine overall status from category results */
function getParticipantStatus(participant: LeaderboardParticipant): ExamResultStatus {
  const allPassed = participant.categories.every((c) => c.isPassed);
  return allPassed ? 'LULUS' : 'TIDAK LULUS';
}

/** Calculate total score & max score from categories */
function getParticipantTotals(participant: LeaderboardParticipant) {
  const totalScore = participant.categories.reduce((sum, c) => sum + c.score, 0);
  const maxScore = participant.categories.reduce((sum, c) => sum + c.maxScore, 0);
  return { totalScore, maxScore };
}

export default function SessionHasilUjianPage() {
  const params = useParams();
  const router = useRouter();
  const sessionId = params.sessionId as string;

  // State
  const [sessionName, setSessionName] = useState<string>('');
  const [participants, setParticipants] = useState<LeaderboardParticipant[]>([]);
  const [pagination, setPagination] = useState<LeaderboardPagination | null>(null);
  const [dynamicColumns, setDynamicColumns] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<StatusType | 'SEMUA'>('SEMUA');
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  // Load leaderboard data from Assessment API
  const loadLeaderboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Load session info (for name) and leaderboard in parallel
      const [sessionData, leaderboardRes] = await Promise.all([ExamSessionService.getSessionById(sessionId), AssessmentService.getLeaderboard(sessionId, currentPage, pageSize)]);

      if (sessionData) {
        setSessionName(sessionData.name);
      }

      const leaderboard = leaderboardRes.data?.data;
      if (!leaderboard) {
        setError('Data leaderboard tidak tersedia');
        return;
      }

      setParticipants(leaderboard.participants);
      setPagination(leaderboard.pagination);

      // Extract unique category codes from first participant (or all)
      const allCategories = new Map<string, string>();
      for (const p of leaderboard.participants) {
        for (const c of p.categories) {
          if (!allCategories.has(c.categoryCode)) {
            allCategories.set(c.categoryCode, c.categoryName);
          }
        }
      }
      setDynamicColumns(Array.from(allCategories.keys()));
    } catch (err) {
      console.error('Failed to load leaderboard:', err);
      setError('Gagal memuat data hasil ujian');
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, currentPage, pageSize]);

  useEffect(() => {
    loadLeaderboard();
  }, [loadLeaderboard]);

  // Client-side filtering by search and status
  const filteredParticipants = useMemo(() => {
    return participants.filter((p) => {
      const matchSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
      const matchStatus = filterStatus === 'SEMUA' || getParticipantStatus(p) === filterStatus;
      return matchSearch && matchStatus;
    });
  }, [participants, searchQuery, filterStatus]);

  // Compute stats from current page data
  const stats = useMemo((): ExamResultStats | null => {
    if (participants.length === 0) return null;
    const total = participants.length;
    const lulus = participants.filter((p) => getParticipantStatus(p) === 'LULUS').length;
    const tidakLulus = total - lulus;
    return {
      total,
      lulus,
      tidakLulus,
      persentaseKelulusan: total > 0 ? Math.round((lulus / total) * 100) : 0,
    };
  }, [participants]);

  // Reset to page 0 when filters change
  useEffect(() => {
    setCurrentPage(0);
  }, [searchQuery, filterStatus]);

  const handleGoBack = () => {
    router.push('/admin/kelola-sesi-ujian');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-100">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-500">Memuat data hasil ujian...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-4">
        <Button variant="ghost" onClick={handleGoBack} className="gap-2 text-gray-600 hover:text-gray-900">
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Kelola Sesi Ujian</span>
        </Button>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <p className="text-sm text-red-600">{error}</p>
        </div>
      </div>
    );
  }

  const totalPages = pagination?.totalPages ?? 1;
  const totalElements = pagination?.totalElements ?? participants.length;

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
          <p className="text-gray-500 mt-1">Lihat hasil ujian peserta sesi {sessionName || sessionId}</p>
        </div>

        {/* Stats Summary */}
        {stats && (
          <div className="flex items-center gap-3">
            <div className="text-sm text-right">
              <span className="text-gray-500">Lulus: </span>
              <span className="font-semibold text-green-600">{stats.lulus}</span>
              <span className="text-gray-400 mx-1">|</span>
              <span className="text-gray-500">Tidak Lulus: </span>
              <span className="font-semibold text-red-600">{stats.tidakLulus}</span>
              <span className="text-gray-400 mx-1">|</span>
              <span className="font-bold">{stats.persentaseKelulusan}%</span>
            </div>
          </div>
        )}
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
                placeholder="Cari nama peserta..."
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
                {filteredParticipants.length === 0 ? (
                  <tr>
                    <td colSpan={4 + dynamicColumns.length} className="py-8 text-center text-gray-500">
                      Tidak ada data yang sesuai dengan filter
                    </td>
                  </tr>
                ) : (
                  filteredParticipants.map((participant) => {
                    const overallStatus = getParticipantStatus(participant);
                    const status = statusConfig[overallStatus];
                    const StatusIcon = status.icon;
                    const rankBadge = getRankingBadge(participant.rank);
                    const { totalScore, maxScore } = getParticipantTotals(participant);

                    // Build category lookup by code
                    const categoryMap = new Map(participant.categories.map((c) => [c.categoryCode, c]));

                    return (
                      <tr key={participant.id} className="hover:bg-gray-50">
                        {/* Ranking */}
                        <td className="py-3 px-4 text-center">
                          <span className={cn('inline-flex items-center justify-center w-8 h-8 rounded-full text-sm font-bold', rankBadge.bg, rankBadge.text)}>{rankBadge.icon ? <Trophy className="w-4 h-4" /> : participant.rank}</span>
                        </td>
                        {/* Nama Peserta */}
                        <td className="py-3 px-4">
                          <p className="font-medium text-gray-900">{participant.name}</p>
                        </td>
                        {/* Skor per Category (dynamic columns) */}
                        {dynamicColumns.map((categoryCode) => {
                          const cat = categoryMap.get(categoryCode);
                          return (
                            <td key={categoryCode} className="py-3 px-4 text-center">
                              {cat ? (
                                <span className={cn('inline-flex items-center justify-center w-12 h-8 rounded-lg text-sm font-semibold', cat.isPassed ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700')}>{cat.score}</span>
                              ) : (
                                <span className="text-gray-400 text-sm">-</span>
                              )}
                            </td>
                          );
                        })}
                        {/* Total Score */}
                        <td className="py-3 px-4 text-center">
                          <div>
                            <span className="inline-flex items-center justify-center w-16 h-8 rounded-lg text-sm font-bold bg-blue-50 text-blue-700">{totalScore}</span>
                            <p className="text-xs text-gray-400 mt-1">/ {maxScore}</p>
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
              <Pagination currentPage={currentPage + 1} totalPages={totalPages} onPageChange={(page) => setCurrentPage(page - 1)} totalItems={totalElements} itemsPerPage={pageSize} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
