'use client';

import { useState, useEffect, useCallback } from 'react';
import type { RubrikWawancaraWithKriteria } from '@/types/rubrik-wawancara';
import { RubrikWawancaraService } from '@/services';

// ============================================
// useInterviewRubrics - Fetch rubrik list for selection
// ============================================

interface UseInterviewRubricsReturn {
  rubrics: RubrikWawancaraWithKriteria[];
  isLoading: boolean;
}

export function useInterviewRubrics(page: number = 0, size: number = 100): UseInterviewRubricsReturn {
  const [rubrics, setRubrics] = useState<RubrikWawancaraWithKriteria[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchRubrics = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await RubrikWawancaraService.getRubrics(page, size);
      setRubrics(result.content);
    } catch (err) {
      console.error('Failed to fetch rubrics:', err);
      setRubrics([]);
    } finally {
      setIsLoading(false);
    }
  }, [page, size]);

  useEffect(() => {
    fetchRubrics();
  }, [fetchRubrics]);

  return {
    rubrics,
    isLoading,
  };
}
