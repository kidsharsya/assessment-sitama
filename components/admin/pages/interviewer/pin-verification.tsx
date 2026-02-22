'use client';

import { useState, useRef, useEffect } from 'react';
import { Shield, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

// ============================================
// PIN Verification Component
// ============================================

interface PinVerificationProps {
  interviewerName: string;
  onVerify: (pin: string) => Promise<boolean>;
}

export function PinVerification({ interviewerName, onVerify }: PinVerificationProps) {
  const [pin, setPin] = useState(['', '', '', '', '', '']);
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPin, setShowPin] = useState(false);
  const [attempts, setAttempts] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const maxAttempts = 5;
  const isLocked = attempts >= maxAttempts;

  // Focus first input on mount
  useEffect(() => {
    inputRefs.current[0]?.focus();
  }, []);

  const handleChange = (index: number, value: string) => {
    if (isLocked) return;

    // Only allow alphanumeric and convert to uppercase
    if (value && !/^[A-Za-z0-9]$/.test(value)) return;

    const newPin = [...pin];
    newPin[index] = value.toUpperCase();
    setPin(newPin);
    setError(null);

    // Move to next input
    if (value && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (isLocked) return;

    // Handle backspace - move to previous input
    if (e.key === 'Backspace') {
      if (!pin[index] && index > 0) {
        // If current input is empty, move to previous and clear it
        const newPin = [...pin];
        newPin[index - 1] = '';
        setPin(newPin);
        inputRefs.current[index - 1]?.focus();
        e.preventDefault();
      }
    }

    // Handle left arrow
    if (e.key === 'ArrowLeft' && index > 0) {
      inputRefs.current[index - 1]?.focus();
      e.preventDefault();
    }

    // Handle right arrow
    if (e.key === 'ArrowRight' && index < 5) {
      inputRefs.current[index + 1]?.focus();
      e.preventDefault();
    }

    // Handle paste
    if (e.key === 'v' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      navigator.clipboard.readText().then((text) => {
        const chars = text
          .replace(/[^A-Za-z0-9]/g, '')
          .toUpperCase()
          .slice(0, 6)
          .split('');
        const newPin = ['', '', '', '', '', ''];
        chars.forEach((char, i) => {
          if (i < 6) newPin[i] = char;
        });
        setPin(newPin);
        setError(null);
        // Focus last filled input or next empty
        const lastIndex = Math.min(chars.length, 5);
        inputRefs.current[lastIndex]?.focus();
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLocked) return;

    const enteredPin = pin.join('');

    if (enteredPin.length < 6) {
      setError('PIN harus 6 karakter');
      return;
    }

    setIsVerifying(true);
    setError(null);

    try {
      const isValid = await onVerify(enteredPin);

      if (!isValid) {
        setAttempts((prev) => prev + 1);
        setError(`PIN tidak valid. ${maxAttempts - attempts - 1} percobaan tersisa.`);
        setPin(['', '', '', '', '', '']);
        inputRefs.current[0]?.focus();
      }
    } catch {
      setError('Terjadi kesalahan. Silakan coba lagi.');
    } finally {
      setIsVerifying(false);
    }
  };

  const filledCount = pin.filter((p) => p !== '').length;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-cyan-50 p-4">
      <Card className="max-w-md w-full shadow-xl">
        <CardContent className="p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-teal-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Shield className="w-8 h-8 text-teal-600" />
            </div>
            <h1 className="text-xl font-bold text-gray-900 mb-2">Verifikasi Akses</h1>
            <p className="text-sm text-gray-500">Masukkan PIN untuk mengakses form penilaian wawancara</p>
          </div>

          {/* Interviewer Info */}
          <div className="bg-gray-50 rounded-lg p-4 mb-6">
            <p className="text-xs text-gray-500 mb-1">Interviewer</p>
            <p className="font-semibold text-gray-900">{interviewerName}</p>
          </div>

          {/* Locked State */}
          {isLocked ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Lock className="w-8 h-8 text-red-600" />
              </div>
              <h3 className="text-lg font-semibold text-red-700 mb-2">Akses Terkunci</h3>
              <p className="text-sm text-gray-500 mb-4">Terlalu banyak percobaan gagal. Silakan hubungi admin untuk mendapatkan bantuan.</p>
              <p className="text-xs text-gray-400">Atau tunggu beberapa saat dan refresh halaman ini.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit}>
              {/* PIN Input */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <label className="text-sm font-medium text-gray-700">Masukkan PIN (6 karakter)</label>
                  <button type="button" onClick={() => setShowPin(!showPin)} className="text-gray-400 hover:text-gray-600 transition-colors">
                    {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex gap-2 justify-center">
                  {pin.map((digit, index) => (
                    <input
                      key={index}
                      ref={(el) => {
                        inputRefs.current[index] = el;
                      }}
                      type={showPin ? 'text' : 'password'}
                      inputMode="text"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleChange(index, e.target.value)}
                      onKeyDown={(e) => handleKeyDown(index, e)}
                      disabled={isVerifying}
                      className={cn(
                        'w-11 h-12 text-center text-lg font-semibold border-2 rounded-lg transition-all uppercase',
                        'focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500',
                        error ? 'border-red-300 bg-red-50' : 'border-gray-300',
                        digit && 'border-teal-400 bg-teal-50',
                      )}
                    />
                  ))}
                </div>

                {/* Progress indicator */}
                <div className="flex justify-center gap-1 mt-3">
                  {[0, 1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className={cn('w-2 h-2 rounded-full transition-colors', i < filledCount ? 'bg-teal-500' : 'bg-gray-200')} />
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg mb-4">
                  <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
                  <p className="text-sm text-red-600">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <Button type="submit" className="w-full bg-teal-600 hover:bg-teal-700" disabled={isVerifying || filledCount < 4}>
                {isVerifying ? (
                  <span className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Memverifikasi...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Verifikasi
                  </span>
                )}
              </Button>

              {/* Attempts Info */}
              {attempts > 0 && (
                <p className="text-xs text-center text-gray-400 mt-3">
                  {attempts} dari {maxAttempts} percobaan digunakan
                </p>
              )}
            </form>
          )}

          {/* Help Text */}
          <p className="text-xs text-center text-gray-400 mt-6">PIN dikirimkan melalui email atau hubungi admin jika tidak menerima PIN.</p>
        </CardContent>
      </Card>
    </div>
  );
}
