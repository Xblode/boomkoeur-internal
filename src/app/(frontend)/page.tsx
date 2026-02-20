import { Hero } from '@/components/feature/Frontend/Home';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accueil',
  description: 'Bienvenue sur notre template Next.js moderne',
};

export default function HomePage() {
  return (
    <>
      <Hero />
    </>
  );
}
