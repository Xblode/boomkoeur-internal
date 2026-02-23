import React from 'react';
import { EventDetailLayoutConfig } from '@/components/feature/Backend/Events/EventDetailLayoutConfig';

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
  return <EventDetailLayoutConfig eventId={id}>{children}</EventDetailLayoutConfig>;
}
