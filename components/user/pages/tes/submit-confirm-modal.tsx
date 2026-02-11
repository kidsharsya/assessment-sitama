'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// ============================================
// Exam Modals Components
// ============================================

// Submit Confirmation Modal
interface SubmitConfirmModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  dijawab: number;
  ditandai: number;
  belum: number;
  totalSoal: number;
  onConfirm: () => void;
}

export function SubmitConfirmModal({ open, onOpenChange, dijawab, ditandai, belum, totalSoal, onConfirm }: SubmitConfirmModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Konfirmasi Submit</DialogTitle>
          <DialogDescription>Apakah Anda yakin ingin mengakhiri dan submit tes ini?</DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="bg-gray-50 rounded-lg p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Soal dijawab</span>
              <span className="font-semibold text-teal-600">
                {dijawab} dari {totalSoal}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Soal ditandai</span>
              <span className="font-semibold text-amber-600">{ditandai}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Soal belum dijawab</span>
              <span className="font-semibold text-gray-600">{belum}</span>
            </div>
          </div>

          {belum > 0 && <p className="text-sm text-amber-600 mt-3">⚠️ Anda masih memiliki {belum} soal yang belum dijawab.</p>}
        </div>

        <DialogFooter className="flex gap-3 sm:gap-3">
          <Button type="button" variant="outline" className="flex-1" onClick={() => onOpenChange(false)}>
            Kembali ke Tes
          </Button>
          <Button type="button" className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={onConfirm}>
            Ya, Submit Tes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Auto Submit Warning Modal
interface AutoSubmitWarningModalProps {
  open: boolean;
  reason: string;
  onSubmit: () => void;
}

export function AutoSubmitWarningModal({ open, reason, onSubmit }: AutoSubmitWarningModalProps) {
  return (
    <Dialog open={open} onOpenChange={() => {}}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-red-600">Pelanggaran Peraturan Tes</DialogTitle>
          <DialogDescription className="text-md text-black">{reason}. Tes Anda akan otomatis di-submit.</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button type="button" className="w-full bg-red-600 hover:bg-red-700" onClick={onSubmit}>
            Mengerti, Submit Tes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
