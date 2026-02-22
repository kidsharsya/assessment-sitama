'use client';

import { useCallback } from 'react';
import { useParams } from 'next/navigation';
import { AlertTriangle, Link2Off, Loader2 } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { InterviewPageContent, PinVerification } from '@/components/admin/pages/interviewer';
import { useInterviewSessionInfo, useInterviewPinVerification, useInterviewDashboard } from '@/hooks/use-interview-process';

// ============================================
// Halaman Wawancara untuk Interviewer
// ============================================

export default function InterviewerWawancaraPage() {
  const params = useParams();
  const sessionToken = params.linkId as string;

  // Fetch session info
  const { sessionInfo, isLoading: isLoadingInfo, error: infoError } = useInterviewSessionInfo(sessionToken);

  // PIN verification state
  const { isVerified, verify } = useInterviewPinVerification(sessionToken);

  // Dashboard data - fetch is controlled by the hook internally based on token availability
  const { dashboard, isLoading: isLoadingDashboard, error: dashboardError, refetch: refetchDashboard } = useInterviewDashboard();

  // Handle PIN verification
  const handleVerify = useCallback(
    async (pin: string): Promise<boolean> => {
      const success = await verify(pin);
      if (success) {
        // Trigger dashboard fetch after successful verification
        await refetchDashboard();
      }
      return success;
    },
    [verify, refetchDashboard],
  );

  // Loading session info
  if (isLoadingInfo) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat data wawancara...</p>
        </div>
      </div>
    );
  }

  // Session not found or invalid
  if (infoError || !sessionInfo || !sessionInfo.isValid) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Link2Off className="w-8 h-8 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Link Tidak Valid</h2>
            <p className="text-sm text-gray-500">{infoError || 'Link wawancara yang Anda akses tidak ditemukan atau sudah tidak berlaku. Silakan hubungi admin untuk mendapatkan link yang valid.'}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show PIN verification if not verified yet
  if (!isVerified) {
    return <PinVerification interviewerName={sessionInfo.interviewerName} onVerify={handleVerify} />;
  }

  // Loading dashboard after verification
  if (isLoadingDashboard || !dashboard) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <Loader2 className="w-12 h-12 animate-spin text-teal-600 mx-auto mb-4" />
          <p className="text-gray-600">Memuat dashboard wawancara...</p>
        </div>
      </div>
    );
  }

  // Dashboard error
  if (dashboardError) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertTriangle className="w-8 h-8 text-amber-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2">Gagal Memuat Data</h2>
            <p className="text-sm text-gray-500">{dashboardError}</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Render interview page with dashboard data
  return <InterviewPageContent dashboard={dashboard} onRefresh={refetchDashboard} />;
}
