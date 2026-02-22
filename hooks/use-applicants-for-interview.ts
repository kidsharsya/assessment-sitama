'use client';

import { useState, useEffect, useCallback } from 'react';
import { mockApplicants } from '@/lib/mock-data/interview-session';

// ============================================
// ApplicantForSelection Type
// ============================================

export interface ApplicantForSelection {
  applicationId: string;
  fullName: string;
  email: string;
}

// ============================================
// useApplicantsForInterview - Fetch applicants for interview selection
// ============================================

interface UseApplicantsForInterviewReturn {
  applicants: ApplicantForSelection[];
  isLoading: boolean;
}

export function useApplicantsForInterview(): UseApplicantsForInterviewReturn {
  const [applicants, setApplicants] = useState<ApplicantForSelection[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchApplicants = useCallback(async () => {
    setIsLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => setTimeout(resolve, 300));
      setApplicants(mockApplicants);
    } catch (err) {
      console.error('Failed to fetch applicants:', err);
      setApplicants([]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchApplicants();
  }, [fetchApplicants]);

  return {
    applicants,
    isLoading,
  };
}
