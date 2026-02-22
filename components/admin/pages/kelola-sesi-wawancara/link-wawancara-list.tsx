'use client';

import { useState } from 'react';
import { Plus, Link2, Users, Copy, ExternalLink, Edit, Trash2, CheckCircle, XCircle, ClipboardList, KeyRound, Eye, EyeOff, ToggleLeft, ToggleRight } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import type { InterviewSession, InterviewSessionStatus } from '@/types/interview-session';
import { cn } from '@/lib/utils';

// ============================================
// Link Wawancara List Component
// ============================================

interface LinkWawancaraListProps {
  sessionList: InterviewSession[];
  onCreateLink: () => void;
  onEditLink: (session: InterviewSession) => void;
  onDeleteLink: (sessionId: string) => void;
  onToggleActive?: (sessionId: string) => void;
}

const statusConfig: Record<InterviewSessionStatus, { label: string; color: string; bgColor: string; icon: React.ElementType }> = {
  aktif: { label: 'Aktif', color: 'text-green-600', bgColor: 'bg-green-100', icon: CheckCircle },
  nonaktif: { label: 'Nonaktif', color: 'text-gray-600', bgColor: 'bg-gray-100', icon: XCircle },
};

export function LinkWawancaraList({ sessionList, onCreateLink, onEditLink, onDeleteLink, onToggleActive }: LinkWawancaraListProps) {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [copiedPinId, setCopiedPinId] = useState<string | null>(null);
  const [visiblePinIds, setVisiblePinIds] = useState<Set<string>>(new Set());

  const getInterviewLink = (linkPath: string) => {
    // Link sudah berisi path lengkap dari API
    if (typeof window !== 'undefined') {
      return `${window.location.origin}${linkPath}`;
    }
    return linkPath;
  };

  const handleCopyLink = async (session: InterviewSession) => {
    const url = getInterviewLink(session.link);
    await navigator.clipboard.writeText(url);
    setCopiedId(session.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleCopyPin = async (session: InterviewSession) => {
    if (session.accessPin) {
      await navigator.clipboard.writeText(session.accessPin);
      setCopiedPinId(session.id);
      setTimeout(() => setCopiedPinId(null), 2000);
    }
  };

  const togglePinVisibility = (sessionId: string) => {
    setVisiblePinIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(sessionId)) {
        newSet.delete(sessionId);
      } else {
        newSet.add(sessionId);
      }
      return newSet;
    });
  };

  const handleOpenLink = (session: InterviewSession) => {
    const url = getInterviewLink(session.link);
    window.open(url, '_blank');
  };

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">Daftar Link Wawancara</h2>
        </div>
        <Button onClick={onCreateLink} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Buat Link Wawancara
        </Button>
      </div>

      {/* Link Cards */}
      {sessionList.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Link2 className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Belum ada link wawancara</h3>
            <p className="text-sm text-gray-500 mb-4">Buat link wawancara untuk interviewer</p>
            <Button onClick={onCreateLink} className="bg-teal-600 hover:bg-teal-700">
              <Plus className="w-4 h-4 mr-2" />
              Buat Link Wawancara
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50/80">
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Interviewer</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Rubrik</th>
                  <th className="text-center py-4 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Pelamar</th>
                  <th className="text-center py-4 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  <th className="text-center py-4 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">PIN Akses</th>
                  <th className="text-left py-4 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Link</th>
                  <th className="text-center py-4 px-5 text-xs font-semibold text-gray-600 uppercase tracking-wider">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 bg-white">
                {sessionList.map((session) => {
                  const status = statusConfig[session.status];
                  const StatusIcon = status.icon;

                  return (
                    <tr key={session.id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-teal-100 flex items-center justify-center shrink-0">
                            <span className="text-sm font-semibold text-teal-700">
                              {session.namaInterviewer
                                .split(' ')
                                .map((n) => n[0])
                                .join('')
                                .slice(0, 2)
                                .toUpperCase()}
                            </span>
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium text-gray-900 text-sm truncate">{session.namaInterviewer}</p>
                            {session.emailInterviewer && <p className="text-xs text-gray-500 truncate">{session.emailInterviewer}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-md bg-teal-50 flex items-center justify-center shrink-0">
                            <ClipboardList className="w-4 h-4 text-teal-600" />
                          </div>
                          <span className="text-sm text-gray-700 truncate max-w-[150px]">{session.rubrikNama || '-'}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 rounded-full">
                          <Users className="w-4 h-4 text-gray-500" />
                          <span className="text-sm font-medium text-gray-700">{session.jumlahPelamar}</span>
                        </div>
                      </td>
                      <td className="py-4 px-5 text-center">
                        <span className={cn('inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full', status.bgColor, status.color)}>
                          <StatusIcon className="w-3.5 h-3.5" />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-5 text-center">
                        {session.accessPin ? (
                          <div className="inline-flex items-center gap-1">
                            <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-200 rounded-md">
                              <KeyRound className="w-3.5 h-3.5 text-amber-600" />
                              <code className="text-xs font-mono text-amber-700 min-w-[40px]">{visiblePinIds.has(session.id) ? session.accessPin : '••••••'}</code>
                            </div>
                            <Button variant="ghost" size="sm" onClick={() => togglePinVisibility(session.id)} title={visiblePinIds.has(session.id) ? 'Sembunyikan PIN' : 'Lihat PIN'} className="h-7 w-7 p-0 text-gray-400 hover:text-gray-600">
                              {visiblePinIds.has(session.id) ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </Button>
                            <Button variant="ghost" size="sm" onClick={() => handleCopyPin(session)} title="Copy PIN" className={cn('h-7 w-7 p-0', copiedPinId === session.id ? 'text-green-600' : 'text-gray-400 hover:text-gray-600')}>
                              {copiedPinId === session.id ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                            </Button>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-400 italic">Tidak ada PIN</span>
                        )}
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center gap-1">
                          <code className="text-xs bg-gray-100 border border-gray-200 px-2.5 py-1.5 rounded-md text-gray-600 max-w-[180px] truncate font-mono">
                            {session.link.length > 25 ? `${session.link.slice(0, 25)}...` : session.link}
                          </code>
                          <Button variant="ghost" size="sm" onClick={() => handleCopyLink(session)} title="Copy link" className={cn('h-8 w-8 p-0', copiedId === session.id && 'text-green-600')}>
                            {copiedId === session.id ? <CheckCircle className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleOpenLink(session)} title="Buka link" className="h-8 w-8 p-0">
                            <ExternalLink className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                      <td className="py-4 px-5">
                        <div className="flex items-center justify-center gap-1">
                          {onToggleActive && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onToggleActive(session.id)}
                              className={cn('h-8 w-8 p-0', session.status === 'aktif' ? 'text-green-600 hover:text-green-700 hover:bg-green-50' : 'text-gray-400 hover:text-gray-600 hover:bg-gray-50')}
                              title={session.status === 'aktif' ? 'Nonaktifkan' : 'Aktifkan'}
                            >
                              {session.status === 'aktif' ? <ToggleRight className="w-4 h-4" /> : <ToggleLeft className="w-4 h-4" />}
                            </Button>
                          )}
                          <Button variant="ghost" size="sm" onClick={() => onEditLink(session)} className="h-8 w-8 p-0 text-gray-600 hover:text-teal-600 hover:bg-teal-50" title="Edit">
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => onDeleteLink(session.id)} className="h-8 w-8 p-0 text-gray-600 hover:text-red-600 hover:bg-red-50" title="Hapus">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      )}
    </div>
  );
}
