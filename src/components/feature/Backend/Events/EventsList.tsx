"use client";

import React from 'react';
import { Event } from '@/types/event';
import { EventCard } from './EventCard';
import { EmptyState } from '@/components/ui/molecules';
import { CalendarDays } from 'lucide-react';

interface EventsListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (event: Event) => void;
  onDuplicate: (id: string) => void;
  onClick: (event: Event) => void;
}

export const EventsList: React.FC<EventsListProps> = ({
  events,
  onEdit,
  onDelete,
  onDuplicate,
  onClick,
}) => {
  if (events.length === 0) {
    return (
      <EmptyState
        icon={CalendarDays}
        title="Aucun événement trouvé"
        description="Aucun événement ne correspond à vos critères de recherche. Essayez de modifier les filtres ou créez votre premier événement."
        variant="full"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {events.map((event) => (
        <EventCard
          key={event.id}
          event={event}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onClick={onClick}
        />
      ))}
    </div>
  );
};
