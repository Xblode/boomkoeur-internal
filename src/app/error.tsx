'use client';

import { useEffect } from 'react';
import { Button } from '@/components/ui/atoms';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-black">
      <div className="max-w-md w-full text-center">
        <div className="text-6xl mb-6">⚠️</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Une erreur s'est produite
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Quelque chose s'est mal passé. Veuillez réessayer.
        </p>
        <div className="flex gap-4 justify-center">
          <Button onClick={reset} variant="primary">
            Réessayer
          </Button>
          <Button onClick={() => window.location.href = '/'} variant="outline">
            Retour à l'accueil
          </Button>
        </div>
      </div>
    </div>
  );
}
