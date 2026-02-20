"use client";

import React from 'react';
import { Event } from '@/types/event';
import { EventDetailLayout } from './EventDetailLayout';
import { EventInfoSection } from './EventInfoSection';

interface EventDetailViewProps {
  event: Event;
}

export function EventDetailView({ event }: EventDetailViewProps) {
  return (
    <EventDetailLayout eventId={event.id}>
      <EventInfoSection />
    </EventDetailLayout>
  );
}
