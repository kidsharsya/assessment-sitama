'use client';

import { useState, useEffect, useCallback } from 'react';
import { InterviewSessionService } from '@/services';
import type { ExamSessionUser } from '@/types/interview-session';

// ============================================
// useExamSessionUsers - Fetch users who completed exam session (eligible for interview)
// ============================================

interface UseExamSessionUsersReturn {
  users: ExamSessionUser[];
  isLoading: boolean;
}

export function useExamSessionUsers(examSessionId: string): UseExamSessionUsersReturn {
  const [users, setUsers] = useState<ExamSessionUser[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    if (!examSessionId) {
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    try {
      const result = await InterviewSessionService.getExamSessionUsers(examSessionId);
      setUsers(result);
    } catch (err) {
      console.error('Failed to fetch exam session users:', err);
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [examSessionId]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return {
    users,
    isLoading,
  };
}
