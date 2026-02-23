'use client';

import CommercialList from '@/components/feature/Backend/Commercial/CommercialList';
import { useCommercialLayout } from '@/components/feature/Backend/Commercial/CommercialLayoutConfig';

export default function CommercialPage() {
  const { activeSection } = useCommercialLayout();

  return (
    <div className="space-y-6">
      {activeSection === 'contacts' && <CommercialList />}
    </div>
  );
}
