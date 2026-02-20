import React from 'react';
import { EventsView } from '@/components/feature/Backend/Events';

export const metadata = {
  title: 'Events | Boomkoeur',
  description: 'Gérez vos événements et soirées musicales',
};

export default function EventsPage() {
  return <EventsView />;
}
