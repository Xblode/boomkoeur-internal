'use client';

import { useState, useEffect } from 'react';
import StatsTab from '@/components/feature/Backend/Products/Stats/components/StatsTab';
import { useAlert } from '@/components/providers/AlertProvider';
import { useProduct } from '@/components/providers';

export default function ProductsStatsPage() {
  const { setAlert } = useAlert();
  const { triggerRefresh } = useProduct();
  const [statsError, setStatsError] = useState<string | null>(null);

  const pageAlertMessage = statsError ? `Impossible de charger les données : ${statsError}` : null;

  useEffect(() => {
    if (pageAlertMessage) {
      setAlert({
        variant: 'error',
        message: pageAlertMessage,
        onDismiss: () => {
          setStatsError(null);
          triggerRefresh();
        },
      });
    } else {
      setAlert(null);
    }
    return () => setAlert(null);
  }, [pageAlertMessage, setAlert, triggerRefresh]);

  return <StatsTab onError={setStatsError} />;
}
