'use client';

import OrdersDashboard from '@/components/feature/Backend/Orders/Dashboard/components/OrdersDashboard';
import { OrderFilters } from '@/types';
import { useState } from 'react';

export default function ProductsOrdersPage() {
  const [filters] = useState<OrderFilters>({
    search: '',
    status: 'all',
    source: 'all',
    payment_status: 'all',
  });

  return <OrdersDashboard filters={filters} />;
}
