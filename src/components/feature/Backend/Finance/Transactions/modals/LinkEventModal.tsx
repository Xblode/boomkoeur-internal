'use client'

import { useState, useMemo } from 'react'
import { financeDataService } from '@/lib/services/FinanceDataService'
import { Modal } from '@/components/ui/organisms'
import { Button } from '@/components/ui/atoms'
import { Input } from '@/components/ui/atoms'
import { Badge } from '@/components/ui/atoms'
import { format } from 'date-fns'
import { fr } from 'date-fns/locale'
import { Search, Calendar } from 'lucide-react'
import { useEvents } from '@/lib/stubs/supabase-stubs'

interface LinkEventModalProps {
  isOpen: boolean
  onClose: () => void
  transactionId: string
  onLink: (eventId: string) => Promise<void>
}

export function LinkEventModal({ isOpen, onClose, transactionId, onLink }: LinkEventModalProps) {
  const { data: allEvents = [], isLoading } = useEvents()
  const [searchQuery, setSearchQuery] = useState('')

  // Filtrer les evenements
  const filteredEvents = useMemo(() => {
    let events = allEvents

    // Filtre par recherche
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      events = events.filter(
        (e) =>
          e.title.toLowerCase().includes(query) ||
          e.location?.toLowerCase().includes(query) ||
          e.notes?.toLowerCase().includes(query)
      )
    }

    // Trier par date (plus recent en premier)
    events.sort((a, b) => {
      const dateA = a.date ? new Date(a.date).getTime() : 0
      const dateB = b.date ? new Date(b.date).getTime() : 0
      return dateB - dateA
    })

    return events
  }, [allEvents, searchQuery])

  const handleLink = async (eventId: string) => {
    try {
      await onLink(eventId)
    } catch (error) {
      // Erreur geree par le parent
    }
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Lier a un evenement"
      size="lg"
      scrollable
    >
      <div className="space-y-4">
        {/* Recherche */}
        <div>
          <label className="block text-sm font-label uppercase mb-2">
            Rechercher
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Titre, lieu, notes..."
              className="pl-10"
            />
          </div>
        </div>

        {/* Liste des evenements */}
        {isLoading ? (
          <div className="text-center py-8 text-zinc-500">Chargement...</div>
        ) : filteredEvents.length === 0 ? (
          <div className="text-center py-8 text-zinc-500">
            <p>Aucun evenement trouve</p>
            {searchQuery && (
              <p className="text-xs mt-2">Essayez de modifier votre recherche</p>
            )}
          </div>
        ) : (
          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {filteredEvents.map((event) => (
              <div
                key={event.id}
                className="p-4 border border-border-custom rounded hover:border-accent transition-colors"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-heading font-bold text-sm">{event.title}</h4>
                      <Badge
                        variant="default"
                        className={
                          event.status === 'ongoing'
                            ? 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
                            : event.status === 'completed'
                            ? 'bg-green-500/20 text-green-400 border-green-500/30'
                            : event.status === 'cancelled'
                            ? 'bg-red-500/20 text-red-400 border-red-500/30'
                            : 'bg-blue-500/20 text-blue-400 border-blue-500/30'
                        }
                      >
                        {event.status === 'ongoing'
                          ? 'En cours'
                          : event.status === 'completed'
                          ? 'Termine'
                          : event.status === 'cancelled'
                          ? 'Annule'
                          : 'Planifie'}
                      </Badge>
                    </div>
                    {event.date && (
                      <div className="flex items-center gap-2 text-xs text-zinc-500 mb-1">
                        <Calendar className="w-3 h-3" />
                        <span>
                          {format(new Date(event.date), 'dd MMMM yyyy', { locale: fr })}
                        </span>
                      </div>
                    )}
                    {event.location && (
                      <p className="text-xs text-zinc-500 line-clamp-1 mt-1">
                        📍 {event.location}
                      </p>
                    )}
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleLink(event.id)}
                  >
                    Lier
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 justify-end mt-6">
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
      </div>
    </Modal>
  )
}

