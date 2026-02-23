'use client';

import React, { useState, useMemo } from 'react';
import { Popover, PopoverContent, PopoverTrigger, Button, Input, Chip, Checkbox, IconButton } from '@/components/ui/atoms';
import { ChevronDown, Calendar as CalendarIcon, MapPin, Search, X } from 'lucide-react';
import { Event } from '@/types/event';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface EventSelectorProps {
  availableEvents: Event[];
  selectedEventIds: string[];
  onEventToggle: (eventId: string) => void;
  placeholder?: string;
  className?: string;
}

/** Sélecteur pour lier des événements (ex: campagnes). Pas pour Shotgun — utiliser ShotgunSearchModal. */
export const EventSelector: React.FC<EventSelectorProps> = ({
  availableEvents,
  selectedEventIds,
  onEventToggle,
  placeholder = "Lier à un événement",
  className,
}) => {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Filtrer les événements selon la recherche
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) {
      return []; // Aucun événement n'est affiché de base
    }
    
    const query = searchQuery.toLowerCase();
    return availableEvents.filter(event => 
      event.name.toLowerCase().includes(query) ||
      event.location.toLowerCase().includes(query) ||
      event.description.toLowerCase().includes(query)
    );
  }, [availableEvents, searchQuery]);

  // Récupérer les événements sélectionnés pour l'affichage
  const selectedEvents = useMemo(() => {
    return availableEvents.filter(event => selectedEventIds.includes(event.id));
  }, [availableEvents, selectedEventIds]);

  const handleRemoveEvent = (eventId: string) => {
    onEventToggle(eventId);
  };

  const handleSelectEvent = (eventId: string) => {
    onEventToggle(eventId);
    // On ne ferme pas le popover pour permettre la sélection multiple
  };

  return (
    <div className={cn("space-y-2", className)}>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            aria-expanded={open}
            className="w-full justify-between"
            type="button"
          >
            <span className="text-sm">
              {selectedEventIds.length > 0
                ? `${selectedEventIds.length} événement${selectedEventIds.length > 1 ? 's' : ''} lié${selectedEventIds.length > 1 ? 's' : ''}`
                : placeholder}
            </span>
            <ChevronDown className={cn("ml-2 h-4 w-4 shrink-0 opacity-50", open && "rotate-180")} />
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-[400px] p-0 !animate-none" align="start">
          <div className="flex flex-col">
            {/* Barre de recherche */}
            <div className="p-3 border-b border-border-custom">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Rechercher un événement..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-8"
                />
                {searchQuery && (
                  <IconButton
                    icon={X}
                    ariaLabel="Effacer la recherche"
                    variant="ghost"
                    size="sm"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground h-8 w-8"
                  />
                )}
              </div>
            </div>

            {/* Liste des résultats */}
            <div className="max-h-[300px] overflow-y-auto">
              {!searchQuery.trim() ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Commencez à taper pour rechercher un événement</p>
                </div>
              ) : filteredEvents.length === 0 ? (
                <div className="p-8 text-center text-sm text-muted-foreground">
                  <p>Aucun événement trouvé</p>
                  <p className="text-xs mt-1">Essayez avec d'autres mots-clés</p>
                </div>
              ) : (
                <div className="p-2 space-y-1">
                  {filteredEvents.map((event) => {
                    const isSelected = selectedEventIds.includes(event.id);
                    return (
                      <div
                        key={event.id}
                        className={cn(
                          "flex items-start gap-3 p-3 rounded-md cursor-pointer transition-colors",
                          "hover:bg-zinc-100 dark:hover:bg-zinc-800",
                          isSelected && "bg-zinc-100 dark:bg-zinc-800"
                        )}
                        onClick={() => handleSelectEvent(event.id)}
                      >
                        <Checkbox 
                          checked={isSelected}
                          onChange={() => handleSelectEvent(event.id)}
                          className="mt-0.5"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{event.name}</p>
                          <div className="flex items-center text-xs text-muted-foreground gap-2 mt-1">
                            <span className="flex items-center gap-1">
                              <CalendarIcon className="h-3 w-3" />
                              {format(new Date(event.date), 'dd/MM/yyyy')}
                            </span>
                            <span>•</span>
                            <span className="flex items-center gap-1 truncate">
                              <MapPin className="h-3 w-3" />
                              {event.location}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </PopoverContent>
      </Popover>

      {/* Affichage des événements sélectionnés */}
      {selectedEvents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedEvents.map((event) => (
            <Chip
              key={event.id}
              label={event.name}
              onDelete={() => handleRemoveEvent(event.id)}
              variant="outline"
            />
          ))}
        </div>
      )}
    </div>
  );
};
