"use client";

import React from 'react';
import { Event } from '@/types/event';
import { EventCard } from './EventCard';
import { CalendarDays } from 'lucide-react';

interface EventsListProps {
  events: Event[];
  onEdit: (event: Event) => void;
  onDelete: (id: string) => void;
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
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <div className="w-20 h-20 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center mb-4">
          <CalendarDays className="h-10 w-10 text-zinc-400" />
        </div>
        <h3 className="text-xl font-semibold mb-2">Aucun événement trouvé</h3>
        <p className="text-zinc-600 dark:text-zinc-400 text-center max-w-md">
          Aucun événement ne correspond à vos critères de recherche.
          Essayez de modifier les filtres ou créez votre premier événement.
        </p>
      </div>
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
