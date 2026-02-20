import React from 'react';
import { CampaignDetailView } from '@/components/feature/Backend/Communication/Campaign';

export const metadata = {
  title: 'Détail Campagne | Boomkoeur',
  description: 'Gérez les posts de votre campagne',
};

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function CampaignPage({ params }: PageProps) {
  const { id } = await params;
  return <CampaignDetailView campaignId={id} />;
}
