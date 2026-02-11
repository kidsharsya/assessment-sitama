'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ClipboardEdit, AlertTriangle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { validateTokenAndStartExam } from '@/lib/mock-data/exam-attempt';

// ============================================
// Tes Overview Page
// ============================================

const examInfo = {
  title: 'Assessment Sitama Online',
};

const peraturanTes = [
  { text: 'Pastikan anda mulai ujian tepat waktu', highlight: null },
  { text: 'Dilarang keluar dari halaman tes sebelum selesai', highlight: null },
  { text: 'Klik kanan dan copy-paste dinonaktifkan', highlight: null },
  { text: 'Pastikan koneksi internet stabil', highlight: null },
];

export default function TesOverview() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [token, setToken] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleMulaiTes = () => {
    setIsModalOpen(true);
    setToken('');
    setTokenError('');
  };

  const handleBatal = () => {
    router.back();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setToken('');
    setTokenError('');
  };

  const handleMulaiSekarang = async () => {
    if (!token.trim()) {
      setTokenError('Token ujian wajib diisi');
      return;
    }

    if (token.length < 6) {
      setTokenError('Token ujian minimal 6 karakter');
      return;
    }

    setIsLoading(true);
    setTokenError('');

    // Simulate loading delay
    await new Promise((resolve) => setTimeout(resolve, 800));

    // Validate token and start exam
    const attempt = validateTokenAndStartExam(token);

    if (!attempt) {
      setIsLoading(false);
      setTokenError('Token tidak valid atau sesi ujian tidak ditemukan');
      return;
    }

    // Store attempt ID in sessionStorage
    sessionStorage.setItem('examAttemptId', attempt.attemptId);

    setIsLoading(false);
    setIsModalOpen(false);
    router.push('/tes-started');
  };

  return (
    <div className="bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 bg-teal-50 rounded-full flex items-center justify-center">
            <ClipboardEdit className="w-10 h-10 text-teal-600" />
          </div>
        </div>

        {/* Title */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">{examInfo.title}</h1>
        </div>

        {/* Peraturan Tes */}
        <div className="bg-amber-50 border border-amber-100 rounded-xl p-5 mb-8">
          <h3 className="font-semibold text-gray-900 mb-4">Informasi dan Peraturan Tes:</h3>
          <div className="space-y-3">
            {peraturanTes.map((item, index) => (
              <div key={index} className="flex items-center gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />
                <span className="text-gray-700">
                  {item.text}
                  {item.highlight && <span className="font-semibold"> {item.highlight}</span>}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <Button type="button" variant="outline" className="flex-1 h-12 text-base rounded-xl" onClick={handleBatal}>
            Batal
          </Button>
          <Button type="button" className="flex-1 h-12 text-base rounded-xl bg-teal-600 hover:bg-teal-700" onClick={handleMulaiTes}>
            Mulai Tes
          </Button>
        </div>
      </div>

      {/* Token Modal */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="text-center">Masukkan Token Ujian</DialogTitle>
            <DialogDescription className="text-center">Masukkan token yang telah diberikan untuk memulai ujian</DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="token" className="sr-only">
              Token Ujian
            </Label>
            <Input
              id="token"
              type="text"
              placeholder="Masukkan token ujian"
              value={token}
              onChange={(e) => {
                setToken(e.target.value.toUpperCase());
                setTokenError('');
              }}
              className={`h-12 text-center text-lg tracking-widest font-mono ${tokenError ? 'border-red-500 focus-visible:ring-red-500' : ''}`}
              maxLength={20}
              autoComplete="off"
              autoFocus
            />
            {tokenError && <p className="text-sm text-red-500 text-center mt-2">{tokenError}</p>}
          </div>

          <DialogFooter className="flex gap-3 sm:gap-3">
            <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal} disabled={isLoading}>
              Batal
            </Button>
            <Button type="button" className="flex-1 bg-teal-600 hover:bg-teal-700" onClick={handleMulaiSekarang} disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Memvalidasi...
                </>
              ) : (
                'Mulai Sekarang'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
