import React from 'react';
import { CommunicationView } from '@/components/feature/Backend/Communication';

export const metadata = {
  title: 'Communication | Boomkoeur',
  description: 'Gérez vos campagnes et posts sur les réseaux sociaux',
};

export default function CommunicationPage() {
  return <CommunicationView />;
}
