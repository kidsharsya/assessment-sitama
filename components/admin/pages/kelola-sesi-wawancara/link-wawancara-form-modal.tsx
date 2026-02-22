'use client';

import { useState, useCallback, useMemo, useEffect } from 'react';
import { Link2, Save, Check, KeyRound, RefreshCw, Loader2, Plus, X, Users, UserPlus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { InterviewSessionFormInput, InterviewSessionStatus, ApiInterviewSessionDetail } from '@/types/interview-session';
import type { ApplicantForSelection } from '@/hooks/use-applicants-for-interview';
import type { RubrikWawancaraWithKriteria } from '@/types/rubrik-wawancara';
import { cn } from '@/lib/utils';
import { addInterviewParticipants, removeInterviewParticipants } from '@/lib/api/services/interview-session';

// ============================================
// Link Wawancara Form Modal Component
// ============================================

interface LinkWawancaraFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: InterviewSessionFormInput) => void;
  session?: ApiInterviewSessionDetail | null;
  mode: 'create' | 'edit';
  rubrikList: RubrikWawancaraWithKriteria[];
  applicantList: ApplicantForSelection[];
  selectedApplicationIds?: string[]; // Pre-selected application IDs for edit mode
  isLoading?: boolean;
  isLoadingSession?: boolean; // Loading state for session detail in edit mode
  isSaving?: boolean;
  onRefreshParticipants?: () => Promise<void>; // Callback to refresh participants after add/remove
}

// Generate random alphanumeric PIN (6 characters)
const generatePin = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Excluded confusing chars: I, O, 0, 1
  let pin = '';
  for (let i = 0; i < 6; i++) {
    pin += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pin;
};

// ============================================
// Inner Form Component - receives initial values as props
// ============================================

interface FormContentProps {
  initialValues: InterviewSessionFormInput;
  onSubmit: (data: InterviewSessionFormInput) => void;
  onClose: () => void;
  rubrikList: RubrikWawancaraWithKriteria[];
  applicantList: ApplicantForSelection[];
  isLoading?: boolean;
  isSaving?: boolean;
  mode: 'create' | 'edit';
  sessionId?: string;
  onRefreshParticipants?: () => Promise<void>;
}

function FormContent({ initialValues, onSubmit, onClose, rubrikList, applicantList, isLoading, isSaving, mode, sessionId, onRefreshParticipants }: FormContentProps) {
  const [form, setForm] = useState<InterviewSessionFormInput>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [searchAvailable, setSearchAvailable] = useState('');
  const [searchAssigned, setSearchAssigned] = useState('');
  const [isAddingParticipants, setIsAddingParticipants] = useState(false);
  const [isRemovingParticipants, setIsRemovingParticipants] = useState(false);
  const [selectedToAdd, setSelectedToAdd] = useState<Set<string>>(new Set());
  const [selectedToRemove, setSelectedToRemove] = useState<Set<string>>(new Set());
  const [participantError, setParticipantError] = useState<string | null>(null);

  // Update form when initialValues change (for edit mode)
  useEffect(() => {
    setForm(initialValues);
  }, [initialValues]);

  const handleChange = (field: keyof InterviewSessionFormInput, value: string | string[] | InterviewSessionStatus) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  // Assigned participants (already in the session)
  const assignedParticipants = useMemo(() => {
    return applicantList.filter((p) => form.applicationIds.includes(p.applicationId));
  }, [applicantList, form.applicationIds]);

  // Available participants (not yet in the session)
  const availableParticipants = useMemo(() => {
    return applicantList.filter((p) => !form.applicationIds.includes(p.applicationId));
  }, [applicantList, form.applicationIds]);

  // Filtered assigned participants
  const filteredAssigned = useMemo(() => {
    const search = searchAssigned.toLowerCase();
    return assignedParticipants.filter((p) => p.fullName.toLowerCase().includes(search) || (p.email && p.email.toLowerCase().includes(search)));
  }, [assignedParticipants, searchAssigned]);

  // Filtered available participants
  const filteredAvailable = useMemo(() => {
    const search = searchAvailable.toLowerCase();
    return availableParticipants.filter((p) => p.fullName.toLowerCase().includes(search) || (p.email && p.email.toLowerCase().includes(search)));
  }, [availableParticipants, searchAvailable]);

  // Toggle selection for adding
  const toggleSelectToAdd = (applicationId: string) => {
    setSelectedToAdd((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  // Toggle selection for removing
  const toggleSelectToRemove = (applicationId: string) => {
    setSelectedToRemove((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(applicationId)) {
        newSet.delete(applicationId);
      } else {
        newSet.add(applicationId);
      }
      return newSet;
    });
  };

  // Select all available for adding
  const selectAllAvailable = () => {
    const ids = filteredAvailable.map((p) => p.applicationId);
    setSelectedToAdd(new Set(ids));
  };

  // Deselect all available
  const deselectAllAvailable = () => {
    setSelectedToAdd(new Set());
  };

  // Select all assigned for removing
  const selectAllAssigned = () => {
    const ids = filteredAssigned.map((p) => p.applicationId);
    setSelectedToRemove(new Set(ids));
  };

  // Deselect all assigned
  const deselectAllAssigned = () => {
    setSelectedToRemove(new Set());
  };

  // Add participants (for edit mode - calls API)
  const handleAddParticipants = async () => {
    if (selectedToAdd.size === 0) return;
    setParticipantError(null);

    if (mode === 'edit' && sessionId) {
      // Edit mode: call API to add participants
      setIsAddingParticipants(true);
      try {
        await addInterviewParticipants(sessionId, Array.from(selectedToAdd));
        // Update local state
        setForm((prev) => ({
          ...prev,
          applicationIds: [...prev.applicationIds, ...Array.from(selectedToAdd)],
        }));
        setSelectedToAdd(new Set());
        // Refresh participants from parent
        if (onRefreshParticipants) {
          await onRefreshParticipants();
        }
      } catch (err) {
        setParticipantError(err instanceof Error ? err.message : 'Gagal menambahkan peserta');
      } finally {
        setIsAddingParticipants(false);
      }
    } else {
      // Create mode: just update local state
      setForm((prev) => ({
        ...prev,
        applicationIds: [...prev.applicationIds, ...Array.from(selectedToAdd)],
      }));
      setSelectedToAdd(new Set());
    }

    if (errors.applicationIds) {
      setErrors((prev) => ({ ...prev, applicationIds: '' }));
    }
  };

  // Remove participants (for edit mode - calls API)
  const handleRemoveParticipants = async () => {
    if (selectedToRemove.size === 0) return;
    setParticipantError(null);

    if (mode === 'edit' && sessionId) {
      // Edit mode: call API to remove participants
      setIsRemovingParticipants(true);
      try {
        await removeInterviewParticipants(sessionId, Array.from(selectedToRemove));
        // Update local state
        setForm((prev) => ({
          ...prev,
          applicationIds: prev.applicationIds.filter((id) => !selectedToRemove.has(id)),
        }));
        setSelectedToRemove(new Set());
        // Refresh participants from parent
        if (onRefreshParticipants) {
          await onRefreshParticipants();
        }
      } catch (err) {
        setParticipantError(err instanceof Error ? err.message : 'Gagal menghapus peserta');
      } finally {
        setIsRemovingParticipants(false);
      }
    } else {
      // Create mode: just update local state
      setForm((prev) => ({
        ...prev,
        applicationIds: prev.applicationIds.filter((id) => !selectedToRemove.has(id)),
      }));
      setSelectedToRemove(new Set());
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.namaInterviewer.trim()) {
      newErrors.namaInterviewer = 'Nama interviewer wajib diisi';
    }
    if (!form.accessPin || form.accessPin.length < 6) {
      newErrors.accessPin = 'PIN harus 6 karakter';
    }
    if (!form.rubrikId) {
      newErrors.rubrikId = 'Pilih rubrik wawancara';
    }
    if (form.applicationIds.length === 0) {
      newErrors.applicationIds = 'Pilih minimal satu peserta';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(form);
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5 text-teal-600" />
          {mode === 'create' ? 'Buat Link Wawancara' : 'Edit Link Wawancara'}
        </DialogTitle>
      </DialogHeader>

      <div className="space-y-4 py-4">
        {/* Nama Interviewer */}
        <div className="space-y-2">
          <Label htmlFor="namaInterviewer">Nama Interviewer *</Label>
          <Input id="namaInterviewer" placeholder="Contoh: Dr. Siti Aminah" value={form.namaInterviewer} onChange={(e) => handleChange('namaInterviewer', e.target.value)} className={errors.namaInterviewer ? 'border-red-500' : ''} />
          {errors.namaInterviewer && <p className="text-xs text-red-500">{errors.namaInterviewer}</p>}
        </div>

        {/* Email Interviewer */}
        <div className="space-y-2">
          <Label htmlFor="emailInterviewer">Email Interviewer (Opsional)</Label>
          <Input id="emailInterviewer" type="email" placeholder="Contoh: interviewer@email.com" value={form.emailInterviewer} onChange={(e) => handleChange('emailInterviewer', e.target.value)} />
        </div>

        {/* Access PIN */}
        <div className="space-y-2">
          <Label htmlFor="accessPin">PIN Akses *</Label>
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-500" />
              <Input
                id="accessPin"
                type="text"
                placeholder="6 karakter PIN"
                value={form.accessPin}
                onChange={(e) => {
                  const val = e.target.value
                    .replace(/[^A-Za-z0-9]/g, '')
                    .toUpperCase()
                    .slice(0, 6);
                  handleChange('accessPin', val);
                }}
                className={cn('pl-9 font-mono tracking-widest uppercase', errors.accessPin ? 'border-red-500' : '')}
                maxLength={6}
              />
            </div>
            <Button type="button" variant="outline" size="sm" onClick={() => handleChange('accessPin', generatePin())} title="Generate PIN baru" className="h-10 px-3">
              <RefreshCw className="w-4 h-4 mr-1" />
              Generate
            </Button>
          </div>
          <p className="text-xs text-gray-500">PIN alfanumerik 6 karakter untuk keamanan akses interviewer</p>
          {errors.accessPin && <p className="text-xs text-red-500">{errors.accessPin}</p>}
        </div>

        {/* Pilih Rubrik */}
        <div className="space-y-2">
          <Label htmlFor="rubrikId">Rubrik Wawancara *</Label>
          <select
            id="rubrikId"
            value={form.rubrikId}
            onChange={(e) => handleChange('rubrikId', e.target.value)}
            className={cn('w-full h-10 px-3 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500', errors.rubrikId ? 'border-red-500' : 'border-gray-300')}
          >
            <option value="">Pilih rubrik wawancara</option>
            {rubrikList
              .filter((r) => r.isActive)
              .map((rubrik) => (
                <option key={rubrik.id} value={rubrik.id}>
                  {rubrik.nama} ({rubrik.totalKriteria} kriteria)
                </option>
              ))}
          </select>
          {errors.rubrikId && <p className="text-xs text-red-500">{errors.rubrikId}</p>}
        </div>

        {/* Status */}
        <div className="space-y-2">
          <Label>Status Link</Label>
          <div className="flex items-center gap-4">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="aktif"
                checked={form.status === 'aktif'}
                onChange={(e) => handleChange('status', e.target.value as InterviewSessionStatus)}
                className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Aktif</span>
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="status"
                value="nonaktif"
                checked={form.status === 'nonaktif'}
                onChange={(e) => handleChange('status', e.target.value as InterviewSessionStatus)}
                className="w-4 h-4 text-teal-600 border-gray-300 focus:ring-teal-500"
              />
              <span className="text-sm text-gray-700">Nonaktif</span>
            </label>
          </div>
        </div>

        {/* Error for participant operations */}
        {participantError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3">
            <p className="text-sm text-red-600">{participantError}</p>
          </div>
        )}

        {/* Participant Assignment Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <Users className="w-4 h-4 text-teal-600" />
            <Label className="text-base font-semibold">Assign Peserta *</Label>
            <span className="text-sm text-gray-500">({form.applicationIds.length} peserta)</span>
          </div>
          {errors.applicationIds && <p className="text-xs text-red-500">{errors.applicationIds}</p>}

          <div className="grid grid-cols-2 gap-4">
            {/* Left: Available Participants */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  <UserPlus className="w-4 h-4 inline mr-1" />
                  Belum Ditambahkan ({availableParticipants.length})
                </Label>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={selectAllAvailable} className="h-6 text-xs px-2">
                    Semua
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={deselectAllAvailable} className="h-6 text-xs px-2">
                    Reset
                  </Button>
                </div>
              </div>

              <Input placeholder="Cari peserta..." value={searchAvailable} onChange={(e) => setSearchAvailable(e.target.value)} disabled={isLoading} className="h-8 text-sm" />

              <div className="border rounded-lg h-48 overflow-y-auto bg-white">
                {isLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-5 h-5 animate-spin mx-auto mb-2 text-teal-600" />
                    <p className="text-xs text-gray-500">Memuat...</p>
                  </div>
                ) : filteredAvailable.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">{availableParticipants.length === 0 ? 'Semua peserta sudah ditambahkan' : 'Tidak ditemukan'}</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredAvailable.map((pelamar) => {
                      const isSelected = selectedToAdd.has(pelamar.applicationId);
                      return (
                        <div
                          key={pelamar.applicationId}
                          onClick={() => toggleSelectToAdd(pelamar.applicationId)}
                          className={cn('flex items-center gap-2 p-2 cursor-pointer transition-colors text-sm', isSelected ? 'bg-teal-50' : 'hover:bg-gray-50')}
                        >
                          <div className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', isSelected ? 'bg-teal-600 border-teal-600' : 'border-gray-300')}>{isSelected && <Check className="w-3 h-3 text-white" />}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{pelamar.fullName}</p>
                            {pelamar.email && <p className="text-xs text-gray-500 truncate">{pelamar.email}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Add Button */}
              <Button type="button" onClick={handleAddParticipants} disabled={selectedToAdd.size === 0 || isAddingParticipants} className="w-full bg-teal-600 hover:bg-teal-700 h-8 text-sm">
                {isAddingParticipants ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Menambahkan...
                  </>
                ) : (
                  <>
                    <Plus className="w-3 h-3 mr-1" />
                    Tambahkan ({selectedToAdd.size})
                  </>
                )}
              </Button>
            </div>

            {/* Right: Assigned Participants */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium text-gray-700">
                  <Users className="w-4 h-4 inline mr-1" />
                  Sudah Ditambahkan ({assignedParticipants.length})
                </Label>
                <div className="flex gap-1">
                  <Button type="button" variant="ghost" size="sm" onClick={selectAllAssigned} className="h-6 text-xs px-2">
                    Semua
                  </Button>
                  <Button type="button" variant="ghost" size="sm" onClick={deselectAllAssigned} className="h-6 text-xs px-2">
                    Reset
                  </Button>
                </div>
              </div>

              <Input placeholder="Cari peserta..." value={searchAssigned} onChange={(e) => setSearchAssigned(e.target.value)} disabled={isLoading} className="h-8 text-sm" />

              <div className="border rounded-lg h-48 overflow-y-auto bg-white">
                {assignedParticipants.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">Belum ada peserta ditambahkan</div>
                ) : filteredAssigned.length === 0 ? (
                  <div className="p-4 text-center text-xs text-gray-500">Tidak ditemukan</div>
                ) : (
                  <div className="divide-y divide-gray-100">
                    {filteredAssigned.map((pelamar) => {
                      const isSelected = selectedToRemove.has(pelamar.applicationId);
                      return (
                        <div
                          key={pelamar.applicationId}
                          onClick={() => toggleSelectToRemove(pelamar.applicationId)}
                          className={cn('flex items-center gap-2 p-2 cursor-pointer transition-colors text-sm', isSelected ? 'bg-red-50' : 'hover:bg-gray-50')}
                        >
                          <div className={cn('w-4 h-4 rounded border flex items-center justify-center shrink-0', isSelected ? 'bg-red-500 border-red-500' : 'border-gray-300')}>{isSelected && <Check className="w-3 h-3 text-white" />}</div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-gray-900 truncate">{pelamar.fullName}</p>
                            {pelamar.email && <p className="text-xs text-gray-500 truncate">{pelamar.email}</p>}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Remove Button */}
              <Button type="button" onClick={handleRemoveParticipants} disabled={selectedToRemove.size === 0 || isRemovingParticipants} variant="destructive" className="w-full h-8 text-sm">
                {isRemovingParticipants ? (
                  <>
                    <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    Menghapus...
                  </>
                ) : (
                  <>
                    <X className="w-3 h-3 mr-1" />
                    Hapus ({selectedToRemove.size})
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onClose} disabled={isSaving}>
          Batal
        </Button>
        <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700" disabled={isSaving || isLoading}>
          {isSaving ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Menyimpan...
            </>
          ) : (
            <>
              <Save className="w-4 h-4 mr-2" />
              {mode === 'create' ? 'Buat Link' : 'Update'}
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  );
}

// ============================================
// Main Modal Component
// ============================================

export function LinkWawancaraFormModal({ isOpen, onClose, onSave, session, mode, rubrikList, applicantList, selectedApplicationIds, isLoading, isLoadingSession, isSaving, onRefreshParticipants }: LinkWawancaraFormModalProps) {
  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  // Compute initial values based on mode and session
  const initialValues = useMemo((): InterviewSessionFormInput => {
    if (mode === 'edit' && session) {
      return {
        namaInterviewer: session.interviewerName || '',
        emailInterviewer: session.interviewerEmail || '',
        rubrikId: session.rubricId || '',
        applicationIds: selectedApplicationIds || [],
        status: session.isActive ? 'aktif' : 'nonaktif',
        accessPin: session.accessPin || generatePin(),
      };
    }
    return {
      namaInterviewer: '',
      emailInterviewer: '',
      rubrikId: '',
      applicationIds: [],
      status: 'aktif',
      accessPin: generatePin(),
    };
  }, [mode, session, selectedApplicationIds]);

  // Create a unique key for FormContent to force remount when data changes
  // For edit mode, include session.id to remount when session data loads
  const formKey = mode === 'edit' ? `edit-${session?.id || 'loading'}` : 'create';

  // For edit mode, show loading state while session is loading
  const showLoading = mode === 'edit' && isLoadingSession;

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        {showLoading ? (
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin text-teal-600 mb-4" />
            <p className="text-sm text-gray-500">Memuat data sesi wawancara...</p>
          </div>
        ) : (
          <FormContent
            key={formKey}
            initialValues={initialValues}
            onSubmit={onSave}
            onClose={onClose}
            rubrikList={rubrikList}
            applicantList={applicantList}
            isLoading={isLoading}
            isSaving={isSaving}
            mode={mode}
            sessionId={session?.id}
            onRefreshParticipants={onRefreshParticipants}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
