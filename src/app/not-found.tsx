import Link from 'next/link';
import { Button } from '@/components/ui/atoms';

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-white dark:bg-black">
      <div className="max-w-md w-full text-center">
        <div className="text-8xl font-bold text-foreground mb-4">404</div>
        <h1 className="text-3xl font-bold text-foreground mb-4">
          Page non trouvée
        </h1>
        <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
          Désolé, la page que vous recherchez n'existe pas ou a été déplacée.
        </p>
        <div className="flex gap-4 justify-center">
          <Link href="/">
            <Button variant="primary">
              Retour à l'accueil
            </Button>
          </Link>
          <Link href="/contact">
            <Button variant="outline">
              Contactez-nous
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
