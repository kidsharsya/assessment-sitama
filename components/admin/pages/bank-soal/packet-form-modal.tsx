'use client';

import { useState, useCallback, useEffect } from 'react';
import { Layers, Save, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { PacketWithQuestions, PacketFormInput } from '@/types/bank-soal';

// ============================================
// Packet Form Modal Component
// ============================================

interface PacketFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: PacketFormInput) => void | Promise<void>;
  packet?: PacketWithQuestions | null;
  mode: 'create' | 'edit';
}

const initialFormState: PacketFormInput = {
  name: '',
  code: 'A',
  isActive: true,
};

export function PacketFormModal({ isOpen, onClose, onSave, packet, mode }: PacketFormModalProps) {
  const [form, setForm] = useState<PacketFormInput>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && packet) {
        setForm({
          name: packet.name,
          code: packet.code,
          isActive: packet.isActive,
        });
      } else {
        setForm(initialFormState);
      }
      setErrors({});
    }
  }, [isOpen, mode, packet]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
        setErrors({});
      }
    },
    [onClose],
  );

  const handleChange = (field: keyof PacketFormInput, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nama paket wajib diisi';
    }
    if (!form.code.trim()) {
      newErrors.code = 'Kode paket wajib diisi';
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            {mode === 'create' ? 'Tambah Paket Soal' : 'Edit Paket Soal'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Nama Paket */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Paket *</Label>
            <Input id="name" placeholder="Contoh: TWK Paket A" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Kode Paket */}
          <div className="space-y-2">
            <Label htmlFor="code">Kode Paket *</Label>
            <Input id="code" placeholder="Contoh: A, B, C, D" value={form.code} onChange={(e) => handleChange('code', e.target.value.toUpperCase())} className={errors.code ? 'border-red-500' : ''} />
            {errors.code && <p className="text-xs text-red-500">{errors.code}</p>}
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
