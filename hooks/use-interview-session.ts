'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InterviewSession, ApiInterviewSessionDetail, CreateInterviewSessionRequest, UpdateInterviewSessionRequest } from '@/types/interview-session';
import { mockInterviewSessions, mockSessionDetails, mockParticipantIds } from '@/lib/mock-data/interview-session';

// ============================================
// useInterviewSessions - List sesi wawancara
// ============================================

interface UseInterviewSessionsReturn {
  sessions: InterviewSession[];
  isLoading: boolean;
  error: string | null;
  currentPage: number;
  totalPages: number;
  totalElements: number;
  pageSize: number;
  setPage: (page: number) => void;
  createSession: (data: CreateInterviewSessionRequest) => Promise<void>;
  updateSession: (id: string, data: UpdateInterviewSessionRequest) => Promise<void>;
  deleteSession: (id: string) => Promise<void>;
  refetch: () => Promise<void>;
}

export function useInterviewSessions(): UseInterviewSessionsReturn {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const pageSize = 10;

  const fetchSessions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 500));
      setSessions([...mockInterviewSessions]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat sesi wawancara');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions, currentPage]);

  const createSession = useCallback(async (data: CreateInterviewSessionRequest) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    const newSession: InterviewSession = {
      id: `session-${Date.now()}`,
      namaInterviewer: data.interviewerName,
      emailInterviewer: data.interviewerEmail,
      rubrikId: data.rubricId,
      rubrikNama: 'Rubrik Baru',
      jumlahPelamar: data.applicationIds.length,
      status: data.isActive ? 'aktif' : 'nonaktif',
      accessPin: data.accessPin,
      link: `/wawancara/link-${Date.now()}`,
      isActive: data.isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setSessions((prev) => [newSession, ...prev]);
  }, []);

  const updateSession = useCallback(async (id: string, data: UpdateInterviewSessionRequest) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSessions((prev) =>
      prev.map((s) =>
        s.id === id
          ? {
              ...s,
              namaInterviewer: data.interviewerName,
              emailInterviewer: data.interviewerEmail,
              rubrikId: data.rubricId,
              accessPin: data.accessPin,
              jumlahPelamar: data.applicationIds.length,
              status: data.isActive ? 'aktif' : 'nonaktif',
              isActive: data.isActive,
              updatedAt: new Date().toISOString(),
            }
          : s,
      ),
    );
  }, []);

  const deleteSession = useCallback(async (id: string) => {
    // TODO: Replace with actual API call
    await new Promise((resolve) => setTimeout(resolve, 300));
    setSessions((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const totalElements = sessions.length;
  const totalPages = Math.max(1, Math.ceil(totalElements / pageSize));

  return {
    sessions,
    isLoading,
    error,
    currentPage,
    totalPages,
    totalElements,
    pageSize,
    setPage: setCurrentPage,
    createSession,
    updateSession,
    deleteSession,
    refetch: fetchSessions,
  };
}

// ============================================
// useInterviewSession - Detail satu sesi (untuk edit)
// ============================================

interface UseInterviewSessionReturn {
  session: ApiInterviewSessionDetail | null;
  participantIds: string[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useInterviewSession(sessionId: string | null): UseInterviewSessionReturn {
  const [session, setSession] = useState<ApiInterviewSessionDetail | null>(null);
  const [participantIds, setParticipantIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      setParticipantIds([]);
      return;
    }

    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      const detail = mockSessionDetails[sessionId] || null;
      const ids = mockParticipantIds[sessionId] || [];
      setSession(detail);
      setParticipantIds(ids);
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setSession(null);
      setParticipantIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    participantIds,
    isLoading,
    refetch: fetchSession,
  };
}
