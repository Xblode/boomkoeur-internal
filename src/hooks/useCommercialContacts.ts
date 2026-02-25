'use client';

import { useState, useEffect, useCallback } from 'react';
import type { CommercialContact } from '@/types/commercial';
import { getCommercialContacts } from '@/lib/supabase/commercial';
import { getErrorMessage } from '@/lib/utils';

export function useCommercialContacts() {
  const [contacts, setContacts] = useState<CommercialContact[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const refetch = useCallback(async (showLoading = true) => {
    if (showLoading) setIsLoading(true);
    setError(null);
    try {
      const data = await getCommercialContacts();
      setContacts(data);
    } catch (e) {
      setError(e instanceof Error ? e : new Error(getErrorMessage(e)));
    } finally {
      if (showLoading) setIsLoading(false);
    }
  }, []);

  /** Met à jour un contact localement sans refetch (affichage immédiat) */
  const updateContactInPlace = useCallback((updated: CommercialContact) => {
    setContacts((prev) =>
      prev.map((c) => (c.id === updated.id ? { ...c, ...updated } : c))
    );
  }, []);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { contacts, isLoading, error, refetch, updateContactInPlace };
}
