'use client';

import { User, CheckCircle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { DashboardParticipant, ParticipantStatus } from '@/types/interview-process';

// ============================================
// Pelamar List Component (untuk Interviewer)
// ============================================

interface PelamarListProps {
  participants: DashboardParticipant[];
  selectedParticipantId: string | null;
  onSelectParticipant: (participant: DashboardParticipant) => void;
}

const statusConfig: Record<ParticipantStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  PENDING: { label: 'Belum', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: Clock },
  IN_PROGRESS: { label: 'Sedang', color: 'text-amber-600', bgColor: 'bg-amber-100', icon: Clock },
  COMPLETED: { label: 'Selesai', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
};

export function PesertaList({ participants, selectedParticipantId, onSelectParticipant }: PelamarListProps) {
  const stats = {
    total: participants.length,
    dinilai: participants.filter((p) => p.status === 'COMPLETED').length,
  };

  return (
    <div className="h-full flex flex-col bg-white border-r border-gray-200">
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        <h2 className="font-semibold text-gray-900">Daftar Peserta Wawancara</h2>
        <p className="text-sm text-gray-500 mt-1">
          {stats.dinilai} dari {stats.total} sudah dinilai
        </p>
        {/* Progress Bar */}
        <div className="mt-2 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div className="h-full bg-teal-600 transition-all duration-300" style={{ width: `${stats.total > 0 ? (stats.dinilai / stats.total) * 100 : 0}%` }} />
        </div>
      </div>

      {/* Pelamar Items */}
      <div className="flex-1 overflow-y-auto">
        {participants.length === 0 ? (
          <div className="p-4 text-center text-gray-500 text-sm">Tidak ada pelamar</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {participants.map((participant) => {
              const isSelected = selectedParticipantId === participant.participantId;
              const status = statusConfig[participant.status] || statusConfig['PENDING'];
              const StatusIcon = status.icon;

              return (
                <div
                  key={participant.participantId}
                  onClick={() => onSelectParticipant(participant)}
                  className={cn('p-4 cursor-pointer transition-colors', isSelected ? 'bg-teal-50 border-l-4 border-teal-600' : 'hover:bg-gray-50 border-l-4 border-transparent')}
                >
                  <div className="flex items-start gap-3">
                    {/* Avatar */}
                    <div className={cn('w-10 h-10 rounded-full flex items-center justify-center shrink-0', isSelected ? 'bg-teal-600 text-white' : 'bg-gray-200 text-gray-600')}>
                      <User className="w-5 h-5" />
                    </div>

                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <p className={cn('font-medium truncate', isSelected ? 'text-teal-700' : 'text-gray-900')}>{participant.applicantName}</p>
                      {/* Nilai Total jika sudah dinilai */}
                      {participant.status === 'COMPLETED' && participant.finalScore !== null && (
                        <div className="mt-1 text-xs text-gray-500">
                          Nilai: <span className="font-semibold text-teal-600">{participant.finalScore}</span>
                        </div>
                      )}
                    </div>

                    {/* Status Badge */}
                    <span className={cn('inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full shrink-0', status.bgColor, status.color)}>
                      <StatusIcon className="w-3 h-3" />
                      {status.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
