import { AboutContent } from '@/components/feature/Frontend/About';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'À propos',
  description: 'Découvrez qui nous sommes et ce que nous faisons',
};

export default function AboutPage() {
  return (
    <>
      <AboutContent />
    </>
  );
}
