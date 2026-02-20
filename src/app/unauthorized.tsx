import Link from 'next/link';
import { Button } from '@/components/ui/atoms';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-black">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-foreground mb-4">401</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Non authentifié
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Vous devez être connecté pour accéder à cette page.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="primary">
              Retour à l'accueil
            </Button>
          </Link>
          <Button variant="outline">
            Se connecter
          </Button>
        </div>
      </div>
    </div>
  );
}
