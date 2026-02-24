'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommercialContact } from '@/types/commercial';
import { getCommercialContacts } from '@/lib/supabase/commercial';
import { getErrorMessage } from '@/lib/utils';

export function useCommercialContacts() {
  const [contacts, setContacts] = useState<CommercialContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getCommercialContacts();
      setContacts(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { contacts, isLoading, error, refetch };
}
