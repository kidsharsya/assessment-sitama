'use client';

import { useState, useCallback, useEffect } from 'react';
import { Package, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import type { CategoryWithPackets, CategoryFormInput } from '@/types/bank-soal';

// ============================================
// Category Form Modal Component
// ============================================

interface CategoryFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: CategoryFormInput) => void | Promise<void>;
  category?: CategoryWithPackets | null;
  mode: 'create' | 'edit';
}

const initialFormState: CategoryFormInput = {
  name: '',
  code: '',
  description: '',
  passingGrade: 0,
  isActive: true,
};

export function CategoryFormModal({ isOpen, onClose, onSave, category, mode }: CategoryFormModalProps) {
  const [form, setForm] = useState<CategoryFormInput>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && category) {
        setForm({
          name: category.name,
          code: category.code,
          description: category.description,
          passingGrade: category.passingGrade,
          isActive: category.isActive,
        });
      } else {
        setForm(initialFormState);
      }
      setErrors({});
    }
  }, [isOpen, mode, category]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
        setErrors({});
      }
    },
    [onClose],
  );

  const handleChange = (field: keyof CategoryFormInput, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nama kategori wajib diisi';
    }
    if (!form.code.trim()) {
      newErrors.code = 'Kode kategori wajib diisi';
    }
    if (!form.description.trim()) {
      newErrors.description = 'Deskripsi wajib diisi';
    }
    if (form.passingGrade <= 0 || isNaN(form.passingGrade)) {
      newErrors.passingGrade = 'Passing grade wajib diisi dan harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsLoading(true);
    try {
      await onSave(form);
    } catch (error) {
      console.error('Error saving:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="w-5 h-5 text-teal-600" />
            {mode === 'create' ? 'Tambah Kategori Soal' : 'Edit Kategori Soal'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama Kategori */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Kategori *</Label>
            <Input id="name" placeholder="Contoh: Tes Wawasan Kebangsaan" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Kode Kategori */}
          <div className="space-y-2">
            <Label htmlFor="code">Kode Kategori *</Label>
            <Input id="code" placeholder="Contoh: TWK" value={form.code} onChange={(e) => handleChange('code', e.target.value.toUpperCase())} className={errors.code ? 'border-red-500' : ''} />
            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
          </div>

          {/* Deskripsi */}
          <div className="space-y-2">
            <Label htmlFor="description">Deskripsi *</Label>
            <Textarea id="description" placeholder="Deskripsi kategori soal..." value={form.description} onChange={(e) => handleChange('description', e.target.value)} rows={3} className={errors.description ? 'border-red-500' : ''} />
            {errors.description && <p className="text-xs text-red-500">{errors.description}</p>}
          </div>

          {/* Passing Grade */}
          <div className="space-y-2">
            <Label htmlFor="passingGrade">Passing Grade *</Label>
            <Input
              id="passingGrade"
              type="number"
              min={1}
              placeholder="Contoh: 75"
              value={form.passingGrade || ''}
              onChange={(e) => handleChange('passingGrade', Number(e.target.value))}
              className={errors.passingGrade ? 'border-red-500' : ''}
            />
            {errors.passingGrade && <p className="text-xs text-red-500">{errors.passingGrade}</p>}
          </div>

          {/* Status Aktif */}
          <div className="flex items-center gap-3">
            <input type="checkbox" id="isActive" checked={form.isActive} onChange={(e) => handleChange('isActive', e.target.checked)} className="w-4 h-4 text-teal-600 border-gray-300 rounded focus:ring-teal-500" />
            <Label htmlFor="isActive" className="cursor-pointer">
              Status Aktif
            </Label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Batal
          </Button>
          <Button onClick={handleSubmit} className="bg-teal-600 hover:bg-teal-700" disabled={isLoading}>
            {isLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            {mode === 'create' ? 'Simpan' : 'Update'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
