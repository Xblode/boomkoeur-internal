"use client";

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Event } from '@/types/event';
import { getEventWithMergedArtists } from '@/lib/localStorage/events';
import { EventDetailView } from './EventDetailView';

interface EventDetailLoaderProps {
  eventId: string;
}

export const EventDetailLoader: React.FC<EventDetailLoaderProps> = ({ eventId }) => {
  const router = useRouter();
  const [event, setEvent] = useState<Event | null | undefined>(undefined);

  useEffect(() => {
    const found = getEventWithMergedArtists(eventId);
    setEvent(found ?? null);
  }, [eventId]);

  if (event === undefined) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-zinc-500">Chargement...</div>
      </div>
    );
  }

  if (event === null) {
    router.replace('/dashboard/events');
    return null;
  }

  return <EventDetailView event={event} />;
};
