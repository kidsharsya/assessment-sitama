'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InterviewSessionInfo, InterviewDashboard, ParticipantAssessmentForm, SubmitScoreRequest } from '@/types/interview-process';
import { InterviewProcessService, getInterviewerToken } from '@/services/interview-process.service';

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
        const info = await InterviewProcessService.getSessionInfo(sessionToken);
        setSessionInfo(info);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Gagal memvalidasi link wawancara');
        setSessionInfo({ isValid: false, interviewerName: '' });
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
  const [isVerified, setIsVerified] = useState(() => !!getInterviewerToken());

  const verify = useCallback(
    async (pin: string): Promise<boolean> => {
      try {
        await InterviewProcessService.verifyPin(sessionToken, pin);
        setIsVerified(true);
        return true;
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

export function useInterviewDashboard(enabled: boolean): UseInterviewDashboardReturn {
  const [dashboard, setDashboard] = useState<InterviewDashboard | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboard = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await InterviewProcessService.getDashboard();
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat dashboard');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      fetchDashboard();
    }
  }, [enabled, fetchDashboard]);

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

  const fetchForm = useCallback(
    async (signal?: AbortSignal) => {
      if (!participantId) {
        setForm(null);
        return;
      }

      setIsLoading(true);
      try {
        const data = await InterviewProcessService.getParticipantForm(participantId);
        if (!signal?.aborted) {
          setForm(data);
        }
      } catch (err) {
        if (!signal?.aborted) {
          console.error('Failed to fetch form:', err);
          setForm(null);
        }
      } finally {
        if (!signal?.aborted) {
          setIsLoading(false);
        }
      }
    },
    [participantId],
  );

  useEffect(() => {
    const controller = new AbortController();
    fetchForm(controller.signal);
    return () => controller.abort();
  }, [fetchForm]);

  return { form, isLoading, refetch: () => fetchForm() };
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
      await InterviewProcessService.submitScore(participantId, data);
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
