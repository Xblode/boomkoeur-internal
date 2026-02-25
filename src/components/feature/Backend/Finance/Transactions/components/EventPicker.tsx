'use client'

import { useState, useMemo } from 'react'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/atoms'
import { Button, Input } from '@/components/ui/atoms'
import { Search, Calendar, Link2Off } from 'lucide-react'
import { useEvents } from '@/hooks/useEvents'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { cn } from '@/lib/utils'

const NEXT_EVENTS_COUNT = 4

export interface EventPickerProps {
  /** ID de l'événement actuellement lié */
  value?: string
  /** Callback quand un événement est sélectionné */
  onSelect: (eventId: string) => void
  /** Callback pour délier l'événement */
  onUnlink: () => void
  /** Contenu du trigger (affichage dans la cellule) */
  children: React.ReactNode
  className?: string
}

export function EventPicker({ value, onSelect, onUnlink, children, className }: EventPickerProps) {
  const [open, setOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const { events: allEvents, isLoading } = useEvents()

  // 4 prochains événements (par date, à venir en premier)
  const nextEvents = useMemo(() => {
    const now = Date.now()
    return allEvents
      .filter((e) => e.date && new Date(e.date).getTime() >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, NEXT_EVENTS_COUNT)
  }, [allEvents])

  // Événements filtrés par recherche (tous les événements correspondants, triés par date)
  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return []
    const query = searchQuery.toLowerCase()
    return allEvents
      .filter(
        (e) =>
          e.name.toLowerCase().includes(query) ||
          (e.location && e.location.toLowerCase().includes(query)) ||
          (e.description && e.description.toLowerCase().includes(query))
      )
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
  }, [allEvents, searchQuery])

  const displayEvents = searchQuery.trim() ? filteredEvents : nextEvents

  const handleSelect = (eventId: string) => {
    onSelect(eventId)
    setOpen(false)
    setSearchQuery('')
  }

  const handleUnlink = () => {
    onUnlink()
    setOpen(false)
    setSearchQuery('')
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className={cn(
            'w-full h-full min-h-8 text-left text-sm cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded flex items-center',
            className
          )}
        >
          {children}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-[320px] p-0" align="start">
        <div className="flex flex-col">
          {/* Barre de recherche */}
          <div className="p-2 border-b border-border-custom">
            <div className="relative">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
              <Input
                placeholder="Rechercher un événement..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 text-sm"
              />
            </div>
          </div>

          {/* Bouton délier */}
          {value && (
            <div className="p-2 border-b border-border-custom">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnlink}
                className="w-full justify-start text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
              >
                <Link2Off className="w-4 h-4 mr-2" />
                Délier l'événement
              </Button>
            </div>
          )}

          {/* Liste des événements */}
          <div className="max-h-[280px] overflow-y-auto p-2">
            {isLoading ? (
              <div className="py-6 text-center text-sm text-zinc-500">Chargement...</div>
            ) : displayEvents.length === 0 ? (
              <div className="py-6 text-center text-sm text-zinc-500">
                {searchQuery ? 'Aucun événement trouvé' : 'Aucun événement à venir'}
              </div>
            ) : (
              <div className="space-y-1">
                {displayEvents.map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    onClick={() => handleSelect(event.id)}
                    className={cn(
                      'w-full text-left p-2 rounded text-sm transition-colors',
                      'hover:bg-zinc-100 dark:hover:bg-zinc-800',
                      value === event.id && 'bg-zinc-100 dark:bg-zinc-800'
                    )}
                  >
                    <div className="font-medium text-zinc-900 dark:text-zinc-100 truncate">
                      {event.name}
                    </div>
                    {event.date && (
                      <div className="flex items-center gap-1.5 mt-0.5 text-xs text-zinc-500">
                        <Calendar className="w-3 h-3 shrink-0" />
                        <span>{format(new Date(event.date), 'dd MMM yyyy', { locale: fr })}</span>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
