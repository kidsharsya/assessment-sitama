'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { CalendarDays, Clock, Layers, Save, Shuffle, X, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { ExamSession, ExamSessionFormInput } from '@/types/exam-session';
import type { CategoryWithPackets } from '@/types/bank-soal';

// ============================================
// Sesi Ujian Form Modal Component
// ============================================

interface SesiUjianFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: ExamSessionFormInput) => void;
  session?: ExamSession | null;
  mode: 'create' | 'edit';
  categories: CategoryWithPackets[];
}

interface FormState {
  name: string;
  categoryIds: string[];
  date: string;
  startTime: string;
  endTime: string;
  duration: number;
  isRandomPacket: boolean;
  isRandomQuestions: boolean;
  isRandomAnswers: boolean;
}

const initialFormState: FormState = {
  name: '',
  categoryIds: [],
  date: '',
  startTime: '',
  endTime: '',
  duration: 0,
  isRandomPacket: true,
  isRandomQuestions: false,
  isRandomAnswers: false,
};

function parseDateTime(isoDateTime: string): { date: string; time: string } {
  const dateObj = new Date(isoDateTime);
  const date = dateObj.toISOString().split('T')[0];
  const time = dateObj.toTimeString().slice(0, 5);
  return { date, time };
}

function getInitialForm(session: ExamSession | null | undefined, mode: 'create' | 'edit'): FormState {
  if (session && mode === 'edit') {
    const { date, time: startTime } = parseDateTime(session.startTime);
    const { time: endTime } = parseDateTime(session.endTime);

    return {
      name: session.name,
      categoryIds: session.categories.map((c) => c.categoryId),
      date,
      startTime,
      endTime,
      duration: session.duration,
      isRandomPacket: session.isRandomPacket,
      isRandomQuestions: session.isRandomQuestions,
      isRandomAnswers: session.isRandomAnswers,
    };
  }
  return { ...initialFormState };
}

export function SesiUjianFormModal({ isOpen, onClose, onSave, session, mode, categories }: SesiUjianFormModalProps) {
  const [form, setForm] = useState<FormState>(() => getInitialForm(session, mode));
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Reset form and errors when modal opens
  useEffect(() => {
    if (isOpen) {
      setForm(session && mode === 'edit' ? getInitialForm(session, mode) : { ...initialFormState });
      setErrors({});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  // Get available categories (not yet selected)
  const availableCategories = useMemo(() => {
    return categories.filter((c) => c.isActive && !form.categoryIds.includes(c.id));
  }, [form.categoryIds, categories]);

  // Get selected categories in order
  const selectedCategories = useMemo(() => {
    return form.categoryIds.map((id) => categories.find((c) => c.id === id)).filter((c): c is CategoryWithPackets => c !== undefined);
  }, [form.categoryIds, categories]);

  // Calculate durasi from jam mulai & selesai
  const calculateDurasi = useCallback((startTime: string, endTime: string): number => {
    if (!startTime || !endTime) return 0;
    const [startH, startM] = startTime.split(':').map(Number);
    const [endH, endM] = endTime.split(':').map(Number);
    return endH * 60 + endM - (startH * 60 + startM);
  }, []);

  // Auto-calculate duration when times change
  const calculatedDuration = useMemo(() => {
    return calculateDurasi(form.startTime, form.endTime);
  }, [form.startTime, form.endTime, calculateDurasi]);

  const handleChange = (field: keyof FormState, value: string | number | boolean) => {
    setForm((prev) => {
      const newForm = { ...prev, [field]: value };
      // Auto-update duration when times change
      if (field === 'startTime' || field === 'endTime') {
        const start = field === 'startTime' ? (value as string) : prev.startTime;
        const end = field === 'endTime' ? (value as string) : prev.endTime;
        newForm.duration = calculateDurasi(start, end);
      }
      return newForm;
    });
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field as string]: '' }));
    }
  };

  // Add category
  const addCategory = (categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: [...prev.categoryIds, categoryId],
    }));
    if (errors.categoryIds) {
      setErrors((prev) => ({ ...prev, categoryIds: '' }));
    }
  };

  // Remove category
  const removeCategory = (categoryId: string) => {
    setForm((prev) => ({
      ...prev,
      categoryIds: prev.categoryIds.filter((c) => c !== categoryId),
    }));
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.name.trim()) {
      newErrors.name = 'Nama sesi wajib diisi';
    }
    if (form.categoryIds.length === 0) {
      newErrors.categoryIds = 'Pilih minimal satu kategori ujian';
    }
    if (!form.date) {
      newErrors.date = 'Tanggal wajib diisi';
    }
    if (!form.startTime) {
      newErrors.startTime = 'Jam mulai wajib diisi';
    }
    if (!form.endTime) {
      newErrors.endTime = 'Jam selesai wajib diisi';
    }
    if (form.startTime && form.endTime && form.startTime >= form.endTime) {
      newErrors.endTime = 'Jam selesai harus lebih dari jam mulai';
    }
    if (form.duration <= 0) {
      newErrors.duration = 'Durasi harus lebih dari 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;

    const payload: ExamSessionFormInput = {
      name: form.name,
      categoryIds: form.categoryIds,
      date: form.date,
      startTime: form.startTime,
      endTime: form.endTime,
      duration: form.duration,
      isRandomPacket: form.isRandomPacket,
      isRandomQuestions: form.isRandomQuestions,
      isRandomAnswers: form.isRandomAnswers,
    };

    onSave(payload);
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-teal-600" />
            {mode === 'create' ? 'Tambah Sesi Ujian' : 'Edit Sesi Ujian'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Nama Sesi */}
          <div className="space-y-2">
            <Label htmlFor="name">Nama Sesi *</Label>
            <Input id="name" placeholder="Contoh: Sesi Ujian SKD Pagi" value={form.name} onChange={(e) => handleChange('name', e.target.value)} className={errors.name ? 'border-red-500' : ''} />
            {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
          </div>

          {/* Kategori Ujian Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-teal-600" />
                Kategori Ujian *
              </Label>
            </div>

            {/* Urutan Kategori Flow (Visual) */}
            {selectedCategories.length > 0 && (
              <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg overflow-x-auto">
                {selectedCategories.map((item, idx) => (
                  <div key={item.id} className="flex items-center gap-2">
                    {idx > 0 && <span className="text-gray-400">→</span>}
                    <span className="px-2 py-1 bg-teal-100 text-teal-700 rounded text-sm font-medium whitespace-nowrap">
                      {idx + 1}. {item.code}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Selected Kategori Cards */}
            {selectedCategories.length > 0 && (
              <div className="space-y-3">
                {selectedCategories.map((item, idx) => (
                  <Card key={item.id} className="border-gray-200">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="w-6 h-6 rounded-full bg-teal-600 text-white flex items-center justify-center text-sm font-medium">{idx + 1}</span>
                          <div>
                            <p className="font-medium text-gray-900">
                              {item.code} - {item.name}
                            </p>
                            <p className="text-xs text-gray-500">
                              {item.totalPackets} paket • {item.totalQuestions} soal • Passing grade: {item.passingGrade}
                            </p>
                          </div>
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => removeCategory(item.id)}>
                          <X className="w-4 h-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {/* Add Kategori Dropdown */}
            {availableCategories.length > 0 && (
              <div className="flex items-center gap-2">
                <Select key={form.categoryIds.length} onValueChange={addCategory}>
                  <SelectTrigger className="flex-1">
                    <SelectValue placeholder="Pilih kategori untuk ditambahkan..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableCategories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.code} - {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="shrink-0"
                  onClick={() => {
                    if (availableCategories.length > 0) {
                      addCategory(availableCategories[0].id);
                    }
                  }}
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {errors.categoryIds && <p className="text-xs text-red-500">{errors.categoryIds}</p>}

            {selectedCategories.length === 0 && <p className="text-xs text-gray-500">Pilih kategori ujian yang akan diikutkan dalam sesi ini. Paket soal akan dipilih secara acak oleh sistem.</p>}
          </div>

          {/* Tanggal & Waktu */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Tanggal */}
            <div className="space-y-2">
              <Label htmlFor="date">Tanggal *</Label>
              <Input id="date" type="date" value={form.date} onChange={(e) => handleChange('date', e.target.value)} className={errors.date ? 'border-red-500' : ''} />
              {errors.date && <p className="text-xs text-red-500">{errors.date}</p>}
            </div>

            {/* Jam Mulai */}
            <div className="space-y-2">
              <Label htmlFor="startTime">Jam Mulai *</Label>
              <Input id="startTime" type="time" value={form.startTime} onChange={(e) => handleChange('startTime', e.target.value)} className={errors.startTime ? 'border-red-500' : ''} />
              {errors.startTime && <p className="text-xs text-red-500">{errors.startTime}</p>}
            </div>

            {/* Jam Selesai */}
            <div className="space-y-2">
              <Label htmlFor="endTime">Jam Selesai *</Label>
              <Input id="endTime" type="time" value={form.endTime} onChange={(e) => handleChange('endTime', e.target.value)} className={errors.endTime ? 'border-red-500' : ''} />
              {errors.endTime && <p className="text-xs text-red-500">{errors.endTime}</p>}
            </div>
          </div>

          {/* Durasi */}
          <div className="space-y-2">
            <Label htmlFor="duration" className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-teal-600" />
              Durasi (menit)
            </Label>
            <Input id="duration" type="number" value={form.duration} onChange={(e) => handleChange('duration', parseInt(e.target.value) || 0)} placeholder="Durasi dalam menit" min={1} />
            {calculatedDuration > 0 && <p className="text-xs text-gray-500">Durasi dihitung otomatis dari jam mulai dan selesai: {calculatedDuration} menit</p>}
            {errors.duration && <p className="text-xs text-red-500">{errors.duration}</p>}
          </div>

          {/* Pengaturan Randomisasi */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Shuffle className="w-4 h-4 text-teal-600" />
              Pengaturan Randomisasi
            </Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isRandomPacket} onChange={(e) => handleChange('isRandomPacket', e.target.checked)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Acak paket soal untuk setiap peserta</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isRandomQuestions} onChange={(e) => handleChange('isRandomQuestions', e.target.checked)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Acak urutan soal</span>
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" checked={form.isRandomAnswers} onChange={(e) => handleChange('isRandomAnswers', e.target.checked)} className="w-4 h-4 text-teal-600 rounded focus:ring-teal-500" />
                <span className="text-sm text-gray-700">Acak urutan pilihan jawaban</span>
              </label>
            </div>
          </div>
        </div>

        <DialogFooter className="gap-2">
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
