'use client';

import { useState, useCallback } from 'react';
import { ClipboardList, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { RubrikWawancaraWithKriteria, RubrikWawancaraFormInput } from '@/types/rubrik-wawancara';

// ============================================
// Rubrik Form Modal Component
// ============================================

interface RubrikFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: RubrikWawancaraFormInput) => void;
  rubrik?: RubrikWawancaraWithKriteria | null;
  mode: 'create' | 'edit';
}

const initialFormState: RubrikWawancaraFormInput = {
  nama: '',
  deskripsi: '',
  isActive: true, // Default value, but won't be editable in form
};

function getInitialForm(rubrik: RubrikWawancaraWithKriteria | null | undefined, mode: 'create' | 'edit'): RubrikWawancaraFormInput {
  if (rubrik && mode === 'edit') {
    return {
      nama: rubrik.nama,
      deskripsi: rubrik.deskripsi,
      isActive: rubrik.isActive,
    };
  }
  return initialFormState;
}

export function RubrikFormModal({ isOpen, onClose, onSave, rubrik, mode }: RubrikFormModalProps) {
  // Use key-based reset pattern - form resets when modal opens with different data
  const formKey = `${mode}-${rubrik?.id || 'new'}-${isOpen}`;
  const [form, setForm] = useState<RubrikWawancaraFormInput>(() => getInitialForm(rubrik, mode));
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [lastFormKey, setLastFormKey] = useState(formKey);

  // Reset form when key changes (modal opens with different data)
  if (formKey !== lastFormKey) {
    setForm(getInitialForm(rubrik, mode));
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

  const handleChange = (field: keyof RubrikWawancaraFormInput, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.nama.trim()) {
      newErrors.nama = 'Nama rubrik wajib diisi';
    }
    if (!form.deskripsi.trim()) {
      newErrors.deskripsi = 'Deskripsi wajib diisi';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSave(form);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ClipboardList className="w-5 h-5 text-teal-600" />
            {mode === 'create' ? 'Tambah Rubrik Wawancara' : 'Edit Rubrik Wawancara'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama Rubrik */}
          <div className="space-y-2">
            <Label htmlFor="nama">Nama Rubrik *</Label>
            <Input id="nama" placeholder="Contoh: Rubrik Wawancara Teknis" value={form.nama} onChange={(e) => handleChange('nama', e.target.value)} className={errors.nama ? 'border-red-500' : ''} />
            {errors.nama && <p className="text-xs text-red-500">{errors.nama}</p>}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="deskripsi">Deskripsi *</Label>
            <Textarea id="deskripsi" placeholder="Deskripsi rubrik wawancara..." value={form.deskripsi} onChange={(e) => handleChange('deskripsi', e.target.value)} rows={4} className={errors.deskripsi ? 'border-red-500' : ''} />
            {errors.deskripsi && <p className="text-xs text-red-500">{errors.deskripsi}</p>}
          </div>

          {/* Info: Status aktif diubah melalui tombol toggle di daftar rubrik */}
          {mode === 'edit' && <p className="text-xs text-gray-500 italic">* Status aktif/nonaktif dapat diubah melalui tombol toggle di daftar rubrik</p>}
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
