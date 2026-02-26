import { Hero, LogosSection, FeaturesSection, CampaignSection, IntegrationsSection, CTASection } from '@/components/feature/Frontend/Home';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Accueil',
  description:
    'Plateforme tout-en-un pour gérer vos événements, billetterie, finances, contacts et campagnes. Organisez, pilotez et communiquez en un seul endroit.',
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <LogosSection />
      <FeaturesSection />
      <CampaignSection />
      <IntegrationsSection />
      <CTASection />
    </>
  );
}
