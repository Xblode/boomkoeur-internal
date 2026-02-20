'use client';

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { Button, Input } from '@/components/ui/atoms';
import { EventSelector } from '@/components/ui/molecules';
import { Campaign } from '@/types/communication';
import { getEvents } from '@/lib/localStorage/events';
import { Event } from '@/types/event';

interface CreateCampaignModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (campaign: Omit<Campaign, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export const CreateCampaignModal: React.FC<CreateCampaignModalProps> = ({
  isOpen,
  onClose,
  onCreate,
}) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedEventIds, setSelectedEventIds] = useState<string[]>([]);
  const [availableEvents, setAvailableEvents] = useState<Event[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      const events = getEvents();
      const sortedEvents = [...events].sort((a, b) => 
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setAvailableEvents(sortedEvents);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;

    setIsSubmitting(true);
    
    onCreate({
      name,
      description,
      status: 'active',
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      eventIds: selectedEventIds,
      posts: [],
      type: selectedEventIds.length > 0 ? 'event' : 'generic',
      platforms: [],
    });

    setIsSubmitting(false);
    onClose();
    setName('');
    setDescription('');
    setStartDate('');
    setEndDate('');
    setSelectedEventIds([]);
  };

  const handleEventToggle = (eventId: string) => {
    setSelectedEventIds(prev => 
      prev.includes(eventId)
        ? prev.filter(id => id !== eventId)
        : [...prev, eventId]
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="w-full max-w-2xl bg-card-bg border border-border-custom rounded-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-4 border-b border-border-custom">
          <h2 className="text-lg font-semibold text-foreground">Nouvelle Campagne</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="space-y-2">
            <label htmlFor="name" className="text-sm font-medium text-foreground">
              Nom de la campagne <span className="text-red-500">*</span>
            </label>
            <Input
              id="name"
              placeholder="Ex: Lancement Collection Été"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <label htmlFor="description" className="text-sm font-medium text-foreground">
              Description
            </label>
            <textarea
              id="description"
              placeholder="Objectif de la campagne..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="startDate" className="text-sm font-medium text-foreground">
                Date de début
              </label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="endDate" className="text-sm font-medium text-foreground">
                Date de fin
              </label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-foreground block">
              Événements liés
            </label>
            <EventSelector
              availableEvents={availableEvents}
              selectedEventIds={selectedEventIds}
              onEventToggle={handleEventToggle}
              placeholder="Lier à un événement"
            />
          </div>
        </form>

        <div className="p-4 border-t border-border-custom bg-card-bg flex justify-end gap-3">
          <Button type="button" variant="outline" onClick={onClose}>
            Annuler
          </Button>
          <Button 
            onClick={handleSubmit} 
            variant="primary" 
            disabled={isSubmitting || !name}
          >
            Créer la campagne
          </Button>
        </div>
      </div>
    </div>
  );
};
