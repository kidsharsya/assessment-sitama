'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { FileQuestion, Save, ImageIcon, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { cn } from '@/lib/utils';
import { StorageService } from '@/services/storage.service';
import type { Question, QuestionFormInput, OptionLabel, QuestionOption } from '@/types/bank-soal';

// ============================================
// Question Form Modal Component
// ============================================

interface QuestionFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: QuestionFormInput) => void | Promise<void>;
  question?: Question | null;
  mode: 'create' | 'edit';
}

const labelOptions: OptionLabel[] = ['A', 'B', 'C', 'D', 'E'];

const initialFormState: QuestionFormInput = {
  questionText: '',
  imagePath: null,
  options: {
    A: { text: '' },
    B: { text: '' },
    C: { text: '' },
    D: { text: '' },
    E: { text: '' },
  },
  correctAnswer: 'A',
  score: 5,
};

export function QuestionFormModal({ isOpen, onClose, onSave, question, mode }: QuestionFormModalProps) {
  const [form, setForm] = useState<QuestionFormInput>(initialFormState);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Initialize form when modal opens
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && question) {
        const optionsMap: QuestionFormInput['options'] = {
          A: { text: '' },
          B: { text: '' },
          C: { text: '' },
          D: { text: '' },
          E: { text: '' },
        };
        question.options.forEach((opt: QuestionOption) => {
          if (optionsMap[opt.label]) {
            optionsMap[opt.label] = { text: opt.text };
          }
        });

        setForm({
          questionText: question.questionText,
          imagePath: question.imagePath || null,
          options: optionsMap,
          correctAnswer: question.correctAnswer,
          score: question.score,
        });
        // Resolve storage URL untuk preview gambar
        setImagePreview(StorageService.getPublicUrl(question.imagePath) || null);
      } else {
        setForm(initialFormState);
        setImagePreview(null);
      }
      setErrors({});
    }
  }, [isOpen, mode, question]);

  const handleOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        onClose();
        setErrors({});
      }
    },
    [onClose],
  );

  const handleChange = (field: keyof QuestionFormInput, value: string | number | File | null) => {
    setForm((prev: QuestionFormInput) => ({ ...prev, [field]: value }));
    if (errors[field as string]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const handleOptionChange = (label: OptionLabel, value: string) => {
    setForm((prev: QuestionFormInput) => ({
      ...prev,
      options: {
        ...prev.options,
        [label]: { ...prev.options[label], text: value },
      },
    }));
    if (errors[`option_${label}`]) {
      setErrors((prev) => ({ ...prev, [`option_${label}`]: '' }));
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev: QuestionFormInput) => ({ ...prev, imagePath: file }));
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeImage = () => {
    setForm((prev: QuestionFormInput) => ({ ...prev, imagePath: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!form.questionText.trim()) {
      newErrors.questionText = 'Pertanyaan wajib diisi';
    }

    labelOptions.forEach((label) => {
      if (!form.options[label].text.trim()) {
        newErrors[`option_${label}`] = `Pilihan ${label} wajib diisi`;
      }
    });

    if (form.score <= 0) {
      newErrors.score = 'Poin harus lebih dari 0';
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
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileQuestion className="w-5 h-5 text-teal-600" />
            {mode === 'create' ? 'Tambah Soal' : 'Edit Soal'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {/* Pertanyaan */}
          <div className="space-y-2">
            <Label htmlFor="questionText">Pertanyaan *</Label>
            <Textarea id="questionText" placeholder="Tulis pertanyaan di sini..." value={form.questionText} onChange={(e) => handleChange('questionText', e.target.value)} rows={3} className={errors.questionText ? 'border-red-500' : ''} />
            {errors.questionText && <p className="text-xs text-red-500">{errors.questionText}</p>}
          </div>

          {/* Gambar Soal */}
          <div className="space-y-2">
            <Label>Gambar Soal (Opsional)</Label>
            <div className="flex items-start gap-4">
              {imagePreview ? (
                <div className="relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={imagePreview} alt="Preview" className="max-h-32 rounded border border-gray-200" />
                  <button type="button" onClick={removeImage} className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center hover:bg-red-600">
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-32 h-24 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-teal-400 hover:bg-teal-50 transition-colors">
                  <ImageIcon className="w-6 h-6 text-gray-400" />
                  <span className="text-xs text-gray-500 mt-1">Upload</span>
                  <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Pilihan Jawaban */}
          <div className="space-y-3">
            <Label>Pilihan Jawaban *</Label>
            {labelOptions.map((label) => (
              <div key={label} className="flex items-start gap-3">
                <button
                  type="button"
                  onClick={() => handleChange('correctAnswer', label)}
                  className={cn(
                    'shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-semibold border-2 transition-all',
                    form.correctAnswer === label ? 'border-green-500 bg-green-500 text-white' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300',
                  )}
                >
                  {label}
                </button>
                <div className="flex-1">
                  <Input placeholder={`Teks pilihan ${label}`} value={form.options[label].text} onChange={(e) => handleOptionChange(label, e.target.value)} className={errors[`option_${label}`] ? 'border-red-500' : ''} />
                  {errors[`option_${label}`] && <p className="text-xs text-red-500 mt-1">{errors[`option_${label}`]}</p>}
                </div>
              </div>
            ))}
            <p className="text-xs text-gray-500">
              Klik huruf untuk memilih jawaban yang benar. Jawaban benar: <span className="font-semibold text-green-600">{form.correctAnswer}</span>
            </p>
          </div>

          {/* Poin */}
          <div className="space-y-2">
            <Label htmlFor="score">Poin *</Label>
            <Input id="score" type="number" min={1} value={form.score} onChange={(e) => handleChange('score', parseInt(e.target.value) || 0)} className={cn('w-32', errors.score && 'border-red-500')} />
            {errors.score && <p className="text-xs text-red-500">{errors.score}</p>}
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
