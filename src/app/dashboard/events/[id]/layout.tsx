import React from 'react';
import { EventDetailLayout } from '@/components/feature/Backend/Events/EventDetailLayout';

interface EventDetailLayoutRouteProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export const metadata = {
  title: 'Événement | Boomkoeur',
  description: 'Détails de l\'événement',
};

export default async function EventDetailLayoutRoute({ children, params }: EventDetailLayoutRouteProps) {
  const { id } = await params;
  return <EventDetailLayout eventId={id}>{children}</EventDetailLayout>;
}
