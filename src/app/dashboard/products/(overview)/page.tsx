'use client';

import { useState, useEffect } from 'react';
import CatalogTab from '@/components/feature/Backend/Products/Catalog/components/CatalogTab';
import { useAlert } from '@/components/providers/AlertProvider';
import { useProduct } from '@/components/providers';

export default function ProductsCatalogPage() {
  const { setAlert } = useAlert();
  const { triggerRefresh } = useProduct();
  const [catalogError, setCatalogError] = useState<string | null>(null);

  const pageAlertMessage = catalogError ? `Impossible de charger les données : ${catalogError}` : null;

  useEffect(() => {
    if (pageAlertMessage) {
      setAlert({
        variant: 'error',
        message: pageAlertMessage,
        onDismiss: () => {
          setCatalogError(null);
          triggerRefresh();
        },
      });
    } else {
      setAlert(null);
    }
    return () => setAlert(null);
  }, [pageAlertMessage, setAlert, triggerRefresh]);

  return <CatalogTab onError={setCatalogError} />;
}
