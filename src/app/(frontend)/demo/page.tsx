'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/atoms';

/**
 * Page Démo : Connexion automatique au compte démo puis redirection vers le dashboard.
 * Accessible sans authentification.
 */
export default function DemoPage() {
  const [status, setStatus] = useState<'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function enterDemo() {
      try {
        const res = await fetch('/api/demo/enter', { method: 'POST' });
        if (cancelled) return;

        if (res.redirected && res.url) {
          window.location.href = res.url;
          return;
        }

        if (!res.ok) {
          const data = await res.json().catch(() => ({}));
          setError(data.error || 'Erreur lors de la connexion à la démo.');
          setStatus('error');
          return;
        }

        window.location.href = '/dashboard';
      } catch {
        if (!cancelled) {
          setError('Impossible de se connecter à la démo.');
          setStatus('error');
        }
      }
    }

    enterDemo();
    return () => {
      cancelled = true;
    };
  }, []);

  if (status === 'error') {
    return (
      <div className="min-h-[40vh] flex flex-col items-center justify-center px-4">
        <p className="text-muted-foreground text-center mb-6">{error}</p>
        <div className="flex gap-4">
          <Link href="/">
            <Button variant="outline">Retour à l&apos;accueil</Button>
          </Link>
          <Link href="/login">
            <Button variant="primary">Se connecter</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center px-4">
      <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent mb-4" />
      <p className="text-muted-foreground">Connexion à la démo...</p>
    </div>
  );
}
