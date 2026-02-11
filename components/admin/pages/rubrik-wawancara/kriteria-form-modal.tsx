'use client';

import { useState, useCallback } from 'react';
import { FileText, Save, Plus, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import type { Kriteria, KriteriaFormInput, RangeNilai } from '@/types/rubrik-wawancara';

// ============================================
// Kriteria Form Modal Component
// ============================================

interface KriteriaFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: KriteriaFormInput) => void;
  kriteria?: Kriteria | null;
  mode: 'create' | 'edit';
  currentTotalBobot: number;
}

const defaultRanges: RangeNilai[] = [
  { id: 'r1', minNilai: 0, maxNilai: 40, kategori: 'Tidak Memenuhi', deskripsi: 'Kandidat tidak memenuhi kriteria dasar' },
  { id: 'r2', minNilai: 41, maxNilai: 60, kategori: 'Cukup', deskripsi: 'Kandidat memenuhi sebagian kriteria' },
  { id: 'r3', minNilai: 61, maxNilai: 80, kategori: 'Baik', deskripsi: 'Kandidat memenuhi sebagian besar kriteria' },
  { id: 'r4', minNilai: 81, maxNilai: 100, kategori: 'Sangat Baik', deskripsi: 'Kandidat memenuhi semua kriteria dengan baik' },
];

const initialFormState: KriteriaFormInput = {
  nama: '',
  deskripsi: '',
  bobot: 0,
  metodePenilaian: {
    tipe: 'range',
    ranges: [...defaultRanges],
    nilaiMaksimum: 100,
  },
};

function getInitialForm(kriteria: Kriteria | null | undefined, mode: 'create' | 'edit'): KriteriaFormInput {
  if (kriteria && mode === 'edit') {
    return {
      nama: kriteria.nama,
      deskripsi: kriteria.deskripsi,
      bobot: kriteria.bobot,
      metodePenilaian: {
        tipe: 'range',
        ranges: kriteria.metodePenilaian.ranges ? [...kriteria.metodePenilaian.ranges] : [...defaultRanges],
        nilaiMaksimum: kriteria.metodePenilaian.nilaiMaksimum || 100,
      },
    };
  }
  return {
    ...initialFormState,
    metodePenilaian: {
      tipe: 'range',
      ranges: [...defaultRanges],
      nilaiMaksimum: 100,
    },
  };
}

export function KriteriaFormModal({ isOpen, onClose, onSave, kriteria, mode, currentTotalBobot }: KriteriaFormModalProps) {
  // Use key-based reset pattern - form resets when modal opens with different data
  const formKey = `${mode}-${kriteria?.id || 'new'}-${isOpen}`;
  const [form, setForm] = useState<KriteriaFormInput>(() => getInitialForm(kriteria, mode));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastFormKey, setLastFormKey] = useState(formKey);

  // Reset form when key changes (modal opens with different data)
  if (formKey !== lastFormKey) {
    setForm(getInitialForm(kriteria, mode));
    setErrors({});
    setLastFormKey(formKey);
  }

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
      }
    },
    [onClose],
  );

  const handleChange = (field: keyof Omit<KriteriaFormInput, 'metodePenilaian'>, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleRangeChange = (rangeId: string, field: keyof RangeNilai, value: string | number) => {
    setForm((prev) => ({
      ...prev,
      metodePenilaian: {
        ...prev.metodePenilaian,
        ranges: prev.metodePenilaian.ranges?.map((r) => (r.id === rangeId ? { ...r, [field]: value } : r)),
      },
    }));
    if (errors.ranges) {
      setErrors((prev) => ({ ...prev, ranges: '' }));
    }
  };

  const handleAddRange = () => {
    const ranges = form.metodePenilaian.ranges || [];
    const lastRange = ranges[ranges.length - 1];
    const newMinNilai = lastRange ? lastRange.maxNilai + 1 : 0;
    const newMaxNilai = Math.min(newMinNilai + 20, form.metodePenilaian.nilaiMaksimum || 100);

    const newRange: RangeNilai = {
      id: `r${Date.now()}`,
      minNilai: newMinNilai,
      maxNilai: newMaxNilai,
      kategori: '',
      deskripsi: '',
    };

    setForm((prev) => ({
      ...prev,
      metodePenilaian: {
        ...prev.metodePenilaian,
        ranges: [...(prev.metodePenilaian.ranges || []), newRange],
      },
    }));
  };

  const handleRemoveRange = (rangeId: string) => {
    setForm((prev) => ({
      ...prev,
      metodePenilaian: {
        ...prev.metodePenilaian,
        ranges: prev.metodePenilaian.ranges?.filter((r) => r.id !== rangeId),
      },
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nama.trim()) {
      newErrors.nama = 'Nama kriteria wajib diisi';
    }
    if (!form.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi wajib diisi';
    }
    if (form.bobot <= 0) {
      newErrors.bobot = 'Bobot harus lebih dari 0';
    }
    if (form.bobot > 100) {
      newErrors.bobot = 'Bobot tidak boleh lebih dari 100%';
    }

    const maxAllowedBobot = mode === 'edit' && kriteria ? 100 - currentTotalBobot + kriteria.bobot : 100 - currentTotalBobot;
    if (form.bobot > maxAllowedBobot) {
      newErrors.bobot = `Bobot maksimal yang tersedia: ${maxAllowedBobot}%`;
    }

    // Validate ranges
    const ranges = form.metodePenilaian.ranges || [];
    if (ranges.length === 0) {
      newErrors.ranges = 'Minimal harus ada 1 range nilai';
    } else {
      const emptyKategori = ranges.find((r) => !r.kategori.trim());
      if (emptyKategori) {
        newErrors.ranges = 'Semua kategori range wajib diisi';
      }
      const invalidRange = ranges.find((r) => r.minNilai > r.maxNilai);
      if (invalidRange) {
        newErrors.ranges = 'Nilai minimum tidak boleh lebih besar dari nilai maksimum';
      }
      const sortedRanges = [...ranges].sort((a, b) => a.minNilai - b.minNilai);
      if (sortedRanges[0]?.minNilai !== 0) {
        newErrors.ranges = 'Range harus dimulai dari nilai 0';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  const getRangeColorClass = (index: number, total: number) => {
    const percentage = total > 1 ? index / (total - 1) : 0;
    if (percentage <= 0.25) return 'border-l-red-500 bg-red-50/50';
    if (percentage <= 0.5) return 'border-l-amber-500 bg-amber-50/50';
    if (percentage <= 0.75) return 'border-l-blue-500 bg-blue-50/50';
    return 'border-l-green-500 bg-green-50/50';
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5 text-teal-600" />
            {mode === 'create' ? 'Tambah Kriteria' : 'Edit Kriteria'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama Kriteria */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Kriteria *</Label>
            <Input id="nama" placeholder="Contoh: Kemampuan Komunikasi" value={form.nama} onChange={(e) => handleChange('nama', e.target.value)} className={errors.nama ? 'border-red-500' : ''} />
            {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi *</Label>
            <Textarea id="deskripsi" placeholder="Deskripsi kriteria penilaian..." value={form.deskripsi} onChange={(e) => handleChange('deskripsi', e.target.value)} rows={3} className={errors.deskripsi ? 'border-red-500' : ''} />
            {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi}</p>}
          </div>

          {/* Bobot */}
          <div className="space-y-2">
            <Label htmlFor="bobot">Bobot (%) *</Label>
            <div className="flex items-center gap-2">
              <Input id="bobot" type="number" min={1} max={100} value={form.bobot} onChange={(e) => handleChange('bobot', parseInt(e.target.value) || 0)} className={`w-24 ${errors.bobot ? 'border-red-500' : ''}`} />
              <span className="text-sm text-gray-500">%</span>
              <span className="text-xs text-gray-400 ml-2">(Tersedia: {mode === 'edit' && kriteria ? 100 - currentTotalBobot + kriteria.bobot : 100 - currentTotalBobot}%)</span>
            </div>
            {errors.bobot && <p className="text-xs text-red-500">{errors.bobot}</p>}
          </div>

          {/* Metode Penilaian - Range */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <Label>Range Nilai *</Label>
                <p className="text-xs text-gray-500 mt-1">Tentukan range nilai dan kategori. Contoh: 0-40 = Tidak Memenuhi</p>
              </div>
              <Button type="button" variant="outline" size="sm" onClick={handleAddRange} className="gap-1">
                <Plus className="w-4 h-4" />
                Tambah Range
              </Button>
            </div>

            <div className="space-y-3">
              {form.metodePenilaian.ranges?.map((range, index) => (
                <div key={range.id} className={cn('p-3 rounded-lg border-l-4 border border-gray-200', getRangeColorClass(index, form.metodePenilaian.ranges?.length || 0))}>
                  <div className="flex items-start gap-3">
                    <div className="flex-1 grid grid-cols-5 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Min</Label>
                        <Input type="number" min={0} max={form.metodePenilaian.nilaiMaksimum} value={range.minNilai} onChange={(e) => handleRangeChange(range.id, 'minNilai', parseInt(e.target.value) || 0)} className="text-sm h-9" />
                      </div>
                      <div className="space-y-1">
                        <Label className="text-xs text-gray-600">Max</Label>
                        <Input type="number" min={0} max={form.metodePenilaian.nilaiMaksimum} value={range.maxNilai} onChange={(e) => handleRangeChange(range.id, 'maxNilai', parseInt(e.target.value) || 0)} className="text-sm h-9" />
                      </div>
                      <div className="col-span-3 space-y-1">
                        <Label className="text-xs text-gray-600">Kategori *</Label>
                        <Input placeholder="Contoh: Sangat Baik" value={range.kategori} onChange={(e) => handleRangeChange(range.id, 'kategori', e.target.value)} className="text-sm h-9" />
                      </div>
                    </div>
                    {(form.metodePenilaian.ranges?.length || 0) > 1 && (
                      <Button type="button" variant="ghost" size="sm" onClick={() => handleRemoveRange(range.id)} className="h-9 w-9 p-0 text-gray-400 hover:text-red-600 hover:bg-red-50 mt-5">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="mt-2">
                    <Input placeholder="Deskripsi (opsional)..." value={range.deskripsi || ''} onChange={(e) => handleRangeChange(range.id, 'deskripsi', e.target.value)} className="text-sm h-8" />
                  </div>
                </div>
              ))}
            </div>
            {errors.ranges && <p className="text-xs text-red-500">{errors.ranges}</p>}

            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs font-medium text-gray-600 mb-2">Preview Range:</p>
              <div className="flex flex-wrap gap-2">
                {form.metodePenilaian.ranges
                  ?.slice()
                  .sort((a, b) => a.minNilai - b.minNilai)
                  .map((range, index) => (
                    <span
                      key={range.id}
                      className={cn('px-2 py-1 text-xs rounded-full border', index === 0 ? 'bg-red-100 text-red-700' : index === 1 ? 'bg-amber-100 text-amber-700' : index === 2 ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700')}
                    >
                      {range.minNilai}-{range.maxNilai}: {range.kategori || '(belum diisi)'}
                    </span>
                  ))}
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Batal
          </Button>
          <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700">
            <Save className="w-4 h-4 mr-2" />
            {mode === 'create' ? 'Simpan' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
