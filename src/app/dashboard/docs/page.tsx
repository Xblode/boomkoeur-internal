'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function DocsPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/dashboard/docs/presentation/introduction');
  }, [router]);

  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-zinc-500">Redirection...</div>
    </div>
  );
}
