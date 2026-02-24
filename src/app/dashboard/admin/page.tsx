'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/admin/general');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-zinc-500">Redirection...</div>
    </div>
  );
}
