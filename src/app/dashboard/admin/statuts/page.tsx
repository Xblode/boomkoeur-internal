'use client';

import { StatutsReadView, StatutsSignaturePanel } from '@/components/feature/Backend/Admin/Statuts';

export default function AdminStatutsPage() {
  return (
    <>
      <StatutsSignaturePanel />
      <StatutsReadView />
    </>
  );
}
