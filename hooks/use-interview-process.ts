'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InterviewSessionInfo, InterviewDashboard, ParticipantAssessmentForm, SubmitScoreRequest } from '@/types/interview-process';
import { mockSessionInfo, mockInterviewDashboard, mockParticipantForm, mockParticipantFormWithAssessment } from '@/lib/mock-data/interview-session';

// ============================================
// useInterviewSessionInfo - Validasi link wawancara
// ============================================

interface UseInterviewSessionInfoReturn {
  sessionInfo: InterviewSessionInfo | null;
  isLoading: boolean;
  error: string | null;
}

export function useInterviewSessionInfo(sessionToken: string): UseInterviewSessionInfoReturn {
  const [sessionInfo, setSessionInfo] = useState<InterviewSessionInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!sessionToken) {
      setIsLoading(false);
      setError('Token sesi tidak valid');
      return;
    }

    const fetchInfo = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Mock: any token is valid for demo purposes
        setSessionInfo({
          ...mockSessionInfo,
          sessionId: sessionToken,
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memvalidasi link wawancara');
      } finally {
        setIsLoading(false);
      }
    };

    fetchInfo();
  }, [sessionToken]);

  return { sessionInfo, isLoading, error };
}

// ============================================
// useInterviewPinVerification - Verifikasi PIN akses
// ============================================

interface UseInterviewPinVerificationReturn {
  isVerified: boolean;
  verify: (pin: string) => Promise<boolean>;
}

export function useInterviewPinVerification(sessionToken: string): UseInterviewPinVerificationReturn {
  const [isVerified, setIsVerified] = useState(false);

  const verify = useCallback(
    async (pin: string): Promise<boolean> => {
      try {
        // TODO: Replace with actual API call
        await new Promise((resolve) => setTimeout(resolve, 500));
        // Mock: accept any 6-char pin for demo
        if (pin.length === 6 && sessionToken) {
          setIsVerified(true);
          return true;
        }
        return false;
      } catch {
        return false;
      }
    },
    [sessionToken],
  );

  return { isVerified, verify };
}

// ============================================
// useInterviewDashboard - Dashboard data untuk interviewer
// ============================================

interface UseInterviewDashboardReturn {
  dashboard: InterviewDashboard | null;
  isLoading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useInterviewDashboard(): UseInterviewDashboardReturn {
  const [dashboard, setDashboard] = useState<InterviewDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setDashboard({ ...mockInterviewDashboard });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  return { dashboard, isLoading, error, refetch: fetchDashboard };
}

// ============================================
// useParticipantForm - Form penilaian peserta
// ============================================

interface UseParticipantFormReturn {
  form: ParticipantAssessmentForm | null;
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useParticipantForm(participantId: string | null): UseParticipantFormReturn {
  const [form, setForm] = useState<ParticipantAssessmentForm | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchForm = useCallback(async () => {
    if (!participantId) {
      setForm(null);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 400));
      // Mock: participant-1 has existing assessment, others don't
      if (participantId === 'participant-1') {
        setForm({ ...mockParticipantFormWithAssessment });
      } else {
        // Use mock form with adjusted applicant name based on participant id
        const participantIndex = parseInt(participantId.split('-')[1]) || 1;
        const names = ['Ahmad Rizky Pratama', 'Dewi Putri Lestari', 'Fajar Nugroho'];
        const emails = ['ahmad.rizky@mubaligh.id', 'dewi.putri@mubaligh.id', 'fajar.nugroho@mubaligh.id'];

        setForm({
          ...mockParticipantForm,
          applicant: {
            name: names[participantIndex - 1] || names[0],
            email: emails[participantIndex - 1] || emails[0],
          },
          existingAssessment: null,
        });
      }
    } catch (err) {
      console.error('Failed to fetch form:', err);
      setForm(null);
    } finally {
      setIsLoading(false);
    }
  }, [participantId]);

  useEffect(() => {
    fetchForm();
  }, [fetchForm]);

  return { form, isLoading, refetch: fetchForm };
}

// ============================================
// useSubmitScore - Submit penilaian peserta
// ============================================

interface UseSubmitScoreReturn {
  isSubmitting: boolean;
  submitScore: (participantId: string, data: SubmitScoreRequest) => Promise<boolean>;
  error: string | null;
}

export function useSubmitScore(): UseSubmitScoreReturn {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const submitScore = useCallback(async (participantId: string, data: SubmitScoreRequest): Promise<boolean> => {
    setIsSubmitting(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      console.log('Score submitted for participant:', participantId, data);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal menyimpan penilaian');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  }, []);

  return { isSubmitting, submitScore, error };
}
