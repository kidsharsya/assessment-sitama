'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, Calendar, Clock, Eye, EyeOff, Copy, Check, Shuffle, FileText } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ExamSession, SessionStatus } from '@/types/exam-session';

// ============================================
// Sesi Ujian List Component
// ============================================

interface SesiUjianListProps {
  sessions: ExamSession[];
  onCreateSession: () => void;
  onEditSession: (session: ExamSession) => void;
  onDeleteSession: (session: ExamSession) => void;
}

const statusConfig: Record<SessionStatus, { label: string; bgColor: string; textColor: string }> = {
  upcoming: { label: 'Akan Datang', bgColor: 'bg-blue-100', textColor: 'text-blue-700' },
  ongoing: { label: 'Berlangsung', bgColor: 'bg-green-100', textColor: 'text-green-700' },
  completed: { label: 'Selesai', bgColor: 'bg-gray-100', textColor: 'text-gray-700' },
};

// Calculate status from session start/end time
function getSessionStatus(session: ExamSession): SessionStatus {
  const now = new Date();
  const startTime = new Date(session.startTime);
  const endTime = new Date(session.endTime);

  if (now < startTime) {
    return 'upcoming';
  } else if (now >= startTime && now <= endTime) {
    return 'ongoing';
  } else {
    return 'completed';
  }
}

// Format datetime to readable format
function formatDateTime(isoDateTime: string): { date: string; time: string } {
  const dateObj = new Date(isoDateTime);
  const date = dateObj.toLocaleDateString('id-ID', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const time = dateObj.toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
  });
  return { date, time };
}

export function SesiUjianList({ sessions = [], onCreateSession, onEditSession, onDeleteSession }: SesiUjianListProps) {
  const router = useRouter();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | SessionStatus>('all');
  const [visibleTokens, setVisibleTokens] = useState<Set<string>>(new Set());
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Filter session list
  const filteredList = sessions.filter((session) => {
    const categoryNames = session.categories.map((c) => c.categoryName.toLowerCase()).join(' ');
    const categoryCodes = session.categories.map((c) => c.categoryCode.toLowerCase()).join(' ');
    const matchSearch =
      session.name.toLowerCase().includes(search.toLowerCase()) || categoryNames.includes(search.toLowerCase()) || categoryCodes.includes(search.toLowerCase()) || session.accessToken.toLowerCase().includes(search.toLowerCase());

    const status = getSessionStatus(session);
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Toggle token visibility
  const toggleTokenVisibility = (sessionId: string) => {
    setVisibleTokens((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  // Copy token to clipboard
  const copyToken = async (token: string, sessionId: string) => {
    await navigator.clipboard.writeText(token);
    setCopiedToken(sessionId);
    setTimeout(() => setCopiedToken(null), 2000);
  };

  // Navigate to exam results
  const goToResults = (sessionId: string) => {
    router.push(`/admin/kelola-sesi-ujian/${sessionId}/hasil-ujian`);
  };

  return (
    <div className="space-y-6">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex-1 flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <Input placeholder="Cari sesi ujian..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-white" />
          </div>

          {/* Status Filter */}
          <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as typeof statusFilter)}>
            <SelectTrigger className="w-45 bg-white">
              <SelectValue placeholder="Semua Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Status</SelectItem>
              <SelectItem value="upcoming">Akan Datang</SelectItem>
              <SelectItem value="ongoing">Berlangsung</SelectItem>
              <SelectItem value="completed">Selesai</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <Button onClick={onCreateSession} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Sesi Ujian
        </Button>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Nama Sesi</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Kategori Ujian</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Tanggal & Waktu</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Token</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Randomisasi</th>
                <th className="text-left px-6 py-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-center px-6 py-4 text-sm font-semibold text-gray-700">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredList.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    {search || statusFilter !== 'all' ? 'Tidak ada sesi ujian yang sesuai filter' : 'Belum ada sesi ujian. Klik "Tambah Sesi Ujian" untuk membuat.'}
                  </td>
                </tr>
              ) : (
                filteredList.map((session) => {
                  const status = getSessionStatus(session);
                  const { date, time: startTime } = formatDateTime(session.startTime);
                  const { time: endTime } = formatDateTime(session.endTime);

                  return (
                    <tr key={session.id} className="hover:bg-gray-50 transition-colors">
                      {/* Nama Sesi */}
                      <td className="px-6 py-4">
                        <p className="font-medium text-gray-900">{session.name}</p>
                      </td>

                      {/* Kategori Ujian */}
                      <td className="px-6 py-4">
                        <div className="space-y-1.5">
                          {session.categories
                            .sort((a, b) => a.orderIndex - b.orderIndex)
                            .map((category) => (
                              <div key={category.categoryCode} className="flex items-center gap-2">
                                <span className="inline-flex items-center justify-center w-5 h-5 rounded bg-teal-100 text-teal-700 text-xs font-medium">{category.orderIndex}</span>
                                <span className="text-sm text-gray-700">
                                  {category.categoryCode} - {category.categoryName}
                                </span>
                              </div>
                            ))}
                        </div>
                      </td>

                      {/* Tanggal & Waktu */}
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-gray-900">
                            <Calendar className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">{date}</span>
                          </div>
                          <div className="flex items-center gap-2 text-gray-600">
                            <Clock className="w-4 h-4 text-gray-400" />
                            <span className="text-sm">
                              {startTime} - {endTime}
                            </span>
                          </div>
                          <p className="text-xs text-gray-500">{session.duration} menit</p>
                        </div>
                      </td>

                      {/* Token */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <code className="px-2 py-1 bg-gray-100 rounded text-sm font-mono">{visibleTokens.has(session.id) ? session.accessToken : '••••••'}</code>
                          <button
                            onClick={() => toggleTokenVisibility(session.id)}
                            className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors"
                            title={visibleTokens.has(session.id) ? 'Sembunyikan token' : 'Tampilkan token'}
                          >
                            {visibleTokens.has(session.id) ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button onClick={() => copyToken(session.accessToken, session.id)} className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded transition-colors" title="Salin token">
                            {copiedToken === session.id ? <Check className="w-4 h-4 text-green-600" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </td>

                      {/* Randomisasi */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1">
                          {session.isRandomPacket || session.isRandomQuestions || session.isRandomAnswers ? (
                            <div className="flex items-center gap-1 text-amber-600">
                              <Shuffle className="w-4 h-4" />
                              <span className="text-xs">{[session.isRandomPacket && 'Paket', session.isRandomQuestions && 'Soal', session.isRandomAnswers && 'Jawaban'].filter(Boolean).join(', ')}</span>
                            </div>
                          ) : (
                            <span className="text-xs text-gray-400">Tidak ada</span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-1 rounded-xl text-[12px] text-center font-medium ${statusConfig[status].bgColor} ${statusConfig[status].textColor}`}>{statusConfig[status].label}</span>
                      </td>

                      {/* Aksi */}
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-center gap-1">
                          {status === 'completed' && (
                            <button onClick={() => goToResults(session.id)} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors" title="Lihat hasil ujian">
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          <button onClick={() => onEditSession(session)} className="p-2 text-gray-500 hover:text-teal-600 hover:bg-teal-50 rounded-lg transition-colors" title="Edit sesi">
                            <Edit className="w-4 h-4" />
                          </button>
                          <button onClick={() => onDeleteSession(session)} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Hapus sesi">
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
