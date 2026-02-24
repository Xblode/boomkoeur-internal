'use client';

import { useState, useEffect, useCallback } from 'react';
import type { TreasuryForecast } from '@/types/finance';
import { getTreasuryForecasts } from '@/lib/supabase/finance';
import { getErrorMessage } from '@/lib/utils';

export function useTreasuryForecasts() {
  const [forecasts, setForecasts] = useState<TreasuryForecast[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getTreasuryForecasts();
      setForecasts(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { forecasts, isLoading, error, refetch };
}
