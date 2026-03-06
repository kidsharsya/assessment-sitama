'use client';

import { useState, useEffect, useCallback } from 'react';
import type { InterviewSession, ApiInterviewSessionDetail, CreateInterviewSessionRequest, UpdateInterviewSessionRequest } from '@/types/interview-session';
import { InterviewSessionService } from '@/services';

// ============================================
// useInterviewSessions - List sesi wawancara by exam session
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

export function useInterviewSessions(examSessionId: string): UseInterviewSessionsReturn {
  const [sessions, setSessions] = useState<InterviewSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 10;

  const fetchSessions = useCallback(async () => {
    if (!examSessionId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const result = await InterviewSessionService.getSessions(examSessionId, currentPage, pageSize);
      setSessions(result.content);
      setTotalElements(result.totalElements);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal memuat sesi wawancara');
    } finally {
      setIsLoading(false);
    }
  }, [examSessionId, currentPage]);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const createSession = useCallback(
    async (data: CreateInterviewSessionRequest) => {
      await InterviewSessionService.createSession({
        ...data,
        examSessionId,
      });
      await fetchSessions();
    },
    [examSessionId, fetchSessions],
  );

  const updateSession = useCallback(
    async (id: string, data: UpdateInterviewSessionRequest) => {
      await InterviewSessionService.updateSession(id, data);
      await fetchSessions();
    },
    [fetchSessions],
  );

  const deleteSession = useCallback(
    async (id: string) => {
      await InterviewSessionService.deleteSession(id);
      await fetchSessions();
    },
    [fetchSessions],
  );

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
  participantUserIds: string[];
  isLoading: boolean;
  refetch: () => Promise<void>;
}

export function useInterviewSession(sessionId: string | null): UseInterviewSessionReturn {
  const [session, setSession] = useState<ApiInterviewSessionDetail | null>(null);
  const [participantUserIds, setParticipantUserIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchSession = useCallback(async () => {
    if (!sessionId) {
      setSession(null);
      setParticipantUserIds([]);
      return;
    }

    setIsLoading(true);
    try {
      const [detail, userIds] = await Promise.all([InterviewSessionService.getSessionById(sessionId), InterviewSessionService.getParticipantUserIds(sessionId)]);
      setSession(detail);
      setParticipantUserIds(userIds);
    } catch (err) {
      console.error('Failed to fetch session:', err);
      setSession(null);
      setParticipantUserIds([]);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  useEffect(() => {
    fetchSession();
  }, [fetchSession]);

  return {
    session,
    participantUserIds,
    isLoading,
    refetch: fetchSession,
  };
}
